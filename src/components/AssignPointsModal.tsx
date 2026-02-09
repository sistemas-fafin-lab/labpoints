import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, User as UserIcon, Award, FileText, Loader2, ChevronLeft, Sparkles, Check, AlertCircle, Tag, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { useToast } from './ui/Toast';
import { User, DEPARTMENT_LABELS, TransactionReasonEnum, TRANSACTION_REASONS_LIST } from '../lib/supabase';

interface AssignPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  loadingUsers: boolean;
  onSubmit: (targetUserId: string, points: number, justification: string, reason: TransactionReasonEnum) => Promise<{ success: boolean; error?: string }>;
}

export function AssignPointsModal({
  isOpen,
  onClose,
  users,
  loadingUsers,
  onSubmit
}: AssignPointsModalProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [points, setPoints] = useState('');
  const [justification, setJustification] = useState('');
  const [reason, setReason] = useState<TransactionReasonEnum | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [reasonDropdownOpen, setReasonDropdownOpen] = useState(false);
  const reasonDropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const departmentLabel = user.department ? DEPARTMENT_LABELS[user.department] : '';
    return (
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departmentLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setPoints('');
      setJustification('');
      setReason('');
      setSearchTerm('');
      setError(null);
      setStep('select');
      setReasonDropdownOpen(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reasonDropdownRef.current && !reasonDropdownRef.current.contains(event.target as Node)) {
        setReasonDropdownOpen(false);
      }
    };

    if (reasonDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [reasonDropdownOpen]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setStep('form');
  };

  const handleBack = () => {
    setStep('select');
    setError(null);
    setReasonDropdownOpen(false);
  };

  const reasonGroups = [
    {
      label: 'COLABORAÇÃO',
      options: [
        { value: 'colaboracao_intersetorial', label: 'Colaboração intersetorial' },
        { value: 'colaboracao_intrasetorial', label: 'Colaboração intrasetorial' },
      ]
    },
    {
      label: 'PROCESSOS',
      options: [
        { value: 'auditoria_processos_internos', label: 'Auditoria de processos internos' },
        { value: 'otimizacao_processos', label: 'Otimização de processos' },
      ]
    },
    {
      label: 'COMPORTAMENTO PROFISSIONAL',
      options: [
        { value: 'postura_empatica', label: 'Postura empática' },
        { value: 'postura_disciplina_autocontrole', label: 'Postura, disciplina e autocontrole' },
        { value: 'responsabilidade_compromisso', label: 'Responsabilidade e compromisso' },
      ]
    },
    {
      label: 'INOVAÇÃO & INICIATIVA',
      options: [
        { value: 'proatividade_inovacao', label: 'Proatividade e inovação' },
        { value: 'protagonismo_desafios', label: 'Protagonismo em Desafios' },
      ]
    },
    {
      label: 'ESTRATÉGIA & GESTÃO',
      options: [
        { value: 'estrategia_organizacao_planejamento', label: 'Estratégia, organização e planejamento' },
        { value: 'promover_sustentabilidade_financeira', label: 'Promover a sustentabilidade financeira' },
        { value: 'realizar_networking_parceiros', label: 'Realizar networking com parceiros' },
      ]
    }
  ];

  const selectedReasonLabel = reasonGroups
    .flatMap(g => g.options)
    .find(opt => opt.value === reason)?.label || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Selecione um usuário');
      return;
    }

    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      setError('Insira uma quantidade válida de pontos');
      return;
    }

    if (!reason) {
      setError('Selecione um motivo');
      return;
    }

    if (!justification.trim()) {
      setError('Insira uma justificativa');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await onSubmit(selectedUser.id, pointsNum, justification.trim(), reason as TransactionReasonEnum);

    setLoading(false);

    if (result.success) {
      showToast('Atribuição criada com sucesso! Aguardando aprovação.', 'success');
      onClose();
    } else {
      setError(result.error || 'Erro ao criar atribuição');
      showToast(result.error || 'Erro ao criar atribuição', 'error');
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ margin: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in" />
      
      {/* Modal Container - centered */}
      <div className="relative z-10 flex items-center justify-center w-full max-h-screen overflow-y-auto py-8">
        {/* Modal */}
        <div 
          className="relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/50 animate-scale-in my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 p-7 text-white overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
          </div>
          
          {/* Close button - positioned with higher z-index */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm cursor-pointer"
            aria-label="Fechar modal"
          >
            <X size={18} strokeWidth={2.5} className="text-white" />
          </button>
          
          <div className="relative flex items-center gap-5 pr-12">
            <div className="w-26 h-26 rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Sparkles size={48} strokeWidth={2} className="drop-shadow-lg text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-ranade font-bold tracking-tight drop-shadow-sm text-white">Atribuir Pontos</h2>
              <p className="text-white/90 text-sm font-dm-sans mt-0.5">
                {step === 'select' ? 'Selecione o colaborador' : 'Defina a pontuação'}
              </p>
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center gap-3 mt-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-dm-sans font-medium transition-all duration-300 ${
              step === 'select' 
                ? 'bg-white text-lab-primary shadow-lg' 
                : 'bg-white/20 text-white/90'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'select' ? 'bg-lab-primary text-white' : 'bg-white/30'
              }`}>
                {step === 'form' ? <Check size={12} strokeWidth={3} /> : '1'}
              </span>
              Colaborador
            </div>
            <div className="w-8 h-0.5 bg-white/30 rounded-full" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-dm-sans font-medium transition-all duration-300 ${
              step === 'form' 
                ? 'bg-white text-lab-primary shadow-lg' 
                : 'bg-white/20 text-white/90'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'form' ? 'bg-lab-primary text-white' : 'bg-white/30'
              }`}>2</span>
              Pontuação
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            <>
              {/* Search */}
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-3.5 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Users List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loadingUsers ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-lab-light flex items-center justify-center mb-4">
                      <Loader2 size={28} className="animate-spin text-lab-primary" />
                    </div>
                    <p className="text-slate-500 font-dm-sans text-sm">Carregando colaboradores...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <UserIcon size={28} className="text-slate-400" />
                    </div>
                    <p className="font-dm-sans text-slate-600 font-medium">Nenhum usuário encontrado</p>
                    <p className="text-slate-400 text-sm mt-1">Tente buscar com outros termos</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="neon-card-wrapper">
                      <button
                        onClick={() => handleSelectUser(user)}
                        className="neon-card-content w-full flex items-center gap-4 p-4 bg-white transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <Avatar
                          src={user.avatar_url}
                          alt={user.nome}
                          size="sm"
                          fallbackText={user.nome}
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-ranade font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            {user.nome}
                          </p>
                          <p className="text-sm text-slate-500 font-dm-sans truncate">
                            {user.department ? DEPARTMENT_LABELS[user.department] : user.email}
                          </p>
                        </div>
                        <div className="flex-shrink-0 bg-slate-100 group-hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                          <span className="text-sm font-dm-sans font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                            {user.lab_points} pts
                          </span>
                        </div>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selected User Display */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-lab-light/50 to-indigo-50/50 border-2 border-lab-primary/20">
                <Avatar
                  src={selectedUser?.avatar_url}
                  alt={selectedUser?.nome || 'Usuário'}
                  size="md"
                  fallbackText={selectedUser?.nome}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-ranade font-semibold text-slate-800 truncate">
                    {selectedUser?.nome}
                  </p>
                  <p className="text-sm text-slate-500 font-dm-sans truncate">
                    {selectedUser?.department ? DEPARTMENT_LABELS[selectedUser.department] : selectedUser?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm text-lab-primary hover:text-indigo-600 font-dm-sans font-medium bg-white px-3 py-1.5 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <ChevronLeft size={16} />
                  Alterar
                </button>
              </div>

              {/* Points Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                  <Award size={16} className="text-lab-primary" />
                  Quantidade de Pontos
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="Ex: 100"
                    className="w-full px-4 py-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 text-lg font-medium"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-lab-primary to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    PONTOS
                  </div>
                </div>
              </div>

              {/* Reason Select */}
              <div>
                <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                  <Tag size={16} className="text-lab-primary" />
                  Motivo
                </label>
                <div className="relative" ref={reasonDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setReasonDropdownOpen(!reasonDropdownOpen)}
                    className={`w-full px-4 py-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border-2 transition-all duration-300 font-dm-sans text-left flex items-center justify-between ${
                      reasonDropdownOpen 
                        ? 'border-lab-primary bg-white ring-4 ring-lab-primary/10' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <span className={reason ? 'text-slate-800' : 'text-slate-400'}>
                      {reason ? selectedReasonLabel : 'Selecione o motivo da atribuição...'}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`text-lab-primary transition-transform duration-300 ${reasonDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {/* Custom Dropdown */}
                  {reasonDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 max-h-96 overflow-y-auto animate-scale-in origin-top">
                      {reasonGroups.map((group, groupIdx) => (
                        <div key={group.label} className={groupIdx > 0 ? 'border-t border-slate-100' : ''}>
                          {/* Group Header */}
                          <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-10">
                            <p className="text-xs font-dm-sans font-bold text-slate-600 tracking-wide">
                              {group.label}
                            </p>
                          </div>
                          
                          {/* Options */}
                          <div className="py-1">
                            {group.options.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setReason(option.value as TransactionReasonEnum);
                                  setReasonDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left font-dm-sans text-sm transition-all duration-200 flex items-center justify-between group ${
                                  reason === option.value
                                    ? 'bg-gradient-to-r from-lab-primary/10 to-indigo-50 text-lab-primary font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="flex-1">{option.label}</span>
                                {reason === option.value && (
                                  <Check size={16} className="text-lab-primary flex-shrink-0 ml-2" strokeWidth={3} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500 font-dm-sans">
                  Selecione a categoria que melhor representa o reconhecimento
                </p>
              </div>

              {/* Justification Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-dm-sans font-semibold text-slate-700 mb-2.5">
                  <FileText size={16} className="text-lab-primary" />
                  Justificativa
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Descreva o motivo da atribuição de pontos..."
                  rows={3}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 resize-none"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-200">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                  <p className="text-red-700 text-sm font-dm-sans font-medium">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/50">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-900 font-dm-sans font-semibold">Aprovação Necessária</p>
                  <p className="text-sm text-amber-700 font-dm-sans mt-0.5">
                    A atribuição será enviada para aprovação de outro gestor.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={handleBack}
                  className="flex-1 !rounded-2xl !py-4 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 !border-0"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  loading={loading}
                  className="flex-1 !rounded-2xl !py-4 !bg-gradient-to-r !from-lab-primary !to-indigo-500 hover:!from-lab-primary/90 hover:!to-indigo-600 !shadow-lg hover:!shadow-xl hover:!shadow-lab-primary/25 !transition-all !duration-300"
                >
                  Enviar para Aprovação
                </Button>
              </div>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
