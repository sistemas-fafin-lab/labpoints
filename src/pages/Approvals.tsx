import { ClipboardCheck, ArrowLeft, Clock, CheckCircle2, XCircle, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePointAssignments } from '../hooks/usePointAssignments';
import { ApprovalQueue } from '../components/ApprovalQueue';
import { Avatar } from '../components/ui/Avatar';
import { DEPARTMENT_LABELS, DepartmentEnum } from '../lib/supabase';

export function Approvals() {
  const { user } = useAuth();
  const {
    pendingApprovals,
    allPendingApprovals,
    myAssignments,
    loadingApprovals,
    approveAssignment,
    rejectAssignment
  } = usePointAssignments(user?.id);

  if (!user) return null;

  const isAdmin = user.role === 'adm';

  // Admins see all pending approvals, others see only assigned to them
  const approvalsToShow = isAdmin ? allPendingApprovals : pendingApprovals;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 size={14} />
            Aprovado
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={14} />
            Rejeitado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock size={14} />
            Pendente
          </span>
        );
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-lab-primary transition-colors mb-4 font-dm-sans"
        >
          <ArrowLeft size={18} />
          Voltar ao Dashboard
        </Link>
        
        <div className="flex items-center gap-4 mt-5">
          <div className="w-14 h-14 rounded-2xl bg-lab-gradient flex items-center justify-center shadow-lab-sm">
            <ClipboardCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-ranade font-bold text-gray-900 ml-8">
              Central de Aprovações
            </h1>
            <p className="text-gray-500 font-dm-sans ml-8">
              {isAdmin 
                ? 'Visualize e gerencie todas as solicitações de pontos'
                : 'Gerencie as solicitações de pontos atribuídas a você'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 mt-6">
        <div className="bg-white rounded-xl p-5 shadow-lab-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-ranade font-bold text-gray-900">
                {approvalsToShow.length}
              </p>
              <p className="text-sm text-gray-500 font-dm-sans">Pendentes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-lab-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-ranade font-bold text-gray-900">
                {myAssignments.filter(a => a.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-500 font-dm-sans">Aprovadas (minhas)</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-lab-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-ranade font-bold text-gray-900">
                {myAssignments.filter(a => a.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-500 font-dm-sans">Rejeitadas (minhas)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner for Admins */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 gap-6">
              <ClipboardCheck size={20} className="text-white gap-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-ranade font-bold text-gray-900 mb-1">
                Você é Administrador
              </h3>
              <p className="text-sm text-gray-600 font-dm-sans">
                Como administrador, você pode visualizar e aprovar <strong>todas as solicitações pendentes</strong> do sistema, 
                independente de terem sido atribuídas a você ou a outros gestores.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approval Queue */}
      <div className="mb-8">
        <ApprovalQueue
          approvals={approvalsToShow}
          loading={loadingApprovals}
          onApprove={approveAssignment}
          onReject={rejectAssignment}
        />
      </div>

      {/* My Assignments History */}
      {myAssignments.length > 0 && (
        <div className="bg-white rounded-lab p-6 shadow-lab-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <History size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-ranade font-bold text-gray-900">
                Minhas Solicitações
              </h2>
              <p className="text-sm text-gray-500 font-dm-sans">
                Histórico das atribuições de pontos que você solicitou
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {myAssignments.slice(0, 10).map((assignment) => (
              <div
                key={assignment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all gap-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar
                    src={(assignment.target_user as any)?.avatar_url}
                    alt={(assignment.target_user as any)?.nome || 'Usuário'}
                    size="sm"
                    fallbackText={(assignment.target_user as any)?.nome}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-ranade font-semibold text-gray-900">
                      {(assignment.target_user as any)?.nome || 'Usuário'}
                    </p>
                    <p className="text-sm text-gray-500 font-dm-sans">
                      {(() => {
                        const dept = (assignment.target_user as any)?.department;
                        if (dept && DEPARTMENT_LABELS[dept as DepartmentEnum]) {
                          return DEPARTMENT_LABELS[dept as DepartmentEnum];
                        }
                        return formatDate(assignment.created_at);
                      })()}
                    </p>
                    {assignment.status === 'pending' && (assignment.approver as any)?.nome && (
                      <p className="text-xs text-amber-600 font-dm-sans mt-1">
                        Aguardando: {(assignment.approver as any)?.nome}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 justify-end sm:justify-start">
                  <div className="text-right">
                    <span className="font-ranade font-bold text-lab-primary">
                      {assignment.points} pts
                    </span>
                  </div>
                  {getStatusBadge(assignment.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
