import { useState } from 'react';
import { Reward } from '../lib/supabase';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';
import { RedeemModal } from './RedeemModal';
import { Tag } from 'lucide-react';

interface RewardCardProps {
  reward: Reward;
  userPoints?: number;
  onRedeem?: () => void;
  onCardClick?: () => void;
  loading?: boolean;
}

export function RewardCard({ reward, userPoints, onRedeem, onCardClick, loading }: RewardCardProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const canRedeem = userPoints !== undefined && userPoints >= reward.custo_points;

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  const handleRedeemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canRedeem && onRedeem) {
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmRedeem = () => {
    if (onRedeem) {
      onRedeem();
    }
    setIsConfirmModalOpen(false);
  };

  return (
    <div 
      className={`bg-white rounded-lab overflow-hidden shadow-lab-sm hover-lift border border-gray-100 flex flex-col group ${onCardClick ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="aspect-video bg-gradient-to-br from-lab-primary to-lab-primary-dark flex items-center justify-center overflow-hidden relative">
        {reward.imagem_url ? (
          <img
            src={reward.imagem_url}
            alt={reward.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <Tag size={48} className="text-white opacity-50 transition-transform duration-300 group-hover:scale-110" />
        )}
        <span className="absolute top-3 right-3 inline-flex items-center px-3 py-1.5 rounded-full bg-white bg-opacity-90 backdrop-blur-sm text-lab-primary text-xs font-dm-sans font-medium shadow-sm">
          {reward.categoria}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-ranade font-bold text-lab-black mb-2 line-clamp-2">
          {reward.titulo}
        </h3>

        <p className="text-sm font-dm-sans text-lab-gray mb-4 flex-1 line-clamp-3">
          {reward.descricao}
        </p>

        <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-100">
          <PointsBadge points={reward.custo_points} size="sm" showLabel={false} />

          {onRedeem && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleRedeemClick}
              disabled={!canRedeem || loading}
              loading={loading}
              className="flex-1"
              aria-label={`Resgatar ${reward.titulo}`}
            >
              {canRedeem ? 'Resgatar' : 'Insuficiente'}
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Resgate */}
      {userPoints !== undefined && (
        <RedeemModal
          reward={reward}
          userPoints={userPoints}
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmRedeem}
          loading={loading}
        />
      )}
    </div>
  );
}
