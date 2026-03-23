/*
  # Sistema de Aprovadores Customizados

  ## Descrição
  Este script implementa um sistema alternativo de aprovação onde administradores
  podem selecionar manualmente quais usuários (gestores ou admins) serão os aprovadores
  das atribuições de pontos.

  ## Componentes
  1. Tabela `approval_settings` - Configurações do sistema de aprovação
  2. Tabela `custom_approvers` - Lista de aprovadores customizados
  3. Função `select_random_approver` atualizada - Usa aprovadores customizados quando configurado
  4. Funções de gerenciamento dos aprovadores customizados
*/

-- ============================================================================
-- 1. TABELA DE CONFIGURAÇÕES DE APROVAÇÃO
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Se true, usa aprovadores customizados; se false, usa lógica aleatória
  use_custom_approvers boolean NOT NULL DEFAULT false,
  
  -- Metadados
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Inserir configuração padrão (modo aleatório ativo)
INSERT INTO approval_settings (use_custom_approvers)
VALUES (false)
ON CONFLICT DO NOTHING;

-- Garantir que só existe uma linha de configuração
CREATE UNIQUE INDEX IF NOT EXISTS approval_settings_singleton ON approval_settings ((true));

-- RLS para approval_settings
ALTER TABLE approval_settings ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver/editar configurações
CREATE POLICY "Admins can view approval_settings"
  ON approval_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  );

CREATE POLICY "Admins can update approval_settings"
  ON approval_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  );

-- ============================================================================
-- 2. TABELA DE APROVADORES CUSTOMIZADOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_approvers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- O usuário selecionado como aprovador (deve ser gestor ou admin)
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Quem adicionou este aprovador
  added_by uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- Quando foi adicionado
  created_at timestamptz DEFAULT now(),
  
  -- Garantir que cada usuário só aparece uma vez
  CONSTRAINT unique_custom_approver UNIQUE (user_id)
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_custom_approvers_user_id ON custom_approvers(user_id);

-- RLS para custom_approvers
ALTER TABLE custom_approvers ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver os aprovadores customizados
CREATE POLICY "Authenticated users can view custom_approvers"
  ON custom_approvers FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem adicionar/remover aprovadores
CREATE POLICY "Admins can insert custom_approvers"
  ON custom_approvers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  );

CREATE POLICY "Admins can delete custom_approvers"
  ON custom_approvers FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'adm')
  );

-- ============================================================================
-- 3. FUNÇÕES DE GERENCIAMENTO
-- ============================================================================

-- Função para obter configurações de aprovação
CREATE OR REPLACE FUNCTION get_approval_settings()
RETURNS jsonb AS $$
DECLARE
  v_settings record;
  v_approvers jsonb;
