import { useState } from 'react';
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };
  return (
    <>
      <div
        className={`relative flex flex-col items-center transition-all duration-500 ease-out animate-fade-in pb-2 ${
          isUnlocked ? 'opacity-100' : 'opacity-50'
        }`}
        style={{ animationDelay: `${position * 0.1}s` }}
      >
        {/* Connector Line (appears before milestone) */}
        {position > 0 && (
          <div 
            className={`absolute top-12 sm:top-14 left-0 w-4 sm:w-6 h-1 -translate-x-full transition-all duration-700 ease-in-out ${
              isUnlocked 
                ? 'bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800' 
                : 'bg-gray-300'
            }`}
            style={{ 
              transitionDelay: `${position * 0.05}s` 
            }}
          />
        )}

        {/* Milestone Circle */}
        <div
          className={`relative z-10 mb-4 sm:mb-5 transition-transform duration-300 ease-out ${
            isUnlocked ? 'drop-shadow-xl' : ''
          }`}
        >
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 ${
              isUnlocked
                ? 'bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 ring-4 ring-blue-300/40'
                : 'bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-400'
            }`}
          >
            {isUnlocked ? (
              <Award size={40} className="text-white drop-shadow-lg" strokeWidth={2.5} />
            ) : (
              <Lock size={32} className="text-gray-500" />
            )}
          </div>

          {/* Progress Percentage Badge */}
          {!isUnlocked && userPoints < points && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md">
              {Math.round((userPoints / points) * 100)}%
            </div>
          )}
        </div>

        {/* Milestone Card with Neon Border Effect */}
        <div 
          className="neon-card-wrapper cursor-pointer"
          onClick={handleCardClick}
        >
          {/* Card Content */}
          <div
            className={`neon-card-content p-4 shadow-md min-w-[200px] sm:min-w-[240px] transition-all duration-300 ease-out ${
              isUnlocked
                ? 'hover:shadow-lg hover:-translate-y-1'
                : ''
            }`}
          >
            <h3 className={`font-ranade font-bold text-base sm:text-lg mb-2 text-center transition-colors duration-300 ${
              isUnlocked ? 'text-gray-900 group-hover:text-blue-700' : 'text-gray-500'
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
                className="w-full transition-all duration-300 hover:scale-105"
              >
                Resgatar Recompensa
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 font-dm-sans">
                  Faltam <span className="font-bold text-blue-700">{points - userPoints}</span> pontos
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
