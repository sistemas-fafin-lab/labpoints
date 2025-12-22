# Implementação do Campo "Motivo" na Atribuição de Pontos

## 📋 Resumo das Alterações

Esta implementação adiciona um campo obrigatório "Motivo" ao fluxo de atribuição de pontos, permitindo categorizar as razões pelas quais os pontos são atribuídos aos colaboradores.

## 🎯 Funcionalidades Implementadas

### 1. Novo Campo no Modal de Atribuição

**Arquivo:** `src/components/AssignPointsModal.tsx`

**Alterações:**
- Adicionado campo select "Motivo" com 12 opções predefinidas
- Validação obrigatória do campo antes do envio
- Interface visual consistente com os outros campos do formulário
- Ícone `Tag` para representar o campo de motivo

**Posicionamento:**
- Campo inserido entre "Quantidade de Pontos" e "Justificativa"
- Ordem lógica: Usuário → Pontos → **Motivo** → Justificativa

### 2. Tipos TypeScript

**Arquivo:** `src/lib/supabase.ts`

**Novos tipos criados:**

```typescript
export type TransactionReasonEnum =
  | 'auditoria_processos_internos'
  | 'colaboracao_intersetorial'
  | 'colaboracao_intrasetorial'
  | 'estrategia_organizacao_planejamento'
  | 'otimizacao_processos'
  | 'postura_empatica'
  | 'postura_disciplina_autocontrole'
  | 'proatividade_inovacao'
  | 'promover_sustentabilidade_financeira'
  | 'protagonismo_desafios'
  | 'realizar_networking_parceiros'
  | 'responsabilidade_compromisso';
```

**Labels para exibição:**
```typescript
export const TRANSACTION_REASON_LABELS: Record<TransactionReasonEnum, string>
```

**Lista para componentes select:**
```typescript
export const TRANSACTION_REASONS_LIST: { value: TransactionReasonEnum; label: string }[]
```

**Type Transaction atualizado:**
```typescript
export type Transaction = {
  id: string;
  user_id: string;
  tipo: 'credito' | 'debito';
  valor: number;
  descricao: string;
  reason?: TransactionReasonEnum | null; // ← NOVO CAMPO
  created_at: string;
};
```

### 3. Migrations de Banco de Dados

#### Migration 1: Adicionar coluna reason
**Arquivo:** `supabase/migrations/20251222_add_transaction_reason.sql`

**Ações:**
1. Cria tipo ENUM `transaction_reason_enum` com os 12 valores
2. Adiciona coluna `reason` na tabela `transactions`
3. Adiciona coluna `reason` na tabela `pending_point_assignments`
4. Adiciona comentários explicativos

```sql
CREATE TYPE transaction_reason_enum AS ENUM (
  'auditoria_processos_internos',
  'colaboracao_intersetorial',
  -- ... outros valores
);

ALTER TABLE transactions
ADD COLUMN reason transaction_reason_enum;

ALTER TABLE pending_point_assignments
ADD COLUMN reason transaction_reason_enum;
```

#### Migration 2: Atualizar funções SQL
**Arquivo:** `supabase/migrations/20251222_update_create_point_assignment_with_reason.sql`

**Ações:**
1. Atualiza função `create_point_assignment` para aceitar parâmetro `p_reason`
2. Atualiza função `approve_point_assignment` para copiar reason para transactions
3. Mantém compatibilidade com reason opcional (DEFAULT NULL)

**Assinatura atualizada:**
```sql
CREATE OR REPLACE FUNCTION create_point_assignment(
  p_requester_id uuid,
  p_target_user_id uuid,
  p_points integer,
  p_justification text,
  p_reason transaction_reason_enum DEFAULT NULL -- ← NOVO PARÂMETRO
)
```

### 4. Hook usePointAssignments

**Arquivo:** `src/hooks/usePointAssignments.ts`

