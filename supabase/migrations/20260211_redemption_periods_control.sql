-- =====================================================
-- MIGRAÇÃO: Controle de Períodos de Resgates
-- Data: 2026-02-11
-- Descrição: Adiciona tabela para configuração de períodos
--            de resgate e atualiza status da tabela redemptions
-- =====================================================

-- =====================================================
-- 1. TABELA DE PERÍODOS DE RESGATE
-- =====================================================

-- Tabela para armazenar configurações de período de resgate
CREATE TABLE IF NOT EXISTS redemption_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_day INTEGER NOT NULL CHECK (start_day >= 1 AND start_day <= 31),
  end_day INTEGER NOT NULL CHECK (end_day >= 1 AND end_day <= 31),
  department TEXT NOT NULL UNIQUE, -- Use 'general' para período padrão
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_redemption_periods_department ON redemption_periods(department);

-- Habilitar RLS (Row Level Security)
ALTER TABLE redemption_periods ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para redemption_periods
-- Todos os usuários autenticados podem ler os períodos
CREATE POLICY "Allow authenticated users to read redemption periods"
  ON redemption_periods
  FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem gerenciar períodos
CREATE POLICY "Allow admins to insert redemption periods"
  ON redemption_periods
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "Allow admins to update redemption periods"
  ON redemption_periods
  FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "Allow admins to delete redemption periods"
  ON redemption_periods
  FOR DELETE
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

-- =====================================================
-- 2. ATUALIZAÇÃO DA TABELA REDEMPTIONS
-- =====================================================

-- Alterar a constraint de status para incluir novos status
-- Primeiro, remover a constraint existente
ALTER TABLE redemptions 
  DROP CONSTRAINT IF EXISTS redemptions_status_check;

-- Adicionar nova constraint com status expandidos
ALTER TABLE redemptions 
  ADD CONSTRAINT redemptions_status_check 
  CHECK (status IN ('pendente', 'aprovado', 'resgatado', 'cancelado', 'concluido'));

-- Nota: 'concluido' mantido para compatibilidade com dados existentes
-- Mapear 'concluido' para 'resgatado' se desejado:
-- UPDATE redemptions SET status = 'resgatado' WHERE status = 'concluido';

-- =====================================================
-- 3. POLÍTICAS ADICIONAIS PARA REDEMPTIONS
-- =====================================================

-- Permitir que gestores e admins vejam todos os resgates
CREATE POLICY "Allow managers and admins to view all redemptions"
  ON redemptions
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('adm', 'gestor')
  );

-- Permitir que gestores e admins atualizem status dos resgates
CREATE POLICY "Allow managers and admins to update redemptions"
  ON redemptions
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('adm', 'gestor')
  )
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('adm', 'gestor')
  );

-- =====================================================
-- 4. FUNÇÃO PARA VERIFICAR PERÍODO DE RESGATE
-- =====================================================

-- Função que verifica se o dia atual está dentro do período configurado
CREATE OR REPLACE FUNCTION check_redemption_period()
RETURNS BOOLEAN AS $$
DECLARE
  period_record RECORD;
  current_day INTEGER;
BEGIN
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  
  -- Busca o período geral
  SELECT * INTO period_record 
  FROM redemption_periods 
  WHERE department = 'general' 
  LIMIT 1;
  
  -- Se não há período configurado, permite resgate
  IF period_record IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verifica se o dia atual está dentro do período
  RETURN current_day >= period_record.start_day AND current_day <= period_record.end_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE redemption_periods IS 'Configurações de períodos permitidos para resgate de recompensas';
COMMENT ON COLUMN redemption_periods.start_day IS 'Dia do mês que inicia o período de resgate (1-31)';
COMMENT ON COLUMN redemption_periods.end_day IS 'Dia do mês que termina o período de resgate (1-31)';
COMMENT ON COLUMN redemption_periods.department IS 'Identificador do departamento ou "general" para todos';

-- =====================================================
-- NOTAS DE MIGRAÇÃO
-- =====================================================
-- 
-- Status dos resgates:
-- - 'pendente': Resgate solicitado, aguardando aprovação
-- - 'aprovado': Resgate aprovado pelo gestor, aguardando entrega
-- - 'resgatado': Recompensa entregue ao colaborador
-- - 'cancelado': Resgate cancelado pelo gestor
-- - 'concluido': Status legado (equivalente a 'resgatado')
--
-- Para migrar dados existentes de 'concluido' para 'resgatado':
-- UPDATE redemptions SET status = 'resgatado' WHERE status = 'concluido';
--
-- =====================================================
