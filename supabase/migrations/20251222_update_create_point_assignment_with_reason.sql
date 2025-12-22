-- Migration: Update create_point_assignment to include reason parameter
-- Created: 2025-12-22

-- Drop old function signature
DROP FUNCTION IF EXISTS create_point_assignment(uuid, uuid, integer, text);

-- Recreate function with reason parameter
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
  
  -- Gestores só podem atribuir a usuários do mesmo departamento
  IF v_requester_role = 'gestor' AND v_requester_dept IS DISTINCT FROM v_target_dept THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gestor só pode atribuir pontos a usuários do mesmo departamento');
  END IF;
  
  -- Selecionar aprovador aleatório (passando target_user_id para evitar que seja selecionado)
  v_approver_id := select_random_approver(p_requester_id, COALESCE(v_requester_dept, v_target_dept), p_target_user_id);
  
  IF v_approver_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não há aprovadores disponíveis. É necessário ter outro gestor do mesmo departamento ou um administrador.');
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

-- Dar permissão para usuários autenticados chamarem a função
GRANT EXECUTE ON FUNCTION create_point_assignment(uuid, uuid, integer, text, transaction_reason_enum) TO authenticated;

-- Também precisamos atualizar as funções de aprovação para copiar o reason para transactions

-- Update approve_point_assignment function
CREATE OR REPLACE FUNCTION approve_point_assignment(
  p_assignment_id uuid,
  p_approver_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_assignment record;
  v_approver_role text;
  v_approver_dept text;
  v_target_dept text;
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
  SELECT role, department::text INTO v_approver_role, v_approver_dept
  FROM users WHERE id = p_approver_id;
  
  IF v_approver_role NOT IN ('gestor', 'adm') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas gestores e administradores podem aprovar atribuições');
  END IF;
  
  -- Verificar se é o aprovador selecionado
  IF v_assignment.selected_approver_id != p_approver_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você não é o aprovador selecionado para esta atribuição');
  END IF;
  
  -- Verificar departamento do target
  SELECT department::text INTO v_target_dept
  FROM users WHERE id = v_assignment.target_user_id;
  
  -- Gestores só podem aprovar atribuições do mesmo departamento
  IF v_approver_role = 'gestor' AND v_approver_dept IS DISTINCT FROM v_target_dept THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gestor só pode aprovar atribuições do mesmo departamento');
  END IF;
  
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

GRANT EXECUTE ON FUNCTION approve_point_assignment(uuid, uuid) TO authenticated;
