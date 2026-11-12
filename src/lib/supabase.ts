import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
// Clean up any trailing /rest/v1 or /rest/v1/ that might be pasted from Supabase API docs
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim() || 'https://placeholder.supabase.co';
export const supabaseAnonKey =
  ((import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '').trim() || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    supabaseAnonKey &&
    !rawUrl.includes('placeholder.supabase.co') &&
    !supabaseAnonKey.includes('placeholder-anon-key')
);

if (!isSupabaseConfigured) {
  console.warn('Supabase env vars are missing — local fallback storage will be used.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Non-blocking keepalive ping to prevent Supabase Free Tier project auto-pausing.
 * Fires in the background without blocking render.
 */
export async function pingSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('courses').select('id', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

// Background keepalive invocation
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  setTimeout(() => {
    pingSupabase().catch(() => {});
  }, 2000);
}
