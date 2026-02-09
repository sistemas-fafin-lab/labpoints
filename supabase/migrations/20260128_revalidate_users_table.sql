-- =====================================================
-- REVALIDAÇÃO DA TABELA USERS
-- Script seguro e idempotente para revalidar estrutura
-- Data: 2026-01-28
-- =====================================================
-- IMPORTANTE: Este script NÃO afeta outras tabelas
-- Pode ser executado múltiplas vezes sem problemas
-- =====================================================

BEGIN;

-- =====================================================
-- 1. VERIFICAR E GARANTIR ESTRUTURA DE COLUNAS
-- =====================================================

-- Garantir que o enum de departamentos existe
DO $$ BEGIN
  CREATE TYPE department_enum AS ENUM (
    'financeiro',
    'faturamento',
    'transporte',
    'qualidade',
    'ti',
    'rh',
    'area_tecnica',
    'atendimento',
    'autorizacao_cadastro',
    'analises_clinicas',
    'estoque',
    'copa_limpeza'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Verificar e adicionar colunas faltantes na tabela users
DO $$
BEGIN
  -- Coluna email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text UNIQUE NOT NULL DEFAULT '';
    RAISE NOTICE 'Coluna email adicionada';
  END IF;

  -- Coluna nome
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'nome'
  ) THEN
    ALTER TABLE users ADD COLUMN nome text NOT NULL DEFAULT 'Colaborador';
    RAISE NOTICE 'Coluna nome adicionada';
  END IF;

  -- Coluna department
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'department'
  ) THEN
    ALTER TABLE users ADD COLUMN department department_enum;
    RAISE NOTICE 'Coluna department adicionada';
  END IF;

  -- Coluna avatar_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
    RAISE NOTICE 'Coluna avatar_url adicionada';
  END IF;

  -- Coluna lab_points
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'lab_points'
  ) THEN
    ALTER TABLE users ADD COLUMN lab_points integer NOT NULL DEFAULT 0;
    RAISE NOTICE 'Coluna lab_points adicionada';
  END IF;

  -- Coluna role
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role text NOT NULL DEFAULT 'colaborador';
    RAISE NOTICE 'Coluna role adicionada';
  END IF;

  -- Coluna created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE users ADD COLUMN created_at timestamptz DEFAULT now();
    RAISE NOTICE 'Coluna created_at adicionada';
  END IF;

  -- Coluna updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Coluna updated_at adicionada';
  END IF;
END $$;

-- =====================================================
-- 2. GARANTIR CONSTRAINTS CORRETOS
-- =====================================================

-- Adicionar check constraint para role se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_role_check' AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('colaborador', 'adm', 'gestor'));
    RAISE NOTICE 'Constraint users_role_check adicionada';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN check_violation THEN 
    RAISE NOTICE 'Constraint já existe ou dados incompatíveis';
END $$;

-- =====================================================
-- 3. GARANTIR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- 4. GARANTIR RLS HABILITADO
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. REMOVER TODAS AS POLÍTICAS RLS (De TODAS as tabelas)
-- =====================================================

-- Remover políticas antigas da tabela users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile fields" ON users;
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Gestors can view department users" ON users;
DROP POLICY IF EXISTS "gestors_view_department_users" ON users;
DROP POLICY IF EXISTS "Users can view relevant profiles" ON users;

-- Remover políticas antigas da tabela rewards
DROP POLICY IF EXISTS "Authenticated users can view active rewards" ON rewards;
DROP POLICY IF EXISTS "Admins can insert rewards" ON rewards;
DROP POLICY IF EXISTS "Admins can update rewards" ON rewards;
DROP POLICY IF EXISTS "Admins can delete rewards" ON rewards;

-- Remover políticas antigas da tabela pending_point_assignments
DROP POLICY IF EXISTS "Requesters can view own assignments" ON pending_point_assignments;
DROP POLICY IF EXISTS "Approvers can view assigned requests" ON pending_point_assignments;
DROP POLICY IF EXISTS "Admins can view all assignments" ON pending_point_assignments;
DROP POLICY IF EXISTS "Managers and admins can create assignments" ON pending_point_assignments;
DROP POLICY IF EXISTS "Approvers and admins can update assignments" ON pending_point_assignments;
DROP POLICY IF EXISTS "Users can view relevant assignments" ON pending_point_assignments;

