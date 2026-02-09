import { createPortal } from 'react-dom';
import { X, Gift } from 'lucide-react';
import { Reward } from '../lib/supabase';
import { Button } from './ui/Button';
import { PointsBadge } from './ui/PointsBadge';
import { useEffect } from 'react';

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
  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const remainingPoints = userPoints - reward.custo_points;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ margin: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in" />

      {/* Modal Container */}
      <div className="relative z-10 flex items-center justify-center w-full max-h-screen overflow-y-auto py-8">
        {/* Modal */}
        <div
          className="relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/50 animate-scale-in my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 p-7 text-white overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-all hover:rotate-90 duration-300 bg-white/10 rounded-full p-2 backdrop-blur-sm"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>

            {/* Header content */}
            <div className="relative z-10 flex items-center gap-3 pr-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Gift size={28} className="text-white drop-shadow-lg" />
              </div>
              <div>
                <h2
                  id="modal-title"
                  className="text-2xl text-white font-ranade font-bold drop-shadow-lg"
                >
                  Confirmar Resgate
                </h2>
                <p className="text-sm text-white/90 font-dm-sans mt-0.5">
                  Revise os detalhes antes de confirmar
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Reward Info */}
            <div>
              <p className="text-xs font-dm-sans text-gray-500 uppercase tracking-wide mb-1.5">
                Recompensa
              </p>
              <p className="text-lg font-ranade font-bold text-gray-900">
                {reward.titulo}
              </p>
            </div>

            {/* Points Summary */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-dm-sans text-gray-600">
                  Saldo Atual
                </span>
                <PointsBadge points={userPoints} size="sm" />
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-dm-sans text-gray-600">
                  Custo
                </span>
                <PointsBadge points={reward.custo_points} size="sm" />
              </div>

              <div className="border-t border-slate-200/80 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-dm-sans font-semibold text-gray-900">
                    Saldo Após Resgate
                  </span>
                  <PointsBadge points={remainingPoints} size="md" />
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4">
              <p className="text-sm font-dm-sans text-amber-900/80 leading-relaxed">
                Após confirmar o resgate, os pontos serão debitados automaticamente
                da sua conta. Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-0">
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
    </div>
  );

  return createPortal(modalContent, document.body);
}
