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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-dm-sans font-medium text-lab-gray-700">
            Progresso Total
          </span>
          <span className="text-sm font-dm-sans font-bold text-lab-primary">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute top-0 left-0 h-full shadow-lab-sm transition-all duration-1000 ease-out rounded-full animate-progress-flow"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Horizontal Scrollable Timeline */}
      <div className="relative">
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-lab-primary scrollbar-track-gray-200">
          <div className="flex items-center gap-4 sm:gap-6 min-w-max px-4">
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
        <div className="flex flex-wrap gap-4 justify-center text-xs sm:text-sm font-dm-sans">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-lab-gradient" />
            <span className="text-lab-gray-700">Desbloqueado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-300" />
            <span className="text-lab-gray-700">Bloqueado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
