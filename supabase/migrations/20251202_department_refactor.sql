-- =====================================================
-- REFATORAÇÃO DE DEPARTAMENTOS
-- Substitui o campo "cargo" por "department" com enum
-- Data: 2025-12-02
-- =====================================================

-- 1. Criar enum de departamentos (se não existir)
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
  WHEN duplicate_object THEN null;
END $$;

-- 2. Remover a tabela departments antiga (se existir)
DROP TABLE IF EXISTS departments CASCADE;

-- 3. Verificar e gerenciar a coluna department
DO $$
DECLARE
  col_exists boolean;
  col_type text;
BEGIN
  -- Verificar se a coluna department existe e qual o tipo
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'department'
  ) INTO col_exists;
  
  IF col_exists THEN
    -- Pegar o tipo atual da coluna
    SELECT data_type INTO col_type
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'department';
    
    -- Se não for department_enum, precisamos converter
    IF col_type != 'USER-DEFINED' THEN
      -- Renomear coluna antiga para backup
      ALTER TABLE users RENAME COLUMN department TO department_old;
      -- Criar nova coluna com tipo correto
      ALTER TABLE users ADD COLUMN department department_enum;
      -- Dropar coluna antiga
      ALTER TABLE users DROP COLUMN IF EXISTS department_old;
    END IF;
  ELSE
    -- Se não existe, criar
    ALTER TABLE users ADD COLUMN department department_enum;
  END IF;
END $$;

-- 4. Remover a coluna cargo antiga (se existir)
ALTER TABLE users DROP COLUMN IF EXISTS cargo;

-- 5. Criar índice para busca por departamento
DROP INDEX IF EXISTS idx_users_department;
CREATE INDEX idx_users_department ON users(department);

-- =====================================================
-- TABELA DE ASSOCIAÇÃO: GESTOR <-> DEPARTAMENTOS
-- Permite que um gestor gerencie múltiplos departamentos
-- =====================================================

-- 6. Criar tabela de associação gestor-departamentos
CREATE TABLE IF NOT EXISTS gestor_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gestor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department department_enum NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(gestor_id, department)
);

-- 7. Índices para a tabela de associação
CREATE INDEX IF NOT EXISTS idx_gestor_departments_gestor ON gestor_departments(gestor_id);
CREATE INDEX IF NOT EXISTS idx_gestor_departments_dept ON gestor_departments(department);

-- 8. RLS para gestor_departments
ALTER TABLE gestor_departments ENABLE ROW LEVEL SECURITY;

-- Dropar políticas existentes se houver
DROP POLICY IF EXISTS "admin_full_access_gestor_departments" ON gestor_departments;
DROP POLICY IF EXISTS "gestor_view_own_departments" ON gestor_departments;

-- Admins podem ver e modificar tudo
CREATE POLICY "admin_full_access_gestor_departments" ON gestor_departments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'adm')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'adm')
  );

-- Gestores podem ver seus próprios departamentos
CREATE POLICY "gestor_view_own_departments" ON gestor_departments
  FOR SELECT
  TO authenticated
  USING (gestor_id = auth.uid());

-- =====================================================
-- ATUALIZAR FUNÇÕES RPC
-- =====================================================

-- 9. Função para obter usuários de departamentos do gestor
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

-- 10. Função para obter departamentos de um gestor
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

-- 11. Atualizar trigger de novo usuário (remover cargo, usar department)
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

-- =====================================================
-- FUNÇÃO HELPER: Converter enum para label legível
-- =====================================================

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_department_users(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_gestor_departments(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION department_label(department_enum) TO authenticated;
