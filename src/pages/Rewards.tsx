import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRewards } from '../hooks/useRewards';
import { useToast } from '../components/ui/Toast';
import { RewardCard } from '../components/RewardCard';
import { RedeemModal } from '../components/RedeemModal';
import { createRedemption } from '../hooks/useRedemptions';
import { Reward } from '../lib/supabase';

export function Rewards() {
  const { user, refreshUser } = useAuth();
  const { rewards, loading } = useRewards(true);
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'preco-asc' | 'preco-desc' | 'recente'>('recente');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);

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

  return (
    <div className="min-h-screen bg-lab-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-ranade font-bold text-gray-900 mb-2">
            Catálogo de Recompensas
          </h1>
          <p className="text-lab-gray-700 font-dm-sans">
            Escolha suas recompensas e resgate com seus Lab Points
          </p>
        </div>

        <div className="bg-white rounded-lab p-24 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lab-gray-700"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar recompensas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lab border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-lab-accent focus:border-transparent font-dm-sans"
                />
              </div>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-3 rounded-lab border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-lab-accent focus:border-transparent font-dm-sans"
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
                className={`px-4 py-2 rounded-full font-dm-sans text-sm transition-colors ${
                  !selectedCategory
                    ? 'bg-lab-gradient text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Filter size={16} className="inline mr-2" />
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-dm-sans text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-lab-gradient text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lab h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredRewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={user.lab_points}
                onRedeem={() => setSelectedReward(reward)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lab p-24 text-center">
            <Search size={48} className="mx-auto text-lab-gray-700 mb-4 opacity-50" />
            <p className="text-lab-gray-700 font-dm-sans">
              Nenhuma recompensa encontrada com os filtros selecionados
            </p>
          </div>
        )}
      </div>

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
    </div>
  );
}
