import { Lock, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';

interface RewardMilestoneProps {
  id: string;
  name: string;
  points: number;
  userPoints: number;
  position: number;
  isUnlocked: boolean;
  onRedeem: (rewardId: string) => void;
  loading?: boolean;
}

export function RewardMilestone({
  id,
  name,
  points,
  userPoints,
  position,
  isUnlocked,
  onRedeem,
  loading
}: RewardMilestoneProps) {
  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-500 ${
        isUnlocked ? 'opacity-100' : 'opacity-40'
      }`}
      style={{ animationDelay: `${position * 0.1}s` }}
    >
      {/* Connector Line (appears before milestone) */}
      {position > 0 && (
        <div 
          className={`absolute top-1/2 right-full w-12 sm:w-16 md:w-24 h-1 -translate-y-1/2 transition-all duration-700 ${
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
        className={`relative z-10 mb-3 sm:mb-4 transition-all duration-500 hover:scale-110 ${
          isUnlocked ? 'animate-pulse-glow' : ''
        }`}
      >
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lab-md transition-all duration-500 ${
            isUnlocked
              ? 'bg-lab-gradient ring-4 ring-lab-blue-light'
              : 'bg-gray-200 border-2 border-gray-300'
          }`}
        >
          {isUnlocked ? (
            <CheckCircle size={32} className="text-white" />
          ) : (
            <Lock size={28} className="text-gray-500" />
          )}
        </div>

        {/* Progress Percentage Badge */}
        {!isUnlocked && userPoints < points && (
          <div className="absolute -top-2 -right-2 bg-lab-accent text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lab-sm animate-bounce-subtle">
            {Math.round((userPoints / points) * 100)}%
          </div>
        )}
      </div>

      {/* Milestone Card */}
      <div
        className={`bg-white rounded-lab p-4 shadow-lab-sm border-2 min-w-[200px] sm:min-w-[240px] transition-all duration-500 ${
          isUnlocked
            ? 'border-lab-primary hover-lift'
            : 'border-gray-200'
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
            onClick={() => onRedeem(id)}
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
      </div>
    </div>
  );
}