**Alterações:**
- Atualizada interface para incluir parâmetro `reason`
- Função `createAssignment` agora aceita 4 parâmetros
- Chamada RPC atualizada para passar `p_reason`

**Antes:**
```typescript
createAssignment: (targetUserId: string, points: number, justification: string)
```

**Depois:**
```typescript
createAssignment: (targetUserId: string, points: number, justification: string, reason: string)
```

## 📊 Opções de Motivo Disponíveis

| Valor no Banco | Label Exibido |
|----------------|---------------|
| `auditoria_processos_internos` | Auditoria de processos internos |
| `colaboracao_intersetorial` | Colaboração intersetorial |
| `colaboracao_intrasetorial` | Colaboração intrasetorial |
| `estrategia_organizacao_planejamento` | Estratégia, organização e planejamento |
| `otimizacao_processos` | Otimização de processos |
| `postura_empatica` | Postura empática |
| `postura_disciplina_autocontrole` | Postura, disciplina e autocontrole |
| `proatividade_inovacao` | Proatividade e inovação |
| `promover_sustentabilidade_financeira` | Promover a sustentabilidade financeira |
| `protagonismo_desafios` | Protagonismo em Desafios |
| `realizar_networking_parceiros` | Realizar networking com parceiros |
| `responsabilidade_compromisso` | Responsabilidade e compromisso |

## 🔄 Fluxo de Dados

```
1. Gestor/Admin abre AssignPointsModal
   ↓
2. Seleciona colaborador
   ↓
3. Preenche:
   - Quantidade de Pontos
   - Motivo (select) ← NOVO
   - Justificativa
   ↓
4. Submit → usePointAssignments.createAssignment()
   ↓
5. RPC → create_point_assignment(requester_id, target_id, points, justification, reason)
   ↓
6. Cria registro em pending_point_assignments com reason
   ↓
7. Quando aprovado → approve_point_assignment()
   ↓
8. Cria transaction com reason copiado da atribuição
```

## 🗂️ Estrutura de Tabelas Atualizada

### Tabela: `transactions`
```sql
id              uuid
user_id         uuid
tipo            varchar ('credito'|'debito')
valor           integer
descricao       text
reason          transaction_reason_enum  ← NOVO
created_at      timestamp
```

### Tabela: `pending_point_assignments`
```sql
id                      uuid
requester_id            uuid
target_user_id          uuid
points                  integer
justification           text
reason                  transaction_reason_enum  ← NOVO
selected_approver_id    uuid
status                  varchar
created_at              timestamp
approved_at             timestamp
approved_by             uuid
transaction_id          uuid
```

## 📝 Validações Implementadas

1. **Campo obrigatório:** O select "Motivo" é required no formulário
2. **Validação frontend:** Antes do submit, verifica se reason foi selecionado
3. **Mensagem de erro:** Exibe "Selecione um motivo" se não preenchido
4. **Placeholder:** "Selecione o motivo da atribuição..." para guiar o usuário

## 🎨 Design e UX

### Visual do Campo
- **Ícone:** Tag (lucide-react)
- **Estilo:** Consistente com outros campos (rounded-2xl, slate-100 bg)
- **Select customizado:** Arrow dropdown personalizada
- **Focus state:** Border lab-primary, ring-4 lab-primary/10
- **Responsivo:** Funciona em mobile e desktop

### Ordenação dos Campos no Formulário
1. **Colaborador Selecionado** (card com avatar)
2. **Quantidade de Pontos** (input numérico com badge "PONTOS")
3. **Motivo** (select dropdown) ← NOVO
4. **Justificativa** (textarea)
5. **Info Box** (aprovação necessária)
6. **Ações** (Voltar / Enviar)

## 🧪 Como Testar

### 1. Testar Criação de Atribuição
```typescript
// No navegador, como gestor ou admin:
1. Clicar em "Atribuir Pontos" no header
2. Selecionar um colaborador
3. Preencher pontos (ex: 100)
4. Selecionar motivo no dropdown
5. Escrever justificativa
6. Clicar "Enviar para Aprovação"
7. Verificar sucesso
```

