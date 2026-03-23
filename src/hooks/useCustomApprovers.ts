import { useState, useEffect, useCallback } from 'react';
import { supabase, User, DepartmentEnum } from '../lib/supabase';

export interface CustomApprover {
  id: string;
  user_id: string;
  user: {
    id: string;
    nome: string;
    email: string;
    avatar_url: string | null;
    department: DepartmentEnum | null;
    role: 'gestor' | 'adm';
  };
  added_at: string;
}

export interface ApprovalSettings {
  use_custom_approvers: boolean;
  updated_at: string | null;
  custom_approvers: CustomApprover[];
}

export interface UseCustomApproversReturn {
  // Data
  settings: ApprovalSettings | null;
  availableApprovers: User[];
  
  // Loading states
  loading: boolean;
  loadingAvailable: boolean;
  saving: boolean;
  
  // Actions
  fetchSettings: () => Promise<void>;
  fetchAvailableApprovers: () => Promise<void>;
  setUseCustomApprovers: (useCustom: boolean) => Promise<{ success: boolean; error?: string }>;
  addApprover: (userId: string) => Promise<{ success: boolean; error?: string }>;
  removeApprover: (userId: string) => Promise<{ success: boolean; error?: string }>;
  setApprovers: (userIds: string[]) => Promise<{ success: boolean; error?: string }>;
}

export function useCustomApprovers(): UseCustomApproversReturn {
  const [settings, setSettings] = useState<ApprovalSettings | null>(null);
  const [availableApprovers, setAvailableApprovers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch approval settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_approval_settings');
      
      if (error) {
        // If function doesn't exist, use default settings
        if (error.message?.includes('function') || error.code === '42883') {
          console.warn('Approval settings function not found, using defaults');
          setSettings({
            use_custom_approvers: false,
            updated_at: null,
            custom_approvers: []
          });
          return;
        }
        throw error;
      }
      
      setSettings(data as ApprovalSettings);
    } catch (error) {
      console.error('Error fetching approval settings:', error);
      // Set default settings on error
      setSettings({
        use_custom_approvers: false,
        updated_at: null,
        custom_approvers: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all users that can be approvers (gestores and admins)
  const fetchAvailableApprovers = useCallback(async () => {
    setLoadingAvailable(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['gestor', 'adm'])
        .order('nome');
      
      if (error) throw error;
      
      setAvailableApprovers(data || []);
    } catch (error) {
      console.error('Error fetching available approvers:', error);
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  // Toggle custom approvers mode
  const setUseCustomApprovers = useCallback(async (useCustom: boolean): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('set_use_custom_approvers', {
        p_use_custom: useCustom
      });
      
      if (error) {
        // If function doesn't exist, migration hasn't been run
        if (error.message?.includes('function') || error.code === '42883') {
          return { 
            success: false, 
            error: 'A migration de aprovadores ainda não foi executada no banco de dados' 
          };
        }
        throw error;
      }
      
      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        // Refresh settings
        await fetchSettings();
      }
      
      return result;
    } catch (error) {
      console.error('Error setting custom approvers mode:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar configuração' 
      };
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  // Add a single approver
  const addApprover = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('add_custom_approver', {
        p_user_id: userId
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        // Refresh settings
        await fetchSettings();
      }
      
      return result;
    } catch (error) {
      console.error('Error adding approver:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao adicionar aprovador' 
      };
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  // Remove a single approver
  const removeApprover = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('remove_custom_approver', {
        p_user_id: userId
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        // Refresh settings
        await fetchSettings();
      }
      
      return result;
    } catch (error) {
      console.error('Error removing approver:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao remover aprovador' 
      };
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  // Set all approvers at once
  const setApprovers = useCallback(async (userIds: string[]): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('set_custom_approvers', {
        p_user_ids: userIds
      });
      
      if (error) {
        // If function doesn't exist, migration hasn't been run
        if (error.message?.includes('function') || error.code === '42883') {
          return { 
            success: false, 
            error: 'A migration de aprovadores ainda não foi executada no banco de dados' 
          };
        }
        throw error;
      }
      
      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        // Refresh settings
        await fetchSettings();
      }
      
      return result;
    } catch (error) {
      console.error('Error setting approvers:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao definir aprovadores' 
      };
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
    fetchAvailableApprovers();
  }, [fetchSettings, fetchAvailableApprovers]);

  return {
    settings,
    availableApprovers,
    loading,
    loadingAvailable,
    saving,
    fetchSettings,
    fetchAvailableApprovers,
    setUseCustomApprovers,
    addApprover,
    removeApprover,
    setApprovers,
  };
}
