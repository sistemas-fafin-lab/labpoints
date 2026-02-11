import { useState, useEffect, useCallback } from 'react';
import { supabase, Redemption, User, Reward } from '../lib/supabase';

// Status da operação de resgate (pelo usuário)
export type RedemptionOperationStatus = 'pendente' | 'concluido' | 'cancelado';

// Status do processo de entrega (pelo gestor)
export type FulfillmentStatus = 'pendente' | 'aprovado' | 'entregue' | 'cancelado';

// Manter compatibilidade com código antigo
export type RedemptionStatus = FulfillmentStatus;

export interface RedemptionWithDetails extends Omit<Redemption, 'status'> {
  status: RedemptionOperationStatus;
  fulfillment_status: FulfillmentStatus;
  processed_by?: string;
  processed_at?: string;
  user?: User;
  reward?: Reward;
}

/**
 * Hook para buscar todos os resgates (para gestores e admins)
 */
export function useAllRedemptions() {
  const [redemptions, setRedemptions] = useState<RedemptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRedemptions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch redemptions with related data
      const { data: redemptionsData, error: fetchError } = await supabase
        .from('redemptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch redemptions error:', fetchError);
        throw fetchError;
      }

      // If no redemptions, return empty array
      if (!redemptionsData || redemptionsData.length === 0) {
        setRedemptions([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Get unique user IDs and reward IDs
      const userIds = [...new Set(redemptionsData.map(r => r.user_id))];
      const rewardIds = [...new Set(redemptionsData.map(r => r.reward_id))];

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (usersError) {
        console.error('Fetch users error:', usersError);
        throw usersError;
      }

      // Fetch rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .in('id', rewardIds);

      if (rewardsError) {
        console.error('Fetch rewards error:', rewardsError);
        throw rewardsError;
      }

      // Create lookup maps
      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);
      const rewardsMap = new Map(rewardsData?.map(r => [r.id, r]) || []);

      // Combine data
      const transformedData = redemptionsData.map(redemption => ({
        ...redemption,
        user: usersMap.get(redemption.user_id),
        reward: rewardsMap.get(redemption.reward_id),
      }));
      
      setRedemptions(transformedData as RedemptionWithDetails[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching redemptions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  const updateRedemptionStatus = async (
    redemptionId: string, 
    newStatus: FulfillmentStatus
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from('redemptions')
        .update({ 
          fulfillment_status: newStatus,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', redemptionId);

      if (updateError) throw updateError;

      // Atualiza estado local
      setRedemptions(prev => 
        prev.map(r => 
          r.id === redemptionId 
            ? { 
                ...r, 
                fulfillment_status: newStatus, 
                processed_at: new Date().toISOString(),
                updated_at: new Date().toISOString() 
              } 
            : r
        )
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  // Estatísticas baseadas no fulfillment_status
  const stats = {
    total: redemptions.length,
    pendente: redemptions.filter(r => r.fulfillment_status === 'pendente').length,
    aprovado: redemptions.filter(r => r.fulfillment_status === 'aprovado').length,
    entregue: redemptions.filter(r => r.fulfillment_status === 'entregue').length,
    cancelado: redemptions.filter(r => r.fulfillment_status === 'cancelado').length,
  };

  return { 
    redemptions, 
    loading, 
    error, 
    refetch: fetchRedemptions, 
    updateRedemptionStatus,
    stats 
  };
}

/**
 * Função para criar um resgate com status pendente
 */
export async function createRedemptionWithPendingStatus(redemption: {
  user_id: string;
  reward_id: string;
  custo_points: number;
}): Promise<{ data: Redemption | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('redemptions')
      .insert([{
        ...redemption,
        status: 'pendente'
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
