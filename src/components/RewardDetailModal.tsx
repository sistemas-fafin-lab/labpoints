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
  if (!isOpen) return null;

  const isUnlocked = userPoints >= reward.points;
  const pointsNeeded = reward.points - userPoints;
  const progressPercentage = Math.min((userPoints / reward.points) * 100, 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-300 hover:scale-110 group"
        >
          <X size={20} className="text-gray-600 group-hover:text-gray-900" />
        </button>

        {/* Image Section */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-lab-primary/10 to-lab-accent/10 overflow-hidden">
          {reward.imagem_url ? (
            <img 
              src={reward.imagem_url} 
              alt={reward.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-lab-gradient flex items-center justify-center shadow-lab-lg animate-pulse-glow">
                <Gift size={48} className="text-white" />
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />

          {/* Tags Container - Left side */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {/* Category Badge */}
            {reward.categoria && (
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-lab-primary to-indigo-500 shadow-lg backdrop-blur-md flex items-center gap-2 overflow-hidden">
                <div className="absolute inset-0 opacity-20 blur-xl bg-lab-primary" />
                <div className="relative flex-shrink-0 w-6 h-6 rounded-lg bg-white/20 ring-1 ring-white/30 flex items-center justify-center">
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
            <div className={`px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2 overflow-hidden ${
              isUnlocked 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                : 'bg-gradient-to-r from-gray-500 to-slate-600'
            }`}>
              <div className={`absolute inset-0 opacity-20 blur-xl ${isUnlocked ? 'bg-emerald-400' : 'bg-gray-400'}`} />
              <div className="relative flex-shrink-0 w-6 h-6 rounded-lg bg-white/20 ring-1 ring-white/30 flex items-center justify-center">
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
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-dm-sans text-gray-600">Seu progresso</span>
                <span className="text-sm font-dm-sans font-bold text-lab-primary">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-lab-gradient rounded-full transition-all duration-700 animate-shimmer"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 font-dm-sans">
                Faltam <span className="font-bold text-lab-accent">{pointsNeeded}</span> pontos para desbloquear
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="flex-1"
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
                className="flex-1 animate-pulse-glow"
              >
                <Gift size={20} className="mr-2" />
                Resgatar Agora
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
