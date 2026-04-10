-- Migration: Add lab_value column to point_transactions and pending_point_assignments
-- Date: 2026-04-10
-- Description: Adds a new column to track which Lab value is associated with point assignments

-- Create the enum type for lab values
DO $$ BEGIN
  CREATE TYPE lab_value_enum AS ENUM (
    'senso_de_time',
    'foco_no_cliente',
    'autorresponsabilidade',
    'espirito_empreendedor',
    'empatia',
    'constante_evolucao'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add lab_value column to pending_point_assignments table
ALTER TABLE pending_point_assignments
ADD COLUMN IF NOT EXISTS lab_value lab_value_enum;

-- Add lab_value column to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS lab_value lab_value_enum;

-- Drop old function signatures before recreating with new parameter
DROP FUNCTION IF EXISTS create_point_assignment(uuid, uuid, integer, text, transaction_reason_enum);
DROP FUNCTION IF EXISTS approve_point_assignment(uuid, uuid);

-- Recreate create_point_assignment with lab_value parameter
CREATE OR REPLACE FUNCTION create_point_assignment(
  p_requester_id uuid,
  p_target_user_id uuid,
  p_points integer,
  p_justification text,
  p_reason transaction_reason_enum DEFAULT NULL,
  p_lab_value lab_value_enum DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_requester_dept text;
  v_target_dept text;
  v_requester_role text;
  v_approver_id uuid;
  v_assignment_id uuid;
BEGIN
  -- Verificar role do requester
  SELECT role, department::text INTO v_requester_role, v_requester_dept
  FROM users WHERE id = p_requester_id;

  IF v_requester_role NOT IN ('gestor', 'adm') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não tem permissão para atribuir pontos');
  END IF;

  -- Verificar departamento do target
  SELECT department::text INTO v_target_dept
  FROM users WHERE id = p_target_user_id;

  -- Gestores só podem atribuir a usuários do mesmo departamento
  IF v_requester_role = 'gestor' AND v_requester_dept IS DISTINCT FROM v_target_dept THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gestor só pode atribuir pontos a usuários do mesmo departamento');
  END IF;

  -- Selecionar aprovador aleatório
  v_approver_id := select_random_approver(p_requester_id, COALESCE(v_requester_dept, v_target_dept), p_target_user_id);

  IF v_approver_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não há aprovadores disponíveis. É necessário ter outro gestor do mesmo departamento ou um administrador.');
  END IF;

  -- Criar a solicitação incluindo reason e lab_value
  INSERT INTO pending_point_assignments (
    requester_id, target_user_id, points, justification,
    selected_approver_id, selected_at, reason, lab_value
  )
  VALUES (
    p_requester_id, p_target_user_id, p_points, p_justification,
    v_approver_id, now(), p_reason, p_lab_value
  )
  RETURNING id INTO v_assignment_id;

  -- Log de auditoria
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
        'reason', p_reason,
        'lab_value', p_lab_value
      ),
      NULL
    );
  EXCEPTION
    WHEN undefined_function THEN NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'assignment_id', v_assignment_id,
    'approver_id', v_approver_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_point_assignment(uuid, uuid, integer, text, transaction_reason_enum, lab_value_enum) TO authenticated;

-- Recreate approve_point_assignment propagating lab_value to the transaction
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

  -- Gestores devem ser o aprovador selecionado
  IF v_approver_role = 'gestor' AND v_assignment.selected_approver_id != p_approver_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você não é o aprovador selecionado para esta atribuição');
  END IF;

  -- Adicionar pontos ao usuário
  UPDATE users
  SET lab_points = lab_points + v_assignment.points,
      updated_at = now()
  WHERE id = v_assignment.target_user_id;

  -- Criar transação incluindo reason e lab_value
  INSERT INTO transactions (user_id, tipo, valor, descricao, reason, lab_value)
  VALUES (
    v_assignment.target_user_id,
    'credito',
    v_assignment.points,
    v_assignment.justification,
    v_assignment.reason,
    v_assignment.lab_value
  )
  RETURNING id INTO v_transaction_id;

  -- Atualizar status da atribuição
  UPDATE pending_point_assignments
  SET status = 'approved',
      approved_at = now(),
      approved_by = p_approver_id,
      transaction_id = v_transaction_id
  WHERE id = p_assignment_id;

  -- Log de auditoria
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
        'reason', v_assignment.reason,
        'lab_value', v_assignment.lab_value
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

-- Add comment to document the new columns
COMMENT ON COLUMN pending_point_assignments.lab_value IS 'Lab value associated with this point assignment';
COMMENT ON COLUMN transactions.lab_value IS 'Lab value associated with this transaction';
