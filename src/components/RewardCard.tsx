import { Reward } from '../lib/supabase';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';
import { Tag } from 'lucide-react';

interface RewardCardProps {
  reward: Reward;
  userPoints?: number;
  onRedeem?: () => void;
  loading?: boolean;
}

export function RewardCard({ reward, userPoints, onRedeem, loading }: RewardCardProps) {
  const canRedeem = userPoints !== undefined && userPoints >= reward.custo_points;

  return (
    <div className="bg-white rounded-lab overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 flex flex-col">
      <div className="aspect-video bg-gradient-to-br from-lab-primary to-lab-primary-dark flex items-center justify-center overflow-hidden">
        {reward.imagem_url ? (
          <img
            src={reward.imagem_url}
            alt={reward.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <Tag size={48} className="text-white opacity-50" />
        )}
      </div>

      <div className="p-16 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-ranade font-bold text-white flex-1">
            {reward.titulo}
          </h3>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-lab-accent bg-opacity-10 text-lab-accent text-xs font-dm-sans font-medium">
            {reward.categoria}
          </span>
        </div>

        <p className="text-sm font-dm-sans text-white mb-4 flex-1">
          {reward.descricao}
        </p>

        <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-100">
          <PointsBadge points={reward.custo_points} size="sm" showLabel={false} />

          {onRedeem && (
            <Button
              variant="primary"
              onClick={onRedeem}
              disabled={!canRedeem || loading}
              loading={loading}
              className="flex-1"
              aria-label={`Resgatar ${reward.titulo}`}
            >
              {canRedeem ? 'Resgatar' : 'Pontos Insuficientes'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
