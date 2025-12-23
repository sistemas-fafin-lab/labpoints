-- Migration: Fix approval logic - Allow approvers from any department
-- Created: 2025-12-22

-- Ensure transaction_reason_enum exists (may have been created in a previous migration)
DO $$ BEGIN
  CREATE TYPE transaction_reason_enum AS ENUM (
    'auditoria_processos_internos',
    'colaboracao_intersetorial',
    'colaboracao_intrasetorial',
    'estrategia_organizacao_planejamento',
    'otimizacao_processos',
    'postura_empatica',
    'postura_disciplina_autocontrole',
    'proatividade_inovacao',
    'promover_sustentabilidade_financeira',
    'protagonismo_desafios',
    'realizar_networking_parceiros',
    'responsabilidade_compromisso'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add missing columns to pending_point_assignments if they don't exist
DO $$ 
BEGIN
  -- Add approved_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_point_assignments' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE pending_point_assignments ADD COLUMN approved_at timestamptz;
  END IF;

  -- Add approved_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_point_assignments' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE pending_point_assignments ADD COLUMN approved_by uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  -- Add transaction_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_point_assignments' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE pending_point_assignments ADD COLUMN transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Drop existing function
DROP FUNCTION IF EXISTS select_random_approver(uuid, text, uuid);

-- Recreate function with updated logic - approver can be from ANY department
CREATE OR REPLACE FUNCTION select_random_approver(
  p_requester_id uuid,
  p_department text,
  p_target_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_approver_id uuid;
BEGIN
  -- Forçar nova seed aleatória usando timestamp para garantir aleatoriedade
  PERFORM setseed(extract(epoch from clock_timestamp()) - floor(extract(epoch from clock_timestamp())));
  
  -- Buscar gestor aleatório de QUALQUER departamento (não apenas do mesmo)
  -- Excluindo apenas o requester e o target_user (usuário que receberá os pontos)
  SELECT id INTO v_approver_id
  FROM users
  WHERE role = 'gestor'
    AND id != p_requester_id
    AND (p_target_user_id IS NULL OR id != p_target_user_id)
  ORDER BY random()
  LIMIT 1;
  
  -- Se não encontrar gestor, buscar admin como fallback
  -- Também excluindo o requester e o target_user
  IF v_approver_id IS NULL THEN
    SELECT id INTO v_approver_id
    FROM users
    WHERE role = 'adm'
      AND id != p_requester_id
      AND (p_target_user_id IS NULL OR id != p_target_user_id)
    ORDER BY random()
    LIMIT 1;
  END IF;
  
  RETURN v_approver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION select_random_approver(uuid, text, uuid) TO authenticated;

-- Update create_point_assignment to keep validation for requester (must be from same dept or admin)
-- But use the new select_random_approver that can select from any department
CREATE OR REPLACE FUNCTION create_point_assignment(
  p_requester_id uuid,
  p_target_user_id uuid,
  p_points integer,
  p_justification text,
  p_reason transaction_reason_enum DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_requester_dept text;
  v_target_dept text;
  v_requester_role text;
  v_approver_id uuid;
  v_assignment_id uuid;
BEGIN
  -- Verificar role do requester (fazendo cast do department para text)
  SELECT role, department::text INTO v_requester_role, v_requester_dept
  FROM users WHERE id = p_requester_id;
  
  IF v_requester_role NOT IN ('gestor', 'adm') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não tem permissão para atribuir pontos');
  END IF;
  
  -- Verificar departamento do target (fazendo cast para text)
  SELECT department::text INTO v_target_dept
  FROM users WHERE id = p_target_user_id;
  
  -- Gestores só podem atribuir a usuários do MESMO departamento
  -- Admins podem atribuir a usuários de qualquer departamento
  IF v_requester_role = 'gestor' AND v_requester_dept IS DISTINCT FROM v_target_dept THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gestor só pode atribuir pontos a usuários do mesmo departamento');
  END IF;
  
  -- Selecionar aprovador aleatório de QUALQUER departamento
  -- Passando target_user_id para evitar que seja selecionado
  v_approver_id := select_random_approver(p_requester_id, COALESCE(v_requester_dept, v_target_dept), p_target_user_id);
  
  IF v_approver_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não há aprovadores disponíveis. É necessário ter outro gestor ou um administrador no sistema.');
  END IF;
  
  -- Criar a solicitação (agora incluindo reason)
  INSERT INTO pending_point_assignments (
    requester_id, target_user_id, points, justification, 
    selected_approver_id, selected_at, reason
  )
  VALUES (
    p_requester_id, p_target_user_id, p_points, p_justification,
    v_approver_id, now(), p_reason
  )
  RETURNING id INTO v_assignment_id;
  
  -- Criar log de auditoria (se a função existir)
  BEGIN
    PERFORM create_audit_log(
      'ASSIGNMENT_CREATED',
      'pending_point_assignments',
      v_assignment_id,
      p_requester_id,
      NULL,
      jsonb_build_object(
        'target_user_id', p_target_user_id,
        'points', p_points,
        'justification', p_justification,
        'approver_id', v_approver_id,
        'reason', p_reason
      ),
      NULL
    );
  EXCEPTION
    WHEN undefined_function THEN
      -- Função de audit não existe, continuar sem log
      NULL;
  END;
  
  RETURN jsonb_build_object(
    'success', true, 
    'assignment_id', v_assignment_id,
    'approver_id', v_approver_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_point_assignment(uuid, uuid, integer, text, transaction_reason_enum) TO authenticated;

-- Update approve_point_assignment to allow approvers from any department
CREATE OR REPLACE FUNCTION approve_point_assignment(
  p_assignment_id uuid,
  p_approver_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_assignment record;
  v_approver_role text;
  v_transaction_id uuid;
BEGIN
  -- Buscar a atribuição pendente
  SELECT * INTO v_assignment
  FROM pending_point_assignments
  WHERE id = p_assignment_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Atribuição não encontrada ou já processada');
  END IF;
  
  -- Verificar role do aprovador
  SELECT role INTO v_approver_role
  FROM users WHERE id = p_approver_id;
  
  IF v_approver_role NOT IN ('gestor', 'adm') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas gestores e administradores podem aprovar atribuições');
  END IF;
  
  -- Verificar se é o aprovador selecionado
  -- Administradores podem aprovar qualquer solicitação
  -- Gestores devem ser o aprovador selecionado
  IF v_approver_role = 'gestor' AND v_assignment.selected_approver_id != p_approver_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você não é o aprovador selecionado para esta atribuição');
  END IF;
  
  -- REMOVIDA a verificação de departamento do aprovador
  -- Aprovadores podem ser de qualquer departamento
  
  -- Adicionar pontos ao usuário
  UPDATE users
  SET lab_points = lab_points + v_assignment.points,
      updated_at = now()
  WHERE id = v_assignment.target_user_id;
  
  -- Criar transação (incluindo reason da atribuição)
  INSERT INTO transactions (user_id, tipo, valor, descricao, reason)
  VALUES (
    v_assignment.target_user_id,
    'credito',
    v_assignment.points,
    v_assignment.justification,
    v_assignment.reason
  )
  RETURNING id INTO v_transaction_id;
  
  -- Atualizar status da atribuição
  UPDATE pending_point_assignments
  SET status = 'approved',
      approved_at = now(),
      approved_by = p_approver_id,
      transaction_id = v_transaction_id
  WHERE id = p_assignment_id;
  
  -- Criar log de auditoria
  BEGIN
    PERFORM create_audit_log(
      'ASSIGNMENT_APPROVED',
      'pending_point_assignments',
      p_assignment_id,
      p_approver_id,
      NULL,
      jsonb_build_object(
        'target_user_id', v_assignment.target_user_id,
        'points', v_assignment.points,
        'transaction_id', v_transaction_id,
        'reason', v_assignment.reason
      ),
      NULL
    );
  EXCEPTION
    WHEN undefined_function THEN NULL;
  END;
  
  RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION approve_point_assignment(uuid, uuid) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION select_random_approver IS 
  'Seleciona aleatoriamente um gestor de QUALQUER departamento (não apenas do mesmo) para aprovar atribuição de pontos. Exclui apenas o requester e o target_user.';

COMMENT ON FUNCTION create_point_assignment IS 
  'Cria atribuição de pontos. Requester deve ser gestor do MESMO departamento do target (ou admin). Aprovador será selecionado de QUALQUER departamento.';

COMMENT ON FUNCTION approve_point_assignment IS 
  'Aprova atribuição de pontos. Aprovador pode ser de QUALQUER departamento, desde que seja o selecionado para a atribuição.';
