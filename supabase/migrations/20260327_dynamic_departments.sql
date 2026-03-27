/*
  # Sistema de Departamentos Dinâmicos

  ## Descrição
  Este script implementa um sistema onde departamentos podem ser cadastrados
  dinamicamente através da interface, sem necessidade de alterar o código.

  ## Componentes
  1. Tabela `departments` - Lista de departamentos cadastrados
  2. Funções de gerenciamento dos departamentos
  3. Migração dos departamentos existentes
*/

-- ============================================================================
-- 0. HABILITAR EXTENSÃO UNACCENT (se disponível)
-- ============================================================================

-- Tentar criar a extensão unaccent (pode falhar se não tiver permissão)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================================
-- 1. TABELA DE DEPARTAMENTOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador único do departamento (slug)
  slug text NOT NULL UNIQUE,
  
  -- Nome exibido para o usuário
  label text NOT NULL,
  
  -- Departamento ativo/inativo
  is_active boolean NOT NULL DEFAULT true,
  
  -- Ordem de exibição
  display_order integer DEFAULT 0,
  
  -- Metadados
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments(slug);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_order ON departments(display_order);

-- RLS para departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa (inclusive anônimos) pode ver departamentos ativos
-- Necessário para a página de cadastro onde o usuário ainda não está logado
CREATE POLICY "Anyone can view active departments"
  ON departments FOR SELECT
  USING (is_active = true);

-- Apenas admins podem ver todos os departamentos (incluindo inativos)
CREATE POLICY "Admins can view all departments"
  ON departments FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  );

-- Apenas admins podem inserir departamentos
CREATE POLICY "Admins can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  );

-- Apenas admins podem atualizar departamentos
CREATE POLICY "Admins can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  );

-- Apenas admins podem deletar departamentos
CREATE POLICY "Admins can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  );

-- ============================================================================
-- 2. MIGRAR DEPARTAMENTOS EXISTENTES
-- ============================================================================

