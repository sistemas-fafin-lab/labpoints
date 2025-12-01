import { useState, useEffect } from 'react';
import { supabase, Redemption } from '../lib/supabase';

export function useRedemptions(userId?: string) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRedemptions = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('redemptions')
        .select('*, reward:rewards(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRedemptions(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, [userId]);

  return { redemptions, loading, error, refetch: fetchRedemptions };
}

export async function createRedemption(redemption: {
  user_id: string;
  reward_id: string;
  custo_points: number;
}) {
  const { data, error } = await supabase
    .from('redemptions')
    .insert([redemption])
    .select()
    .single();

  if (error) throw error;
  return data;
}
