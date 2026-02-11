import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Package, XCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { RedemptionStatus } from '../hooks/useAllRedemptions';

interface RedemptionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  currentStatus?: RedemptionStatus;
  newStatus: RedemptionStatus;
  userName: string;
  rewardName: string;
}

const STATUS_LABELS: Record<RedemptionStatus, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  resgatado: 'Resgatado',
  cancelado: 'Cancelado',
};

const STATUS_ICONS: Record<RedemptionStatus, React.ElementType> = {
  pendente: AlertTriangle,
  aprovado: CheckCircle2,
  resgatado: Package,
  cancelado: XCircle,
};

const STATUS_COLORS: Record<RedemptionStatus, { bg: string; text: string; icon: string }> = {
  pendente: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'text-amber-600' },
  aprovado: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-600' },
  resgatado: { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-600' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-600' },
};

export function RedemptionStatusModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  newStatus,
  userName,
  rewardName,
}: RedemptionStatusModalProps) {
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

  const NewStatusIcon = STATUS_ICONS[newStatus];
  const newStatusColors = STATUS_COLORS[newStatus];

  const getActionMessage = () => {
    switch (newStatus) {
      case 'aprovado':
        return 'Ao aprovar, você confirma que o resgate está autorizado para entrega.';
      case 'resgatado':
        return 'Ao marcar como resgatado, você confirma que a recompensa foi entregue ao colaborador.';
      case 'cancelado':
        return 'Ao cancelar, o resgate será invalidado. Os pontos do colaborador não serão devolvidos automaticamente.';
      default:
        return '';
    }
  };

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
          className="relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 animate-scale-in my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className={`relative p-7 text-white overflow-hidden ${
            newStatus === 'cancelado' 
              ? 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600'
              : newStatus === 'resgatado'
              ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600'
              : 'bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600'
          }`}>
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
                <NewStatusIcon size={28} className="text-white drop-shadow-lg" />
              </div>
              <div>
                <h2
                  id="modal-title"
                  className="text-2xl text-white font-ranade font-bold drop-shadow-lg"
                >
                  Confirmar Alteração
                </h2>
                <p className="text-sm text-white/90 font-dm-sans mt-0.5">
                  Alterar status do resgate
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Status Change Info */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/50">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-dm-sans text-gray-500 uppercase tracking-wide mb-1">
                    Colaborador
                  </p>
                  <p className="text-base font-ranade font-semibold text-gray-900">
                    {userName}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-dm-sans text-gray-500 uppercase tracking-wide mb-1">
                    Recompensa
                  </p>
                  <p className="text-base font-ranade font-semibold text-gray-900">
                    {rewardName}
                  </p>
                </div>

                <div className="border-t border-slate-200/80 pt-3 mt-3">
                  <p className="text-xs font-dm-sans text-gray-500 uppercase tracking-wide mb-2">
                    Novo Status
                  </p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${newStatusColors.bg} ${newStatusColors.text}`}>
                    <NewStatusIcon size={16} />
                    {STATUS_LABELS[newStatus]}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className={`rounded-2xl p-4 ${
              newStatus === 'cancelado'
                ? 'bg-red-50/50 border border-red-200/50'
                : 'bg-blue-50/50 border border-blue-200/50'
            }`}>
              <p className={`text-sm font-dm-sans leading-relaxed ${
                newStatus === 'cancelado' ? 'text-red-900/80' : 'text-blue-900/80'
              }`}>
                {getActionMessage()}
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
              variant={newStatus === 'cancelado' ? 'danger' : 'primary'}
              onClick={onConfirm}
              loading={loading}
              className="flex-1"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
