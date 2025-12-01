import { Link } from 'react-router-dom';
import { TrendingUp, Award, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRewards } from '../hooks/useRewards';
import { useTransactions } from '../hooks/useTransactions';
import { RewardCard } from '../components/RewardCard';
import { PointsBadge } from '../components/ui/PointsBadge';

export function Dashboard() {
  const { user } = useAuth();
  const { rewards, loading: rewardsLoading } = useRewards(true);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id);

  if (!user) return null;

  const featuredRewards = rewards.slice(0, 6);
  const recentTransactions = transactions.slice(0, 5);

  const totalEarned = transactions
    .filter((t) => t.tipo === 'credito')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalRedeemed = transactions
    .filter((t) => t.tipo === 'debito')
    .reduce((sum, t) => sum + t.valor, 0);

  return (
    <div className="min-h-screen bg-lab-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-ranade font-bold text-gray-900 mb-2">
            Olá, {user.nome.split(' ')[0]}!
          </h1>
          <p className="text-lab-gray-700 font-dm-sans">
            Bem-vindo ao seu painel de recompensas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lab p-24 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-lab-gradient rounded-lg">
                <Award className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-dm-sans text-lab-gray-700">
                  Saldo Atual
                </p>
                <PointsBadge points={user.lab_points} size="md" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lab p-24 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-dm-sans text-lab-gray-700">
                  Total Ganho
                </p>
                <p className="text-2xl font-ranade font-bold text-gray-900">
                  {totalEarned.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lab p-24 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-lab-accent rounded-lg">
                <History className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-dm-sans text-lab-gray-700">
                  Total Resgatado
                </p>
                <p className="text-2xl font-ranade font-bold text-gray-900">
                  {totalRedeemed.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-ranade font-bold text-gray-900">
                Recompensas em Destaque
              </h2>
              <Link
                to="/recompensas"
                className="text-lab-primary hover:text-lab-primary-dark font-dm-sans font-medium transition-colors"
              >
                Ver Todas
              </Link>
            </div>

            {rewardsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lab h-80 animate-pulse"
                  />
                ))}
              </div>
            ) : featuredRewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredRewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    userPoints={user.lab_points}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lab p-24 text-center">
                <Award size={48} className="mx-auto text-lab-gray-700 mb-4 opacity-50" />
                <p className="text-lab-gray-700 font-dm-sans">
                  Nenhuma recompensa disponível no momento
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-ranade font-bold text-gray-900 mb-2 mt-20">
              Transações Recentes
            </h2>

            {transactionsLoading ? (
              <div className="bg-white rounded-lab p-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="bg-white rounded-lab p-24 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-start justify-between p-4 rounded-lab bg-lab-gray-100"
                    >
                      <div className="flex-1">
                        <p className="font-dm-sans text-sm text-gray-900 font-medium">
                          {transaction.descricao}
                        </p>
                        <p className="text-xs font-dm-sans text-lab-gray-700 mt-1">
                          {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className={`font-ranade font-bold text-sm ${
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
                  className="block text-center mt-6 text-lab-primary hover:text-lab-primary-dark font-dm-sans font-medium transition-colors"
                >
                  Ver Histórico Completo
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lab p-24 text-center">
                <History size={48} className="mx-auto text-lab-gray-700 mb-4 opacity-50" />
                <p className="text-lab-gray-700 font-dm-sans">
                  Nenhuma transação registrada
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
