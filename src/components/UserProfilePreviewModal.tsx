import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Award, 
  Building2, 
  Calendar, 
  TrendingUp,
  Crown
} from 'lucide-react';
import { DEPARTMENT_LABELS, DepartmentEnum } from '../lib/supabase';

// Tipo simplificado para preview (pode vir de diferentes fontes)
export interface PreviewUser {
  id: string;
  nome: string;
  avatar_url: string | null;
  lab_points: number;
  department?: string | null;
  role?: string;
  created_at?: string;
}

interface UserProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PreviewUser | null;
  rankPosition?: number;
}

// Context para gerenciar o modal globalmente
interface ProfilePreviewContextType {
  openPreview: (user: PreviewUser, rankPosition?: number) => void;
  closePreview: () => void;
}

const ProfilePreviewContext = createContext<ProfilePreviewContextType | null>(null);

export function useProfilePreview() {
  const context = useContext(ProfilePreviewContext);
  if (!context) {
    throw new Error('useProfilePreview must be used within a ProfilePreviewProvider');
  }
  return context;
}

export function ProfilePreviewProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PreviewUser | null>(null);
  const [rankPosition, setRankPosition] = useState<number | undefined>();

  const openPreview = useCallback((user: PreviewUser, position?: number) => {
    setSelectedUser(user);
    setRankPosition(position);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    // Delay clearing user to allow exit animation
    setTimeout(() => {
      setSelectedUser(null);
      setRankPosition(undefined);
    }, 300);
  }, []);

  return (
    <ProfilePreviewContext.Provider value={{ openPreview, closePreview }}>
      {children}
      <UserProfilePreviewModal
        isOpen={isOpen}
        onClose={closePreview}
        user={selectedUser}
        rankPosition={rankPosition}
      />
    </ProfilePreviewContext.Provider>
  );
}

