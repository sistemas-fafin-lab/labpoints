import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'colaborador' | 'adm' | 'gestor';

export type DepartmentEnum = 
  | 'financeiro'
  | 'faturamento'
  | 'transporte'
  | 'qualidade'
  | 'ti'
  | 'rh'
  | 'area_tecnica'
  | 'atendimento'
  | 'autorizacao_cadastro'
  | 'analises_clinicas'
  | 'estoque'
  | 'copa_limpeza';

// Labels legíveis para os departamentos
export const DEPARTMENT_LABELS: Record<DepartmentEnum, string> = {
  financeiro: 'Financeiro',
  faturamento: 'Faturamento',
  transporte: 'Transporte',
  qualidade: 'Qualidade',
  ti: 'TI',
  rh: 'RH',
  area_tecnica: 'Área Técnica',
  atendimento: 'Atendimento',
  autorizacao_cadastro: 'Autorização e Cadastro',
  analises_clinicas: 'Análises Clínicas',
  estoque: 'Estoque',
  copa_limpeza: 'Copa e Limpeza',
};

// Lista de departamentos para selects
export const DEPARTMENTS_LIST: { value: DepartmentEnum; label: string }[] = [
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'faturamento', label: 'Faturamento' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'qualidade', label: 'Qualidade' },
  { value: 'ti', label: 'TI' },
  { value: 'rh', label: 'RH' },
  { value: 'area_tecnica', label: 'Área Técnica' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'autorizacao_cadastro', label: 'Autorização e Cadastro' },
  { value: 'analises_clinicas', label: 'Análises Clínicas' },
  { value: 'estoque', label: 'Estoque' },
  { value: 'copa_limpeza', label: 'Copa e Limpeza' },
];

export type User = {
  id: string;
  email: string;
  nome: string;
  avatar_url: string | null;
  lab_points: number;
  role: UserRole;
  department: DepartmentEnum | null;
  created_at: string;
  updated_at: string;
};

export type GestorDepartment = {
  id: string;
  gestor_id: string;
  department: DepartmentEnum;
  created_at: string;
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

export type AssignmentStatus = 'pending' | 'approved' | 'rejected';

export type PendingPointAssignment = {
  id: string;
  requester_id: string;
  target_user_id: string;
  points: number;
  justification: string;
  selected_approver_id: string | null;
  status: AssignmentStatus;
  rejection_reason: string | null;
  created_at: string;
  selected_at: string | null;
  decided_at: string | null;
  // Joins
  requester?: User;
  target_user?: User;
  approver?: User;
};

export type AuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor?: User;
};
