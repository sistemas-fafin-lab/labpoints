import { useState } from 'react';
import { Search, Filter, Plus, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRewards } from '../hooks/useRewards';
import { useToast } from '../components/ui/Toast';
import { RewardCard } from '../components/RewardCard';
import { RedeemModal } from '../components/RedeemModal';
import { RewardDetailModal } from '../components/RewardDetailModal';
import { AddRewardModal } from '../components/AddRewardModal';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pt-6">
      <div className="max-w-7xl mx-auto" style={{ padding: '32px 16px' }}>
        
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">
          
          {/* Header com Gradiente */}
          <div className="relative bg-gradient-to-br from-lab-primary via-blue-500 to-indigo-600 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-300/20 rounded-full blur-xl" />
            </div>
            
            {/* Header Content */}
            <div className="relative" style={{ padding: '32px 32px 28px 32px' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ gap: '20px' }}>
                <div className="flex items-center" style={{ gap: '16px' }}>
                  <div 
                    className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
                    style={{ width: '56px', height: '56px' }}
                  >
                    <Gift style={{ width: '28px', height: '28px' }} strokeWidth={2} className="drop-shadow-lg text-white" />
                  </div>
                  <div style={{ marginLeft: '4px' }}>
                    <h1 className="text-2xl md:text-3xl font-ranade font-bold tracking-tight drop-shadow-sm" style={{ color: 'white', marginBottom: '4px' }}>
                      Catálogo de Recompensas
                    </h1>
                    <p className="text-white/80 font-dm-sans" style={{ fontSize: '14px', lineHeight: '20px' }}>
                      Escolha suas recompensas e resgate com seus Lab Points
                    </p>
                  </div>
                </div>
                
                {isAdmin && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center self-start sm:self-auto bg-transparent border-2 border-white text-white rounded-xl font-dm-sans font-medium transition-all duration-300 hover:bg-white hover:text-lab-primary"
                    style={{ padding: '12px 20px', fontSize: '14px' }}
                  >
                    <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    Cadastrar Recompensa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div style={{ padding: '32px' }}>
            
            {/* Filtros Modernizados */}
            <div 
              className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100"
              style={{ padding: '24px', marginBottom: '28px' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '16px' }}>
                {/* Barra de Busca */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <input
                      type="text"
                      placeholder="Buscar recompensas por nome ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl bg-white border-2 border-slate-200 focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400"
                      style={{ paddingLeft: '48px', paddingRight: '16px', paddingTop: '14px', paddingBottom: '14px', fontSize: '15px' }}
                    />
                  </div>
                </div>

                {/* Ordenação */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full rounded-xl bg-white border-2 border-slate-200 focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 cursor-pointer"
                    style={{ padding: '14px 16px', fontSize: '15px' }}
                  >
                    <option value="recente">Mais Recentes</option>
                    <option value="preco-asc">Menor Preço</option>
                    <option value="preco-desc">Maior Preço</option>
                  </select>
                </div>
              </div>

              {/* Categorias */}
              {categories.length > 0 && (
                <div className="flex flex-wrap" style={{ gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`flex items-center rounded-xl font-dm-sans font-medium transition-all duration-300 ${
                      !selectedCategory
                        ? 'bg-gradient-to-r from-lab-primary to-indigo-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={{ gap: '8px', padding: '10px 18px', fontSize: '14px' }}
                  >
                    <Filter style={{ width: '16px', height: '16px' }} />
                    Todas
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-xl font-dm-sans font-medium transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-lab-primary to-indigo-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      style={{ padding: '10px 18px', fontSize: '14px' }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid de Recompensas */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl animate-pulse border border-slate-100" 
                    style={{ height: '380px' }} 
                  />
                ))}
              </div>
            ) : filteredRewards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '20px' }}>
                {filteredRewards.map((reward, index) => (
                  <div 
                    key={reward.id} 
                    className="animate-scale-in" 
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
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
              <div 
                className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 text-center"
                style={{ padding: '80px 32px' }}
              >
                <div 
                  className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto shadow-inner"
                  style={{ width: '80px', height: '80px', marginBottom: '20px' }}
                >
                  <Search style={{ width: '40px', height: '40px' }} className="text-slate-300" />
                </div>
                <p className="text-slate-600 font-dm-sans font-medium" style={{ fontSize: '18px', marginBottom: '4px' }}>
                  Nenhuma recompensa encontrada
                </p>
                <p className="text-slate-400 font-dm-sans" style={{ fontSize: '14px' }}>
                  Tente ajustar os filtros ou buscar por outro termo
                </p>
              </div>
            )}
          </div>
        </div>
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
