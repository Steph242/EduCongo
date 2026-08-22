import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_NAME = 'Edu-Congo';
export const SUPABASE_PROJECT_ID = 'hvjavqbpmdfdqdvunbsj';
export const SUPABASE_DEFAULT_URL = 'https://hvjavqbpmdfdqdvunbsj.supabase.co';
export const SUPABASE_DEFAULT_ANON_KEY =
  'sb_publishable_tGgcQloCGp6pd-QdqQgi7g_usuQW1yW';

/**
 * Robustly sanitizes the base Supabase URL to protocol + hostname
 * (strips any `/rest/v1`, `/auth/v1`, trailing slashes, etc.)
 */
function sanitizeSupabaseUrl(inputUrl?: string): string {
  const fallback = SUPABASE_DEFAULT_URL;
  if (!inputUrl || typeof inputUrl !== 'string') return fallback;
  try {
    const trimmed = inputUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return fallback;
    }
    const parsed = new URL(trimmed);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return fallback;
  }
}

const rawUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || SUPABASE_DEFAULT_URL;

const supabaseUrl = sanitizeSupabaseUrl(rawUrl);

const supabaseAnonKey = (
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY
).trim();

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

