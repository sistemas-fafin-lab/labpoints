import { memo } from 'react';
import { Trophy, Crown, Medal, Flame, Sparkles } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { TopUser } from '../hooks/useTopUsers';
import { DEPARTMENT_LABELS, DepartmentEnum } from '../lib/supabase';
import { useProfilePreview } from './UserProfilePreviewModal';

interface TopUsersRankingProps {
  users: TopUser[];
  loading?: boolean;
  currentUserId?: string;
}

// Configuração visual para cada posição do ranking
const RANK_CONFIG = [
  {
    position: 1,
    icon: Crown,
    gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
    bgGradient: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-500',
    glowColor: 'shadow-yellow-200/50',
    label: '1º',
    emoji: '👑',
  },
  {
    position: 2,
    icon: Medal,
    gradient: 'from-slate-300 via-gray-300 to-slate-400',
    bgGradient: 'from-slate-50 to-gray-100',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-600',
    iconColor: 'text-slate-400',
    glowColor: 'shadow-slate-200/50',
    label: '2º',
    emoji: '🥈',
  },
  {
    position: 3,
    icon: Medal,
    gradient: 'from-amber-600 via-orange-500 to-amber-700',
    bgGradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-500',
    glowColor: 'shadow-amber-200/50',
    label: '3º',
    emoji: '🥉',
  },
  {
    position: 4,
    icon: Flame,
    gradient: 'from-lab-primary to-indigo-500',
    bgGradient: 'from-indigo-50 to-purple-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-600',
    iconColor: 'text-indigo-400',
    glowColor: 'shadow-indigo-200/50',
    label: '4º',
    emoji: '🔥',
  },
  {
    position: 5,
    icon: Sparkles,
    gradient: 'from-emerald-400 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-600',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-200/50',
    label: '5º',
    emoji: '✨',
  },
];

function RankingSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lab-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-200 animate-shimmer" />
        <div className="h-6 w-40 bg-gray-200 rounded-lg animate-shimmer" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-1 min-w-[140px] h-[160px] bg-gray-100 rounded-xl animate-shimmer"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export const TopUsersRanking = memo(function TopUsersRanking({
  users,
  loading,
  currentUserId,
}: TopUsersRankingProps) {
  const { openPreview } = useProfilePreview();

  if (loading) {
    return <RankingSkeleton />;
  }

  if (users.length === 0) {
    return null;
  }

  const handleCardClick = (user: TopUser, rankPosition: number) => {
    openPreview(
      {
        id: user.id,
        nome: user.nome,
        avatar_url: user.avatar_url,
        lab_points: user.lab_points,
        department: user.department,
        created_at: user.created_at,
      },
      rankPosition
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lab-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md shadow-yellow-200/50">
            <Trophy size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-ranade font-bold text-gray-900">
              Top Colaboradores
            </h2>
            <p className="text-sm text-gray-500 font-dm-sans">
              Os mais pontuados do Lab
            </p>
          </div>
        </div>
      </div>

      {/* Ranking Cards - Horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pt-3 pb-3 pl-3 pr-1 -ml-3 -mr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {users.map((user, index) => {
          const config = RANK_CONFIG[index] || RANK_CONFIG[4];
          const isCurrentUser = user.id === currentUserId;
          const RankIcon = config.icon;
          const rankPosition = index + 1;

          return (
            <div
              key={user.id}
              onClick={() => handleCardClick(user, rankPosition)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(user, rankPosition);
                }
              }}
              className={`
                relative flex-shrink-0 w-[130px] sm:w-[150px] lg:flex-1 lg:min-w-[130px]
                bg-gradient-to-b ${config.bgGradient}
                rounded-xl border-2 ${config.borderColor}
                pt-5 pb-4 px-3 transition-all duration-300 cursor-pointer
                hover:scale-[1.02] hover:shadow-lg ${config.glowColor}
                ${isCurrentUser ? 'ring-2 ring-lab-primary ring-offset-2' : ''}
                animate-scale-in
                focus:outline-none focus:ring-2 focus:ring-lab-primary focus:ring-offset-2
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Position Badge */}
              <div
                className={`
                  absolute -top-2.5 left-2 w-7 h-7 rounded-full
                  bg-gradient-to-br ${config.gradient}
                  flex items-center justify-center
                  shadow-md text-white font-ranade font-bold text-xs
                  border-2 border-white z-10
                `}
              >
                {config.label}
              </div>

              {/* Emoji for top 3 */}
              {index < 3 && (
                <div className="absolute top-0.5 right-1.5 text-base">
                  {config.emoji}
                </div>
              )}

              {/* User Avatar */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className={index === 0 ? 'ring-2 ring-yellow-400 ring-offset-1 rounded-full' : ''}>
                    <Avatar
                      src={user.avatar_url}
                      alt={user.nome}
                      size="sm"
                      fallbackText={user.nome}
                    />
                  </div>
                  {index === 0 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                      <Crown size={10} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center">
                <p
                  className={`
                    font-ranade font-bold text-xs sm:text-sm truncate mb-0.5 px-1
                    ${isCurrentUser ? 'text-lab-primary' : 'text-gray-900'}
                  `}
                  title={user.nome}
                >
                  {user.nome.split(' ')[0]}
                </p>
                {isCurrentUser && (
                  <p className="text-[9px] text-lab-primary font-dm-sans font-medium -mt-0.5 mb-0.5">
                    (você)
                  </p>
                )}
                <p className="text-[9px] sm:text-[10px] text-gray-500 font-dm-sans truncate px-1 mb-2">
                  {user.department
                    ? DEPARTMENT_LABELS[user.department as DepartmentEnum]
                    : 'Colaborador'}
                </p>

                {/* Points */}
                <div
                  className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                    bg-gradient-to-r ${config.gradient}
                    text-white font-ranade font-bold text-[10px] sm:text-xs
                    shadow-sm
                  `}
                >
                  <RankIcon size={10} className="flex-shrink-0" />
                  <span>{user.lab_points.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {/* Streak indicator for top 3 */}
              {index < 3 && (
                <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
                  {Array.from({ length: 3 - index }).map((_, i) => (
                    <Flame
                      key={i}
                      size={8}
                      className={`${config.iconColor} animate-pulse`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fun footer message */}
      <div className="mt-3 text-center">
        <p className="text-[10px] sm:text-xs text-gray-400 font-dm-sans">
          🎯 Ganhe mais pontos e suba no ranking!
        </p>
      </div>
    </div>
  );
});
