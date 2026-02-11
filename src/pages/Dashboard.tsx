import { Link } from 'react-router-dom';
import { TrendingUp, Award, History } from 'lucide-react';
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
    <div className="min-h-screen bg-lab-gray-100 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-ranade font-bold text-gray-900 mb-2">
            Olá, {user.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base text-lab-gray-700 font-dm-sans">
            Bem-vindo ao seu painel de recompensas Lab Points!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Hero Balance Card - Primary focal point */}
          <div className="hero-balance-card rounded-lab p-5 sm:p-6 hover-lift">
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Larger icon with matching blue palette */}
              <div className="p-4 bg-white/15 backdrop-blur-sm rounded-xl shadow-lg mr-2">
                <Award className="text-white drop-shadow-md" size={48} />
              </div>
              <div className="flex-1 min-w-0">
                {/* Upper label - small, subtle */}
                <p className="text-[10px] sm:text-sm font-dm-sans font-bold text-white uppercase tracking-wider mb-1">
                  Seu Saldo
                </p>
                {/* Prominent balance value */}
                <p className="text-3xl sm:text-4xl font-ranade font-bold text-white drop-shadow-sm">
                  {user.lab_points.toLocaleString('pt-BR')}
                </p>
                {/* Subtle supporting text */}
                <p className="text-xs sm:text-sm font-dm-sans text-white/70 mt-1">
                  Lab Points disponíveis
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lab p-5 sm:p-6 shadow-lab-sm hover-lift border border-gray-100 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lab-sm mr-2">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-dm-sans text-lab-gray-700 mb-1">
                  Total Ganho
                </p>
                <p className="text-2xl sm:text-3xl font-ranade font-bold text-gray-900">
                  {totalEarned.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lab p-5 sm:p-6 shadow-lab-sm hover-lift border border-gray-100 animate-scale-in sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="p-3 bg-gradient-to-br from-lab-accent to-red-500 rounded-lg shadow-lab-sm mr-2">
                <History className="text-white" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-dm-sans text-lab-gray-700 mb-1">
                  Total Resgatado
                </p>
                <p className="text-2xl sm:text-3xl font-ranade font-bold text-gray-900">
                  {totalRedeemed.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Users Ranking */}
        <div className="mb-6 mt-24 sm:mb-8 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <TopUsersRanking
            users={topUsers}
            loading={topUsersLoading}
            currentUserId={user.id}
          />
        </div>

        {/* Rewards Timeline Section */}
        <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
          <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <ApprovalQueue
              approvals={pendingApprovals}
              loading={loadingApprovals}
              onApprove={approveAssignment}
              onReject={rejectAssignment}
            />
          </div>
        )}

        {/* Rewards Section */}
        <div className="mb-6 sm:mb-24 mt-24 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-ranade font-bold text-gray-900">
              Recompensas em Destaque
            </h2>
            <Link
              to="/recompensas"
              className="text-lab-primary hover:text-lab-primary-dark font-dm-sans font-medium transition-colors inline-flex items-center gap-2 group"
            >
              Ver Todas
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {rewardsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lab h-80 animate-shimmer border border-gray-100"
                />
              ))}
            </div>
          ) : featuredRewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredRewards.map((reward, index) => (
                <div key={reward.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <RewardCard
                    reward={reward}
                    userPoints={user.lab_points}
                    onCardClick={() => setSelectedReward(reward)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lab p-8 sm:p-12 text-center shadow-lab-sm border border-gray-100">
              <Award size={48} className="mx-auto text-lab-gray-700 mb-4 opacity-30" />
              <p className="text-lab-gray-700 font-dm-sans text-sm sm:text-base">
                Nenhuma recompensa disponível no momento
              </p>
            </div>
          )}
        </div>

        {/* Transactions Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-ranade font-bold text-gray-900 mb-4 sm:mb-6">
            Transações Recentes
          </h2>

          {transactionsLoading ? (
            <div className="bg-white rounded-lab p-6 sm:p-8 shadow-lab-sm border border-gray-100">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg animate-shimmer" />
                ))}
              </div>
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="bg-white rounded-lab p-4 sm:p-6 shadow-lab-sm border border-gray-100">
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-lab-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-dm-sans text-sm sm:text-base text-gray-900 font-medium truncate">
                        {transaction.descricao}
                      </p>
                      <p className="text-xs sm:text-sm font-dm-sans text-lab-gray-700 mt-1">
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`font-ranade font-bold text-base sm:text-lg whitespace-nowrap ${
                        transaction.tipo === 'credito'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.tipo === 'credito' ? '+' : '-'}
                      {transaction.valor}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to="/perfil"
                className="block text-center mt-6 text-lab-primary hover:text-lab-primary-dark font-dm-sans font-medium transition-colors hover:underline"
              >
                Ver Histórico Completo
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lab p-8 sm:p-12 text-center shadow-lab-sm border border-gray-100">
              <History size={48} className="mx-auto text-lab-gray-700 mb-4 opacity-30" />
              <p className="text-lab-gray-700 font-dm-sans text-sm sm:text-base">
                Nenhuma transação registrada
              </p>
            </div>
          )}
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
