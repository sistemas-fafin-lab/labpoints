-- Migration: Add reason field to transactions
-- Created: 2025-12-22

-- Create ENUM type for transaction reasons
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

-- Add reason column to transactions table
ALTER TABLE transactions
ADD COLUMN reason transaction_reason_enum;

-- Add reason column to pending_point_assignments table (for pending approvals)
ALTER TABLE pending_point_assignments
ADD COLUMN reason transaction_reason_enum;

-- Add comment to explain the column
COMMENT ON COLUMN transactions.reason IS 'Motivo da atribuição de pontos';
COMMENT ON COLUMN pending_point_assignments.reason IS 'Motivo da atribuição de pontos';