BEGIN
  -- Obter configurações
  SELECT use_custom_approvers, updated_at, updated_by
  INTO v_settings
  FROM approval_settings
  LIMIT 1;
  
  -- Obter lista de aprovadores customizados com dados do usuário
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', ca.id,
      'user_id', ca.user_id,
      'user', jsonb_build_object(
        'id', u.id,
        'nome', u.nome,
        'email', u.email,
        'avatar_url', u.avatar_url,
        'department', u.department,
        'role', u.role
      ),
      'added_at', ca.created_at
    )
  ), '[]'::jsonb)
  INTO v_approvers
  FROM custom_approvers ca
  JOIN users u ON u.id = ca.user_id;
  
  RETURN jsonb_build_object(
    'use_custom_approvers', COALESCE(v_settings.use_custom_approvers, false),
    'updated_at', v_settings.updated_at,
    'custom_approvers', v_approvers
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_approval_settings() TO authenticated;

-- Função para atualizar configuração de usar aprovadores customizados
CREATE OR REPLACE FUNCTION set_use_custom_approvers(p_use_custom boolean)
RETURNS jsonb AS $$
DECLARE
  v_user_role text;
  v_settings_id uuid;
BEGIN
  -- Verificar se é admin
  SELECT role INTO v_user_role FROM users WHERE id = auth.uid();
  
  IF v_user_role != 'adm' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem alterar esta configuração');
  END IF;
  
  -- Buscar ID da configuração existente
  SELECT id INTO v_settings_id FROM approval_settings LIMIT 1;
  
  IF v_settings_id IS NOT NULL THEN
    -- Atualizar configuração existente
    UPDATE approval_settings
    SET use_custom_approvers = p_use_custom,
        updated_at = now(),
        updated_by = auth.uid()
    WHERE id = v_settings_id;
  ELSE
    -- Criar nova configuração
    INSERT INTO approval_settings (use_custom_approvers, updated_by)
    VALUES (p_use_custom, auth.uid());
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_use_custom_approvers(boolean) TO authenticated;

-- Função para adicionar aprovador customizado
CREATE OR REPLACE FUNCTION add_custom_approver(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_user_role text;
  v_target_role text;
BEGIN
  -- Verificar se quem está chamando é admin
  SELECT role INTO v_user_role FROM users WHERE id = auth.uid();
  
  IF v_user_role != 'adm' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem adicionar aprovadores');
  END IF;
  
  -- Verificar se o usuário alvo é gestor ou admin
  SELECT role INTO v_target_role FROM users WHERE id = p_user_id;
  
  IF v_target_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  IF v_target_role NOT IN ('gestor', 'adm') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas gestores ou administradores podem ser aprovadores');
  END IF;
  
  -- Adicionar aprovador
  INSERT INTO custom_approvers (user_id, added_by)
  VALUES (p_user_id, auth.uid())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_custom_approver(uuid) TO authenticated;

-- Função para remover aprovador customizado
CREATE OR REPLACE FUNCTION remove_custom_approver(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_user_role text;
BEGIN
  -- Verificar se quem está chamando é admin
  SELECT role INTO v_user_role FROM users WHERE id = auth.uid();
  
  IF v_user_role != 'adm' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem remover aprovadores');
  END IF;
  
  -- Remover aprovador
  DELETE FROM custom_approvers WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION remove_custom_approver(uuid) TO authenticated;

-- Função para definir todos os aprovadores de uma vez
CREATE OR REPLACE FUNCTION set_custom_approvers(p_user_ids uuid[])
RETURNS jsonb AS $$
DECLARE
  v_user_role text;
  v_uid uuid;
  v_target_role text;
BEGIN
  -- Verificar se quem está chamando é admin
  SELECT role INTO v_user_role FROM users WHERE id = auth.uid();
  
  IF v_user_role != 'adm' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem configurar aprovadores');
  END IF;
  
  -- Verificar se todos os usuários são gestores ou admins
  FOREACH v_uid IN ARRAY p_user_ids LOOP
    SELECT role INTO v_target_role FROM users WHERE id = v_uid;
    
    IF v_target_role IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Usuário não encontrado: ' || v_uid::text);
    END IF;
    
    IF v_target_role NOT IN ('gestor', 'adm') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Apenas gestores ou administradores podem ser aprovadores');
    END IF;
  END LOOP;
  
  -- Limpar aprovadores existentes
  DELETE FROM custom_approvers;
  
  -- Inserir novos aprovadores
  INSERT INTO custom_approvers (user_id, added_by)
  SELECT unnest(p_user_ids), auth.uid();
  
  RETURN jsonb_build_object('success', true, 'count', array_length(p_user_ids, 1));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_custom_approvers(uuid[]) TO authenticated;

-- ============================================================================
-- 4. ATUALIZAR FUNÇÃO select_random_approver
-- ============================================================================

-- Dropar versões anteriores
DROP FUNCTION IF EXISTS select_random_approver(uuid, text, uuid);

-- Recriar com suporte a aprovadores customizados
CREATE OR REPLACE FUNCTION select_random_approver(
  p_requester_id uuid,
  p_department text,
  p_target_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_approver_id uuid;
  v_use_custom boolean;
BEGIN
  -- Verificar se deve usar aprovadores customizados
  SELECT use_custom_approvers INTO v_use_custom
  FROM approval_settings
  LIMIT 1;
  
  -- Se usar aprovadores customizados
  IF v_use_custom = true THEN
    -- Forçar nova seed aleatória
    PERFORM setseed(extract(epoch from clock_timestamp()) - floor(extract(epoch from clock_timestamp())));
    
    -- Selecionar aleatoriamente entre os aprovadores customizados
    -- Excluindo requester e target_user
    SELECT ca.user_id INTO v_approver_id
    FROM custom_approvers ca
    JOIN users u ON u.id = ca.user_id
    WHERE u.role IN ('gestor', 'adm')
      AND ca.user_id != p_requester_id
      AND (p_target_user_id IS NULL OR ca.user_id != p_target_user_id)
    ORDER BY random()
    LIMIT 1;
    
    -- Se encontrou aprovador customizado, retornar
    IF v_approver_id IS NOT NULL THEN
      RETURN v_approver_id;
    END IF;
    
    -- Se não encontrou entre os customizados, cair para lógica padrão
  END IF;
  
  -- Lógica padrão: selecionar aleatoriamente qualquer gestor
  PERFORM setseed(extract(epoch from clock_timestamp()) - floor(extract(epoch from clock_timestamp())));
  
  SELECT id INTO v_approver_id
  FROM users
  WHERE role = 'gestor'
    AND id != p_requester_id
    AND (p_target_user_id IS NULL OR id != p_target_user_id)
  ORDER BY random()
  LIMIT 1;
  
  -- Fallback para admin
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

-- ============================================================================
-- 5. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE approval_settings IS 'Configurações do sistema de aprovação de pontos';
COMMENT ON COLUMN approval_settings.use_custom_approvers IS 'Se true, usa apenas aprovadores da lista custom_approvers';

COMMENT ON TABLE custom_approvers IS 'Lista de usuários selecionados como aprovadores customizados';
COMMENT ON COLUMN custom_approvers.user_id IS 'ID do usuário que pode aprovar (deve ser gestor ou admin)';

COMMENT ON FUNCTION get_approval_settings() IS 'Retorna as configurações de aprovação e lista de aprovadores customizados';
COMMENT ON FUNCTION set_use_custom_approvers(boolean) IS 'Ativa/desativa o modo de aprovadores customizados';
COMMENT ON FUNCTION add_custom_approver(uuid) IS 'Adiciona um usuário à lista de aprovadores customizados';
COMMENT ON FUNCTION remove_custom_approver(uuid) IS 'Remove um usuário da lista de aprovadores customizados';
COMMENT ON FUNCTION set_custom_approvers(uuid[]) IS 'Define a lista completa de aprovadores customizados';
