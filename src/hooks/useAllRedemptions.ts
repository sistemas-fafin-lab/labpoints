import { useState, useEffect, useCallback } from 'react';
import { supabase, Redemption, User, Reward } from '../lib/supabase';

export type RedemptionStatus = 'pendente' | 'aprovado' | 'resgatado' | 'cancelado';

export interface RedemptionWithDetails extends Omit<Redemption, 'status'> {
  status: RedemptionStatus;
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
      const { data, error: fetchError } = await supabase
        .from('redemptions')
        .select(`
          *,
          user:users(*),
          reward:rewards(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRedemptions((data || []) as RedemptionWithDetails[]);
      setError(null);
    } catch (err) {
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
    newStatus: RedemptionStatus
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from('redemptions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', redemptionId);

      if (updateError) throw updateError;

      // Atualiza estado local
      setRedemptions(prev => 
        prev.map(r => 
          r.id === redemptionId 
            ? { ...r, status: newStatus, updated_at: new Date().toISOString() } 
            : r
        )
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  // Estatísticas
  const stats = {
    total: redemptions.length,
    pendente: redemptions.filter(r => r.status === 'pendente').length,
    aprovado: redemptions.filter(r => r.status === 'aprovado').length,
    resgatado: redemptions.filter(r => r.status === 'resgatado').length,
    cancelado: redemptions.filter(r => r.status === 'cancelado').length,
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
