import { useState, useEffect, useCallback } from 'react';
import { supabase, PendingPointAssignment, User } from '../lib/supabase';

interface UsePointAssignmentsReturn {
  // Data
  pendingApprovals: PendingPointAssignment[];
  allPendingApprovals: PendingPointAssignment[]; // All pending approvals (for admins)
  myAssignments: PendingPointAssignment[];
  departmentUsers: User[];
  pendingCount: number;
  
  // Loading states
  loading: boolean;
  loadingApprovals: boolean;
  loadingUsers: boolean;
  
  // Actions
  createAssignment: (targetUserId: string, points: number, justification: string) => Promise<{ success: boolean; error?: string; assignmentId?: string }>;
  approveAssignment: (assignmentId: string) => Promise<{ success: boolean; error?: string }>;
  rejectAssignment: (assignmentId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  refreshApprovals: () => Promise<void>;
  refreshDepartmentUsers: () => Promise<void>;
}

export function usePointAssignments(userId: string | undefined): UsePointAssignmentsReturn {
  const [pendingApprovals, setPendingApprovals] = useState<PendingPointAssignment[]>([]);
  const [allPendingApprovals, setAllPendingApprovals] = useState<PendingPointAssignment[]>([]);
  const [myAssignments, setMyAssignments] = useState<PendingPointAssignment[]>([]);
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch pending approvals assigned to the current user
  const fetchPendingApprovals = useCallback(async () => {
    if (!userId) return;
    
    setLoadingApprovals(true);
    try {
      // Fetch approvals assigned to this user
      const { data, error } = await supabase
        .from('pending_point_assignments')
        .select(`
          *,
          requester:requester_id(id, nome, email, department),
          target_user:target_user_id(id, nome, email, department)
        `)
        .eq('selected_approver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingApprovals(data || []);
      setPendingCount(data?.length || 0);

      // Also fetch ALL pending approvals (for admin view)
      const { data: allData, error: allError } = await supabase
        .from('pending_point_assignments')
        .select(`
          *,
          requester:requester_id(id, nome, email, department),
          target_user:target_user_id(id, nome, email, department),
          approver:selected_approver_id(id, nome, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!allError) {
        setAllPendingApprovals(allData || []);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoadingApprovals(false);
    }
  }, [userId]);

  // Fetch assignments created by the current user
  const fetchMyAssignments = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('pending_point_assignments')
        .select(`
          *,
          target_user:target_user_id(id, nome, email, department),
          approver:selected_approver_id(id, nome, email)
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMyAssignments(data || []);
    } catch (error) {
      console.error('Error fetching my assignments:', error);
    }
  }, [userId]);

  // Fetch users from the same department
  const fetchDepartmentUsers = useCallback(async () => {
    if (!userId) return;
    
    setLoadingUsers(true);
    try {
      // First, get the current user's department
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('department, role')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // If admin, can see all users; if gestor, only same department
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', userId)
        .order('nome');

      if (currentUser.role === 'gestor' && currentUser.department) {
        query = query.eq('department', currentUser.department);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDepartmentUsers(data || []);
    } catch (error) {
      console.error('Error fetching department users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [userId]);

  // Create a new point assignment
  const createAssignment = useCallback(async (
    targetUserId: string,
    points: number,
    justification: string
  ): Promise<{ success: boolean; error?: string; assignmentId?: string }> => {
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);
    try {
      // Call the database function to create assignment
      const { data, error } = await supabase.rpc('create_point_assignment', {
        p_requester_id: userId,
        p_target_user_id: targetUserId,
        p_points: points,
        p_justification: justification
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; assignment_id?: string; approver_id?: string };

      if (!result.success) {
        return { success: false, error: result.error || 'Erro ao criar atribuição' };
      }

      // Refresh lists
      await fetchMyAssignments();
      
      return { 
        success: true, 
        assignmentId: result.assignment_id 
      };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar atribuição' 
      };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchMyAssignments]);

  // Approve an assignment
  const approveAssignment = useCallback(async (
    assignmentId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('approve_point_assignment', {
        p_assignment_id: assignmentId,
        p_approver_id: userId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        return { success: false, error: result.error || 'Erro ao aprovar atribuição' };
      }

      // Refresh approvals list
      await fetchPendingApprovals();
      
      return { success: true };
    } catch (error) {
      console.error('Error approving assignment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao aprovar atribuição' 
      };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchPendingApprovals]);

  // Reject an assignment
  const rejectAssignment = useCallback(async (
    assignmentId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('reject_point_assignment', {
        p_assignment_id: assignmentId,
        p_approver_id: userId,
        p_rejection_reason: reason || null
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        return { success: false, error: result.error || 'Erro ao rejeitar atribuição' };
      }

      // Refresh approvals list
      await fetchPendingApprovals();
      
      return { success: true };
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao rejeitar atribuição' 
      };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchPendingApprovals]);

  // Refresh functions
  const refreshApprovals = useCallback(async () => {
    await Promise.all([fetchPendingApprovals(), fetchMyAssignments()]);
  }, [fetchPendingApprovals, fetchMyAssignments]);

  const refreshDepartmentUsers = useCallback(async () => {
    await fetchDepartmentUsers();
  }, [fetchDepartmentUsers]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchPendingApprovals();
      fetchMyAssignments();
      fetchDepartmentUsers();
    }
  }, [userId, fetchPendingApprovals, fetchMyAssignments, fetchDepartmentUsers]);

  // Subscribe to real-time updates for pending approvals
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('pending_approvals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_point_assignments',
          filter: `selected_approver_id=eq.${userId}`
        },
        () => {
          fetchPendingApprovals();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_point_assignments',
          filter: `requester_id=eq.${userId}`
        },
        () => {
          fetchMyAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchPendingApprovals, fetchMyAssignments]);

  return {
    pendingApprovals,
    allPendingApprovals,
    myAssignments,
    departmentUsers,
    pendingCount,
    loading,
    loadingApprovals,
    loadingUsers,
    createAssignment,
    approveAssignment,
    rejectAssignment,
    refreshApprovals,
    refreshDepartmentUsers
  };
}