### 2. Testar Validação
```typescript
// Tentar submeter sem selecionar motivo:
1. Preencher todos os campos EXCETO motivo
2. Tentar submeter
3. Deve aparecer erro: "Selecione um motivo"
```

### 3. Verificar no Banco
```sql
-- Verificar pending_point_assignments
SELECT id, target_user_id, points, reason, justification
FROM pending_point_assignments
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Após aprovar, verificar transactions
SELECT id, user_id, valor, reason, descricao
FROM transactions
WHERE tipo = 'credito'
ORDER BY created_at DESC;
```

## 🚀 Deploy

### Ordem de Execução
1. **Aplicar migrations no Supabase:**
   ```bash
   # Migration 1: Adicionar coluna e ENUM
   supabase/migrations/20251222_add_transaction_reason.sql
   
   # Migration 2: Atualizar funções
   supabase/migrations/20251222_update_create_point_assignment_with_reason.sql
   ```

2. **Deploy do código frontend:**
   - Alterações em TypeScript types (supabase.ts)
   - Atualização do componente (AssignPointsModal.tsx)
   - Atualização do hook (usePointAssignments.ts)

### Compatibilidade
- ✅ **Backward compatible:** Campo reason é opcional (DEFAULT NULL)
- ✅ **Atribuições antigas:** Continuam funcionando sem reason
- ✅ **Atribuições novas:** Devem incluir reason obrigatoriamente no frontend

## 📊 Impacto

### Alterações Breaking
- ❌ Nenhuma alteração breaking
- ✅ Migrations adicionam coluna opcional
- ✅ Funções SQL mantêm compatibilidade com DEFAULT NULL
- ✅ Frontend valida obrigatoriedade apenas para novas atribuições

### Dados Existentes
- Registros antigos terão `reason = NULL`
- Podem ser atualizados posteriormente se necessário
- Queries devem tratar `NULL` adequadamente

## 🔍 Queries Úteis

### Relatório de Motivos Mais Usados
```sql
SELECT 
  reason,
  COUNT(*) as total,
  SUM(valor) as total_pontos
FROM transactions
WHERE tipo = 'credito' 
  AND reason IS NOT NULL
GROUP BY reason
ORDER BY total DESC;
```

### Atribuições Pendentes por Motivo
```sql
SELECT 
  reason,
  COUNT(*) as total,
  SUM(points) as total_pontos
FROM pending_point_assignments
WHERE status = 'pending'
  AND reason IS NOT NULL
GROUP BY reason
ORDER BY total DESC;
```

### Colaboradores por Motivo de Pontuação
```sql
SELECT 
  u.nome,
  u.department,
  t.reason,
  COUNT(*) as vezes_pontuado,
  SUM(t.valor) as total_pontos
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.tipo = 'credito'
  AND t.reason IS NOT NULL
GROUP BY u.id, u.nome, u.department, t.reason
ORDER BY total_pontos DESC;
```

## 📚 Próximos Passos (Sugestões)

1. **Dashboard Analytics:**
   - Gráfico de pizza com distribuição de motivos
   - Top 3 motivos mais usados por departamento
   - Evolução temporal dos motivos

2. **Relatórios:**
   - Exportar CSV com reason incluído
   - Filtrar histórico por motivo
   - Ranking de colaboradores por categoria de motivo

3. **Notificações:**
   - Incluir motivo nas notificações de aprovação
   - Email com reason formatado

4. **Auditoria:**
   - Log de alterações de motivo (se permitido editar)
   - Rastreamento de uso por gestor

---

**Data de Implementação:** 22 de Dezembro de 2025  
**Status:** ✅ Completo e Pronto para Deploy  
**Desenvolvedor:** GitHub Copilot
