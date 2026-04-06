import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured with real credentials
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  !supabaseUrl.includes('your-project');

// Create Supabase client with fallback values for development
// This allows the app to build even without Supabase configured
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'bnri-auth-token',
  },
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any, context: string = 'Operation') {
  // Don't log or throw if Supabase isn't configured
  if (!isSupabaseConfigured) {
    return;
  }

  console.error(`${context} error:`, error);

  if (error?.message) {
    throw new Error(`${context} failed: ${error.message}`);
  }

  throw new Error(`${context} failed with unknown error`);
}

// Check if Supabase is properly configured
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
}
