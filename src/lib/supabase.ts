import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';
const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'votre_cle_anonyme_supabase';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseLiveConfigured = Boolean(
  (import.meta as any).env?.VITE_SUPABASE_URL &&
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY &&
  !(import.meta as any).env?.VITE_SUPABASE_ANON_KEY.includes('votre_cle')
);