-- Inserir departamentos que já existem no sistema
INSERT INTO departments (slug, label, display_order, is_active)
VALUES 
  ('financeiro', 'Financeiro', 1, true),
  ('faturamento', 'Faturamento', 2, true),
  ('transporte', 'Transporte', 3, true),
  ('qualidade', 'Qualidade', 4, true),
  ('ti', 'TI', 5, true),
  ('rh', 'RH', 6, true),
  ('area_tecnica', 'Área Técnica', 7, true),
  ('atendimento', 'Atendimento', 8, true),
  ('autorizacao_cadastro', 'Autorização e Cadastro', 9, true),
  ('analises_clinicas', 'Análises Clínicas', 10, true),
  ('estoque', 'Estoque', 11, true),
  ('copa_limpeza', 'Copa e Limpeza', 12, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3. FUNÇÕES DE GERENCIAMENTO
-- ============================================================================

-- Função para obter todos os departamentos ativos
CREATE OR REPLACE FUNCTION get_departments()
RETURNS TABLE (
  id uuid,
  slug text,
  label text,
  display_order integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.slug, d.label, d.display_order
  FROM departments d
  WHERE d.is_active = true
  ORDER BY d.display_order ASC, d.label ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_departments() TO authenticated;

-- Função para criar um novo departamento
CREATE OR REPLACE FUNCTION create_department(
  p_label text,
  p_slug text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_user_role text;
  v_slug text;
  v_max_order integer;
  v_new_id uuid;
  v_clean_label text;
BEGIN
  -- Verificar se é admin
  SELECT role INTO v_user_role FROM users WHERE id = auth.uid();
  
  IF v_user_role != 'adm' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem criar departamentos');
  END IF;
  
  -- Validar label
  IF p_label IS NULL OR trim(p_label) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nome do departamento é obrigatório');
  END IF;
  
  -- Gerar slug se não fornecido
  IF p_slug IS NULL OR trim(p_slug) = '' THEN
    -- Remover acentos manualmente (fallback se unaccent não disponível)
    v_clean_label := trim(p_label);
    v_clean_label := translate(v_clean_label, 
      'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
      'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
    );
    v_slug := lower(
      regexp_replace(
        regexp_replace(
          v_clean_label,
          '[^a-zA-Z0-9]+', '_', 'g'
        ),
        '^_|_$', '', 'g'
      )
    );
  ELSE
    v_slug := lower(trim(p_slug));
  END IF;
  
  -- Verificar se slug já existe
  IF EXISTS (SELECT 1 FROM departments WHERE slug = v_slug) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Já existe um departamento com este nome');
  END IF;
  
  -- Obter próxima ordem
  SELECT COALESCE(MAX(display_order), 0) + 1 INTO v_max_order FROM departments;
  
  -- Inserir departamento
  INSERT INTO departments (slug, label, display_order, created_by)
  VALUES (v_slug, trim(p_label), v_max_order, auth.uid())
  RETURNING id INTO v_new_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'department', jsonb_build_object(
      'id', v_new_id,
      'slug', v_slug,
      'label', trim(p_label),
      'display_order', v_max_order
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_department(text, text) TO authenticated;

-- Função para atualizar um departamento
CREATE OR REPLACE FUNCTION update_department(
  p_id uuid,
  p_label text DEFAULT NULL,
  p_is_active boolean DEFAULT NULL,
  p_display_order integer DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_user_role text;
BEGIN
  -- Verificar se é admin
  SELECT role INTO v_user_role FROM users WHERE id = auth.uid();
  
  IF v_user_role != 'adm' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem atualizar departamentos');
  END IF;
  
  -- Verificar se departamento existe
  IF NOT EXISTS (SELECT 1 FROM departments WHERE id = p_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Departamento não encontrado');
  END IF;
  
  -- Atualizar campos fornecidos
  UPDATE departments
  SET 
    label = COALESCE(p_label, label),
    is_active = COALESCE(p_is_active, is_active),
    display_order = COALESCE(p_display_order, display_order),
    updated_at = now()
  WHERE id = p_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_department(uuid, text, boolean, integer) TO authenticated;

-- Função para deletar um departamento (soft delete)
CREATE OR REPLACE FUNCTION delete_department(p_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_user_role text;
  v_users_count integer;
BEGIN
  -- Verificar se é admin
  SELECT role INTO v_user_role FROM users WHERE id = auth.uid();
  
  IF v_user_role != 'adm' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem excluir departamentos');
  END IF;
  
  -- Verificar se departamento existe
  IF NOT EXISTS (SELECT 1 FROM departments WHERE id = p_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Departamento não encontrado');
  END IF;
  
  -- Verificar se há usuários vinculados
  SELECT COUNT(*) INTO v_users_count 
  FROM users u
  JOIN departments d ON d.slug = u.department
  WHERE d.id = p_id;
  
  IF v_users_count > 0 THEN
    -- Soft delete - apenas desativa
    UPDATE departments
    SET is_active = false, updated_at = now()
    WHERE id = p_id;
    
    RETURN jsonb_build_object(
      'success', true, 
      'warning', 'Departamento desativado pois há ' || v_users_count || ' usuário(s) vinculado(s)'
    );
  ELSE
    -- Hard delete - remove completamente
    DELETE FROM departments WHERE id = p_id;
    
    RETURN jsonb_build_object('success', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_department(uuid) TO authenticated;

-- ============================================================================
-- 4. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE departments IS 'Cadastro dinâmico de departamentos do sistema';
COMMENT ON COLUMN departments.slug IS 'Identificador único do departamento (usado internamente)';
COMMENT ON COLUMN departments.label IS 'Nome de exibição do departamento';
COMMENT ON COLUMN departments.is_active IS 'Se false, o departamento não aparece nas listas mas mantém histórico';
COMMENT ON COLUMN departments.display_order IS 'Ordem de exibição nas listas';

COMMENT ON FUNCTION get_departments() IS 'Retorna lista de departamentos ativos ordenados';
COMMENT ON FUNCTION create_department(text, text) IS 'Cria um novo departamento';
COMMENT ON FUNCTION update_department(uuid, text, boolean, integer) IS 'Atualiza informações de um departamento';
COMMENT ON FUNCTION delete_department(uuid) IS 'Remove ou desativa um departamento';
