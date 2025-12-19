# Configuração de Email Templates no Supabase

Este documento fornece instruções passo a passo para configurar os templates de email personalizados no Supabase Auth.

## 📧 Templates Disponíveis

O projeto inclui dois templates de email HTML personalizados:

1. **confirmation.html** - Email de confirmação de cadastro
2. **reset-password.html** - Email de redefinição de senha

Ambos os templates seguem o mesmo design visual do sistema Lab Points, com:
- Gradientes modernos
- Layout responsivo
- Ícones e badges informativos
- Design consistente com a identidade visual

## 🔧 Como Configurar no Supabase Dashboard

### Passo 1: Acessar as Configurações de Auth

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **Authentication**
4. Clique na aba **Email Templates**

### Passo 2: Configurar o Template de Confirmação

1. Na lista de templates, clique em **Confirm signup**
2. Substitua o conteúdo existente pelo código do arquivo `supabase/email-templates/confirmation.html`
3. Certifique-se de que a variável `{{ .ConfirmationURL }}` está presente no template (ela será substituída automaticamente pelo Supabase)
4. Clique em **Save** para salvar as alterações

### Passo 3: Configurar o Template de Redefinição de Senha

1. Na lista de templates, clique em **Reset Password**
2. Substitua o conteúdo existente pelo código do arquivo `supabase/email-templates/reset-password.html`
3. Certifique-se de que a variável `{{ .ConfirmationURL }}` está presente no template
4. Clique em **Save** para salvar as alterações

## 📋 Variáveis Disponíveis

O Supabase fornece as seguintes variáveis que podem ser usadas nos templates:

- `{{ .ConfirmationURL }}` - URL de confirmação/redefinição gerada automaticamente
- `{{ .Token }}` - Token de confirmação/redefinição
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site configurado nas settings
- `{{ .Email }}` - Email do usuário

Nossos templates utilizam principalmente a variável `{{ .ConfirmationURL }}` que já inclui o token e redireciona para a página apropriada.

## 🎨 Personalização dos Templates

### Cores e Gradientes

Os templates usam as seguintes cores principais:

**Template de Confirmação (confirmation.html):**
- Gradiente do header: `#0ea5e9` → `#3b82f6` → `#4f46e5` (sky → blue → indigo)
- Botão CTA: `#3b82f6` → `#4f46e5` (blue → indigo)

**Template de Redefinição de Senha (reset-password.html):**
- Gradiente do header: `#10b981` → `#059669` → `#047857` (green → emerald → dark green)
- Botão CTA: `#10b981` → `#059669` (green → emerald)

### Estrutura dos Templates

Ambos os templates seguem a mesma estrutura:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <!-- Meta tags e configurações -->
</head>
<body>
  <!-- Wrapper Table -->
  <table>
    <!-- Header com gradiente e logo -->
    <tr><td>Header</td></tr>
    
    <!-- Content com mensagem e CTA -->
    <tr><td>Content</td></tr>
    
    <!-- Footer -->
    <tr><td>Footer</td></tr>
  </table>
  
  <!-- Link alternativo -->
  <table>Alternative Link</table>
</body>
</html>
```

### Modificando Textos

Para alterar os textos dos templates, procure pelas seguintes seções:

**Confirmation Template:**
- Título: `Bem-vindo(a) à equipe! 🎉`
- Descrição: Texto abaixo do título
- Botão: `✓ Confirmar meu e-mail`
- Features: Seção "O que você pode fazer:"

**Reset Password Template:**
- Título: `Redefinir sua Senha 🔑`
- Descrição: Texto abaixo do título
- Botão: `🔒 Redefinir Minha Senha`
- Dicas: Seção "Dicas de Segurança:"

## ⚙️ Configurações Adicionais

### Site URL

É importante configurar corretamente o Site URL nas configurações do Supabase:

1. Vá em **Authentication** → **URL Configuration**
2. Configure o **Site URL** para a URL de produção do seu app
3. Para desenvolvimento local, use: `http://localhost:5173`
4. Para produção, use sua URL de domínio

### Redirect URLs

Configure as URLs de redirecionamento permitidas:

1. Vá em **Authentication** → **URL Configuration**
2. Na seção **Redirect URLs**, adicione:
   - `http://localhost:5173/redefinir-senha` (desenvolvimento)
   - `https://seudominio.com/redefinir-senha` (produção)

## 🧪 Testando os Templates

### Testar Template de Confirmação

1. Faça um novo cadastro na aplicação
2. Verifique a caixa de entrada do email cadastrado
3. Confirme que o email chegou com o design personalizado
4. Clique no botão de confirmação e verifique o redirecionamento

### Testar Template de Redefinição de Senha

1. Na página de login, clique em "Esqueci minha senha"
2. Digite um email válido e envie
3. Verifique a caixa de entrada
4. Confirme que o email chegou com o design personalizado
5. Clique no botão e verifique o redirecionamento para `/redefinir-senha`

## 🐛 Troubleshooting

### Emails não estão chegando

1. Verifique as configurações de SMTP em **Project Settings** → **Auth**
2. Confirme que o email de remetente está verificado
3. Verifique a pasta de spam
4. Confira os logs em **Authentication** → **Logs**

### Template não está sendo aplicado

1. Certifique-se de salvar as alterações no Supabase Dashboard
2. Limpe o cache do navegador
3. Teste com um novo cadastro/redefinição
4. Verifique se há erros de HTML no template

### URL de redirecionamento não funciona

1. Confirme que a URL está na lista de Redirect URLs permitidas
2. Verifique se o `redirectTo` no código está correto
3. Confira se o Site URL está configurado corretamente

## 📝 Notas Importantes

- Os templates usam table-based layout para máxima compatibilidade com clientes de email
- Inline CSS é usado para garantir que os estilos sejam aplicados corretamente
- Os templates são responsivos e funcionam em dispositivos móveis
- Emojis são usados para melhor visualização em diferentes clientes de email

## 🔄 Atualizações Futuras

Se precisar atualizar os templates no futuro:

1. Edite os arquivos em `supabase/email-templates/`
2. Teste localmente visualizando os arquivos HTML no navegador
3. Copie o código atualizado para o Supabase Dashboard
4. Salve e teste enviando um email real

## 📚 Recursos Adicionais

- [Documentação do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Email Templates do Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Best Practices para Email HTML](https://www.campaignmonitor.com/css/)
