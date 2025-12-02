import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, User, DepartmentEnum } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome: string, department: DepartmentEnum) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      const profile = await fetchUserProfile(authUser.id);
      setUser(profile);
      setSupabaseUser(authUser);
    } else {
      setUser(null);
      setSupabaseUser(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
          setSupabaseUser(session.user);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
          setSupabaseUser(session.user);
        } else {
          setUser(null);
          setSupabaseUser(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
        setSupabaseUser(data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, nome: string, department: DepartmentEnum) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            department,
            role: 'colaborador',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Aguardar um pouco para o trigger criar o perfil
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser(profile);
          setSupabaseUser(data.user);
        } else {
          // Tentar criar manualmente como fallback
          const { data: newProfile, error: profileError } = await supabase
            .from('users')
            .insert([{
              id: data.user.id,
              email: data.user.email || '',
              nome,
              department,
              role: 'colaborador',
              lab_points: 0
            }])
            .select()
            .single();
            
          if (profileError) {
            console.error('Error creating user profile:', profileError);
          } else {
            setUser(newProfile);
            setSupabaseUser(data.user);
          }
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
