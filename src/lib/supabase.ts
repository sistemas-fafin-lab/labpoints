import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  avatar_url: string | null;
  lab_points: number;
  role: 'colaborador' | 'adm';
  created_at: string;
  updated_at: string;
};

export type Reward = {
  id: string;
  titulo: string;
  descricao: string;
  custo_points: number;
  categoria: string;
  imagem_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  tipo: 'credito' | 'debito';
  valor: number;
  descricao: string;
  created_at: string;
};

export type Redemption = {
  id: string;
  user_id: string;
  reward_id: string;
  custo_points: number;
  status: 'pendente' | 'concluido' | 'cancelado';
  created_at: string;
  updated_at: string;
  reward?: Reward;
};
