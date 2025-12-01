import { useState, useEffect } from 'react';
import { supabase, Reward } from '../lib/supabase';

export function useRewards(activeOnly = true) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('ativo', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRewards(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [activeOnly]);

  return { rewards, loading, error, refetch: fetchRewards };
}

export async function createReward(reward: Omit<Reward, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('rewards')
    .insert([reward])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReward(id: string, updates: Partial<Reward>) {
  const { data, error } = await supabase
    .from('rewards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReward(id: string) {
  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
