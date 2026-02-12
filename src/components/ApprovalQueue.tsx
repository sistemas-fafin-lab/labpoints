import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User as UserIcon, Award, FileText, Loader2, AlertCircle, Star, ChevronRight } from 'lucide-react';
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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 overflow-hidden" style={{ padding: '24px 28px' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative flex items-center" style={{ gap: '16px' }}>
            <div 
              className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
              style={{ width: '52px', height: '52px' }}
            >
              <Clock style={{ width: '26px', height: '26px' }} className="text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-ranade font-bold text-white drop-shadow-sm">
                Aprovações Pendentes
              </h2>
              <p className="text-white/80 font-dm-sans" style={{ fontSize: '14px' }}>
                Carregando solicitações...
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center" style={{ padding: '64px 28px' }}>
          <Loader2 style={{ width: '40px', height: '40px' }} className="animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  // Empty State
  if (approvals.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">
        <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 overflow-hidden" style={{ padding: '24px 28px' }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative flex items-center" style={{ gap: '16px' }}>
            <div 
              className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
              style={{ width: '52px', height: '52px' }}
            >
              <CheckCircle style={{ width: '26px', height: '26px' }} className="text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-ranade font-bold text-white drop-shadow-sm">
                Tudo em Dia!
              </h2>
              <p className="text-white/80 font-dm-sans" style={{ fontSize: '14px' }}>
                Não há aprovações pendentes
              </p>
            </div>
          </div>
        </div>
        <div className="text-center" style={{ padding: '48px 28px' }}>
          <div 
            className="mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center animate-float-gentle"
            style={{ width: '72px', height: '72px', marginBottom: '20px' }}
          >
            <CheckCircle style={{ width: '36px', height: '36px' }} className="text-emerald-500" />
          </div>
          <p className="text-slate-600 font-dm-sans" style={{ fontSize: '15px', maxWidth: '280px', margin: '0 auto' }}>
            Todas as solicitações de pontos foram processadas. Volte mais tarde para verificar novas solicitações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden transition-shadow duration-500 hover:shadow-2xl">
      {/* Header com Gradiente */}
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative" style={{ padding: '24px 28px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: '16px' }}>
              <div 
                className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg animate-icon-float"
                style={{ width: '52px', height: '52px' }}
              >
                <Clock style={{ width: '26px', height: '26px' }} className="text-white drop-shadow-lg" />
              </div>
              <div style={{ marginLeft: '4px' }}>
                <h2 className="text-xl md:text-2xl font-ranade font-bold text-white drop-shadow-sm" style={{ marginBottom: '2px' }}>
                  Aprovações Pendentes
                </h2>
                <p className="text-white/80 font-dm-sans" style={{ fontSize: '14px' }}>
                  {approvals.length} {approvals.length === 1 ? 'solicitação aguardando' : 'solicitações aguardando'} análise
                </p>
              </div>
            </div>
            
            {/* Badge contador */}
            <div 
              className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl ring-1 ring-white/20 flex items-center"
              style={{ padding: '10px 16px', gap: '8px' }}
            >
              <Star style={{ width: '18px', height: '18px' }} fill="currentColor" className="text-white" />
              <span className="font-ranade font-bold text-white" style={{ fontSize: '18px' }}>
                {approvals.reduce((sum, a) => sum + a.points, 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-white/80 font-dm-sans" style={{ fontSize: '13px' }}>pts total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px' }}>
        {/* Error Message */}
        {error && (
          <div 
            className="flex items-center rounded-xl bg-red-50 border border-red-200 text-red-600 font-dm-sans animate-slide-up-fade"
            style={{ padding: '12px 16px', marginBottom: '20px', gap: '10px', fontSize: '14px' }}
          >
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Approvals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {approvals.map((approval, index) => (
            <div
              key={approval.id}
              className="animate-row-slide-in group border border-slate-100 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white hover:border-slate-200 hover:shadow-lg transition-all duration-300"
              style={{ padding: '24px', animationDelay: `${index * 0.08}s` }}
            >
              {/* Request Header - User Info + Points */}
              <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
                <div className="flex items-center" style={{ gap: '14px' }}>
                  <AvatarWithPreview
                    src={(approval.target_user as any)?.avatar_url}
                    alt={(approval.target_user as any)?.nome || 'Usuário'}
                    size="md"
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
                  <div className="min-w-0">
                    <p className="font-ranade font-bold text-slate-800 truncate" style={{ fontSize: '17px', marginBottom: '2px' }}>
                      {(approval.target_user as any)?.nome || 'Usuário'}
                    </p>
                    <p className="text-slate-500 font-dm-sans truncate" style={{ fontSize: '13px' }}>
                      {(() => {
                        const dept = (approval.target_user as any)?.department;
                        if (dept && DEPARTMENT_LABELS[dept as DepartmentEnum]) {
                          return DEPARTMENT_LABELS[dept as DepartmentEnum];
                        }
                        return (approval.target_user as any)?.email;
                      })()}
                    </p>
                  </div>
                </div>
                
                {/* Points Badge */}
                <div 
                  className="flex items-center bg-gradient-to-br from-lab-primary to-indigo-600 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                  style={{ padding: '10px 16px', gap: '6px' }}
                >
                  <Star style={{ width: '18px', height: '18px' }} fill="currentColor" className="text-white" />
                  <span className="font-ranade font-bold text-white" style={{ fontSize: '18px' }}>
                    {approval.points}
                  </span>
                  <span className="text-white/80 font-dm-sans" style={{ fontSize: '12px' }}>pts</span>
                </div>
              </div>

              {/* Justification Card */}
              <div 
                className="rounded-xl bg-slate-50/80 border border-slate-100"
                style={{ padding: '16px', marginBottom: '16px' }}
              >
                <div className="flex items-start" style={{ gap: '12px' }}>
                  <div 
                    className="rounded-lg bg-slate-200/70 flex items-center justify-center flex-shrink-0"
                    style={{ width: '36px', height: '36px' }}
                  >
                    <FileText style={{ width: '18px', height: '18px' }} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-dm-sans font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '6px' }}>
                      Justificativa
                    </p>
                    <p className="text-slate-700 font-dm-sans leading-relaxed" style={{ fontSize: '14px' }}>
                      {approval.justification}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '12px', marginBottom: '16px' }}>
                {/* Requester */}
                <div 
                  className="flex items-center rounded-xl bg-blue-50/70 border border-blue-100/60 transition-colors duration-300 hover:bg-blue-50"
                  style={{ padding: '12px 14px', gap: '12px' }}
                >
                  <div 
                    className="rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"
                    style={{ width: '36px', height: '36px' }}
                  >
                    <UserIcon style={{ width: '16px', height: '16px' }} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-dm-sans font-medium text-blue-600 uppercase tracking-wide" style={{ fontSize: '10px', marginBottom: '2px' }}>
                      Solicitado por
                    </p>
                    <p className="font-dm-sans font-semibold text-slate-800 truncate" style={{ fontSize: '13px' }}>
                      {(approval.requester as any)?.nome || 'Gestor'}
                    </p>
                  </div>
                  <ChevronRight style={{ width: '14px', height: '14px' }} className="text-blue-300 flex-shrink-0" />
                </div>
                
                {/* Approver */}
                <div 
                  className="flex items-center rounded-xl bg-amber-50/70 border border-amber-100/60 transition-colors duration-300 hover:bg-amber-50"
                  style={{ padding: '12px 14px', gap: '12px' }}
                >
                  <div 
                    className="rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"
                    style={{ width: '36px', height: '36px' }}
                  >
                    <CheckCircle style={{ width: '16px', height: '16px' }} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-dm-sans font-medium text-amber-600 uppercase tracking-wide" style={{ fontSize: '10px', marginBottom: '2px' }}>
                      Atribuído para
                    </p>
                    <p className="font-dm-sans font-semibold text-slate-800 truncate" style={{ fontSize: '13px' }}>
                      {(approval.approver as any)?.nome || 'Aprovador'}
                    </p>
                  </div>
                  <ChevronRight style={{ width: '14px', height: '14px' }} className="text-amber-300 flex-shrink-0" />
                </div>
              </div>

              {/* Date Info */}
              <div 
                className="flex items-center text-slate-400 font-dm-sans"
                style={{ gap: '6px', fontSize: '12px', marginBottom: '16px' }}
              >
                <Clock style={{ width: '12px', height: '12px' }} />
                <span>{formatDate(approval.created_at)}</span>
              </div>

              {/* Rejection Form */}
              {rejectingId === approval.id ? (
                <div className="border-t border-slate-100" style={{ paddingTop: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Motivo da rejeição (opcional)..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all font-dm-sans resize-none"
                      style={{ padding: '12px 16px', fontSize: '14px' }}
                    />
                  </div>
                  <div className="flex" style={{ gap: '10px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason('');
                      }}
                      disabled={processingId === approval.id}
                      className="flex-1 !rounded-xl"
                      style={{ padding: '12px 16px' }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReject(approval.id)}
                      disabled={processingId === approval.id}
                      loading={processingId === approval.id}
                      className="flex-1 !bg-red-500 hover:!bg-red-600 !rounded-xl"
                      style={{ padding: '12px 16px' }}
                    >
                      Confirmar Rejeição
                    </Button>
                  </div>
                </div>
              ) : approvingId === approval.id ? (
                /* Approval Confirmation */
                <div className="border-t border-slate-100" style={{ paddingTop: '16px' }}>
                  <div 
                    className="rounded-xl bg-emerald-50 border border-emerald-200"
                    style={{ padding: '16px', marginBottom: '12px' }}
                  >
                    <div className="flex items-start" style={{ gap: '14px' }}>
                      <div 
                        className="rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0"
                        style={{ width: '44px', height: '44px' }}
                      >
                        <CheckCircle style={{ width: '22px', height: '22px' }} className="text-white" />
                      </div>
                      <div>
                        <p className="font-ranade font-bold text-slate-800" style={{ fontSize: '15px', marginBottom: '4px' }}>
                          Confirmar aprovação
                        </p>
                        <p className="text-slate-600 font-dm-sans" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                          Você está prestes a aprovar <strong>{approval.points} pontos</strong> para{' '}
                          <strong>{(approval.target_user as any)?.nome}</strong>. Esta ação não pode ser desfeita.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex" style={{ gap: '10px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setApprovingId(null)}
                      disabled={processingId === approval.id}
                      className="flex-1 !rounded-xl"
                      style={{ padding: '12px 16px' }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApproveConfirm}
                      disabled={processingId === approval.id}
                      loading={processingId === approval.id}
                      className="flex-1 !bg-emerald-500 hover:!bg-emerald-600 !rounded-xl"
                      style={{ padding: '12px 16px' }}
                    >
                      Confirmar Aprovação
                    </Button>
                  </div>
                </div>
              ) : (
                /* Action Buttons */
                <div className="flex border-t border-slate-100" style={{ paddingTop: '16px', gap: '12px' }}>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setRejectingId(approval.id)}
                    disabled={processingId === approval.id}
                    className="flex-1 !border-red-200 !text-red-600 hover:!bg-red-50 !rounded-xl group/btn transition-all duration-300"
                    style={{ padding: '14px 20px' }}
                  >
                    <XCircle style={{ width: '18px', height: '18px', marginRight: '8px' }} className="transition-transform duration-300 group-hover/btn:scale-110" />
                    Rejeitar
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setApprovingId(approval.id)}
                    disabled={processingId === approval.id}
                    className="flex-1 !bg-emerald-500 hover:!bg-emerald-600 !rounded-xl group/btn transition-all duration-300"
                    style={{ padding: '14px 20px' }}
                  >
                    <CheckCircle style={{ width: '18px', height: '18px', marginRight: '8px' }} className="transition-transform duration-300 group-hover/btn:scale-110" />
                    Aprovar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
