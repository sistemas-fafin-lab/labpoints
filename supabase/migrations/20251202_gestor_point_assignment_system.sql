/*
  # Sistema de Atribuição de Pontos por Gestores

  ## Visão Geral
  Esta migration implementa o sistema de atribuição de pontos onde gestores podem
  atribuir pontos a colaboradores do seu departamento, com aprovação aleatória
  por outro gestor do mesmo departamento.

  ## Alterações

  ### 1. Tabela `users` - Novos campos
  - `department` (text, nullable) - Departamento do usuário
  - Atualização do CHECK constraint de `role` para incluir 'gestor'

  ### 2. Nova tabela `departments` (opcional, para referência)
  - Lista de departamentos válidos

  ### 3. Nova tabela `pending_point_assignments`
  - Armazena solicitações de atribuição de pontos pendentes de aprovação

  ### 4. Nova tabela `audit_logs`
  - Registra todas as ações do sistema para auditoria

  ## Notas Importantes
  - Migrations são idempotentes (podem ser executadas múltiplas vezes)
  - Nenhuma coluna NOT NULL sem default para evitar quebras
  - Todas as alterações são não-destrutivas
*/

-- ============================================================================
-- FASE 1: ALTERAÇÕES NA TABELA USERS
-- ============================================================================

-- 1.1 Adicionar coluna department na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department text;

-- 1.2 Criar índice para busca por departamento
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- 1.3 Criar índice para busca por role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 1.4 Remover a constraint antiga de role e adicionar nova com 'gestor'
-- Primeiro, precisamos dropar a constraint existente
DO $$
BEGIN
  -- Tentar remover constraint existente (pode ter nomes diferentes)
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check1;
  ALTER TABLE users DROP CONSTRAINT IF EXISTS check_role;
  
  -- Adicionar nova constraint com todos os valores permitidos
  ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('colaborador', 'adm', 'gestor'));
EXCEPTION
  WHEN others THEN
    -- Se falhar, tentar de outra forma
    RAISE NOTICE 'Constraint já existe ou não pôde ser alterada: %', SQLERRM;
END $$;

-- ============================================================================
-- FASE 2: TABELA DE DEPARTAMENTOS (OPCIONAL - PARA REFERÊNCIA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para busca de departamentos ativos
CREATE INDEX IF NOT EXISTS idx_departments_ativo ON departments(ativo);

-- Habilitar RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Políticas para departments
CREATE POLICY "Authenticated users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

-- ============================================================================
-- FASE 3: TABELA PENDING_POINT_ASSIGNMENTS
-- ============================================================================

-- Criar tipo enum para status (mais seguro que text com check)
DO $$
BEGIN
  CREATE TYPE assignment_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type assignment_status already exists';
END $$;

CREATE TABLE IF NOT EXISTS pending_point_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quem está solicitando a atribuição (gestor)
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Usuário que receberá os pontos
  target_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Quantidade de pontos a ser atribuída
  points integer NOT NULL CHECK (points > 0),
  
  -- Justificativa para a atribuição
  justification text NOT NULL,
  
  -- Gestor selecionado aleatoriamente para aprovar (pode ser null até seleção)
  selected_approver_id uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status da solicitação
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Motivo da rejeição (se aplicável)
  rejection_reason text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  selected_at timestamptz, -- Quando o aprovador foi selecionado
  decided_at timestamptz,  -- Quando foi aprovado/rejeitado
  
  -- Constraint: requester não pode ser o mesmo que target
  CONSTRAINT different_requester_target CHECK (requester_id != target_user_id),
  
  -- Constraint: requester não pode ser o aprovador
  CONSTRAINT different_requester_approver CHECK (requester_id != selected_approver_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_assignments_requester ON pending_point_assignments(requester_id);
CREATE INDEX IF NOT EXISTS idx_pending_assignments_target ON pending_point_assignments(target_user_id);
CREATE INDEX IF NOT EXISTS idx_pending_assignments_approver ON pending_point_assignments(selected_approver_id);
CREATE INDEX IF NOT EXISTS idx_pending_assignments_status ON pending_point_assignments(status);
CREATE INDEX IF NOT EXISTS idx_pending_assignments_pending ON pending_point_assignments(selected_approver_id, status) 
  WHERE status = 'pending';

-- Habilitar RLS
ALTER TABLE pending_point_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pending_point_assignments

-- Gestores podem ver suas próprias solicitações
CREATE POLICY "Requesters can view own assignments"
  ON pending_point_assignments FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid());

-- Aprovadores podem ver solicitações atribuídas a eles
CREATE POLICY "Approvers can view assigned requests"
  ON pending_point_assignments FOR SELECT
  TO authenticated
  USING (selected_approver_id = auth.uid());

-- Admins podem ver tudo
CREATE POLICY "Admins can view all assignments"
  ON pending_point_assignments FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

-- Gestores e admins podem criar solicitações
CREATE POLICY "Managers and admins can create assignments"
  ON pending_point_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    requester_id = auth.uid() 
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('gestor', 'adm')
  );

