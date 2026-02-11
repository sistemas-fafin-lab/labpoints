import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface RedemptionPeriod {
  id: string;
  start_day: number;
  end_day: number;
  department: string;
  created_at: string;
  updated_at: string;
}

interface PeriodCheck {
  isOpen: boolean;
  period: RedemptionPeriod | null;
  loading: boolean;
  daysUntilOpen: number | null;
}

/**
 * Hook para verificar se o período de resgate está aberto
 * @param userRole - Role do usuário (gestores e admins sempre podem visualizar)
 * @returns Estado do período de resgate
 */
export function useRedemptionPeriod(userRole?: string): PeriodCheck {
  const [isOpen, setIsOpen] = useState(true);
  const [period, setPeriod] = useState<RedemptionPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysUntilOpen, setDaysUntilOpen] = useState<number | null>(null);

  useEffect(() => {
    const checkPeriod = async () => {
      setLoading(true);

      // Gestores e admins sempre podem acessar
      if (userRole === 'gestor' || userRole === 'adm') {
        setIsOpen(true);
        setLoading(false);
        
        // Ainda busca o período para exibição
        const { data } = await supabase
          .from('redemption_periods')
          .select('*')
          .eq('department', 'general')
          .maybeSingle();
        
        if (data) {
          setPeriod(data);
        }
        return;
      }

      // Busca o período configurado
      const { data, error } = await supabase
        .from('redemption_periods')
        .select('*')
        .eq('department', 'general')
        .maybeSingle();

      if (error || !data) {
        // Se não há configuração, permite resgates
        setIsOpen(true);
        setLoading(false);
        return;
      }

      setPeriod(data);

      // Verifica se o dia atual está dentro do período
      const today = new Date().getDate();
      const isWithinPeriod = today >= data.start_day && today <= data.end_day;
      setIsOpen(isWithinPeriod);

      // Calcula dias até abertura se fechado
      if (!isWithinPeriod) {
        const days = getDaysUntilPeriodOpens(data.start_day);
        setDaysUntilOpen(days);
      }

      setLoading(false);
    };

    checkPeriod();
  }, [userRole]);

  return { isOpen, period, loading, daysUntilOpen };
}

/**
 * Calcula quantos dias faltam para o período de resgate abrir
 */
function getDaysUntilPeriodOpens(startDay: number): number {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let nextPeriodStart: Date;

  if (currentDay < startDay) {
    // Ainda neste mês
    nextPeriodStart = new Date(currentYear, currentMonth, startDay);
  } else {
    // Próximo mês
    nextPeriodStart = new Date(currentYear, currentMonth + 1, startDay);
  }

  const diffTime = nextPeriodStart.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Hook para gerenciar configuração de período de resgate (apenas admin)
 */
export function useRedemptionPeriodConfig() {
  const [period, setPeriod] = useState<RedemptionPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPeriod = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('redemption_periods')
      .select('*')
      .eq('department', 'general')
      .maybeSingle();

    if (!error && data) {
      setPeriod(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPeriod();
  }, []);

  const savePeriod = async (startDay: number, endDay: number): Promise<{ success: boolean; error?: string }> => {
    if (startDay < 1 || startDay > 31 || endDay < 1 || endDay > 31) {
      return { success: false, error: 'Dias devem estar entre 1 e 31' };
    }

    if (startDay > endDay) {
      return { success: false, error: 'Dia inicial deve ser menor ou igual ao dia final' };
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('redemption_periods')
        .upsert({
          start_day: startDay,
          end_day: endDay,
          department: 'general',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'department'
        });

      if (error) {
        setSaving(false);
        return { success: false, error: error.message };
      }

      await fetchPeriod();
      setSaving(false);
      return { success: true };
    } catch (err) {
      setSaving(false);
      return { success: false, error: 'Erro ao salvar período' };
    }
  };

  const deletePeriod = async (): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('redemption_periods')
        .delete()
        .eq('department', 'general');

      if (error) {
        setSaving(false);
        return { success: false, error: error.message };
      }

      setPeriod(null);
      setSaving(false);
      return { success: true };
    } catch (err) {
      setSaving(false);
      return { success: false, error: 'Erro ao remover período' };
    }
  };

  return { period, loading, saving, savePeriod, deletePeriod, refetch: fetchPeriod };
}
