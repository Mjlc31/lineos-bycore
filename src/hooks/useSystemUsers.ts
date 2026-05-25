import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../context/AuthContext';

export interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'EQUIPE' | 'CLIENTE';
}

export function useSystemUsers() {
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
        if (error) throw error;
        const users = (data || []).map((p: any) => ({
          id: p.id,
          email: p.email,
          fullName: p.full_name || p.email.split('@')[0],
          avatarUrl: p.avatar_url,
          role: p.role || 'EQUIPE',
        }));
        setSystemUsers(users);
      } catch (err) {
        console.error('[useSystemUsers] Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { systemUsers, isLoading };
}