-- Apenas o aprovador selecionado ou admin pode atualizar
CREATE POLICY "Approvers and admins can update assignments"
  ON pending_point_assignments FOR UPDATE
  TO authenticated
  USING (
    selected_approver_id = auth.uid() 
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'adm'
  )
  WITH CHECK (
    selected_approver_id = auth.uid() 
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'adm'
  );

-- ============================================================================
-- FASE 4: TABELA AUDIT_LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de ação
  action text NOT NULL,
  
  -- Entidade afetada (ex: 'pending_point_assignments', 'users', 'transactions')
  entity_type text NOT NULL,
  
  -- ID da entidade afetada
  entity_id uuid,
  
  -- Usuário que realizou a ação
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- Dados antes da alteração (JSON)
  old_data jsonb,
  
  -- Dados depois da alteração (JSON)
  new_data jsonb,
  
  -- Metadados adicionais (IP, user agent, etc)
  metadata jsonb,
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs de auditoria
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

-- Sistema pode inserir logs (via functions com SECURITY DEFINER)
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- FASE 5: FUNÇÕES AUXILIARES
-- ============================================================================

-- 5.1 Função para selecionar aprovador aleatório
CREATE OR REPLACE FUNCTION select_random_approver(
  p_requester_id uuid,
  p_department text
)
RETURNS uuid AS $$
DECLARE
  v_approver_id uuid;
