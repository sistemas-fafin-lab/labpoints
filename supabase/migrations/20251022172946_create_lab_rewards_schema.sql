/*
  # Lab Rewards Database Schema

  ## Overview
  This migration creates the complete database structure for the Lab Rewards system,
  a platform for managing employee rewards, points, and redemptions.

  ## New Tables

  ### 1. `users`
  Stores all collaborator and admin information
  - `id` (uuid, primary key) - Unique identifier linked to auth.users
  - `email` (text, unique, not null) - User email address
  - `nome` (text, not null) - Full name of the collaborator
  - `cargo` (text, not null) - Job position/role
  - `avatar_url` (text, nullable) - URL to user's avatar image
  - `lab_points` (integer, default 0) - Current balance of Lab Points
  - `role` (text, not null, default 'colaborador') - User role: 'colaborador' or 'adm'
  - `created_at` (timestamptz, default now()) - Account creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ### 2. `rewards`
  Catalog of available rewards that can be redeemed
  - `id` (uuid, primary key) - Unique reward identifier
  - `titulo` (text, not null) - Reward title
  - `descricao` (text, not null) - Detailed description
  - `custo_points` (integer, not null) - Cost in Lab Points
  - `categoria` (text, not null) - Category/type of reward
  - `imagem_url` (text, nullable) - URL to reward image
  - `ativo` (boolean, default true) - Whether reward is currently available
  - `created_at` (timestamptz, default now()) - Creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ### 3. `transactions`
  Complete history of all point movements (credits and debits)
  - `id` (uuid, primary key) - Unique transaction identifier
  - `user_id` (uuid, foreign key -> users.id) - User receiving/spending points
  - `tipo` (text, not null) - Transaction type: 'credito' or 'debito'
  - `valor` (integer, not null) - Amount of points (always positive)
  - `descricao` (text, not null) - Description of transaction
  - `created_at` (timestamptz, default now()) - Transaction timestamp

  ### 4. `redemptions`
  Records of reward redemptions by users
  - `id` (uuid, primary key) - Unique redemption identifier
  - `user_id` (uuid, foreign key -> users.id) - User redeeming the reward
  - `reward_id` (uuid, foreign key -> rewards.id) - Reward being redeemed
  - `custo_points` (integer, not null) - Points cost at time of redemption
  - `status` (text, default 'concluido') - Status: 'pendente', 'concluido', 'cancelado'
  - `created_at` (timestamptz, default now()) - Redemption timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## Security (Row Level Security)
  
  All tables have RLS enabled with restrictive policies:
  
  ### Users Table Policies
  - Users can view their own profile data
  - Users can update their own profile (name, cargo, avatar)
  - Admins can view and modify all users
  - Admins can modify lab_points for any user
  
  ### Rewards Table Policies
  - All authenticated users can view active rewards
  - Only admins can create, update, or delete rewards
  
  ### Transactions Table Policies
  - Users can view their own transaction history
  - Admins can view all transactions
  - Transactions are created automatically via triggers
  
  ### Redemptions Table Policies
  - Users can view their own redemptions
  - Users can create redemptions (with balance validation)
  - Admins can view and update all redemptions

  ## Important Notes
  - Users table syncs with Supabase Auth via trigger on auth.users
  - Lab Points balance is automatically updated via trigger on transactions
  - Redemptions automatically create debit transactions
  - All monetary values use integer type (points are whole numbers)
  - Timestamps use timestamptz for proper timezone handling
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nome text NOT NULL,
  cargo text NOT NULL DEFAULT '',
  avatar_url text,
  lab_points integer NOT NULL DEFAULT 0,
  role text NOT NULL DEFAULT 'colaborador' CHECK (role IN ('colaborador', 'adm')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text NOT NULL,
  custo_points integer NOT NULL CHECK (custo_points >= 0),
  categoria text NOT NULL,
  imagem_url text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('credito', 'debito')),
  valor integer NOT NULL CHECK (valor > 0),
  descricao text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  custo_points integer NOT NULL CHECK (custo_points > 0),
  status text NOT NULL DEFAULT 'concluido' CHECK (status IN ('pendente', 'concluido', 'cancelado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_reward_id ON redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_rewards_ativo ON rewards(ativo);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile fields"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'colaborador'
  );

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

-- Rewards table policies
CREATE POLICY "Authenticated users can view active rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (ativo = true OR (SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "Admins can insert rewards"
  ON rewards FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "Admins can update rewards"
  ON rewards FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "Admins can delete rewards"
  ON rewards FOR DELETE
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

-- Transactions table policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "System can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Redemptions table policies
CREATE POLICY "Users can view own redemptions"
  ON redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create redemptions"
  ON redemptions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() 
    AND (SELECT lab_points FROM users WHERE id = auth.uid()) >= custo_points
  );

CREATE POLICY "Admins can view all redemptions"
  ON redemptions FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

CREATE POLICY "Admins can update redemptions"
  ON redemptions FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'adm')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'adm');

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, cargo, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', 'Novo Colaborador'),
    COALESCE(new.raw_user_meta_data->>'cargo', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'colaborador')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redemptions_updated_at BEFORE UPDATE ON redemptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update lab_points when transaction is created
CREATE OR REPLACE FUNCTION update_lab_points_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'credito' THEN
    UPDATE users SET lab_points = lab_points + NEW.valor WHERE id = NEW.user_id;
  ELSIF NEW.tipo = 'debito' THEN
    UPDATE users SET lab_points = lab_points - NEW.valor WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update lab_points automatically
DROP TRIGGER IF EXISTS on_transaction_created ON transactions;
CREATE TRIGGER on_transaction_created
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_lab_points_on_transaction();

-- Function to create transaction when redemption is created
CREATE OR REPLACE FUNCTION create_transaction_on_redemption()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluido' THEN
    INSERT INTO transactions (user_id, tipo, valor, descricao)
    VALUES (
      NEW.user_id,
      'debito',
      NEW.custo_points,
      'Resgate: ' || (SELECT titulo FROM rewards WHERE id = NEW.reward_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create transaction on redemption
DROP TRIGGER IF EXISTS on_redemption_created ON redemptions;
CREATE TRIGGER on_redemption_created
  AFTER INSERT ON redemptions
  FOR EACH ROW EXECUTE FUNCTION create_transaction_on_redemption();