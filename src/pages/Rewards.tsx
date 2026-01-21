import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRewards } from '../hooks/useRewards';
import { useToast } from '../components/ui/Toast';
import { RewardCard } from '../components/RewardCard';
import { RedeemModal } from '../components/RedeemModal';
import { RewardDetailModal } from '../components/RewardDetailModal';
import { AddRewardModal } from '../components/AddRewardModal';
import { Button } from '../components/ui/Button';
import { createRedemption } from '../hooks/useRedemptions';
import { Reward } from '../lib/supabase';

export function Rewards() {
  const { user, refreshUser } = useAuth();
  const { rewards, loading, refetch: refetchRewards } = useRewards(true);
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'preco-asc' | 'preco-desc' | 'recente'>('recente');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [detailReward, setDetailReward] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const isAdmin = user?.role === 'adm';

  if (!user) return null;

  const categories = Array.from(new Set(rewards.map((r) => r.categoria)));

  let filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || reward.categoria === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'preco-asc') {
    filteredRewards = filteredRewards.sort((a, b) => a.custo_points - b.custo_points);
  } else if (sortBy === 'preco-desc') {
    filteredRewards = filteredRewards.sort((a, b) => b.custo_points - a.custo_points);
  }

  const handleRedeem = async () => {
    if (!selectedReward || !user) return;

    setRedeeming(true);

    try {
      await createRedemption({
        user_id: user.id,
        reward_id: selectedReward.id,
        custo_points: selectedReward.custo_points,
      });

      await refreshUser();
      showToast('Recompensa resgatada com sucesso!', 'success');
      setSelectedReward(null);
    } catch (error) {
      showToast('Erro ao resgatar recompensa', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  const handleRedeemFromDetail = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || !user) return;

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
      showToast('Recompensa resgatada com sucesso!', 'success');
      setDetailReward(null);
    } catch (error) {
      showToast('Erro ao resgatar recompensa', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  const handleAddRewardSuccess = async () => {
    await refetchRewards();
    setShowAddModal(false);
    showToast('Recompensa cadastrada com sucesso!', 'success');
  };

  return (
    <div className="min-h-screen bg-lab-gray-100 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-ranade font-bold text-gray-900 mb-2">
              Catálogo de Recompensas 🎁
            </h1>
            <p className="text-sm sm:text-base text-lab-gray-700 font-dm-sans">
              Escolha suas recompensas e resgate com seus Lab Points
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="self-start sm:self-auto"
            >
              <Plus size={20} className="mr-2" />
              Cadastrar Recompensa
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lab p-4 sm:p-6 shadow-lab-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lab-gray-700 pointer-events-none"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar recompensas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lab border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-lab-primary focus:border-lab-primary font-dm-sans transition-all duration-300 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-3 rounded-lab border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-lab-primary focus:border-lab-primary font-dm-sans transition-all duration-300 cursor-pointer"
              >
                <option value="recente">Mais Recentes</option>
                <option value="preco-asc">Menor Preço</option>
                <option value="preco-desc">Maior Preço</option>
              </select>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full font-dm-sans text-sm font-medium transition-all duration-300 ${
                  !selectedCategory
                    ? 'bg-lab-gradient text-white shadow-lab-sm scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                }`}
              >
                <Filter size={16} className="inline mr-2" />
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-dm-sans text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-lab-gradient text-white shadow-lab-sm scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rewards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lab h-96 animate-shimmer border border-gray-100" />
            ))}
          </div>
        ) : filteredRewards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRewards.map((reward, index) => (
              <div key={reward.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <RewardCard
                  reward={reward}
                  userPoints={user.lab_points}
                  onRedeem={() => setSelectedReward(reward)}
                  onCardClick={() => setDetailReward(reward)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lab p-8 sm:p-12 text-center shadow-lab-sm border border-gray-100">
            <Search size={48} className="mx-auto text-lab-gray-700 mb-4 opacity-30" />
            <p className="text-lab-gray-700 font-dm-sans text-sm sm:text-base">
              Nenhuma recompensa encontrada com os filtros selecionados
            </p>
          </div>
        )}
      </div>

      {/* Redeem Confirmation Modal */}
      {selectedReward && (
        <RedeemModal
          reward={selectedReward}
          userPoints={user.lab_points}
          isOpen={!!selectedReward}
          onClose={() => setSelectedReward(null)}
          onConfirm={handleRedeem}
          loading={redeeming}
        />
      )}

      {/* Reward Detail Modal */}
      {detailReward && (
        <RewardDetailModal
          isOpen={!!detailReward}
          onClose={() => setDetailReward(null)}
          reward={{
            id: detailReward.id,
            name: detailReward.titulo,
            points: detailReward.custo_points,
            descricao: detailReward.descricao,
            imagem_url: detailReward.imagem_url || undefined,
            categoria: detailReward.categoria
          }}
          userPoints={user.lab_points}
          onRedeem={handleRedeemFromDetail}
          loading={redeeming}
        />
      )}

      {/* Add Reward Modal (Admin only) */}
      {isAdmin && (
        <AddRewardModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddRewardSuccess}
        />
      )}
    </div>
  );
}
