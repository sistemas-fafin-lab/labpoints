import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User as UserIcon, Award, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { AvatarWithPreview } from './AvatarWithPreview';
import { useToast } from './ui/Toast';
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
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleApproveConfirm = async () => {
    if (!approvingId) return;
    
    setProcessingId(approvingId);
    setError(null);
    
    const result = await onApprove(approvingId);
    
    setProcessingId(null);
    setApprovingId(null);
    
    if (!result.success) {
      setError(result.error || 'Erro ao aprovar');
      showToast(result.error || 'Erro ao aprovar atribuição', 'error');
    } else {
      showToast('Atribuição aprovada com sucesso!', 'success');
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
      showToast(result.error || 'Erro ao rejeitar atribuição', 'error');
    } else {
      showToast('Atribuição rejeitada com sucesso', 'success');
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
      <div className="space-y-5">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-200 bg-white"
          >
            {/* Request Info */}
            <div className="flex items-start gap-4 mb-6">
              <AvatarWithPreview
                src={(approval.target_user as any)?.avatar_url}
                alt={(approval.target_user as any)?.nome || 'Usuário'}
                size="sm"
                fallbackText={(approval.target_user as any)?.nome}
                user={{
                  id: (approval.target_user as any)?.id || approval.target_user_id,
                  nome: (approval.target_user as any)?.nome || 'Usuário',
                  avatar_url: (approval.target_user as any)?.avatar_url,
                  lab_points: (approval.target_user as any)?.lab_points || 0,
                  department: (approval.target_user as any)?.department,
                  role: (approval.target_user as any)?.role,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-ranade font-semibold text-gray-900 text-lg">
                  {(approval.target_user as any)?.nome || 'Usuário'}
                </p>
                <p className="text-sm text-gray-500 font-dm-sans mt-0.5">
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
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lab-gradient shadow-sm">
                  <Award size={18} className="text-white" />
                  <span className="font-ranade font-bold text-white text-lg">{approval.points}</span>
                  <span className="text-white/90 text-sm font-dm-sans">pts</span>
                </div>
              </div>
            </div>

            {/* Justification */}
            <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-gray-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-dm-sans font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Justificativa
                  </p>
                  <p className="text-gray-700 font-dm-sans leading-relaxed">
                    {approval.justification}
                  </p>
                </div>
              </div>
            </div>

            {/* Requester and Approver Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex items-center gap-3 text-sm font-dm-sans p-3 rounded-lg bg-blue-50/50 border border-blue-100/50">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-0.5">Solicitado por</p>
                  <p className="font-semibold text-gray-900 truncate">
                    {(approval.requester as any)?.nome || 'Gestor'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm font-dm-sans p-3 rounded-lg bg-amber-50/50 border border-amber-100/50">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-0.5">Atribuído para</p>
                  <p className="font-semibold text-gray-900 truncate">
                    {(approval.approver as any)?.nome || 'Aprovador'}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Info */}
            <div className="flex items-center gap-2 text-xs text-gray-400 font-dm-sans mb-5">
              <Clock size={12} />
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
            ) : approvingId === approval.id ? (
              /* Approval Confirmation */
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-ranade font-bold text-gray-900 mb-1">
                        Confirmar aprovação
                      </p>
                      <p className="text-sm text-gray-600 font-dm-sans">
                        Você está prestes a aprovar <strong>{approval.points} pontos</strong> para{' '}
                        <strong>{(approval.target_user as any)?.nome}</strong>. Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setApprovingId(null)}
                    disabled={processingId === approval.id}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApproveConfirm}
                    disabled={processingId === approval.id}
                    loading={processingId === approval.id}
                    className="flex-1 !bg-green-500 hover:!bg-green-600"
                  >
                    Confirmar Aprovação
                  </Button>
                </div>
              </div>
            ) : (
              /* Action Buttons */
              <div className="flex gap-3 pt-5 border-t border-gray-200">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setRejectingId(approval.id)}
                  disabled={processingId === approval.id}
                  className="flex-1 !border-red-200 !text-red-600 hover:!bg-red-50 !py-3"
                >
                  <XCircle size={18} className="mr-2" />
                  Rejeitar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setApprovingId(approval.id)}
                  disabled={processingId === approval.id}
                  className="flex-1 !bg-green-500 hover:!bg-green-600 !py-3"
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
