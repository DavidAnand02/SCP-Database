import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Only initialize if we have valid, non-empty credentials
const isValidConfig = supabaseUrl && 
                     supabaseAnonKey && 
                     supabaseUrl.startsWith('http') &&
                     !supabaseUrl.includes('your_supabase_project_url');

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
    console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
  } else if (supabaseUrl.includes('your_supabase_project_url')) {
    console.warn('Supabase URL appears to be a placeholder. Please update VITE_SUPABASE_URL with your actual project URL.');
  } else {
    console.warn('Supabase configuration is invalid. URL must start with http/https.');
  }
}
