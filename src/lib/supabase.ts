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

// Labels legíveis para os departamentos (fallback para departamentos estáticos)
export const DEPARTMENT_LABELS: Record<string, string> = {
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

// Labels legíveis para os motivos de transação
export const TRANSACTION_REASON_LABELS: Record<TransactionReasonEnum, string> = {
  auditoria_processos_internos: 'Auditoria de processos internos',
  colaboracao_intersetorial: 'Colaboração intersetorial',
  colaboracao_intrasetorial: 'Colaboração intrasetorial',
  estrategia_organizacao_planejamento: 'Estratégia, organização e planejamento',
  otimizacao_processos: 'Otimização de processos',
  postura_empatica: 'Postura empática',
  postura_disciplina_autocontrole: 'Postura, disciplina e autocontrole',
  proatividade_inovacao: 'Proatividade e inovação',
  promover_sustentabilidade_financeira: 'Promover a sustentabilidade financeira',
  protagonismo_desafios: 'Protagonismo em Desafios',
  realizar_networking_parceiros: 'Realizar networking com parceiros',
  responsabilidade_compromisso: 'Responsabilidade e compromisso',
};

// Lista de motivos para selects
export const TRANSACTION_REASONS_LIST: { value: TransactionReasonEnum; label: string }[] = [
  { value: 'auditoria_processos_internos', label: 'Auditoria de processos internos' },
  { value: 'colaboracao_intersetorial', label: 'Colaboração intersetorial' },
  { value: 'colaboracao_intrasetorial', label: 'Colaboração intrasetorial' },
  { value: 'estrategia_organizacao_planejamento', label: 'Estratégia, organização e planejamento' },
  { value: 'otimizacao_processos', label: 'Otimização de processos' },
  { value: 'postura_empatica', label: 'Postura empática' },
  { value: 'postura_disciplina_autocontrole', label: 'Postura, disciplina e autocontrole' },
  { value: 'proatividade_inovacao', label: 'Proatividade e inovação' },
  { value: 'promover_sustentabilidade_financeira', label: 'Promover a sustentabilidade financeira' },
  { value: 'protagonismo_desafios', label: 'Protagonismo em Desafios' },
  { value: 'realizar_networking_parceiros', label: 'Realizar networking com parceiros' },
  { value: 'responsabilidade_compromisso', label: 'Responsabilidade e compromisso' },
];

// Valores do Lab
export type LabValueEnum =
  | 'senso_de_time'
  | 'foco_no_cliente'
  | 'autorresponsabilidade'
  | 'espirito_empreendedor'
  | 'empatia'
  | 'constante_evolucao';

// Labels legíveis para os valores do Lab
export const LAB_VALUE_LABELS: Record<LabValueEnum, string> = {
  senso_de_time: 'Senso de Time',
  foco_no_cliente: 'Foco no Cliente',
  autorresponsabilidade: 'Autorresponsabilidade',
  espirito_empreendedor: 'Espírito Empreendedor',
  empatia: 'Empatia',
  constante_evolucao: 'Constante Evolução',
};

// Descrições dos valores do Lab
export const LAB_VALUE_DESCRIPTIONS: Record<LabValueEnum, string> = {
  senso_de_time: 'Trabalhamos juntos, celebramos juntos',
  foco_no_cliente: 'O cliente sempre no centro de tudo',
  autorresponsabilidade: 'Donos do nosso próprio destino',
  espirito_empreendedor: 'Inovamos e criamos oportunidades',
  empatia: 'Nos colocamos no lugar do outro',
  constante_evolucao: 'Aprendemos e melhoramos sempre',
};

// Lista de valores para selects
export const LAB_VALUES_LIST: { value: LabValueEnum; label: string; description: string }[] = [
  { value: 'senso_de_time', label: 'Senso de Time', description: 'Trabalhamos juntos, celebramos juntos' },
  { value: 'foco_no_cliente', label: 'Foco no Cliente', description: 'O cliente sempre no centro de tudo' },
  { value: 'autorresponsabilidade', label: 'Autorresponsabilidade', description: 'Donos do nosso próprio destino' },
  { value: 'espirito_empreendedor', label: 'Espírito Empreendedor', description: 'Inovamos e criamos oportunidades' },
  { value: 'empatia', label: 'Empatia', description: 'Nos colocamos no lugar do outro' },
  { value: 'constante_evolucao', label: 'Constante Evolução', description: 'Aprendemos e melhoramos sempre' },
];

export type User = {
  id: string;
  email: string;
  nome: string;
  avatar_url: string | null;
  lab_points: number;
  role: UserRole;
  department: string | null;
  created_at: string;
  updated_at: string;
};

export type GestorDepartment = {
  id: string;
  gestor_id: string;
  department: string;
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
  reason?: TransactionReasonEnum | null;
  lab_value?: LabValueEnum | null;
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
  reason?: TransactionReasonEnum | null;
  lab_value?: LabValueEnum | null;
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
