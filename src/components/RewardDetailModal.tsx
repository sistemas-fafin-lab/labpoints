import { useEffect } from 'react';
import { X, Gift, Star, Award, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';

interface RewardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: {
    id: string;
    name: string;
    points: number;
    descricao?: string;
    imagem_url?: string;
    categoria?: string;
  };
  userPoints: number;
  onRedeem: (rewardId: string) => void;
  loading?: boolean;
}

export function RewardDetailModal({
  isOpen,
  onClose,
  reward,
  userPoints,
  onRedeem,
  loading
}: RewardDetailModalProps) {
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

  if (!isOpen) return null;

  const isUnlocked = userPoints >= reward.points;
  const pointsNeeded = reward.points - userPoints;
  const progressPercentage = Math.min((userPoints / reward.points) * 100, 100);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
      style={{ margin: 0 }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-all duration-500" />
      
      {/* Modal Container - centered */}
      <div className="relative z-10 flex items-center justify-center min-h-full w-full py-8">
        {/* Modal */}
        <div 
          className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-500 ease-out animate-scale-in hover:shadow-blue-500/20"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all duration-500 ease-out hover:scale-110 hover:rotate-90 group backdrop-blur-sm"
        >
          <X size={20} className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300" />
        </button>

        {/* Image Section */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-blue-50 via-blue-100 to-slate-100 overflow-hidden">
          {reward.imagem_url ? (
            <img 
              src={reward.imagem_url} 
              alt={reward.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 flex items-center justify-center shadow-2xl transition-all duration-700 hover:scale-110">
                <Gift size={48} className="text-white drop-shadow-lg" />
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent" />

          {/* Tags Container - Left side */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {/* Category Badge */}
            {reward.categoria && (
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 shadow-xl backdrop-blur-md flex items-center gap-2 overflow-hidden transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 opacity-30 blur-xl bg-blue-400" />
                <div className="relative flex-shrink-0 w-6 h-6 rounded-lg bg-white/25 ring-1 ring-white/40 flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                  {reward.categoria?.toLowerCase().includes('experiência') || reward.categoria?.toLowerCase().includes('experiencia') ? (
                    <Star size={12} className="text-white drop-shadow-md" strokeWidth={2.5} />
                  ) : reward.categoria?.toLowerCase().includes('prêmio') || reward.categoria?.toLowerCase().includes('premio') ? (
                    <Award size={12} className="text-white drop-shadow-md" strokeWidth={2.5} />
                  ) : (
                    <Gift size={12} className="text-white drop-shadow-md" strokeWidth={2.5} />
                  )}
                </div>
                <span className="relative text-xs font-dm-sans font-semibold text-white drop-shadow-sm">
                  {reward.categoria}
                </span>
              </div>
            )}

            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2 overflow-hidden transition-all duration-500 hover:scale-105 ${
              isUnlocked 
                ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                : 'bg-gradient-to-r from-gray-400 to-slate-500'
            }`}>
              <div className={`absolute inset-0 opacity-30 blur-xl ${isUnlocked ? 'bg-emerald-300' : 'bg-gray-300'}`} />
              <div className="relative flex-shrink-0 w-6 h-6 rounded-lg bg-white/25 ring-1 ring-white/40 flex items-center justify-center transition-transform duration-300 hover:rotate-12">
                {isUnlocked ? (
                  <CheckCircle size={12} className="text-white drop-shadow-md" strokeWidth={2.5} />
                ) : (
                  <Clock size={12} className="text-white drop-shadow-md" strokeWidth={2.5} />
                )}
              </div>
              <span className="relative text-xs font-dm-sans font-semibold text-white drop-shadow-sm">
                {isUnlocked ? 'Desbloqueado' : 'Em progresso'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-ranade font-bold text-gray-900 mb-2">
            {reward.name}
          </h2>

          {/* Points Badge */}
          <div className="mb-4">
            <PointsBadge points={reward.points} size="lg" animated={isUnlocked} />
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-600 font-dm-sans leading-relaxed">
              {reward.descricao || 'Uma recompensa exclusiva aguarda por você! Continue acumulando pontos para desbloquear.'}
            </p>
          </div>

          {/* Progress Section (if not unlocked) */}
          {!isUnlocked && (
            <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl border border-blue-100 shadow-inner transition-all duration-500">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-dm-sans text-gray-700 font-medium">Seu progresso</span>
                <span className="text-sm font-dm-sans font-bold text-blue-700">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner border border-gray-200">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 40%, #2563eb 70%, #1e40af 100%)',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 font-dm-sans">
                Faltam <span className="font-bold text-blue-700">{pointsNeeded}</span> pontos para desbloquear
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="flex-1 transition-all duration-300 hover:scale-105"
            >
              Fechar
            </Button>
            {isUnlocked && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  onRedeem(reward.id);
                  onClose();
                }}
                disabled={loading}
                loading={loading}
                className="flex-1 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
              >
                <Gift size={20} className="mr-2" />
                Resgatar Agora
              </Button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
