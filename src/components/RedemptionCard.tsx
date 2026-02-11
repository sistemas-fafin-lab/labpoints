import { Gift, Clock, CheckCircle2, Package, XCircle, Calendar } from 'lucide-react';
import { AvatarWithPreview } from './AvatarWithPreview';
import { PointsBadge } from './ui/PointsBadge';
import { Button } from './ui/Button';
import { RedemptionWithDetails, FulfillmentStatus } from '../hooks/useAllRedemptions';
import { DEPARTMENT_LABELS, DepartmentEnum } from '../lib/supabase';

interface RedemptionCardProps {
  redemption: RedemptionWithDetails;
  onStatusChange: (redemptionId: string, newStatus: FulfillmentStatus) => void;
  loading?: boolean;
}

// Status de fulfillment (processo de entrega da recompensa pelo gestor)
const STATUS_CONFIG: Record<FulfillmentStatus, { 
  label: string; 
  icon: React.ElementType; 
  bgColor: string; 
  textColor: string;
  borderColor: string;
}> = {
  pendente: {
    label: 'Pendente',
    icon: Clock,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  aprovado: {
    label: 'Aprovado',
    icon: CheckCircle2,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  entregue: {
    label: 'Entregue',
    icon: Package,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
};

export function RedemptionCard({ redemption, onStatusChange, loading }: RedemptionCardProps) {
  // Usar fulfillment_status para controlar o processo de entrega
  const fulfillmentStatus = redemption.fulfillment_status || 'pendente';
  const validStatus = STATUS_CONFIG[fulfillmentStatus] ? fulfillmentStatus : 'pendente';
  const statusConfig = STATUS_CONFIG[validStatus];
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextStatus = (currentStatus: FulfillmentStatus): FulfillmentStatus | null => {
    switch (currentStatus) {
      case 'pendente':
        return 'aprovado';
      case 'aprovado':
        return 'entregue';
      case 'entregue':
      case 'cancelado':
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: FulfillmentStatus): string | null => {
    switch (currentStatus) {
      case 'pendente':
        return 'Aprovar';
      case 'aprovado':
        return 'Marcar como Entregue';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(fulfillmentStatus);
  const nextStatusLabel = getNextStatusLabel(fulfillmentStatus);

  return (
    <div 
      className="group bg-white rounded-2xl border border-gray-100 shadow-lab-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
      role="article"
      aria-label={`Resgate de ${redemption.user?.nome || 'Usuário'}: ${redemption.reward?.titulo || 'Recompensa'}`}
    >
      {/* Header com status */}
      <div className={`px-5 py-3 ${statusConfig.bgColor} border-b ${statusConfig.borderColor} transition-colors duration-200`}>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-2 text-sm font-medium ${statusConfig.textColor} transition-transform duration-200 group-hover:scale-105`}>
            <StatusIcon size={16} className="transition-transform duration-200 group-hover:rotate-12" />
            {statusConfig.label}
          </span>
          <span className="text-xs text-gray-500 font-dm-sans flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
            <Calendar size={12} />
            {formatDate(redemption.created_at)}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Info do Usuário */}
        <div className="flex items-center gap-3 mb-12 group/user">
          <div className="transition-transform duration-200 group-hover/user:scale-105">
            {redemption.user && (
              <AvatarWithPreview
                src={redemption.user.avatar_url}
                alt={redemption.user.nome || 'Usuário'}
                size="sm"
                fallbackText={redemption.user.nome}
                user={{
                  id: redemption.user.id,
                  nome: redemption.user.nome,
                  avatar_url: redemption.user.avatar_url,
                  lab_points: redemption.user.lab_points,
                  department: redemption.user.department,
                  role: redemption.user.role,
                }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-ranade font-semibold text-gray-900 truncate group-hover/user:text-lab-primary transition-colors duration-200">
              {redemption.user?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 font-dm-sans">
              {redemption.user?.department 
                ? DEPARTMENT_LABELS[redemption.user.department as DepartmentEnum]
                : 'Colaborador'}
            </p>
          </div>
        </div>

        {/* Info da Recompensa */}
        <div className="bg-slate-50 rounded-xl p-4 mt-4 mb-4 transition-all duration-200 hover:bg-slate-100/80 group/reward">
          <div className="flex items-start gap-3">
            <div className="w-[48px] h-[48px] rounded-xl bg-lab-gradient flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover/reward:scale-110 group-hover/reward:rotate-3">
              {redemption.reward?.imagem_url ? (
                <img
                  src={redemption.reward.imagem_url}
                  alt={redemption.reward.titulo}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Gift size={24} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-ranade font-bold text-gray-900 text-sm mb-1 transition-colors duration-200 group-hover/reward:text-lab-primary">
                {redemption.reward?.titulo || 'Recompensa'}
              </p>
              <p className="text-xs text-gray-500 font-dm-sans line-clamp-2">
                {redemption.reward?.descricao}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
            <span className="text-xs text-gray-500 font-dm-sans">Custo do resgate</span>
            <div className="transition-transform duration-200 hover:scale-110">
              <PointsBadge points={redemption.custo_points} size="sm" showLabel={false} />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {nextStatus && nextStatusLabel && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStatusChange(redemption.id, nextStatus)}
              disabled={loading}
              loading={loading}
              className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {nextStatusLabel}
            </Button>
          )}
          
          {fulfillmentStatus === 'pendente' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onStatusChange(redemption.id, 'cancelado')}
              disabled={loading}
              className="px-4 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Cancelar resgate"
            >
              <XCircle size={16} />
            </Button>
          )}
          
          {fulfillmentStatus === 'entregue' && (
            <div className="flex-1 flex items-center justify-center py-2 px-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
              <span className="text-sm text-green-700 font-dm-sans font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="animate-bounce-subtle" />
                Entregue
              </span>
            </div>
          )}
          
          {fulfillmentStatus === 'cancelado' && (
            <div className="flex-1 flex items-center justify-center py-2 px-4 bg-red-50 rounded-lg border border-red-200 animate-fade-in">
              <span className="text-sm text-red-700 font-dm-sans font-medium flex items-center gap-2">
                <XCircle size={16} />
                Cancelado
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
