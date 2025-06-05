import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      storageKey: 'adhok_auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
  }
);

// Optional: Attach supabase to window for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

/**
 * Optional helper to make direct Supabase REST requests with logging.
 * Use this for custom fetch requests that hit Supabase endpoints directly.
 */
export async function fetchWithSupabase(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    let errorBody = {};
    try {
      errorBody = await response.json();
    } catch (_) {
      errorBody = { message: 'Could not parse error JSON' };
    }

    console.error('Supabase request failed', {
      status: response.status,
      statusText: response.statusText,
      error: errorBody,
    });
  }
  return response;
}