import { TrendingUp, Gift, Target, Lock } from 'lucide-react';
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

  // Find the next target reward (first reward the user hasn't unlocked yet)
  const nextTargetIndex = sortedRewards.findIndex(reward => userPoints < reward.points);
  const nextTargetReward = nextTargetIndex !== -1 ? sortedRewards[nextTargetIndex] : null;
  const pointsToNextTarget = nextTargetReward ? nextTargetReward.points - userPoints : 0;

  // Find first unlocked reward for CTA hierarchy (primary vs secondary buttons)
  const firstUnlockedIndex = sortedRewards.findIndex(reward => userPoints >= reward.points);

  // Determine which rewards are unlocked and which is the next target
  const rewardsWithStatus = sortedRewards.map((reward, index) => ({
    ...reward,
    isUnlocked: userPoints >= reward.points,
    isNextTarget: index === nextTargetIndex,
    isFirstUnlocked: index === firstUnlockedIndex,
    position: (reward.points / maxPoints) * 100
  }));

  if (orientation === 'vertical') {
    return (
      <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        {/* Header - redesigned with AssignPointsModal visual approach */}
        <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 p-6 sm:p-7 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
                style={{ width: '56px', height: '56px' }}
              >
                <TrendingUp style={{ width: '28px', height: '28px' }} className="text-white drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-ranade font-bold text-white drop-shadow-sm">
                  Próximas Recompensas
                </h2>
                <p className="text-sm text-white/80 font-dm-sans mt-0.5">
                  Resgate com seu saldo ou acumule para desbloquear
                </p>
              </div>
            </div>
            <PointsBadge points={userPoints} size="lg" animated />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Vertical Timeline */}
          <div className="space-y-8">
            {rewardsWithStatus.map((reward, index) => (
              <div key={reward.id} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Left side: Progress line and circle */}
                <div className="flex flex-col items-center">
                {index > 0 && (
                  <div
                    className={`w-1 h-16 transition-all duration-700 ${
                      reward.isUnlocked 
                        ? 'bg-gradient-to-b from-indigo-400 via-purple-500 to-indigo-600' 
                        : 'bg-slate-200'
                    }`}
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  />
                )}
                <div
                  className={`rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 flex-shrink-0 ${
                    reward.isUnlocked
                      ? 'bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 ring-2 ring-white/40'
                      : reward.isNextTarget
                        ? 'bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-indigo-200/60'
                        : 'bg-slate-100 border-2 border-slate-200 opacity-50'
                  }`}
                  style={{ width: '56px', height: '56px' }}
                >
                  {reward.isUnlocked ? (
                    <Gift style={{ width: '24px', height: '24px' }} className="text-white drop-shadow-lg" />
                  ) : reward.isNextTarget ? (
                    <Target style={{ width: '24px', height: '24px' }} className="text-white drop-shadow-lg" />
                  ) : (
                    <Lock style={{ width: '20px', height: '20px' }} className="text-slate-400" />
                  )}
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
                  isNextTarget={reward.isNextTarget}
                  isFirstUnlocked={reward.isFirstUnlocked}
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
      </div>
    );
  }

  // Horizontal Timeline
  return (
    <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl mt-32 shadow-2xl border border-white/50 overflow-hidden">
      {/* Header - redesigned with AssignPointsModal visual approach */}
      <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 p-6 sm:p-7 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
              style={{ width: '56px', height: '56px' }}
            >
              <TrendingUp style={{ width: '28px', height: '28px' }} className="text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-ranade font-bold text-white drop-shadow-sm">
                Próximas Recompensas
              </h2>
              <p className="text-sm text-white/80 font-dm-sans mt-0.5">
                Resgate com seu saldo ou acumule para desbloquear
              </p>
            </div>
          </div>
          <PointsBadge points={userPoints} size="lg" animated />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        {/* Progress Bar Container */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-md font-dm-sans font-medium text-slate-700 mt-4">
              Progresso Total
            </span>
            <span className="text-md font-dm-sans font-bold text-indigo-600 mt-4">
              {userPoints} / {maxPoints} pts ({progressPercentage.toFixed(0)}%)
            </span>
          </div>
          
          {/* Motivational message for next target - refined */}
          {nextTargetReward && (
            <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/60 animate-fade-in">
              <p className="text-sm font-dm-sans text-slate-600 text-center">
                <span className="text-indigo-600 font-semibold">+{pointsToNextTarget} pts</span>
                {' '}para{' '}
                <span className="font-medium text-slate-800">{nextTargetReward.name}</span>
              </p>
            </div>
          )}
          
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${progressPercentage}%`,
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}
            />
          </div>
        </div>

        {/* Horizontal Scrollable Timeline */}
        <div className="relative min-h-[380px]">
          <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-slate-100 hover:scrollbar-thumb-indigo-500 transition-colors duration-300">
            <div className="flex items-start gap-4 sm:gap-6 min-w-max px-4 pt-8">
              {rewardsWithStatus.map((reward, index) => (
                <RewardMilestone
                  key={reward.id}
                  id={reward.id}
                  name={reward.name}
                  points={reward.points}
                  userPoints={userPoints}
                  position={index}
                  isUnlocked={reward.isUnlocked}
                  isNextTarget={reward.isNextTarget}
                  isFirstUnlocked={reward.isFirstUnlocked}
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
            <p className="text-xs text-slate-500 font-dm-sans flex items-center justify-center gap-1">
              <span className="animate-bounce">👈</span>
              Deslize para ver todas as recompensas
              <span className="animate-bounce">👉</span>
            </p>
          </div>
        </div>

        {/* Legend - redesigned with modern styling */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-wrap gap-6 justify-center text-xs font-dm-sans">
            <div className="flex items-center gap-2">
              <div 
                className="rounded-lg bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 ring-1 ring-white/40 flex items-center justify-center"
                style={{ width: '20px', height: '20px' }}
              >
                <Gift style={{ width: '10px', height: '10px' }} className="text-white" />
              </div>
              <span className="text-slate-600">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 ring-1 ring-indigo-200/60 flex items-center justify-center"
                style={{ width: '20px', height: '20px' }}
              >
                <Target style={{ width: '10px', height: '10px' }} className="text-white" />
              </div>
              <span className="text-slate-600">Próxima meta</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center"
                style={{ width: '20px', height: '20px' }}
              >
                <Lock style={{ width: '10px', height: '10px' }} className="text-slate-400" />
              </div>
              <span className="text-slate-600">Bloqueado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
