-- =====================================================
-- MIGRATION: Adicionar campo de status de entrega
-- Data: 2026-02-11
-- Descrição: Separa o status da operação de resgate do status
--            do processo de entrega da recompensa
-- =====================================================

-- 1. Adicionar novo campo fulfillment_status
ALTER TABLE redemptions 
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT NOT NULL DEFAULT 'pendente';

-- 2. Adicionar constraint para valores permitidos
ALTER TABLE redemptions 
ADD CONSTRAINT redemptions_fulfillment_status_check 
CHECK (fulfillment_status IN ('pendente', 'aprovado', 'entregue', 'cancelado'));

-- 3. Criar índice para melhor performance em queries filtradas
CREATE INDEX IF NOT EXISTS idx_redemptions_fulfillment_status 
ON redemptions(fulfillment_status);

-- 4. Atualizar todos os registros existentes baseado na lógica atual
-- Resgates com status 'concluido' que já foram processados permanecerão como 'pendente'
-- para que os gestores possam revisar e marcar como 'entregue'
UPDATE redemptions 
SET fulfillment_status = 'pendente' 
WHERE fulfillment_status IS NULL OR fulfillment_status = 'pendente';

-- 5. Adicionar campo para rastrear quem processou a entrega
ALTER TABLE redemptions 
ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES users(id);

ALTER TABLE redemptions 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- 6. Comentários de documentação
COMMENT ON COLUMN redemptions.status IS 'Status da operação de resgate pelo usuário: pendente, concluido, cancelado';
COMMENT ON COLUMN redemptions.fulfillment_status IS 'Status do processo de entrega pelo gestor: pendente (aguardando), aprovado (em processamento), entregue (finalizado), cancelado';
COMMENT ON COLUMN redemptions.processed_by IS 'ID do gestor/admin que processou a entrega';
COMMENT ON COLUMN redemptions.processed_at IS 'Data/hora em que a entrega foi processada';

-- =====================================================
-- EXPLICAÇÃO DOS STATUS:
-- =====================================================
-- 
-- redemptions.status (operação do usuário):
--   - 'pendente': Usuário iniciou mas não confirmou (se aplicável)
--   - 'concluido': Resgate realizado com sucesso pelo usuário
--   - 'cancelado': Usuário cancelou o resgate
--
-- redemptions.fulfillment_status (processo do gestor):
--   - 'pendente': Aguardando análise/processamento do gestor
--   - 'aprovado': Gestor aprovou, recompensa em preparação
--   - 'entregue': Recompensa entregue ao colaborador (FINALIZADO)
--   - 'cancelado': Gestor cancelou a entrega (pontos devolvidos)
--
-- =====================================================
