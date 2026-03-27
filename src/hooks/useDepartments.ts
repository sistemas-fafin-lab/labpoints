import { useState, useEffect, useCallback } from 'react';
import { supabase, DEPARTMENTS_LIST } from '../lib/supabase';

export interface Department {
  id: string;
  slug: string;
  label: string;
  display_order: number;
}

interface UseDepartmentsReturn {
  departments: Department[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDepartment: (label: string) => Promise<{ success: boolean; error?: string; department?: Department }>;
  getDepartmentLabel: (slug: string | null | undefined) => string;
}

/**
 * Hook para gerenciar departamentos dinâmicos
 * 
 * Busca departamentos do banco de dados se disponível,
 * com fallback para a lista estática caso a migration não tenha sido aplicada.
 */
export function useDepartments(): UseDepartmentsReturn {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dynamicSystemAvailable, setDynamicSystemAvailable] = useState<boolean | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Primeiro tentar buscar diretamente da tabela para verificar se existe
      const { data: tableData, error: tableError } = await supabase
        .from('departments')
        .select('id, slug, label, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('label', { ascending: true });

      if (tableError) {
        // Se a tabela não existe, usar fallback
        if (tableError.message?.includes('does not exist') || tableError.code === '42P01') {
          console.warn('Tabela departments não encontrada, usando lista estática');
          setDynamicSystemAvailable(false);
          setDepartments(
            DEPARTMENTS_LIST.map((d, index) => ({
              id: d.value,
              slug: d.value,
              label: d.label,
              display_order: index + 1,
            }))
          );
          return;
        }
        throw tableError;
      }

      // Tabela existe - sistema dinâmico está disponível
      setDynamicSystemAvailable(true);

      if (tableData && tableData.length > 0) {
        setDepartments(tableData);
      } else {
        // Tabela existe mas está vazia - ainda usar lista estática para exibição
        // mas permitir criação de novos departamentos
        console.warn('Tabela departments está vazia, usando lista estática para exibição');
        setDepartments(
          DEPARTMENTS_LIST.map((d, index) => ({
            id: d.value,
            slug: d.value,
            label: d.label,
            display_order: index + 1,
          }))
        );
      }
    } catch (err) {
      console.error('Erro ao buscar departamentos:', err);
      // Fallback para lista estática
      setDynamicSystemAvailable(false);
      setDepartments(
        DEPARTMENTS_LIST.map((d, index) => ({
          id: d.value,
          slug: d.value,
          label: d.label,
          display_order: index + 1,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const createDepartment = useCallback(async (label: string): Promise<{ success: boolean; error?: string; department?: Department }> => {
    // Se ainda não sabemos se o sistema está disponível, tentar mesmo assim
    if (dynamicSystemAvailable === false) {
      return { 
        success: false, 
        error: 'Sistema de departamentos dinâmicos não está configurado. Execute a migration primeiro.' 
      };
    }

    try {
      const { data, error: rpcError } = await supabase.rpc('create_department', {
        p_label: label.trim()
      });

      if (rpcError) {
        console.error('Erro RPC create_department:', rpcError);
        // Erro de função não existente
        if (rpcError.message?.includes('function') && rpcError.message?.includes('does not exist')) {
          setDynamicSystemAvailable(false);
          return { 
            success: false, 
            error: 'Sistema de departamentos dinâmicos não está configurado.' 
          };
        }
        return { success: false, error: rpcError.message };
      }

      const result = data as { success: boolean; error?: string; department?: Department };

      if (result.success && result.department) {
        // Atualizar lista local
        setDepartments(prev => [...prev, result.department!].sort((a, b) => a.display_order - b.display_order));
        // Re-buscar para garantir sincronização
        fetchDepartments();
        return { success: true, department: result.department };
      }

      return { success: false, error: result.error || 'Erro ao criar departamento' };
    } catch (err) {
      console.error('Erro ao criar departamento:', err);
      return { success: false, error: 'Erro ao criar departamento' };
    }
  }, [dynamicSystemAvailable, fetchDepartments]);

  const getDepartmentLabel = useCallback((slug: string | null | undefined): string => {
    if (!slug) return 'Sem departamento';
    
    const dept = departments.find(d => d.slug === slug);
    if (dept) return dept.label;
    
    // Fallback para a lista estática
    const staticDept = DEPARTMENTS_LIST.find(d => d.value === slug);
    if (staticDept) return staticDept.label;
    
    return slug;
  }, [departments]);

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
    createDepartment,
    getDepartmentLabel,
  };
}

/**
 * Versão simplificada que retorna apenas a lista para selects
 */
export function useDepartmentsList(): { value: string; label: string }[] {
  const { departments } = useDepartments();
  return departments.map(d => ({ value: d.slug, label: d.label }));
}