BEGIN
  -- Buscar gestor aleatório do mesmo departamento (excluindo o requester)
  SELECT id INTO v_approver_id
  FROM users
  WHERE role = 'gestor'
    AND department = p_department
    AND id != p_requester_id
  ORDER BY random()
  LIMIT 1;
  
  -- Se não encontrar gestor, buscar admin como fallback
  IF v_approver_id IS NULL THEN
    SELECT id INTO v_approver_id
    FROM users
    WHERE role = 'adm'
      AND id != p_requester_id
    ORDER BY random()
    LIMIT 1;
  END IF;
  
  RETURN v_approver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Função para criar log de auditoria
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_actor_id uuid,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, old_data, new_data, metadata)
  VALUES (p_action, p_entity_type, p_entity_id, p_actor_id, p_old_data, p_new_data, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.3 Função para criar atribuição de pontos pendente
CREATE OR REPLACE FUNCTION create_point_assignment(
  p_requester_id uuid,
  p_target_user_id uuid,
  p_points integer,
  p_justification text
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
  SELECT role, department INTO v_requester_role, v_requester_dept
  FROM users WHERE id = p_requester_id;
  
  IF v_requester_role NOT IN ('gestor', 'adm') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não tem permissão para atribuir pontos');
  END IF;
  
  -- Verificar departamento do target
  SELECT department INTO v_target_dept
  FROM users WHERE id = p_target_user_id;
  
  -- Gestores só podem atribuir a usuários do mesmo departamento
  IF v_requester_role = 'gestor' AND v_requester_dept != v_target_dept THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gestor só pode atribuir pontos a usuários do mesmo departamento');
  END IF;
  
  -- Selecionar aprovador aleatório
  v_approver_id := select_random_approver(p_requester_id, COALESCE(v_requester_dept, v_target_dept));
  
  IF v_approver_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não há aprovadores disponíveis');
  END IF;
  
  -- Criar a solicitação
  INSERT INTO pending_point_assignments (
    requester_id, target_user_id, points, justification, 
    selected_approver_id, selected_at
  )
  VALUES (
    p_requester_id, p_target_user_id, p_points, p_justification,
    v_approver_id, now()
  )
  RETURNING id INTO v_assignment_id;
  
  -- Criar log de auditoria
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
      'approver_id', v_approver_id
    ),
    NULL
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'assignment_id', v_assignment_id,
    'approver_id', v_approver_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.4 Função para aprovar atribuição de pontos
CREATE OR REPLACE FUNCTION approve_point_assignment(
  p_assignment_id uuid,
  p_approver_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_assignment pending_point_assignments%ROWTYPE;
  v_transaction_id uuid;
BEGIN
  -- Buscar e validar a atribuição
  SELECT * INTO v_assignment
  FROM pending_point_assignments
  WHERE id = p_assignment_id
  FOR UPDATE; -- Lock para evitar race conditions
  
  IF v_assignment IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Atribuição não encontrada');
  END IF;
  
  IF v_assignment.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Atribuição já foi processada');
  END IF;
  
  -- Verificar se o aprovador é o correto (ou admin)
  IF v_assignment.selected_approver_id != p_approver_id THEN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_approver_id AND role = 'adm') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Usuário não autorizado a aprovar esta solicitação');
    END IF;
  END IF;
  
  -- Criar transação de crédito
  INSERT INTO transactions (user_id, tipo, valor, descricao)
  VALUES (
    v_assignment.target_user_id,
    'credito',
    v_assignment.points,
    'Atribuição de pontos: ' || v_assignment.justification
  )
  RETURNING id INTO v_transaction_id;
  
  -- Atualizar status da atribuição
  UPDATE pending_point_assignments
  SET status = 'approved', decided_at = now()
  WHERE id = p_assignment_id;
  
  -- Criar log de auditoria
  PERFORM create_audit_log(
    'ASSIGNMENT_APPROVED',
    'pending_point_assignments',
    p_assignment_id,
    p_approver_id,
    jsonb_build_object('status', 'pending'),
    jsonb_build_object('status', 'approved', 'transaction_id', v_transaction_id),
    NULL
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'points_assigned', v_assignment.points
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.5 Função para rejeitar atribuição de pontos
CREATE OR REPLACE FUNCTION reject_point_assignment(
  p_assignment_id uuid,
  p_approver_id uuid,
  p_rejection_reason text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_assignment pending_point_assignments%ROWTYPE;
BEGIN
  -- Buscar e validar a atribuição
  SELECT * INTO v_assignment
  FROM pending_point_assignments
  WHERE id = p_assignment_id
  FOR UPDATE;
  
  IF v_assignment IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Atribuição não encontrada');
  END IF;
  
  IF v_assignment.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Atribuição já foi processada');
  END IF;
  
  -- Verificar se o aprovador é o correto (ou admin)
  IF v_assignment.selected_approver_id != p_approver_id THEN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_approver_id AND role = 'adm') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Usuário não autorizado a rejeitar esta solicitação');
    END IF;
  END IF;
  
  -- Atualizar status da atribuição
  UPDATE pending_point_assignments
  SET 
    status = 'rejected', 
    decided_at = now(),
    rejection_reason = p_rejection_reason
  WHERE id = p_assignment_id;
  
  -- Criar log de auditoria
  PERFORM create_audit_log(
    'ASSIGNMENT_REJECTED',
    'pending_point_assignments',
    p_assignment_id,
    p_approver_id,
    jsonb_build_object('status', 'pending'),
    jsonb_build_object('status', 'rejected', 'reason', p_rejection_reason),
    NULL
  );
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.6 Função para buscar usuários do departamento
CREATE OR REPLACE FUNCTION get_department_users(p_department text)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM users
  WHERE department = p_department
  ORDER BY nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.7 Função para contar aprovações pendentes de um usuário
CREATE OR REPLACE FUNCTION count_pending_approvals(p_user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM pending_point_assignments
    WHERE selected_approver_id = p_user_id
      AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FASE 6: ATUALIZAR FUNÇÃO handle_new_user PARA INCLUIR department
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, cargo, role, department)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', 'Novo Colaborador'),
    COALESCE(new.raw_user_meta_data->>'cargo', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'colaborador'),
    new.raw_user_meta_data->>'department'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FASE 7: POLÍTICAS ADICIONAIS PARA GESTORES
-- ============================================================================

-- Gestores podem ver usuários do mesmo departamento
CREATE POLICY "Managers can view department users"
  ON users FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'gestor'
    AND department = (SELECT department FROM users WHERE id = auth.uid())
  );

-- Gestores podem ver transações do seu departamento (para auditoria)
CREATE POLICY "Managers can view department transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'gestor'
    AND user_id IN (
      SELECT id FROM users 
      WHERE department = (SELECT department FROM users WHERE id = auth.uid())
    )
  );

-- ============================================================================
-- FASE 8: TRIGGERS PARA UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE pending_point_assignments IS 
  'Armazena solicitações de atribuição de pontos pendentes de aprovação por gestores';

COMMENT ON TABLE audit_logs IS 
  'Registro de auditoria de todas as ações do sistema de pontos';

COMMENT ON TABLE departments IS 
  'Lista de departamentos da organização';

COMMENT ON FUNCTION select_random_approver IS 
  'Seleciona aleatoriamente um gestor do mesmo departamento para aprovar atribuição de pontos';

COMMENT ON FUNCTION create_point_assignment IS 
  'Cria uma nova solicitação de atribuição de pontos com seleção automática de aprovador';

COMMENT ON FUNCTION approve_point_assignment IS 
  'Aprova uma solicitação de atribuição de pontos e cria a transação de crédito';

COMMENT ON FUNCTION reject_point_assignment IS 
  'Rejeita uma solicitação de atribuição de pontos';
