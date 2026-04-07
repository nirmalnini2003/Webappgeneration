import { isSupabaseConfigured } from './supabase';

/**
 * Suppress console errors related to Supabase when it's not configured
 * This prevents cluttering the console with expected "Failed to fetch" errors
 */
export function suppressUnconfiguredErrors() {
  if (isSupabaseConfigured) {
    return; // Don't suppress errors when Supabase is properly configured
  }

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error to filter out Supabase-related errors
  console.error = (...args: any[]) => {
    const message = args.join(' ');

    // Suppress these error patterns when Supabase is not configured
    const suppressPatterns = [
      'Failed to fetch',
      'fetch',
      'NetworkError',
      'TypeError: NetworkError',
      'supabase',
      'auth',
      'placeholder.supabase.co',
      'Authentication',
      'Unable to connect',
    ];

    const shouldSuppress = suppressPatterns.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  // Override console.warn to filter out Supabase-related warnings
  console.warn = (...args: any[]) => {
    const message = args.join(' ');

    const suppressPatterns = [
      'supabase',
      'placeholder.supabase.co',
    ];

    const shouldSuppress = suppressPatterns.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Suppress unhandled promise rejections from failed fetch calls
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);

    const suppressPatterns = [
      'Failed to fetch',
      'fetch',
      'NetworkError',
      'supabase',
      'placeholder.supabase.co',
    ];

    const shouldSuppress = suppressPatterns.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (shouldSuppress) {
      event.preventDefault(); // Prevent the error from appearing in console
    }
  });
}