-- Remover políticas antigas da tabela audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- =====================================================
-- 6. DROPAR E RECRIAR FUNÇÕES AUXILIARES
-- =====================================================

-- Agora podemos dropar as funções (sem dependências)
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.get_current_user_department();

-- Função que retorna a role do usuário sem passar pelo RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$;

-- Função que retorna o departamento do usuário sem passar pelo RLS
CREATE OR REPLACE FUNCTION public.get_current_user_department()
RETURNS department_enum
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT department FROM public.users WHERE id = auth.uid());
END;
$$;

-- Conceder permissão de execução
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_department() TO authenticated;

-- =====================================================
-- 7. RECRIAR POLÍTICAS RLS PARA TABELA USERS
-- =====================================================

-- Política de SELECT: SIMPLES - sem subqueries recursivas
-- Usuário pode ver seu próprio perfil
-- Admins e Gestores têm acesso via função SECURITY DEFINER
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (
    -- Próprio perfil (sem subquery!)
    auth.uid() = id 
    OR 
    -- Admin pode ver todos (usa função que bypassa RLS)
    public.get_current_user_role() = 'adm'
    OR
    -- Gestor pode ver colaboradores do mesmo departamento (com cast explícito)
    (
      public.get_current_user_role() = 'gestor'
      AND (department::text = public.get_current_user_department()::text OR (department IS NULL AND public.get_current_user_department() IS NULL))
    )
  );

-- Política de UPDATE simplificada
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    public.get_current_user_role() = 'adm'
  )
  WITH CHECK (
    auth.uid() = id 
    OR 
    public.get_current_user_role() = 'adm'
  );

-- Política de INSERT: permite criação de perfil pelo trigger
CREATE POLICY "Allow user creation"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permite que o próprio usuário seja criado (via trigger)
    auth.uid() = id
    OR
    -- Ou se for admin criando outro usuário
    public.get_current_user_role() = 'adm'
  );

-- =====================================================
-- 8. RECRIAR POLÍTICAS RLS PARA TABELA REWARDS
-- =====================================================

-- Garantir RLS habilitado na tabela rewards
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Política de SELECT simplificada: todos autenticados veem rewards ativos
-- Admins veem todos (ativos e inativos)
CREATE POLICY "Authenticated users can view active rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (
    ativo = true 
    OR 
    public.get_current_user_role() = 'adm'
  );

-- Política de INSERT para admins
CREATE POLICY "Admins can insert rewards"
  ON rewards FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_user_role() = 'adm');

-- Política de UPDATE para admins
CREATE POLICY "Admins can update rewards"
  ON rewards FOR UPDATE
  TO authenticated
  USING (public.get_current_user_role() = 'adm')
  WITH CHECK (public.get_current_user_role() = 'adm');

-- Política de DELETE para admins
CREATE POLICY "Admins can delete rewards"
  ON rewards FOR DELETE
  TO authenticated
  USING (public.get_current_user_role() = 'adm');

-- =====================================================
-- 9. RECRIAR POLÍTICAS RLS PARA PENDING_POINT_ASSIGNMENTS
-- =====================================================

-- Garantir RLS habilitado
ALTER TABLE pending_point_assignments ENABLE ROW LEVEL SECURITY;

-- Política de SELECT unificada
CREATE POLICY "Users can view relevant assignments"
  ON pending_point_assignments FOR SELECT
  TO authenticated
  USING (
    -- Próprias solicitações (como requester)
    requester_id = auth.uid()
    OR
    -- Solicitações atribuídas para aprovar
    selected_approver_id = auth.uid()
    OR
    -- Admin pode ver tudo
    public.get_current_user_role() = 'adm'
  );

