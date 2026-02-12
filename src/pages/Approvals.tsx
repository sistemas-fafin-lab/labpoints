import { ClipboardCheck, ArrowLeft, Clock, CheckCircle2, XCircle, History, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePointAssignments } from '../hooks/usePointAssignments';
import { ApprovalQueue } from '../components/ApprovalQueue';
import { AvatarWithPreview } from '../components/AvatarWithPreview';
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
          <span 
            className="inline-flex items-center rounded-full font-dm-sans font-medium bg-emerald-50 text-emerald-600 border border-emerald-100"
            style={{ padding: '6px 12px', gap: '6px', fontSize: '12px' }}
          >
            <CheckCircle2 style={{ width: '14px', height: '14px' }} />
            Aprovado
          </span>
        );
      case 'rejected':
        return (
          <span 
            className="inline-flex items-center rounded-full font-dm-sans font-medium bg-red-50 text-red-600 border border-red-100"
            style={{ padding: '6px 12px', gap: '6px', fontSize: '12px' }}
          >
            <XCircle style={{ width: '14px', height: '14px' }} />
            Rejeitado
          </span>
        );
      default:
        return (
          <span 
            className="inline-flex items-center rounded-full font-dm-sans font-medium bg-amber-50 text-amber-600 border border-amber-100"
            style={{ padding: '6px 12px', gap: '6px', fontSize: '12px' }}
          >
            <Clock style={{ width: '14px', height: '14px' }} />
            Pendente
          </span>
        );
    }
  };

  // Stats card config similar to RedeemControl
  const statsConfig = [
    {
      key: 'pending',
      value: approvalsToShow.length,
      label: 'Pendentes',
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      hoverBorder: 'hover:border-amber-200/80',
      glowColor: 'group-hover:shadow-amber-100/50',
    },
    {
      key: 'approved',
      value: myAssignments.filter(a => a.status === 'approved').length,
      label: 'Aprovadas',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      hoverBorder: 'hover:border-emerald-200/80',
      glowColor: 'group-hover:shadow-emerald-100/50',
    },
    {
      key: 'rejected',
      value: myAssignments.filter(a => a.status === 'rejected').length,
      label: 'Rejeitadas',
      icon: XCircle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-400',
      hoverBorder: 'hover:border-red-200/80',
      glowColor: 'group-hover:shadow-red-100/50',
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <header className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-400 hover:text-lab-primary transition-all duration-150 font-dm-sans hover:-translate-x-0.5 transform"
          style={{ gap: '8px', marginBottom: '16px', marginTop: '48px', fontSize: '14px' }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
          Voltar ao Dashboard
        </Link>
        
        <div className="flex items-center" style={{ gap: '16px', marginTop: '20px' }}>
          <div 
            className="rounded-2xl bg-lab-gradient flex items-center justify-center shadow-md shadow-lab-primary/15 transition-transform duration-150 hover:scale-105"
            style={{ width: '64px', height: '64px' }}
          >
            <ClipboardCheck style={{ width: '26px', height: '26px' }} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-ranade font-bold text-gray-900">
              Central de Aprovações
            </h1>
            <p className="text-gray-400 font-dm-sans text-sm sm:text-base">
              {isAdmin 
                ? 'Visualize e gerencie todas as solicitações de pontos'
                : 'Gerencie as solicitações de pontos atribuídas a você'
              }
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards - Same style as RedeemControl */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '16px', marginBottom: '24px', marginTop: '24px' }}>
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className={`
                group relative bg-white rounded-xl 
                border border-gray-100/80 
                shadow-sm ${stat.glowColor}
                ${stat.hoverBorder}
                hover:shadow-md hover:-translate-y-0.5
                transition-all duration-150 ease-out
                cursor-default select-none
                animate-fade-in-up
              `}
              style={{ padding: '20px', animationDelay: `${index * 50}ms` }}
            >
              {/* Subtle top gradient line */}
              <div 
                className={`
                  absolute top-0 left-4 right-4 h-[2px] rounded-full
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-150
                  ${stat.iconBg.replace('bg-', 'bg-gradient-to-r from-transparent via-').replace('-50', '-300')} to-transparent
                `}
              />
              
              <div className="flex items-center" style={{ gap: '16px' }}>
                <div 
                  className={`rounded-xl ${stat.iconBg} flex items-center justify-center transition-all duration-150 ease-out group-hover:scale-105`}
                  style={{ width: '56px', height: '56px' }}
                >
                  <Icon 
                    style={{ width: '28px', height: '28px' }}
                    className={`${stat.iconColor} transition-transform duration-150`} 
                    strokeWidth={2}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-2xl sm:text-3xl font-ranade font-bold text-gray-900 leading-none tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 font-dm-sans truncate" style={{ fontSize: '14px', marginTop: '4px' }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner for Admins - Premium glassmorphism style */}
      {isAdmin && (
        <div 
          className="relative bg-gradient-to-br from-lab-primary via-blue-500 to-indigo-600 rounded-2xl overflow-hidden animate-fade-in-up"
          style={{ padding: '20px 24px', marginBottom: '24px' }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative flex items-start" style={{ gap: '16px' }}>
            <div 
              className="rounded-xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg flex-shrink-0"
              style={{ width: '48px', height: '48px' }}
            >
              <Shield style={{ width: '24px', height: '24px' }} className="text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h3 className="font-ranade font-bold text-white drop-shadow-sm" style={{ fontSize: '16px', marginBottom: '4px' }}>
                Você é Administrador
              </h3>
              <p className="text-white/85 font-dm-sans leading-relaxed" style={{ fontSize: '14px' }}>
                Como administrador, você pode visualizar e aprovar <strong className="text-white">todas as solicitações pendentes</strong> do sistema, 
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
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden transition-shadow duration-500 hover:shadow-2xl">
          {/* Header com Gradiente */}
          <div className="relative bg-gradient-to-br from-lab-primary via-blue-500 to-indigo-600 overflow-hidden">
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
                    <History style={{ width: '26px', height: '26px' }} className="text-white drop-shadow-lg" />
                  </div>
                  <div style={{ marginLeft: '4px' }}>
                    <h2 className="text-xl md:text-2xl font-ranade font-bold text-white drop-shadow-sm" style={{ marginBottom: '2px' }}>
                      Minhas Solicitações
                    </h2>
                    <p className="text-white/80 font-dm-sans" style={{ fontSize: '14px' }}>
                      Histórico das atribuições de pontos que você solicitou
                    </p>
                  </div>
                </div>
                
                {/* Badge contador */}
                <div 
                  className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl ring-1 ring-white/20 flex items-center"
                  style={{ padding: '10px 16px', gap: '8px' }}
                >
                  <span className="font-ranade font-bold text-white" style={{ fontSize: '18px' }}>
                    {myAssignments.length}
                  </span>
                  <span className="text-white/80 font-dm-sans" style={{ fontSize: '13px' }}>
                    {myAssignments.length === 1 ? 'solicitação' : 'solicitações'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myAssignments.slice(0, 10).map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="animate-row-slide-in group flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded-2xl bg-gradient-to-r from-slate-50/50 to-white hover:border-slate-200 hover:shadow-lg transition-all duration-300"
                  style={{ padding: '20px', animationDelay: `${index * 0.06}s`, gap: '16px' }}
                >
                  <div className="flex items-center flex-1" style={{ gap: '14px' }}>
                    <AvatarWithPreview
                      src={(assignment.target_user as any)?.avatar_url}
                      alt={(assignment.target_user as any)?.nome || 'Usuário'}
                      size="md"
                      fallbackText={(assignment.target_user as any)?.nome}
                      user={{
                        id: (assignment.target_user as any)?.id || assignment.target_user_id,
                        nome: (assignment.target_user as any)?.nome || 'Usuário',
                        avatar_url: (assignment.target_user as any)?.avatar_url,
                        lab_points: (assignment.target_user as any)?.lab_points || 0,
                        department: (assignment.target_user as any)?.department,
                        role: (assignment.target_user as any)?.role,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-ranade font-bold text-slate-800 truncate" style={{ fontSize: '16px', marginBottom: '2px' }}>
                        {(assignment.target_user as any)?.nome || 'Usuário'}
                      </p>
                      <p className="text-slate-500 font-dm-sans truncate" style={{ fontSize: '13px' }}>
                        {(() => {
                          const dept = (assignment.target_user as any)?.department;
                          if (dept && DEPARTMENT_LABELS[dept as DepartmentEnum]) {
                            return DEPARTMENT_LABELS[dept as DepartmentEnum];
                          }
                          return formatDate(assignment.created_at);
                        })()}
                      </p>
                      {assignment.status === 'pending' && (assignment.approver as any)?.nome && (
                        <p className="text-amber-600 font-dm-sans font-medium" style={{ fontSize: '12px', marginTop: '4px' }}>
                          ⏳ Aguardando: {(assignment.approver as any)?.nome}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end sm:justify-start" style={{ gap: '16px' }}>
                    <div 
                      className="flex items-center bg-gradient-to-br from-lab-primary to-indigo-600 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                      style={{ padding: '8px 14px', gap: '4px' }}
                    >
                      <span className="font-ranade font-bold text-white" style={{ fontSize: '16px' }}>
                        {assignment.points}
                      </span>
                      <span className="text-white/80 font-dm-sans" style={{ fontSize: '11px' }}>pts</span>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
