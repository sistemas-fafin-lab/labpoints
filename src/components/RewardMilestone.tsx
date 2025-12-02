import { useState, useRef, useCallback } from 'react';
import { Lock, Award } from 'lucide-react';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';
import { RewardDetailModal } from './RewardDetailModal';

interface RewardMilestoneProps {
  id: string;
  name: string;
  points: number;
  userPoints: number;
  position: number;
  isUnlocked: boolean;
  onRedeem: (rewardId: string) => void;
  loading?: boolean;
  descricao?: string;
  imagem_url?: string;
  categoria?: string;
}

export function RewardMilestone({
  id,
  name,
  points,
  userPoints,
  position,
  isUnlocked,
  onRedeem,
  loading,
  descricao,
  imagem_url,
  categoria
}: RewardMilestoneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    // Clear leave timeout if re-entering
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsHovering(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsModalOpen(true);
    }, 2000); // 2 seconds delay
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Clear the modal timeout immediately
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Delay the hover state reset for smoother transition
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 300); // 300ms delay before closing
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleCardClick = useCallback(() => {
    // Clear hover timeout if clicking
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsModalOpen(true);
  }, []);
  return (
    <>
      <div
        className={`relative flex flex-col items-center transition-all duration-500 ${
          isUnlocked ? 'opacity-100' : 'opacity-40'
        }`}
        style={{ animationDelay: `${position * 0.1}s` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Connector Line (appears before milestone) */}
        {position > 0 && (
          <div 
            className={`absolute top-1/2 left-0 w-4 sm:w-6 h-1 -translate-x-full -translate-y-1/2 transition-all duration-700 ${
              isUnlocked 
                ? 'bg-lab-gradient shadow-lab-sm' 
                : 'bg-gray-300'
            }`}
            style={{ 
              animationDelay: `${position * 0.1}s`,
              transitionDelay: `${position * 0.05}s` 
            }}
          />
        )}

        {/* Milestone Circle */}
        <div
          className={`relative z-10 mb-5 sm:mb-6 transition-all duration-300 ease-out ${isHovering ? 'scale-105' : 'hover:scale-105'} ${
            isUnlocked ? 'animate-pulse-glow-smooth' : ''
          }`}
        >
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lab-lg transition-all duration-300 ${
              isUnlocked
                ? 'bg-lab-gradient ring-4 ring-lab-blue-light/50'
                : 'bg-gray-200 border-2 border-gray-300'
            }`}
          >
            {isUnlocked ? (
              <Award size={40} className="text-white drop-shadow-md" strokeWidth={2.5} />
            ) : (
              <Lock size={32} className="text-gray-500" />
            )}
          </div>

          {/* Progress Percentage Badge */}
          {!isUnlocked && userPoints < points && (
            <div className="absolute -top-2 -right-2 bg-lab-accent text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lab-sm animate-bounce-subtle">
              {Math.round((userPoints / points) * 100)}%
            </div>
          )}
        </div>

        {/* Milestone Card with Border Animation */}
        <div 
          className={`hover-border-fill rounded-lab ${isHovering ? 'border-animating' : ''}`}
          onClick={handleCardClick}
        >
          <div
            className={`bg-white rounded-lab p-4 shadow-lab-sm min-w-[200px] sm:min-w-[240px] transition-all duration-500 cursor-pointer ${
              isUnlocked
                ? 'hover-lift'
                : ''
            }`}
          >
            <h3 className={`font-ranade font-bold text-base sm:text-lg mb-2 text-center ${
              isUnlocked ? 'text-lab-black' : 'text-gray-500'
            }`}>
              {name}
            </h3>

            <div className="flex justify-center mb-3">
              <PointsBadge points={points} size="md" />
            </div>

            {isUnlocked ? (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRedeem(id);
                }}
                disabled={loading}
                loading={loading}
                className="w-full animate-scale-in"
              >
                Resgatar Recompensa
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 font-dm-sans">
                  Faltam <span className="font-bold text-lab-accent">{points - userPoints}</span> pontos
                </p>
              </div>
            )}

            {/* Hover indicator */}
            {isHovering && (
              <div className="mt-3 text-center">
                <p className="text-xs text-lab-primary font-dm-sans animate-pulse">
                  Aguarde para ver detalhes...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reward Detail Modal */}
      <RewardDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reward={{
          id,
          name,
          points,
          descricao,
          imagem_url,
          categoria
        }}
        userPoints={userPoints}
        onRedeem={onRedeem}
        loading={loading}
      />
    </>
  );
}