// Role labels e badges
const ROLE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  adm: { label: 'Administrador', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  gestor: { label: 'Gestor', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  colaborador: { label: 'Colaborador', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export function UserProfilePreviewModal({
  isOpen,
  onClose,
  user,
  rankPosition,
}: UserProfilePreviewModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const roleConfig = ROLE_CONFIG[user.role || 'colaborador'] || ROLE_CONFIG.colaborador;
  const memberSince = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  // Ranking badge colors
  const getRankBadge = (position: number) => {
    if (position === 1) return { emoji: '🏆', color: 'from-yellow-400 to-amber-500', label: 'Líder do Ranking' };
    if (position === 2) return { emoji: '🥈', color: 'from-slate-300 to-gray-400', label: '2º Lugar' };
    if (position === 3) return { emoji: '🥉', color: 'from-amber-500 to-orange-500', label: '3º Lugar' };
    return { emoji: '⭐', color: 'from-lab-primary to-indigo-500', label: `${position}º Lugar` };
  };

  const rankBadge = rankPosition ? getRankBadge(rankPosition) : null;

  const modalContent = (
    <div 
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4
        transition-all duration-300 overflow-y-auto
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div 
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm
          transition-opacity duration-300
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Modal Card */}
      <div
        className={`
          relative w-full max-w-[400px] bg-white rounded-[24px] shadow-2xl overflow-hidden
          transform transition-all duration-300 ease-out my-auto
          ${isAnimating ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Background with Gradient - h-32 para equilibrar composição */}
        <div className="relative h-[128px] bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 w-12 sm:w-20 h-12 sm:h-20 rounded-full bg-white/20 blur-xl" />
            <div className="absolute bottom-0 right-2 w-16 sm:w-32 h-16 sm:h-32 rounded-full bg-white/10 blur-2xl" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="
              absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full 
              bg-white/20 hover:bg-white/30 backdrop-blur-sm
              text-white transition-all duration-200
              hover:scale-110 active:scale-95
              z-10
            "
            aria-label="Fechar"
          >
            <X size={16} />
          </button>

          {/* Rank Badge */}
          {rankBadge && (
            <div 
              className={`
                absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
                bg-gradient-to-r ${rankBadge.color}
                text-white text-[10px] sm:text-xs font-bold font-dm-sans
                flex items-center gap-1 sm:gap-1.5 shadow-lg
                animate-bounce-subtle
              `}
            >
              <span className="text-xs sm:text-sm">{rankBadge.emoji}</span>
              <span className="hidden xs:inline">{rankBadge.label}</span>
              <span className="xs:hidden">{rankPosition}º</span>
            </div>
          )}
        </div>

        {/* Avatar - Positioned to overlap header com respiro adequado */}
        <div className="relative -mt-[48px] flex justify-center">
          <div className="relative w-[128px] h-[128px]">
            {/* Avatar customizado com w-full h-full */}
            <div className="w-full h-full rounded-full overflow-hidden bg-lab-gradient flex items-center justify-center font-ranade font-bold shadow-xl ring-4 ring-white transition-transform hover:scale-105">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl leading-none">
                  {user.nome.trim().split(' ').length === 1 
                    ? user.nome.charAt(0).toUpperCase()
                    : (user.nome.trim().split(' ')[0].charAt(0) + user.nome.trim().split(' ')[user.nome.trim().split(' ').length - 1].charAt(0)).toUpperCase()
                  }
                </span>
              )}
            </div>
            {/* Online/Active indicator */}
            <div className="absolute bottom-[2px] right-[2px] w-[24px] h-[24px] bg-green-500 rounded-full border-[4px] border-white shadow-md z-10" />
            
            {/* Crown for #1 */}
            {rankPosition === 1 && (
              <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 animate-bounce-subtle z-10">
                <Crown size={36} className="text-yellow-500 drop-shadow-lg" fill="currentColor" />
              </div>
            )}
          </div>
        </div>

        {/* User Info - Espaçamentos otimizados com progressão vertical consistente */}
        <div className="px-[28px] pt-[24px] pb-[28px] text-center">
          {/* Name - 12px margin bottom (elementos pequenos) */}
          <h2 className="text-[20px] font-ranade font-bold text-gray-900 mb-[12px] truncate">
            {user.nome}
          </h2>

          {/* Role Badge - 24px margin bottom (entre seções) */}
          <div className="flex justify-center mb-[24px]">
            <span className={`px-[14px] py-[6px] rounded-full text-[12px] font-dm-sans font-medium ${roleConfig.bgColor} ${roleConfig.color}`}>
              {roleConfig.label}
            </span>
          </div>

          {/* Stats Grid - gap-[16px] entre cards, mb-[24px] antes próxima seção */}
          <div className="grid grid-cols-2 gap-[16px] mb-[24px]">
            {/* Points Card - padding p-[18px] para altura adequada */}
            <div className="bg-gradient-to-br from-lab-primary/5 to-indigo-50 rounded-[12px] p-[18px] border border-lab-primary/10">
              <div className="flex items-center justify-center gap-[6px] mb-[10px]">
                <Award size={16} className="text-lab-primary" />
                <span className="text-[10px] text-gray-500 font-dm-sans uppercase tracking-wide">Pontos</span>
              </div>
              <p className="text-[22px] font-ranade font-bold text-gray-900">
                {user.lab_points.toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Department Card - mesma altura */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[12px] p-[18px] border border-emerald-100">
              <div className="flex items-center justify-center gap-[6px] mb-[10px]">
                <Building2 size={16} className="text-emerald-600" />
                <span className="text-[10px] text-gray-500 font-dm-sans uppercase tracking-wide">Setor</span>
              </div>
              <p className="text-[14px] font-ranade font-semibold text-gray-900 truncate">
                {user.department 
                  ? DEPARTMENT_LABELS[user.department as DepartmentEnum] || user.department
                  : '—'}
              </p>
            </div>
          </div>

          {/* Member Since - mb-[20px] para separação do footer */}
          {memberSince && (
            <div className="flex items-center justify-center gap-[8px] text-[11px] text-gray-400 font-dm-sans mb-[20px]">
              <Calendar size={14} />
              <span>Membro desde {memberSince}</span>
            </div>
          )}

          {/* Motivational Footer - pt-[24px] para respiro superior */}
          <div className="pt-[24px] border-t border-gray-100">
            <div className="flex items-center justify-center gap-[8px] text-gray-500">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-[13px] font-dm-sans">
                {rankPosition && rankPosition <= 3 
                  ? '🔥 No topo do ranking!' 
                  : rankPosition && rankPosition <= 5
                  ? '⚡ Subindo no ranking!'
                  : '✨ Continue assim!'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="h-[4px] bg-gradient-to-r from-lab-primary via-indigo-500 to-purple-500" />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
