import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_NAME = 'Edu-Congo';
export const SUPABASE_PROJECT_ID = 'hvjavqbpmdfdqdvunbsj';
export const SUPABASE_DEFAULT_URL = 'https://hvjavqbpmdfdqdvunbsj.supabase.co';
export const SUPABASE_DEFAULT_ANON_KEY =
  'sb_publishable_tGgcQloCGp6pd-QdqQgi7g_usuQW1yW';

const rawUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || SUPABASE_DEFAULT_URL;

// Normalize URL: clean any trailing `/rest/v1` or trailing slashes
const supabaseUrl = (rawUrl || SUPABASE_DEFAULT_URL)
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseLiveConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('votre_cle')
);