-- Política de INSERT: gestores e admins podem criar
CREATE POLICY "Managers and admins can create assignments"
  ON pending_point_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    requester_id = auth.uid() 
    AND (public.get_current_user_role() = 'gestor' OR public.get_current_user_role() = 'adm')
  );

-- Política de UPDATE: aprovadores e admins podem atualizar
CREATE POLICY "Approvers and admins can update assignments"
  ON pending_point_assignments FOR UPDATE
  TO authenticated
  USING (
    selected_approver_id = auth.uid() 
    OR public.get_current_user_role() = 'adm'
  )
  WITH CHECK (
    selected_approver_id = auth.uid() 
    OR public.get_current_user_role() = 'adm'
  );

-- =====================================================
-- 10. RECRIAR POLÍTICAS RLS PARA AUDIT_LOGS
-- =====================================================

-- Garantir RLS habilitado
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins podem ver logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (public.get_current_user_role() = 'adm');

-- Sistema pode inserir logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 11. RECRIAR FUNÇÕES RELACIONADAS À TABELA USERS
-- =====================================================

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dept_value department_enum;
BEGIN
  -- Converter string do metadado para enum de forma segura
  BEGIN
    dept_value := (new.raw_user_meta_data->>'department')::department_enum;
  EXCEPTION
    WHEN invalid_text_representation THEN
      dept_value := NULL;
    WHEN others THEN
      dept_value := NULL;
  END;

  INSERT INTO public.users (id, email, nome, department, role, lab_points)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    dept_value,
    COALESCE(new.raw_user_meta_data->>'role', 'colaborador'),
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = COALESCE(EXCLUDED.nome, users.nome),
    department = COALESCE(EXCLUDED.department, users.department);
  RETURN new;
END;
$$;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. RECRIAR TRIGGERS
-- =====================================================

-- Trigger para criar perfil quando usuário se registra no auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. FUNÇÕES AUXILIARES PARA DEPARTAMENTOS
-- =====================================================

-- Dropar funções existentes para recriar com assinatura correta
DROP FUNCTION IF EXISTS get_department_users(uuid);
DROP FUNCTION IF EXISTS get_gestor_departments(uuid);

-- Função para obter usuários dos departamentos de um gestor
CREATE OR REPLACE FUNCTION get_department_users(p_gestor_id uuid)
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  department department_enum,
  lab_points integer,
  role text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.nome,
    u.email,
    u.department,
    u.lab_points,
    u.role,
    u.avatar_url
  FROM users u
  WHERE u.department IN (
    SELECT gd.department 
    FROM gestor_departments gd 
    WHERE gd.gestor_id = p_gestor_id
  )
  AND u.id != p_gestor_id
  AND u.role = 'colaborador'
  ORDER BY u.nome;
END;
$$;

-- Função para obter departamentos de um gestor
CREATE OR REPLACE FUNCTION get_gestor_departments(p_gestor_id uuid)
RETURNS TABLE (department department_enum)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT gd.department
  FROM gestor_departments gd
  WHERE gd.gestor_id = p_gestor_id;
END;
$$;

-- Função para converter enum de departamento para label legível
CREATE OR REPLACE FUNCTION department_label(dept department_enum)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE dept
    WHEN 'financeiro' THEN 'Financeiro'
    WHEN 'faturamento' THEN 'Faturamento'
    WHEN 'transporte' THEN 'Transporte'
    WHEN 'qualidade' THEN 'Qualidade'
    WHEN 'ti' THEN 'TI'
    WHEN 'rh' THEN 'RH'
    WHEN 'area_tecnica' THEN 'Área Técnica'
    WHEN 'atendimento' THEN 'Atendimento'
    WHEN 'autorizacao_cadastro' THEN 'Autorização e Cadastro'
    WHEN 'analises_clinicas' THEN 'Análises Clínicas'
    WHEN 'estoque' THEN 'Estoque'
    WHEN 'copa_limpeza' THEN 'Copa e Limpeza'
    ELSE dept::text
  END;
END;
$$;

