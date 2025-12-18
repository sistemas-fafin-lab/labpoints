import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User as UserIcon, Award, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { PendingPointAssignment, DEPARTMENT_LABELS, DepartmentEnum } from '../lib/supabase';

interface ApprovalQueueProps {
  approvals: PendingPointAssignment[];
  loading: boolean;
  onApprove: (assignmentId: string) => Promise<{ success: boolean; error?: string }>;
  onReject: (assignmentId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
}

export function ApprovalQueue({
  approvals,
  loading,
  onApprove,
  onReject
}: ApprovalQueueProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (assignmentId: string) => {
    setProcessingId(assignmentId);
    setError(null);
    
    const result = await onApprove(assignmentId);
    
    setProcessingId(null);
    
    if (!result.success) {
      setError(result.error || 'Erro ao aprovar');
    }
  };

  const handleReject = async (assignmentId: string) => {
    setProcessingId(assignmentId);
    setError(null);
    
    const result = await onReject(assignmentId, rejectReason || undefined);
    
    setProcessingId(null);
    setRejectingId(null);
    setRejectReason('');
    
    if (!result.success) {
      setError(result.error || 'Erro ao rejeitar');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lab p-8 shadow-lab-sm border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-lab-primary" />
        </div>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="bg-white rounded-lab p-8 shadow-lab-sm border border-gray-100">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h3 className="text-xl font-ranade font-bold text-gray-900 mb-2">
            Tudo em dia!
          </h3>
          <p className="text-gray-500 font-dm-sans">
            Não há aprovações pendentes no momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lab p-6 shadow-lab-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-ranade font-bold text-gray-900">
              Aprovações Pendentes
            </h2>
            <p className="text-sm text-gray-500 font-dm-sans">
              {approvals.length} {approvals.length === 1 ? 'solicitação aguardando' : 'solicitações aguardando'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-dm-sans flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all duration-200"
          >
            {/* Request Info */}
            <div className="flex items-start gap-4 mb-4">
              <Avatar
                src={(approval.target_user as any)?.avatar_url}
                alt={(approval.target_user as any)?.nome || 'Usuário'}
                size="sm"
                fallbackText={(approval.target_user as any)?.nome}
              />
              <div className="flex-1 min-w-0">
                <p className="font-ranade font-semibold text-gray-900">
                  {(approval.target_user as any)?.nome || 'Usuário'}
                </p>
                <p className="text-sm text-gray-500 font-dm-sans">
                  {(() => {
                    const dept = (approval.target_user as any)?.department;
                    if (dept && DEPARTMENT_LABELS[dept as DepartmentEnum]) {
                      return DEPARTMENT_LABELS[dept as DepartmentEnum];
                    }
                    return (approval.target_user as any)?.email;
                  })()}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-lab-gradient text-white">
                  <Award size={16} />
                  <span className="font-ranade font-bold">{approval.points}</span>
                  <span className="text-white/80 text-sm">pts</span>
                </div>
              </div>
            </div>

            {/* Justification */}
            <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-dm-sans font-medium text-gray-700 mb-1">
                    Justificativa
                  </p>
                  <p className="text-gray-600 font-dm-sans">
                    {approval.justification}
                  </p>
                </div>
              </div>
            </div>

            {/* Requester Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 font-dm-sans mb-4">
              <UserIcon size={14} />
              <span>
                Solicitado por <strong className="text-gray-700">{(approval.requester as any)?.nome || 'Gestor'}</strong>
              </span>
              <span className="text-gray-300">•</span>
              <span>{formatDate(approval.created_at)}</span>
            </div>

            {/* Rejection Form */}
            {rejectingId === approval.id ? (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Motivo da rejeição (opcional)..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all font-dm-sans resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setRejectingId(null);
                      setRejectReason('');
                    }}
                    disabled={processingId === approval.id}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReject(approval.id)}
                    disabled={processingId === approval.id}
                    loading={processingId === approval.id}
                    className="flex-1 !bg-red-500 hover:!bg-red-600"
                  >
                    Confirmar Rejeição
                  </Button>
                </div>
              </div>
            ) : (
              /* Action Buttons */
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setRejectingId(approval.id)}
                  disabled={processingId === approval.id}
                  className="flex-1 !border-red-200 !text-red-600 hover:!bg-red-50"
                >
                  <XCircle size={18} className="mr-2" />
                  Rejeitar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleApprove(approval.id)}
                  disabled={processingId === approval.id}
                  loading={processingId === approval.id}
                  className="flex-1 !bg-green-500 hover:!bg-green-600"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Aprovar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
