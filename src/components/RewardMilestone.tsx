import { useState } from 'react';
import { Lock, Gift, Target } from 'lucide-react';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';
import { RewardDetailModal } from './RewardDetailModal';
import { RedeemModal } from './RedeemModal';
import type { Reward } from '../lib/supabase';

interface RewardMilestoneProps {
  id: string;
  name: string;
  points: number;
  userPoints: number;
  position: number;
  isUnlocked: boolean;
  isNextTarget?: boolean;
  isFirstUnlocked?: boolean;
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
  isNextTarget = false,
  onRedeem,
  loading,
  descricao,
  imagem_url,
  categoria
}: RewardMilestoneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Calculate progress percentage for next target
  const progressToUnlock = Math.min((userPoints / points) * 100, 100);
  const pointsRemaining = Math.max(points - userPoints, 0);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };
  return (
    <>
      <div
        className={`relative flex flex-col items-center transition-all duration-500 ease-out pb-2 pt-4 ${
          isUnlocked 
            ? 'opacity-100' 
            : isNextTarget 
              ? 'opacity-100 next-target-card' 
              : 'opacity-50'
        }`}
        style={{ 
          animationDelay: `${position * 0.1}s`,
          // Slight scale emphasis for next target
          transform: isNextTarget ? 'scale(1.03)' : 'scale(1)'
        }}
      >
        {/* "PRÓXIMA META" Badge - posicionado acima do círculo */}
        {isNextTarget && (
          <div className="mb-2 z-20 animate-fade-in">
            <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[9px] font-semibold uppercase tracking-wide rounded-full shadow-md whitespace-nowrap">
              Próxima
            </span>
          </div>
        )}
        {/* Connector Line (appears before milestone) */}
        {position > 0 && (
          <div 
            className={`absolute top-[50px] sm:top-[60px] left-0 w-4 sm:w-6 h-1 -translate-x-full -translate-y-1/2 transition-all duration-700 ease-in-out ${
              isUnlocked 
                ? 'bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600' 
                : 'bg-slate-200'
            }`}
            style={{ 
              transitionDelay: `${position * 0.05}s` 
            }}
          />
        )}

        {/* Milestone Circle - redesigned with AssignPointsModal visual approach */}
        <div
          className={`relative z-10 mb-4 sm:mb-5 transition-transform duration-300 ease-out ${
            isUnlocked || isNextTarget ? 'drop-shadow-xl' : ''
          }`}
        >
          <div
            className={`rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 ${
              isUnlocked
                ? 'bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 ring-2 ring-white/40'
                : isNextTarget
                  ? 'bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-indigo-200/60 animate-pulse-glow-target-refined'
                  : 'bg-slate-100 border-2 border-slate-200'
            }`}
            style={{ width: '80px', height: '80px' }}
          >
            {isUnlocked ? (
              <Gift style={{ width: '36px', height: '36px' }} className="text-white drop-shadow-lg" strokeWidth={2} />
            ) : isNextTarget ? (
              <Target style={{ width: '36px', height: '36px' }} className="text-white drop-shadow-lg" strokeWidth={2} />
            ) : (
              <Lock style={{ width: '28px', height: '28px' }} className="text-slate-400" />
            )}
          </div>

          {/* Progress Percentage Badge - refined with indigo/purple tones */}
          {isNextTarget && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md ring-2 ring-white">
              {Math.round(progressToUnlock)}%
            </div>
          )}
          
          {/* Progress badge for other locked rewards */}
          {!isUnlocked && !isNextTarget && userPoints < points && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-slate-400 to-slate-500 text-white text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
              {Math.round((userPoints / points) * 100)}%
            </div>
          )}
        </div>

        {/* Milestone Card with Neon Border Effect */}
        <div 
          className={`neon-card-wrapper cursor-pointer ${
            isNextTarget ? 'next-target-wrapper-refined' : ''
          }`}
          onClick={handleCardClick}
        >
          {/* Card Content */}
          <div
            className={`neon-card-content p-4 shadow-md min-w-[200px] sm:min-w-[240px] transition-all duration-300 ease-out ${
              isUnlocked
                ? 'hover:shadow-lg hover:-translate-y-1'
                : isNextTarget
                  ? 'ring-1 ring-blue-300/40 hover:shadow-lg hover:-translate-y-1'
                  : ''
            }`}
          >
            {/* Card title with appropriate styling */}
            <h3 className={`font-ranade font-bold text-base sm:text-lg mb-2 text-center transition-colors duration-300 ${
              isUnlocked 
                ? 'text-gray-900 group-hover:text-blue-700' 
                : isNextTarget
                  ? 'text-gray-900'
                  : 'text-gray-500'
            }`}>
              {name}
            </h3>

            <div className="flex justify-center mb-3">
              <PointsBadge points={points} size="md" />
            </div>

            {/* CTA based on reward state - todos com variant secondary */}
            {isUnlocked ? (
              /* Unlocked: Abre modal de confirmação */
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmModalOpen(true);
                }}
                disabled={loading}
                loading={loading}
                className="w-full transition-all duration-300 hover:scale-102"
              >
                Resgatar
              </Button>
            ) : isNextTarget ? (
              /* Next Target: Simplified progress feedback */
              <div className="text-center space-y-2">
                <p className="text-xs text-blue-600 font-dm-sans font-medium">
                  +{pointsRemaining} pts
                </p>
                {/* Animated progress bar - refined blue tones */}
                <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressToUnlock}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Locked: Minimal info */
              <div className="text-center">
                <p className="text-[11px] text-gray-400 font-dm-sans">
                  +{pointsRemaining} pts
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

      {/* Modal de Confirmação de Resgate */}
      <RedeemModal
        reward={{
          id,
          titulo: name,
          descricao: descricao || '',
          custo_points: points,
          categoria: categoria || '',
          ativo: true,
          created_at: '',
          updated_at: '',
          imagem_url: imagem_url || null
        } as Reward}
        userPoints={userPoints}
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          onRedeem(id);
          setIsConfirmModalOpen(false);
        }}
        loading={loading}
      />
    </>
  );
}
