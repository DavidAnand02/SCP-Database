import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize if we have valid, non-empty credentials
const isValidConfig = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your_supabase_project_url')
);

export const supabase = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null as any;

if (!isValidConfig) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[SUPABASE] Configuration Missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined in the environment.');
  } else if (supabaseUrl.includes('your_supabase_project_url')) {
    console.warn('[SUPABASE] Placeholder Detected: VITE_SUPABASE_URL still contains the template placeholder.');
  } else {
    console.warn('[SUPABASE] Invalid URL: VITE_SUPABASE_URL must start with http/https.');
  }
} else {
  console.log('[SUPABASE] Connection Initialized Successfully.');
}
