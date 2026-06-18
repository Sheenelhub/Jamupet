import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Explicitly use implicit flow for SPAs because PKCE verifier can be lost on mobile redirects
    flowType: 'implicit',
    // detectSessionInUrl: picks up tokens from the URL hash after OAuth redirect
    detectSessionInUrl: true,
    // Persist session in localStorage across page reloads
    persistSession: true,
    // Automatically refresh tokens before they expire
    autoRefreshToken: true,
  }
})

// Export utility functions for common operations
export const supabaseAuth = supabase.auth
export const supabaseDatabase = supabase.from
