import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAllRedemptions, RedemptionStatus } from '../hooks/useAllRedemptions';
import { useRedemptionPeriodConfig } from '../hooks/useRedemptionPeriod';
import { useToast } from '../components/ui/Toast';
import { RedemptionCard } from '../components/RedemptionCard';
import { RedemptionStatusModal } from '../components/RedemptionStatusModal';
import {
  StatsCards,
  RedemptionPeriodControl,
  RedemptionFilters,
  EmptyState,
  StatsCardsSkeleton,
  RedemptionsGridSkeleton,
  FiltersSkeleton,
} from '../components/redeem-control';

type FilterStatus = 'all' | RedemptionStatus;

export function RedeemControl() {
  const { user } = useAuth();
  const { redemptions, loading, updateRedemptionStatus, stats } = useAllRedemptions();
  const {
    period,
    loading: periodLoading,
    saving: periodSaving,
    savePeriod,
    deletePeriod,
  } = useRedemptionPeriodConfig();
  const { showToast } = useToast();

  // Filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    redemptionId: string;
    currentStatus: RedemptionStatus;
    newStatus: RedemptionStatus;
    userName: string;
    rewardName: string;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Early return if no user
  if (!user) return null;

  const isAdmin = user.role === 'adm';

  // Filter redemptions
  const filteredRedemptions = redemptions.filter((redemption) => {
    const matchesStatus = filterStatus === 'all' || redemption.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      redemption.user?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.reward?.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const hasFilters = searchTerm !== '' || filterStatus !== 'all';

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleFilterChange = useCallback((value: FilterStatus) => {
    setFilterStatus(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
  }, []);

  const handleStatusChangeRequest = (redemptionId: string, newStatus: RedemptionStatus) => {
    const redemption = redemptions.find((r) => r.id === redemptionId);
    if (!redemption) return;

    setStatusModal({
      isOpen: true,
      redemptionId,
      currentStatus: redemption.status,
      newStatus,
      userName: redemption.user?.nome || 'Usuário',
      rewardName: redemption.reward?.titulo || 'Recompensa',
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusModal) return;

    setUpdatingStatus(true);
    const result = await updateRedemptionStatus(statusModal.redemptionId, statusModal.newStatus);
    setUpdatingStatus(false);

    if (result.success) {
      showToast('Status atualizado com sucesso!', 'success');
      setStatusModal(null);
    } else {
      showToast(result.error || 'Erro ao atualizar status', 'error');
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <header className="mb-6 sm:mb-8 animate-fade-in-up">
        <Link
          to="/dashboard"
          className="
            inline-flex items-center gap-4 
            text-gray-400 hover:text-lab-primary 
            transition-all duration-150 
            mb-4 mt-12 font-dm-sans text-sm
            hover:-translate-x-0.5 transform
          "
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </Link>

        <div className="flex items-center gap-4 mt-5">
          <div 
            className="
              w-[64px] h-[64px] rounded-2xl bg-lab-gradient 
              flex items-center justify-center 
              shadow-md shadow-lab-primary/15
              transition-transform duration-150 hover:scale-105
              mr-8
            "
          >
            <Package size={26} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-ranade font-bold text-gray-900">
              Controle de Resgates
            </h1>
            <p className="text-gray-400 font-dm-sans text-sm sm:text-base">
              Gerencie os resgates de recompensas dos colaboradores
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards with Skeleton */}
      {loading ? (
        <StatsCardsSkeleton />
      ) : (
        <StatsCards stats={stats} />
      )}

      {/* Period Configuration */}
      <RedemptionPeriodControl
        period={period}
        periodLoading={periodLoading}
        periodSaving={periodSaving}
        onSavePeriod={savePeriod}
        onDeletePeriod={deletePeriod}
        showToast={showToast}
        isAdmin={isAdmin}
      />

      {/* Filters with Skeleton */}
      {loading ? (
        <FiltersSkeleton />
      ) : (
        <RedemptionFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filterStatus={filterStatus}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Redemptions List with Skeleton */}
      {loading ? (
        <RedemptionsGridSkeleton count={6} />
      ) : filteredRedemptions.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRedemptions.map((redemption, index) => (
            <div
              key={redemption.id}
              className="animate-stagger-fade-in"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <RedemptionCard
                redemption={redemption}
                onStatusChange={handleStatusChangeRequest}
                loading={updatingStatus && statusModal?.redemptionId === redemption.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* Status Change Modal */}
      {statusModal && (
        <RedemptionStatusModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal(null)}
          onConfirm={handleConfirmStatusChange}
          loading={updatingStatus}
          currentStatus={statusModal.currentStatus}
          newStatus={statusModal.newStatus}
          userName={statusModal.userName}
          rewardName={statusModal.rewardName}
        />
      )}
    </main>
  );
}
