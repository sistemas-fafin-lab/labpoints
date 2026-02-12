import { Link } from 'react-router-dom';
import { TrendingUp, History, Gift, ArrowRight, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRewards } from '../hooks/useRewards';
import { useTransactions } from '../hooks/useTransactions';
import { usePointAssignments } from '../hooks/usePointAssignments';
import { useTopUsers } from '../hooks/useTopUsers';
import { RewardCard } from '../components/RewardCard';
//import { PointsBadge } from '../components/ui/PointsBadge';
import { RewardsTimeline } from '../components/RewardsTimeline';
import { ApprovalQueue } from '../components/ApprovalQueue';
import { RewardDetailModal } from '../components/RewardDetailModal';
import { ValuesWheel } from '../components/ValuesWheel';
import { TopUsersRanking } from '../components/TopUsersRanking';
import { useState } from 'react';
import { createRedemption } from '../hooks/useRedemptions';
import { useToast } from '../components/ui/Toast';

export function Dashboard() {
  const { user, refreshUser } = useAuth();
  const { rewards, loading: rewardsLoading, refetch: refetchRewards } = useRewards(true);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id);
  const { topUsers, loading: topUsersLoading } = useTopUsers(5);
  const { 
    pendingApprovals, 
    loadingApprovals, 
    approveAssignment, 
    rejectAssignment 
  } = usePointAssignments(user?.id);
  const { showToast } = useToast();
  const [redeeming, setRedeeming] = useState(false);
  const [selectedReward, setSelectedReward] = useState<typeof rewards[0] | null>(null);

  const canManageApprovals = user?.role === 'gestor' || user?.role === 'adm';

  if (!user) return null;

  const featuredRewards = rewards.slice(0, 6);
  const recentTransactions = transactions.slice(0, 5);

  // Timeline rewards - top 5 by points
  const timelineRewards = [...rewards]
    .sort((a, b) => a.custo_points - b.custo_points)
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      name: r.titulo,
      points: r.custo_points,
      descricao: r.descricao,
      imagem_url: r.imagem_url || undefined,
      categoria: r.categoria
    }));

  const totalEarned = transactions
    .filter((t) => t.tipo === 'credito')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalRedeemed = transactions
    .filter((t) => t.tipo === 'debito')
    .reduce((sum, t) => sum + t.valor, 0);

  const handleRewardRedeem = async (rewardId: string) => {
    if (!user) return;

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (user.lab_points < reward.custo_points) {
      showToast('Pontos insuficientes para resgatar esta recompensa', 'error');
      return;
    }

    setRedeeming(true);

    try {
      await createRedemption({
        user_id: user.id,
        reward_id: rewardId,
        custo_points: reward.custo_points,
      });

      await refreshUser();
      await refetchRewards();
      showToast('Recompensa resgatada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao resgatar recompensa', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pt-6">
      <div className="max-w-7xl mx-auto" style={{ padding: '24px 16px 48px 16px' }}>
        {/* Welcome Section */}
        <div className="animate-slide-in-left" style={{ marginBottom: '48px' }}>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-ranade font-bold text-slate-900" style={{ marginBottom: '8px' }}>
            Olá, {user.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-dm-sans animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            Bem-vindo ao seu painel de recompensas Lab Points!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children" style={{ marginBottom: '48px' }}>
          {/* Hero Balance Card - Primary focal point */}
          <div className="hero-balance-card card-shine-effect rounded-2xl shadow-xl card-hover-lift animate-scale-up-bounce animate-hero-glow" style={{ padding: '24px 28px' }}>
            <div className="flex items-center" style={{ gap: '24px' }}>
              {/* Larger icon with matching blue palette */}
              <div 
                className="bg-white/15 backdrop-blur-sm rounded-2xl shadow-lg ring-2 ring-white/30 flex items-center justify-center animate-icon-float"
                style={{ width: '64px', height: '64px' }}
              >
                <Star className="text-white drop-shadow-md" fill="currentColor" style={{ width: '32px', height: '32px' }} />
              </div>
              <div className="flex-1 min-w-0">
                {/* Upper label - small, subtle */}
                <p className="text-xs font-dm-sans font-bold text-white/90 uppercase tracking-wider" style={{ marginBottom: '6px' }}>
                  Seu Saldo
                </p>
                {/* Prominent balance value */}
                <p className="text-3xl sm:text-4xl font-ranade font-bold text-white drop-shadow-sm transition-transform duration-300 hover:scale-105">
                  {user.lab_points.toLocaleString('pt-BR')}
                </p>
                {/* Subtle supporting text */}
                <p className="text-sm font-dm-sans text-white/70" style={{ marginTop: '4px' }}>
                  Lab Points disponíveis
                </p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-2xl shadow-lg border border-slate-100 card-hover-lift animate-slide-up-fade group" 
            style={{ padding: '24px 28px', animationDelay: '0.15s' }}
          >
            <div className="flex items-center" style={{ gap: '20px' }}>
              <div 
                className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ width: '52px', height: '52px' }}
              >
                <TrendingUp className="text-white" style={{ width: '26px', height: '26px' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-dm-sans text-slate-500 font-medium" style={{ marginBottom: '4px' }}>
                  Total Ganho
                </p>
                <p className="text-2xl sm:text-3xl font-ranade font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-600">
                  {totalEarned.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-2xl shadow-lg border border-slate-100 card-hover-lift animate-slide-up-fade sm:col-span-2 lg:col-span-1 group" 
            style={{ padding: '24px 28px', animationDelay: '0.25s' }}
          >
            <div className="flex items-center" style={{ gap: '20px' }}>
              <div 
                className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                style={{ width: '52px', height: '52px' }}
              >
                <Gift className="text-white" style={{ width: '26px', height: '26px' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-dm-sans text-slate-500 font-medium" style={{ marginBottom: '4px' }}>
                  Total Resgatado
                </p>
                <p className="text-2xl sm:text-3xl font-ranade font-bold text-slate-800 transition-colors duration-300 group-hover:text-rose-500">
                  {totalRedeemed.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Users Ranking */}
        <div className="animate-slide-up-fade" style={{ marginBottom: '48px', animationDelay: '0.35s' }}>
          <TopUsersRanking
            users={topUsers}
            loading={topUsersLoading}
            currentUserId={user.id}
          />
        </div>

        {/* Rewards Timeline Section */}
        <div className="animate-slide-up-fade" style={{ marginBottom: '48px', animationDelay: '0.45s' }}>
          {timelineRewards.length > 0 && (
            <RewardsTimeline
              rewards={timelineRewards}
              userPoints={user.lab_points}
              onRedeem={handleRewardRedeem}
              loading={redeeming}
              orientation="horizontal"
            />
          )}
        </div>

        {/* Approval Queue Section - Managers and Admins only */}
        {canManageApprovals && pendingApprovals.length > 0 && (
          <div className="animate-slide-up-fade" style={{ marginBottom: '48px', animationDelay: '0.55s' }}>
            <ApprovalQueue
              approvals={pendingApprovals}
              loading={loadingApprovals}
              onApprove={approveAssignment}
              onReject={rejectAssignment}
            />
          </div>
        )}

        {/* Rewards Section - Premium Card Design */}
        <div className="animate-slide-up-fade" style={{ marginBottom: '48px', animationDelay: '0.6s' }}>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden transition-shadow duration-500 hover:shadow-2xl">
            
            {/* Header com Gradiente */}
            <div className="relative bg-gradient-to-br from-lab-primary via-blue-500 to-indigo-600 overflow-hidden">
              {/* Background decorations */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
              </div>
              
              {/* Header Content */}
              <div className="relative" style={{ padding: '24px 28px' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ gap: '16px' }}>
                  <div className="flex items-center" style={{ gap: '16px' }}>
                    <div 
                      className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg animate-icon-float"
                      style={{ width: '52px', height: '52px' }}
                    >
                      <Gift style={{ width: '26px', height: '26px' }} strokeWidth={2} className="drop-shadow-lg text-white" />
                    </div>
                    <div style={{ marginLeft: '4px' }}>
                      <h2 className="text-xl md:text-2xl font-ranade font-bold tracking-tight drop-shadow-sm" style={{ color: 'white', marginBottom: '2px' }}>
                        Recompensas em Destaque
                      </h2>
                      <p className="text-white/80 font-dm-sans" style={{ fontSize: '13px', lineHeight: '18px' }}>
                        As melhores opções para resgatar seus pontos
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to="/recompensas"
                    className="flex items-center self-start sm:self-auto bg-white/15 backdrop-blur-md border border-white/30 text-white rounded-xl font-dm-sans font-medium transition-all duration-300 hover:bg-white hover:text-lab-primary hover:scale-105 active:scale-95 group ring-1 ring-white/20"
                    style={{ padding: '10px 18px', fontSize: '14px', gap: '8px' }}
                  >
                    Ver Todas
                    <ArrowRight style={{ width: '16px', height: '16px' }} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '28px' }}>
              {rewardsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-slate-50 to-white rounded-2xl h-80 animate-shimmer border border-slate-100"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              ) : featuredRewards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                  {featuredRewards.map((reward, index) => (
                    <div 
                      key={reward.id} 
                      className="animate-slide-up-fade"
                      style={{ animationDelay: `${0.7 + index * 0.08}s` }}
                    >
                      <div className="card-hover-lift rounded-2xl">
                        <RewardCard
                          reward={reward}
                          userPoints={user.lab_points}
                          onCardClick={() => setSelectedReward(reward)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100" style={{ padding: '48px 32px' }}>
                  <div className="text-center">
                    <div 
                      className="mx-auto rounded-2xl bg-slate-100 flex items-center justify-center animate-float-gentle"
                      style={{ width: '64px', height: '64px', marginBottom: '16px' }}
                    >
                      <Gift style={{ width: '32px', height: '32px' }} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-dm-sans" style={{ fontSize: '15px' }}>
                      Nenhuma recompensa disponível no momento
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Section - Premium Card Design */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '0.75s' }}>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden transition-shadow duration-500 hover:shadow-2xl">
            
            {/* Header com Gradiente */}
            <div className="relative bg-gradient-to-br from-lab-primary via-blue-500 to-indigo-600 overflow-hidden">
              {/* Background decorations */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
              </div>
              
              {/* Header Content */}
              <div className="relative" style={{ padding: '24px 28px' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ gap: '16px' }}>
                  <div className="flex items-center" style={{ gap: '16px' }}>
                    <div 
                      className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg animate-icon-float"
                      style={{ width: '52px', height: '52px', animationDelay: '0.5s' }}
                    >
                      <Clock style={{ width: '26px', height: '26px' }} strokeWidth={2} className="drop-shadow-lg text-white" />
                    </div>
                    <div style={{ marginLeft: '4px' }}>
                      <h2 className="text-xl md:text-2xl font-ranade font-bold tracking-tight drop-shadow-sm" style={{ color: 'white', marginBottom: '2px' }}>
                        Transações Recentes
                      </h2>
                      <p className="text-white/80 font-dm-sans" style={{ fontSize: '13px', lineHeight: '18px' }}>
                        Acompanhe seus ganhos e resgates
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to="/perfil"
                    className="flex items-center self-start sm:self-auto bg-white/15 backdrop-blur-md border border-white/30 text-white rounded-xl font-dm-sans font-medium transition-all duration-300 hover:bg-white hover:text-lab-primary hover:scale-105 active:scale-95 group ring-1 ring-white/20"
                    style={{ padding: '10px 18px', fontSize: '14px', gap: '8px' }}
                  >
                    Ver Histórico
                    <ArrowRight style={{ width: '16px', height: '16px' }} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 28px' }}>
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className="h-20 bg-gradient-to-r from-slate-50 to-white rounded-xl animate-shimmer border border-slate-100" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="animate-row-slide-in group flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50/80 to-white border border-slate-100 transition-all duration-300 hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 hover:bg-white"
                      style={{ padding: '16px 20px', animationDelay: `${0.8 + index * 0.08}s` }}
                    >
                      <div className="flex items-center" style={{ gap: '16px' }}>
                        {/* Icon indicator */}
                        <div 
                          className={`rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                            transaction.tipo === 'credito'
                              ? 'bg-gradient-to-br from-emerald-100 to-green-50 group-hover:shadow-emerald-200/50'
                              : 'bg-gradient-to-br from-red-100 to-rose-50 group-hover:shadow-rose-200/50'
                          } group-hover:shadow-lg`}
                          style={{ width: '44px', height: '44px' }}
                        >
                          {transaction.tipo === 'credito' ? (
                            <TrendingUp style={{ width: '20px', height: '20px' }} className="text-emerald-600" />
                          ) : (
                            <Gift style={{ width: '20px', height: '20px' }} className="text-rose-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-dm-sans text-slate-800 font-medium truncate transition-colors duration-300 group-hover:text-slate-900" style={{ fontSize: '15px', marginBottom: '2px' }}>
                            {transaction.descricao}
                          </p>
                          <p className="text-slate-500 font-dm-sans transition-colors duration-300 group-hover:text-slate-600" style={{ fontSize: '13px' }}>
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Points value */}
                      <div 
                        className={`flex items-center font-ranade font-bold transition-transform duration-300 group-hover:scale-110 ${
                          transaction.tipo === 'credito'
                            ? 'text-emerald-600'
                            : 'text-rose-500'
                        }`}
                        style={{ fontSize: '17px', gap: '4px' }}
                      >
                        <Star style={{ width: '16px', height: '16px' }} fill="currentColor" className="opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                        <span>
                          {transaction.tipo === 'credito' ? '+' : '-'}
                          {transaction.valor.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100" style={{ padding: '48px 32px' }}>
                  <div className="text-center">
                    <div 
                      className="mx-auto rounded-2xl bg-slate-100 flex items-center justify-center animate-float-gentle"
                      style={{ width: '64px', height: '64px', marginBottom: '16px' }}
                    >
                      <History style={{ width: '32px', height: '32px' }} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-dm-sans" style={{ fontSize: '15px' }}>
                      Nenhuma transação registrada
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reward Detail Modal */}
        {selectedReward && (
          <RewardDetailModal
            isOpen={!!selectedReward}
            onClose={() => setSelectedReward(null)}
            reward={{
              id: selectedReward.id,
              name: selectedReward.titulo,
              points: selectedReward.custo_points,
              descricao: selectedReward.descricao,
              imagem_url: selectedReward.imagem_url || undefined,
              categoria: selectedReward.categoria
            }}
            userPoints={user.lab_points}
            onRedeem={handleRewardRedeem}
            loading={redeeming}
          />
        )}
      </div>

      {/* Values Wheel FAB */}
      <ValuesWheel />
    </div>
  );
}
