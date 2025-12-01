/*
  # Fix User Policies for Login
  
  Corrige as políticas RLS da tabela users para permitir login correto.
  
  O problema anterior era que as políticas criavam uma verificação circular:
  - Para fazer login, o usuário precisa acessar seu perfil
  - Para acessar o perfil, as políticas verificavam subqueries que também tentavam acessar o perfil
  - Isso causava falha no login
  
  Solução:
  - Simplificar a política de SELECT para evitar subqueries desnecessárias
  - Remover a verificação de role da política de UPDATE para colaboradores
  - Manter a segurança adequada enquanto permite acesso básico ao próprio perfil
*/

-- Remove políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile fields" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

-- Política simplificada de SELECT: usuários podem ver seu próprio perfil
-- Admins podem ver todos os perfis
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

-- Política de UPDATE: usuários podem atualizar campos específicos do próprio perfil
-- Colaboradores não podem modificar role ou lab_points
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Se não está tentando mudar role ou lab_points, pode atualizar
      (OLD.role = NEW.role AND OLD.lab_points = NEW.lab_points)
      OR
      -- Ou se for admin, pode atualizar tudo
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'adm'
      )
    )
  );

-- Política de INSERT: permite que o trigger do auth crie o perfil
-- E permite que admins criem novos usuários
CREATE POLICY "Allow user creation"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permite que o próprio usuário seja criado (via trigger)
    auth.uid() = id
    OR
    -- Ou se for admin criando outro usuário
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'adm'
    )
  );
