import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  Users, 
  Shield, 
  Check, 
  Loader2, 
  UserCheck, 
  AlertCircle,
  Shuffle,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/Button';
import { AvatarWithPreview } from './AvatarWithPreview';
import { useToast } from './ui/Toast';
import { User, DEPARTMENT_LABELS } from '../lib/supabase';
import { useCustomApprovers } from '../hooks/useCustomApprovers';

interface ApproverSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApproverSelectionModal({ isOpen, onClose }: ApproverSelectionModalProps) {
  const { showToast } = useToast();
  const {
    settings,
    availableApprovers,
    loading,
    loadingAvailable,
    saving,
    setUseCustomApprovers,
    setApprovers,
  } = useCustomApprovers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize selected IDs from settings
  useEffect(() => {
    if (settings?.custom_approvers) {
      const ids = new Set(settings.custom_approvers.map(a => a.user_id));
      setSelectedIds(ids);
      setHasChanges(false);
    }
  }, [settings?.custom_approvers]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setHasChanges(false);
    }
  }, [isOpen]);

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

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return availableApprovers.filter(user => {
      const departmentLabel = user.department ? DEPARTMENT_LABELS[user.department] : '';
      const roleLabel = user.role === 'adm' ? 'Admin Administrador' : 'Gestor';
      return (
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        departmentLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roleLabel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [availableApprovers, searchTerm]);

  // Group users by role for better organization
  const groupedUsers = useMemo(() => {
    const admins = filteredUsers.filter(u => u.role === 'adm');
    const gestores = filteredUsers.filter(u => u.role === 'gestor');
    return { admins, gestores };
  }, [filteredUsers]);

  const handleToggleUser = (userId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
    setHasChanges(true);
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(availableApprovers.map(u => u.id)));
    setHasChanges(true);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
    setHasChanges(true);
  };

  const handleToggleMode = async () => {
    const newMode = !settings?.use_custom_approvers;
    const result = await setUseCustomApprovers(newMode);
    
    if (result.success) {
      showToast(
        newMode 
          ? 'Modo de aprovadores customizados ativado' 
          : 'Modo de seleção aleatória ativado',
        'success'
      );
    } else {
      showToast(result.error || 'Erro ao alterar modo', 'error');
    }
  };

  const handleSaveApprovers = async () => {
    if (selectedIds.size === 0 && settings?.use_custom_approvers) {
      showToast('Selecione pelo menos um aprovador', 'error');
      return;
    }

    const result = await setApprovers(Array.from(selectedIds));
    
    if (result.success) {
      showToast('Aprovadores atualizados com sucesso', 'success');
      setHasChanges(false);
    } else {
      showToast(result.error || 'Erro ao salvar aprovadores', 'error');
    }
  };

  if (!isOpen) return null;

  const isCustomMode = settings?.use_custom_approvers || false;

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
          className="relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50 animate-scale-in my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 text-white overflow-hidden" style={{ padding: '28px' }}>
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute bg-white/20 rounded-full blur-2xl" style={{ top: 0, right: 0, width: '128px', height: '128px', transform: 'translate(50%, -50%)' }} />
              <div className="absolute bg-white/10 rounded-full blur-xl" style={{ bottom: 0, left: 0, width: '96px', height: '96px', transform: 'translate(-50%, 50%)' }} />
            </div>
            
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute z-20 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm cursor-pointer"
              style={{ top: '20px', right: '20px', width: '40px', height: '40px' }}
              aria-label="Fechar modal"
            >
              <X style={{ width: '18px', height: '18px' }} strokeWidth={2.5} className="text-white" />
            </button>
            
            <div className="relative flex items-center" style={{ gap: '20px', paddingRight: '48px' }}>
              <div 
                className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
                style={{ width: '64px', height: '64px' }}
              >
                <UserCheck style={{ width: '32px', height: '32px' }} strokeWidth={2} className="drop-shadow-lg text-white" />
              </div>
              <div>
                <h2 className="font-ranade font-bold tracking-tight drop-shadow-sm text-white" style={{ fontSize: '24px' }}>
                  Configurar Aprovadores
                </h2>
                <p className="text-white/90 font-dm-sans" style={{ fontSize: '14px', marginTop: '2px' }}>
                  Defina quem pode aprovar as atribuições de pontos
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {loading || loadingAvailable ? (
              <div className="flex items-center justify-center" style={{ padding: '48px 0' }}>
                <Loader2 style={{ width: '32px', height: '32px' }} className="text-lab-primary animate-spin" />
              </div>
            ) : (
              <>
                {/* Mode Toggle Card */}
                <div 
                  className={`relative rounded-2xl border-2 transition-all duration-300 ${
                    isCustomMode 
                      ? 'border-lab-primary bg-gradient-to-br from-lab-light/50 to-indigo-50/50' 
                      : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'
                  }`}
                  style={{ padding: '20px', marginBottom: '24px' }}
                >
                  <div className="flex items-center justify-between" style={{ gap: '16px' }}>
                    <div className="flex items-center" style={{ gap: '16px' }}>
                      <div 
                        className={`rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isCustomMode 
                            ? 'bg-lab-primary text-white' 
                            : 'bg-slate-200 text-slate-500'
                        }`}
                        style={{ width: '48px', height: '48px' }}
                      >
                        {isCustomMode ? (
                          <Users style={{ width: '24px', height: '24px' }} />
                        ) : (
                          <Shuffle style={{ width: '24px', height: '24px' }} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-ranade font-bold text-slate-800" style={{ fontSize: '16px' }}>
                          {isCustomMode ? 'Aprovadores Selecionados' : 'Seleção Aleatória'}
                        </h3>
                        <p className="text-slate-500 font-dm-sans" style={{ fontSize: '13px' }}>
                          {isCustomMode 
                            ? 'Apenas os aprovadores selecionados abaixo poderão aprovar'
                            : 'Qualquer gestor ou admin pode ser selecionado automaticamente'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={handleToggleMode}
                      disabled={saving}
                      aria-label={isCustomMode ? 'Desativar modo customizado' : 'Ativar modo customizado'}
                      className="flex-shrink-0 transition-all duration-300"
                      style={{
                        position: 'relative',
                        width: '56px',
                        height: '32px',
                        borderRadius: '16px',
                        backgroundColor: isCustomMode ? '#3E6BF7' : '#cbd5e1',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.5 : 1,
                        border: 'none',
                        padding: 0,
                      }}
                    >
                      <div 
                        className="flex items-center justify-center bg-white rounded-full shadow-md transition-all duration-300"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: isCustomMode ? '28px' : '4px',
                          width: '24px',
                          height: '24px',
                        }}
                      >
                        {saving ? (
                          <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin text-slate-400" />
                        ) : isCustomMode ? (
                          <Check style={{ width: '12px', height: '12px' }} className="text-lab-primary" />
                        ) : null}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Info Banner when custom mode is active */}
                {isCustomMode && selectedIds.size === 0 && (
                  <div 
                    className="flex items-start bg-amber-50 border border-amber-200 rounded-xl"
                    style={{ padding: '16px', gap: '12px', marginBottom: '24px' }}
                  >
                    <AlertCircle style={{ width: '20px', height: '20px' }} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-dm-sans text-amber-800 font-medium" style={{ fontSize: '14px' }}>
                        Nenhum aprovador selecionado
                      </p>
                      <p className="font-dm-sans text-amber-600" style={{ fontSize: '13px' }}>
                        Selecione pelo menos um aprovador abaixo ou desative o modo customizado
                      </p>
                    </div>
                  </div>
                )}

                {/* Search and actions */}
                <div className="flex flex-col sm:flex-row" style={{ gap: '12px', marginBottom: '16px' }}>
                  <div className="relative flex-1">
                    <Search 
                      className="absolute text-slate-400" 
                      style={{ width: '18px', height: '18px', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nome, email ou departamento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border-2 border-transparent focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400"
                      style={{ paddingLeft: '44px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px' }}
                    />
                  </div>
                  
                  <div className="flex" style={{ gap: '8px' }}>
                    <Button
                      variant="secondary"
                      onClick={handleSelectAll}
                      className="whitespace-nowrap"
                      style={{ padding: '10px 14px', fontSize: '12px' }}
                    >
                      Selecionar todos
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleDeselectAll}
                      className="whitespace-nowrap"
                      style={{ padding: '10px 14px', fontSize: '12px' }}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>

                {/* Selected count badge */}
                <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                  <span className="font-dm-sans text-slate-500" style={{ fontSize: '13px' }}>
                    {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} disponíve{filteredUsers.length !== 1 ? 'is' : 'l'}
                  </span>
                  <span 
                    className={`
                      inline-flex items-center rounded-full font-dm-sans font-medium
                      ${selectedIds.size > 0 
                        ? 'bg-lab-primary/10 text-lab-primary' 
                        : 'bg-slate-100 text-slate-500'
                      }
                    `}
                    style={{ padding: '6px 12px', fontSize: '13px', gap: '6px' }}
                  >
                    <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                    {selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Users List */}
                <div 
                  className="overflow-y-auto rounded-2xl border border-slate-200 bg-white"
                  style={{ maxHeight: '320px' }}
                >
                  {/* Admins Section */}
                  {groupedUsers.admins.length > 0 && (
                    <div>
                      <div 
                        className="sticky top-0 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-100 z-10"
                        style={{ padding: '10px 16px' }}
                      >
                        <div className="flex items-center" style={{ gap: '8px' }}>
                          <Shield style={{ width: '14px', height: '14px' }} className="text-purple-600" />
                          <span className="font-dm-sans font-semibold text-purple-700" style={{ fontSize: '12px' }}>
                            ADMINISTRADORES ({groupedUsers.admins.length})
                          </span>
                        </div>
                      </div>
                      {groupedUsers.admins.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          isSelected={selectedIds.has(user.id)}
                          onToggle={() => handleToggleUser(user.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Gestores Section */}
                  {groupedUsers.gestores.length > 0 && (
                    <div>
                      <div 
                        className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 z-10"
                        style={{ padding: '10px 16px' }}
                      >
                        <div className="flex items-center" style={{ gap: '8px' }}>
                          <Users style={{ width: '14px', height: '14px' }} className="text-blue-600" />
                          <span className="font-dm-sans font-semibold text-blue-700" style={{ fontSize: '12px' }}>
                            GESTORES ({groupedUsers.gestores.length})
                          </span>
                        </div>
                      </div>
                      {groupedUsers.gestores.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          isSelected={selectedIds.has(user.id)}
                          onToggle={() => handleToggleUser(user.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {filteredUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-slate-400" style={{ padding: '48px 24px' }}>
                      <Users style={{ width: '40px', height: '40px', marginBottom: '12px' }} strokeWidth={1.5} />
                      <p className="font-dm-sans" style={{ fontSize: '14px' }}>
                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum gestor ou admin disponível'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div 
                  className="flex flex-col sm:flex-row items-center justify-end border-t border-slate-100"
                  style={{ marginTop: '24px', paddingTop: '24px', gap: '12px' }}
                >
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                    style={{ padding: '12px 24px' }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveApprovers}
                    disabled={saving || !hasChanges}
                    className="w-full sm:w-auto"
                    style={{ padding: '12px 24px', color: 'white' }}
                  >
                    {saving ? (
                      <span className="flex items-center" style={{ gap: '8px', color: 'white' }}>
                        <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin text-white" />
                        Salvando...
                      </span>
                    ) : (
                      <span className="flex items-center" style={{ gap: '8px', color: 'white' }}>
                        <Check style={{ width: '18px', height: '18px' }} className="text-white" />
                        Salvar Alterações
                      </span>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// User Row Component
interface UserRowProps {
  user: User;
  isSelected: boolean;
  onToggle: () => void;
}

function UserRow({ user, isSelected, onToggle }: UserRowProps) {
  return (
    <div
      onClick={onToggle}
      className={`
        flex items-center cursor-pointer transition-all duration-200
        border-b border-slate-50 last:border-b-0
        ${isSelected 
          ? 'bg-lab-primary/5 hover:bg-lab-primary/10' 
          : 'hover:bg-slate-50'
        }
      `}
      style={{ padding: '12px 16px', gap: '12px' }}
    >
      {/* Checkbox */}
      <div 
        className={`
          rounded-md border-2 flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${isSelected 
            ? 'bg-lab-primary border-lab-primary' 
            : 'border-slate-300 hover:border-lab-primary/50'
          }
        `}
        style={{ width: '20px', height: '20px' }}
      >
        {isSelected && <Check style={{ width: '12px', height: '12px' }} className="text-white" strokeWidth={3} />}
      </div>
      
      {/* Avatar */}
      <AvatarWithPreview
        src={user.avatar_url}
        alt={user.nome}
        size="sm"
        fallbackText={user.nome}
        user={{
          id: user.id,
          nome: user.nome,
          avatar_url: user.avatar_url,
          lab_points: user.lab_points,
          department: user.department,
          role: user.role,
        }}
      />
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-ranade font-semibold text-slate-800 truncate" style={{ fontSize: '14px' }}>
          {user.nome}
        </p>
        <p className="font-dm-sans text-slate-400 truncate" style={{ fontSize: '12px' }}>
          {user.department ? DEPARTMENT_LABELS[user.department] : 'Sem departamento'}
        </p>
      </div>
      
      {/* Role Badge */}
      <span
        className={`
          rounded-full font-dm-sans font-medium flex-shrink-0
          ${user.role === 'adm'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700'
          }
        `}
        style={{ padding: '4px 10px', fontSize: '11px' }}
      >
        {user.role === 'adm' ? 'Admin' : 'Gestor'}
      </span>
    </div>
  );
}
