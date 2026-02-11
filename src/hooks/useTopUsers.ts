import { useState, useEffect } from 'react';
import { supabase, User } from '../lib/supabase';

export interface TopUser {
  id: string;
  nome: string;
  avatar_url: string | null;
  lab_points: number;
  department: string | null;
  created_at?: string;
}

export function useTopUsers(limit: number = 5) {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, nome, avatar_url, lab_points, department, created_at')
        .order('lab_points', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      setTopUsers(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUsers();
  }, [limit]);

  return { topUsers, loading, error, refetch: fetchTopUsers };
}
