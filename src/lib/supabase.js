import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE flow: tokens are exchanged securely, never appear in the URL
    flowType: 'pkce',
    // Automatically detect and exchange the auth code from the URL
    detectSessionInUrl: true,
    // Store session in localStorage (default, secure for SPA)
    persistSession: true,
    // Redirect to clean URL after OAuth (removes hash tokens from address bar)
    autoRefreshToken: true,
  }
})

// Export utility functions for common operations
export const supabaseAuth = supabase.auth
export const supabaseDatabase = supabase.from
