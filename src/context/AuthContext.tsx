import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'EQUIPE' | 'CLIENTE';
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapProfileRow(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? row.email.split('@')[0],
    avatarUrl: row.avatar_url,
    role: row.role,
    twoFactorEnabled: row.two_factor_enabled ?? false,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ─── Buscar perfil do usuário logado ──────────────────────────────────────
  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(mapProfileRow(data as ProfileRow));
      }
    } catch (err) {
      console.error('[AuthContext] fetchProfile falhou:', err);
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.warn('[AuthContext] Supabase não configurado — modo sem autenticação.');
      setIsAuthLoading(false);
      return;
    }

    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsAuthLoading(false);
    });

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Sistema não configurado. Contate o administrador.' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const errorMap: Record<string, string> = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada.',
        'Too many requests': 'Muitas tentativas. Aguarde um momento.',
      };
      return { error: errorMap[error.message] ?? error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
    localStorage.removeItem('line_os_cached_role');
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: string | null }> => {
    if (!supabase || !user) return { error: 'Usuário não autenticado.' };

    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.twoFactorEnabled !== undefined) dbUpdates.two_factor_enabled = updates.twoFactorEnabled;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) return { error: error.message };
    
    // Atualizar estado local
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isAuthLoading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
