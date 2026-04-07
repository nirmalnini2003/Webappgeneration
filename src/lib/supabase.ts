import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION & RUNTIME LOGGING
// ============================================================================

// CRITICAL: Get Supabase configuration from environment variables
// These MUST be prefixed with VITE_ to be available in the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Check if Supabase is configured with real credentials
export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  !supabaseUrl?.includes('your-project') &&
  !supabaseUrl?.includes('placeholder');

// CRITICAL: Runtime validation - logs configuration status for debugging production issues
// This helps identify if environment variables were properly embedded during build
if (!isSupabaseConfigured) {
  console.group('❌ Supabase Configuration Error');
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'PROVIDED (hidden)' : 'MISSING');
  console.error('Environment mode:', import.meta.env.MODE);
  console.error('All env vars:', Object.keys(import.meta.env));
  console.groupEnd();
  console.error(
    '🚨 SUPABASE NOT CONFIGURED!\n' +
    'For local dev: Create .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
    'For GitHub Pages: Add secrets in Settings → Secrets and variables → Actions'
  );
} else {
  // Success - log configuration confirmation
  console.group('✅ Supabase Configuration');
  console.log('Environment:', import.meta.env.MODE);
  console.log('URL:', supabaseUrl);
  console.log('Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
  console.groupEnd();
}

// Create Supabase client with fallback values for development
// This allows the app to build even without Supabase configured
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    // Disable all automatic auth features when not configured to prevent network calls
    autoRefreshToken: isSupabaseConfigured,
    persistSession: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
    storage: isSupabaseConfigured ? window.localStorage : undefined,
    storageKey: 'bnri-auth-token',
  },
  global: {
    headers: isSupabaseConfigured ? {} : { 'X-Skip-Request': 'true' },
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