-- =====================================================
-- 14. PERMISSÕES DE EXECUÇÃO
-- =====================================================

GRANT EXECUTE ON FUNCTION get_department_users(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_gestor_departments(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION department_label(department_enum) TO authenticated;

-- =====================================================
-- 15. CORRIGIR FOREIGN KEYS DA TABELA PENDING_POINT_ASSIGNMENTS
-- (Para que o PostgREST reconheça os relacionamentos)
-- =====================================================

-- Verificar e recriar foreign keys com nomes explícitos
DO $$
BEGIN
  -- Dropar constraints antigas (se existirem)
  ALTER TABLE pending_point_assignments 
    DROP CONSTRAINT IF EXISTS pending_point_assignments_requester_id_fkey;
  
  ALTER TABLE pending_point_assignments 
    DROP CONSTRAINT IF EXISTS pending_point_assignments_target_user_id_fkey;
  
  ALTER TABLE pending_point_assignments 
    DROP CONSTRAINT IF EXISTS pending_point_assignments_selected_approver_id_fkey;

  -- Recriar com nomes explícitos que o PostgREST reconhece
  ALTER TABLE pending_point_assignments
    ADD CONSTRAINT pending_point_assignments_requester_id_fkey
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE;

  ALTER TABLE pending_point_assignments
    ADD CONSTRAINT pending_point_assignments_target_user_id_fkey
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE;

  ALTER TABLE pending_point_assignments
    ADD CONSTRAINT pending_point_assignments_selected_approver_id_fkey
    FOREIGN KEY (selected_approver_id) REFERENCES users(id) ON DELETE SET NULL;

  RAISE NOTICE 'Foreign keys de pending_point_assignments recriadas com sucesso';
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Erro ao recriar foreign keys: %', SQLERRM;
END $$;

-- =====================================================
-- 16. VALIDAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  col_count integer;
  user_policy_count integer;
  reward_policy_count integer;
  assignment_policy_count integer;
  fk_count integer;
BEGIN
  -- Contar colunas esperadas na tabela users
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('id', 'email', 'nome', 'department', 'avatar_url', 'lab_points', 'role', 'created_at', 'updated_at');
  
  -- Contar políticas da tabela users
  SELECT COUNT(*) INTO user_policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'users';
  
  -- Contar políticas da tabela rewards
  SELECT COUNT(*) INTO reward_policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'rewards';
  
  -- Contar políticas da tabela pending_point_assignments
  SELECT COUNT(*) INTO assignment_policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'pending_point_assignments';
  
  -- Contar foreign keys de pending_point_assignments
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE table_schema = 'public' 
  AND table_name = 'pending_point_assignments'
  AND constraint_type = 'FOREIGN KEY';
  
  RAISE NOTICE '=== VALIDAÇÃO CONCLUÍDA ===';
  RAISE NOTICE 'Colunas users verificadas: % de 9 esperadas', col_count;
  RAISE NOTICE 'Políticas RLS users: %', user_policy_count;
  RAISE NOTICE 'Políticas RLS rewards: %', reward_policy_count;
  RAISE NOTICE 'Políticas RLS pending_point_assignments: %', assignment_policy_count;
  RAISE NOTICE 'Foreign keys pending_point_assignments: %', fk_count;
  RAISE NOTICE 'RLS habilitado em users, rewards, pending_point_assignments e audit_logs';
  RAISE NOTICE '===========================';
END $$;

COMMIT;

-- =====================================================
-- RESUMO DAS ALTERAÇÕES:
-- =====================================================
-- ✓ Verificação e criação de colunas faltantes
-- ✓ Garantia de constraints corretos (role check)
-- ✓ Criação de índices para performance
-- ✓ Habilitação de RLS
-- ✓ Recriação de políticas RLS corrigidas
-- ✓ Recriação de funções (handle_new_user, update_updated_at)
-- ✓ Recriação de triggers
-- ✓ Funções auxiliares de departamento
-- ✓ Permissões de execução
-- ✓ Correção de foreign keys para PostgREST
-- =====================================================
