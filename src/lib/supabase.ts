import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// ─── Re-exportando os Tipos principais a partir do DB gerado ──────────────────
export type UserRole = Database['public']['Enums']['user_role'];
export type TaskPriority = Database['public']['Enums']['task_priority'];
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type ContentStatusDB = Database['public']['Enums']['content_status'] | 'ALTERAÇÃO';
export type ContentTypeDB = Database['public']['Enums']['content_type'];

// ─── Supabase Client Singleton ─────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let _supabase: SupabaseClient<Database> | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[LINE OS] ⚠️  Variáveis de ambiente Supabase não configuradas.\n' +
    '  Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.\n' +
    '  O sistema cairá para modo local (localStorage) até isso ser corrigido.'
  );
} else {
  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

export const supabase = _supabase;

/**
 * Guard type-safe para garantir que Supabase está configurado antes de usar.
 * Lança erro explicativo ao invés de falhar silenciosamente.
 */
export function requireSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    throw new Error(
      '[LINE OS] Supabase não está configurado. ' +
      'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.'
    );
  }
  return _supabase;
}

/** Verifica se o Supabase está disponível sem lançar erro */
export const isSupabaseAvailable = (): boolean => _supabase !== null;
