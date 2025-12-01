import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function usePoints() {
  const { user, refreshUser } = useAuth();
  const [points, setPoints] = useState(user?.lab_points || 0);

  useEffect(() => {
    // Atualiza pontos quando o usuário muda
    if (user?.lab_points !== undefined) {
      setPoints(user.lab_points);
    }
  }, [user?.lab_points]);

  useEffect(() => {
    if (!user?.id) return;

    // Inscreve para atualizações em tempo real na tabela de transactions
    const transactionsChannel = supabase
      .channel('points-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          await refreshUser();
        }
      )
      .subscribe();

    // Inscreve para atualizações em tempo real na tabela de redemptions
    const redemptionsChannel = supabase
      .channel('points-redemptions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'redemptions',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          await refreshUser();
        }
      )
      .subscribe();

    // Inscreve para atualizações diretas na tabela de users
    const usersChannel = supabase
      .channel('points-user')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new && 'lab_points' in payload.new) {
            setPoints(payload.new.lab_points);
          }
        }
      )
      .subscribe();

    // Cleanup: unsubscribe de todos os channels quando o componente desmontar
    return () => {
      transactionsChannel.unsubscribe();
      redemptionsChannel.unsubscribe();
      usersChannel.unsubscribe();
    };
  }, [user?.id, refreshUser]);

  // Força uma atualização inicial
  useEffect(() => {
    if (user?.id) {
      refreshUser();
    }
  }, [user?.id, refreshUser]);

  return points;
}