import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User as UserIcon, 
  Shield, 
  Building2, 
  Wallet, 
  ChevronDown,
  Check,
  AlertCircle,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from './ui/Button';
import { 
  User, 
  UserRole, 
  DepartmentEnum, 
  DEPARTMENTS_LIST,
  supabase
} from '../lib/supabase';
import { updateUser } from '../hooks/useUsers';
import { createTransaction } from '../hooks/useTransactions';
import { useToast } from './ui/Toast';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: () => Promise<void>;
}

type TabType = 'settings' | 'points';

export function UserManagementModal({
  isOpen,
  onClose,
  user,
  onUpdate
}: UserManagementModalProps) {
  const { showToast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  
  // Settings state
  const [role, setRole] = useState<UserRole>('colaborador');
  const [department, setDepartment] = useState<DepartmentEnum | ''>('');
  const [gestorDepartments, setGestorDepartments] = useState<DepartmentEnum[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Points state
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsDescription, setPointsDescription] = useState('');
  const [pointsOperation, setPointsOperation] = useState<'add' | 'remove'>('add');
  const [savingPoints, setSavingPoints] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens with new user
  useEffect(() => {
    if (isOpen && user) {
      setActiveTab('settings');
      setRole(user.role);
      setDepartment(user.department || '');
      setPointsAmount('');
      setPointsDescription('');
      setPointsOperation('add');
      setError(null);
      
      // Fetch gestor departments if applicable
      if (user.role === 'gestor') {
        fetchGestorDepartments(user.id);
      } else {
        setGestorDepartments([]);
      }
    }
  }, [isOpen, user]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchGestorDepartments = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('gestor_departments')
        .select('department')
        .eq('gestor_id', userId);
      
      setGestorDepartments(data?.map(d => d.department) || []);
    } catch {
      setGestorDepartments([]);
    }
  };

  const toggleGestorDepartment = (dept: DepartmentEnum) => {
    setGestorDepartments(prev => 
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setSavingSettings(true);
    setError(null);
    
    try {
      // Update user role and department
      await updateUser(user.id, { 
        role,
        department: department || null
      });

      // Handle gestor departments
      if (role === 'gestor') {
        // Remove old departments
        await supabase
          .from('gestor_departments')
          .delete()
          .eq('gestor_id', user.id);
        
        // Add new departments
        if (gestorDepartments.length > 0) {
          await supabase
            .from('gestor_departments')
            .insert(gestorDepartments.map(dept => ({
              gestor_id: user.id,
              department: dept
            })));
        }
      } else {
        // Remove all managed departments if no longer a gestor
        await supabase
          .from('gestor_departments')
          .delete()
          .eq('gestor_id', user.id);
      }

      await onUpdate();
      showToast('Configurações salvas com sucesso', 'success');
      onClose();
    } catch (err) {
      setError('Erro ao salvar configurações');
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSavePoints = async () => {
    if (!user) return;
    
    const amount = parseInt(pointsAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Insira uma quantidade válida de pontos');
      return;
    }

    if (!pointsDescription.trim()) {
      setError('Insira uma descrição para a transação');
      return;
    }

    setSavingPoints(true);
    setError(null);

    try {
      const finalAmount = pointsOperation === 'remove' ? -amount : amount;
      
      await createTransaction({
        user_id: user.id,
        tipo: pointsOperation === 'add' ? 'credito' : 'debito',
        valor: Math.abs(finalAmount),
        descricao: pointsDescription.trim(),
      });

      await onUpdate();
      showToast(
        pointsOperation === 'add' 
          ? `${amount} pontos adicionados com sucesso` 
          : `${amount} pontos removidos com sucesso`, 
        'success'
      );
      onClose();
    } catch (err) {
      setError('Erro ao processar transação');
      showToast('Erro ao processar transação', 'error');
    } finally {
      setSavingPoints(false);
    }
  };

  if (!isOpen || !user) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ margin: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in" />
      
      {/* Modal Container */}
      <div className="relative z-10 flex items-center justify-center w-full max-h-screen overflow-y-auto py-8">
        {/* Modal */}
        <div 
          className="relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/50 animate-scale-in my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 px-7 py-8 text-white overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
            </div>
            
            {/* Close button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm cursor-pointer"
              aria-label="Fechar modal"
            >
              <X size={18} strokeWidth={2.5} className="text-white" />
            </button>
            
            {/* Header content */}
            <div className="relative flex items-center gap-5 pr-14">
              <div className="w-28 h-28 ring-3 rounded-full overflow-hidden bg-white/20 flex items-center justify-center font-ranade font-bold shadow-md ring-white transition-transform hover:scale-105 flex-shrink-0">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.nome} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-ranade font-bold text-white">
                    {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-ranade font-bold tracking-tight drop-shadow-sm text-white truncate">
                  {user.nome}
                </h2>
                <p className="text-white/80 text-sm font-dm-sans truncate mt-0.5">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-dm-sans font-semibold bg-white/20 backdrop-blur-sm text-white">
                    <Wallet size={12} />
                    {user.lab_points} pontos
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-dm-sans font-semibold text-white ${
                    user.role === 'adm' 
                      ? 'bg-amber-400/40' 
                      : user.role === 'gestor'
                      ? 'bg-emerald-400/40'
                      : 'bg-white/20'
                  }`}>
                    {user.role === 'adm' ? 'Admin' : user.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Tab buttons */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => { setActiveTab('settings'); setError(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-dm-sans font-medium transition-all duration-300 ${
                  activeTab === 'settings' 
                    ? 'bg-white text-lab-primary shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Shield size={16} />
                Configurações
              </button>
              <button
                onClick={() => { setActiveTab('points'); setError(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-dm-sans font-medium transition-all duration-300 ${
                  activeTab === 'points' 
                    ? 'bg-white text-lab-primary shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Sparkles size={16} />
                Pontos
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {activeTab === 'settings' ? (
              <div className="space-y-5">
                {/* Role Select */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                    <Shield size={16} className="text-lab-primary" />
                    Função do Usuário
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setRole(newRole);
                        if (newRole !== 'gestor') {
                          setGestorDepartments([]);
                        }
                      }}
                      className="w-full px-4 py-4 rounded-2xl bg-slate-100 border-2 border-transparent appearance-none focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 pr-12"
                    >
                      <option value="colaborador">Colaborador</option>
                      <option value="gestor">Gestor</option>
                      <option value="adm">Administrador</option>
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Department Select */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                    <Building2 size={16} className="text-lab-primary" />
                    Departamento
                  </label>
                  <div className="relative">
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as DepartmentEnum)}
                      className="w-full px-4 py-4 rounded-2xl bg-slate-100 border-2 border-transparent appearance-none focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 pr-12"
                    >
                      <option value="">Selecione o departamento</option>
                      {DEPARTMENTS_LIST.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Gestor Departments */}
                {role === 'gestor' && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                      <UserIcon size={16} className="text-lab-primary" />
                      Departamentos Gerenciados
                    </label>
                    <p className="text-xs text-slate-500 mb-3 font-dm-sans">
                      Selecione os departamentos que este gestor pode gerenciar
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                      {DEPARTMENTS_LIST.map((dept) => (
                        <button
                          key={dept.value}
                          type="button"
                          onClick={() => toggleGestorDepartment(dept.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-dm-sans text-left transition-all duration-200 ${
                            gestorDepartments.includes(dept.value)
                              ? 'bg-gradient-to-r from-lab-primary to-indigo-500 text-white-700 shadow-md'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {gestorDepartments.includes(dept.value) && (
                            <Check size={14} strokeWidth={3} className="flex-shrink-0 text-white" />
                          )}
                          <span className="truncate">{dept.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Current Balance */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-lab-light/50 to-indigo-50/50 border-2 border-lab-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lab-primary to-indigo-500 flex items-center justify-center shadow-lg">
                      <Wallet size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-dm-sans">Saldo Atual</p>
                      <p className="text-2xl font-ranade font-bold text-slate-800">{user.lab_points}</p>
                    </div>
                  </div>
                  <span className="text-sm font-dm-sans text-slate-500">pontos</span>
                </div>

                {/* Operation Toggle */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                    Operação
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPointsOperation('add')}
                      className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-dm-sans font-semibold transition-all duration-300 ${
                        pointsOperation === 'add'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Plus size={18} className={pointsOperation === 'add' ? 'text-white' : ''} />
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPointsOperation('remove')}
                      className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-dm-sans font-semibold transition-all duration-300 ${
                        pointsOperation === 'remove'
                          ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Minus size={18} className={pointsOperation === 'remove' ? 'text-white' : ''} />
                      Remover
                    </button>
                  </div>
                </div>

                {/* Points Amount */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                    <Sparkles size={16} className="text-lab-primary" />
                    Quantidade de Pontos
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={pointsAmount}
                      onChange={(e) => setPointsAmount(e.target.value)}
                      placeholder="Ex: 100"
                      className="w-full px-4 py-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 text-lg font-medium"
                    />
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-white text-xs font-bold px-3 py-1.5 rounded-lg ${
                      pointsOperation === 'add' 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}>
                      {pointsOperation === 'add' ? '+' : '-'} PTS
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                    Descrição da Transação
                  </label>
                  <textarea
                    value={pointsDescription}
                    onChange={(e) => setPointsDescription(e.target.value)}
                    placeholder="Descreva o motivo da transação..."
                    rows={3}
                    className="w-full px-4 py-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Preview */}
                {pointsAmount && (
                  <div className={`flex items-center gap-3 p-4 rounded-2xl ${
                    pointsOperation === 'add'
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200/50'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200/50'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      pointsOperation === 'add' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {pointsOperation === 'add' 
                        ? <Plus size={20} className="text-emerald-600" />
                        : <Minus size={20} className="text-red-600" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-dm-sans font-semibold ${
                        pointsOperation === 'add' ? 'text-emerald-900' : 'text-red-900'
                      }`}>
                        Novo saldo: {user.lab_points + (pointsOperation === 'add' ? parseInt(pointsAmount) || 0 : -(parseInt(pointsAmount) || 0))} pontos
                      </p>
                      <p className={`text-xs font-dm-sans mt-0.5 ${
                        pointsOperation === 'add' ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {pointsOperation === 'add' ? 'Crédito' : 'Débito'} de {pointsAmount} pontos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-200 mt-5">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <p className="text-red-700 text-sm font-dm-sans font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 pt-0">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={savingSettings || savingPoints}
                className="flex-1 !rounded-2xl !py-4 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 !border-0"
              >
                Cancelar
              </Button>
              {activeTab === 'settings' ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveSettings}
                  loading={savingSettings}
                  className="flex-1 !rounded-2xl !py-4 !bg-gradient-to-r !from-lab-primary !to-indigo-500 hover:!from-lab-primary/90 hover:!to-indigo-600 !shadow-lg hover:!shadow-xl hover:!shadow-lab-primary/25 !transition-all !duration-300"
                >
                  Salvar Configurações
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSavePoints}
                  loading={savingPoints}
                  disabled={!pointsAmount || !pointsDescription.trim()}
                  className={`flex-1 !rounded-2xl !py-4 !shadow-lg hover:!shadow-xl !transition-all !duration-300 ${
                    pointsOperation === 'add'
                      ? '!bg-gradient-to-r !from-emerald-500 !to-green-500 hover:!from-emerald-600 hover:!to-green-600 hover:!shadow-emerald-500/25'
                      : '!bg-gradient-to-r !from-red-500 !to-rose-500 hover:!from-red-600 hover:!to-rose-600 hover:!shadow-red-500/25'
                  }`}
                >
                  {pointsOperation === 'add' ? 'Adicionar Pontos' : 'Remover Pontos'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
