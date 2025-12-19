import { TrendingUp } from 'lucide-react';
import { RewardMilestone } from './RewardMilestone';
import { PointsBadge } from './ui/PointsBadge';

export interface TimelineReward {
  id: string;
  name: string;
  points: number;
  descricao?: string;
  imagem_url?: string;
  categoria?: string;
}

interface RewardsTimelineProps {
  rewards: TimelineReward[];
  userPoints: number;
  onRedeem: (rewardId: string) => void;
  loading?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function RewardsTimeline({
  rewards,
  userPoints,
  onRedeem,
  loading,
  orientation = 'horizontal'
}: RewardsTimelineProps) {
  // Sort rewards by points ascending
  const sortedRewards = [...rewards].sort((a, b) => a.points - b.points);
  
  // Calculate max points for progress bar
  const maxPoints = sortedRewards[sortedRewards.length - 1]?.points || 1000;
  const progressPercentage = Math.min((userPoints / maxPoints) * 100, 100);

  // Determine which rewards are unlocked
  const rewardsWithStatus = sortedRewards.map((reward) => ({
    ...reward,
    isUnlocked: userPoints >= reward.points,
    position: (reward.points / maxPoints) * 100
  }));

  if (orientation === 'vertical') {
    return (
      <div className="bg-white rounded-lab p-6 shadow-lab-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-ranade font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-lab-primary" size={28} />
              Próximas Recompensas
            </h2>
            <p className="text-sm text-lab-gray-700 font-dm-sans mt-1">
              Continue acumulando pontos para desbloquear recompensas
            </p>
          </div>
          <PointsBadge points={userPoints} size="lg" animated />
        </div>

        {/* Vertical Timeline */}
        <div className="space-y-8">
          {rewardsWithStatus.map((reward, index) => (
            <div key={reward.id} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Left side: Progress line and circle */}
              <div className="flex flex-col items-center">
                {index > 0 && (
                  <div
                    className={`w-1 h-16 transition-all duration-700 ${
                      reward.isUnlocked ? 'bg-lab-gradient shadow-lab-sm' : 'bg-gray-300'
                    }`}
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  />
                )}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lab-md transition-all duration-500 flex-shrink-0 ${
                    reward.isUnlocked
                      ? 'bg-lab-gradient ring-4 ring-lab-blue-light animate-pulse-glow'
                      : 'bg-gray-200 border-2 border-gray-300 opacity-40'
                  }`}
                >
                  <span className="text-white font-ranade font-bold text-xs">
                    {reward.points}
                  </span>
                </div>
              </div>

              {/* Right side: Milestone card */}
              <div className="flex-1">
                <RewardMilestone
                  id={reward.id}
                  name={reward.name}
                  points={reward.points}
                  userPoints={userPoints}
                  position={index}
                  isUnlocked={reward.isUnlocked}
                  onRedeem={onRedeem}
                  loading={loading}
                  descricao={reward.descricao}
                  imagem_url={reward.imagem_url}
                  categoria={reward.categoria}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal Timeline
  return (
    <div className="bg-white rounded-lab p-6 sm:p-8 shadow-lab-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-ranade font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-lab-primary" size={28} />
            Próximas Recompensas
          </h2>
          <p className="text-sm text-lab-gray-700 font-dm-sans mt-1">
            Continue acumulando pontos para desbloquear recompensas
          </p>
        </div>
        <PointsBadge points={userPoints} size="lg" animated />
      </div>

      {/* Progress Bar Container */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-dm-sans font-medium text-gray-700">
            Progresso Total
          </span>
          <span className="text-sm font-dm-sans font-bold text-blue-700">
            {userPoints} / {maxPoints} pts ({progressPercentage.toFixed(0)}%)
          </span>
        </div>
        <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${progressPercentage}%`,
              background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 40%, #2563eb 70%, #1e40af 100%)',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
          />
        </div>
      </div>

      {/* Horizontal Scrollable Timeline */}
      <div className="relative min-h-[320px]">
        <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 hover:scrollbar-thumb-blue-600 transition-colors duration-300">
          <div className="flex items-start gap-4 sm:gap-6 min-w-max px-4 pt-2">
            {rewardsWithStatus.map((reward, index) => (
              <RewardMilestone
                key={reward.id}
                id={reward.id}
                name={reward.name}
                points={reward.points}
                userPoints={userPoints}
                position={index}
                isUnlocked={reward.isUnlocked}
                onRedeem={onRedeem}
                loading={loading}
                descricao={reward.descricao}
                imagem_url={reward.imagem_url}
                categoria={reward.categoria}
              />
            ))}
          </div>
        </div>

        {/* Scroll Hint (mobile) */}
        <div className="md:hidden text-center mt-4">
          <p className="text-xs text-lab-gray font-dm-sans flex items-center justify-center gap-1">
            <span className="animate-bounce">👈</span>
            Deslize para ver todas as recompensas
            <span className="animate-bounce">👉</span>
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-6 justify-center text-xs sm:text-sm font-dm-sans">
          <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 shadow-md" />
            <span className="text-gray-700 font-medium">Desbloqueado</span>
          </div>
          <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 shadow-md" />
            <span className="text-gray-700 font-medium">Bloqueado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
