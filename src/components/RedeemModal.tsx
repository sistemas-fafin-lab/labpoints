import { X } from 'lucide-react';
import { Reward } from '../lib/supabase';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';

interface RedeemModalProps {
  reward: Reward;
  userPoints: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function RedeemModal({
  reward,
  userPoints,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: RedeemModalProps) {
  if (!isOpen) return null;

  const remainingPoints = userPoints - reward.custo_points;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-lab-modal max-w-md w-full p-24 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          <X size={24} />
        </button>

        <h2
          id="modal-title"
          className="text-2xl font-ranade font-bold text-white mb-4"
        >
          Confirmar Resgate
        </h2>

        <div className="space-y-4 mb-24">
          <div>
            <p className="text-sm font-dm-sans text-white mb-1">
              Recompensa
            </p>
            <p className="text-lg font-ranade font-bold text-white">
              {reward.titulo}
            </p>
          </div>

          <div className="bg-lab-gray-100 rounded-lab p-16">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-dm-sans text-white">
                Saldo Atual
              </span>
              <PointsBadge points={userPoints} size="sm" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-dm-sans text-white">
                Custo
              </span>
              <PointsBadge points={reward.custo_points} size="sm" />
            </div>

            <div className="border-t-2 border-white pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-dm-sans font-bold text-white">
                  Saldo Após Resgate
                </span>
                <PointsBadge points={remainingPoints} size="md" />
              </div>
            </div>
          </div>

          <div className="bg-lab-accent bg-opacity-10 border-l-4 border-lab-accent rounded p-16">
            <p className="text-sm font-dm-sans text-white">
              Após confirmar o resgate, os pontos serão debitados automaticamente
              da sua conta. Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            Confirmar Resgate
          </Button>
        </div>
      </div>
    </div>
  );
}
