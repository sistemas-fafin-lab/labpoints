# Correção do Problema de Login

## 🔍 Problema Identificado

O problema estava nas políticas RLS (Row Level Security) da tabela `users`. As políticas criavam uma verificação circular:

1. Ao fazer login, o sistema tenta buscar o perfil do usuário na tabela `users`
2. A política de SELECT verificava subconsultas como `(SELECT role FROM users WHERE id = auth.uid())`
3. Esta subconsulta também precisa passar pelas mesmas políticas RLS
4. Isso cria um ciclo que impede o acesso ao perfil
5. Sem acesso ao perfil, o login falha mesmo com credenciais corretas

## ✅ Solução Implementada

Foi criada uma nova migration (`20251201000000_fix_user_policies.sql`) que:

1. **Remove as políticas problemáticas** com subconsultas circulares
2. **Cria políticas otimizadas** que:
   - Permitem que usuários vejam seu próprio perfil diretamente
   - Permitem que admins vejam todos os perfis usando EXISTS (mais eficiente)
   - Protegem campos sensíveis (role, lab_points) de modificação não autorizada
   - Permitem que o trigger do auth crie novos perfis automaticamente

## 🚀 Como Aplicar a Correção

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# Aplicar a migration
npx supabase migration up --db-url "sua-connection-string"
```

### Opção 2: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `supabase/migrations/20251201000000_fix_user_policies.sql`
4. Execute o SQL

### Opção 3: Via psql (se tiver acesso direto ao banco)

```bash
psql -h sua-host -U postgres -d postgres -f supabase/migrations/20251201000000_fix_user_policies.sql
```

## 🧪 Como Testar

1. **Limpe o cache do navegador** (ou use aba anônima)
2. **Faça logout** se estiver logado
3. **Tente fazer login** com um usuário existente
4. **Verifique que o login funciona corretamente**

### Teste com novo cadastro:

1. Crie uma nova conta
2. Verifique que o usuário é criado no auth.users
3. Verifique que o perfil é criado na tabela users (via trigger)
4. Faça login com as novas credenciais
5. Verifique que o dashboard carrega corretamente

## 📋 Checklist de Verificação

- [ ] Migration aplicada com sucesso no banco
- [ ] Login funciona com usuários existentes
- [ ] Cadastro de novos usuários funciona
- [ ] Login funciona com usuários recém-cadastrados
- [ ] Dashboard carrega os dados do usuário corretamente
- [ ] Usuários colaboradores não conseguem modificar role ou lab_points
- [ ] Admins conseguem ver e modificar todos os usuários

## 🔧 Troubleshooting

### Se o login ainda não funcionar:

1. **Verifique se a migration foi aplicada:**
   ```sql
   SELECT * FROM _migrations WHERE version = '20251201000000';
   ```

2. **Verifique as políticas atuais:**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
   FROM pg_policies
   WHERE tablename = 'users';
   ```

3. **Teste se o perfil está acessível:**
   ```sql
   -- Execute como o usuário que está tentando fazer login
   SELECT * FROM users WHERE id = auth.uid();
   ```

4. **Verifique logs de erro no console do navegador**

5. **Verifique logs do Supabase** no Dashboard > Logs

## 📝 Detalhes Técnicos

### Política de SELECT (Antes - PROBLEMÁTICA):
```sql
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');
```

**Problema**: A segunda política tem uma subconsulta que também precisa verificar RLS, criando recursão.

### Política de SELECT (Depois - CORRIGIDA):
```sql
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'adm'
    )
  );
```

**Solução**: Uma única política que combina ambos os casos com OR, e usa EXISTS que é mais eficiente e evita alguns casos de recursão.

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Common RLS Patterns](https://supabase.com/docs/guides/database/postgres/row-level-security#common-patterns)
