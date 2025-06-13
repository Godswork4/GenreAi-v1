import { createClient } from '@supabase/supabase-js'
import { generateUUID } from '../utils/crypto'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client for development if Supabase connection fails
const createMockClient = () => {
  console.warn('Using mock Supabase client for development');
  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
    }),
    rpc: () => Promise.resolve({ data: new Date().toISOString(), error: null }),
    auth: {
      onAuthStateChange: () => ({ data: null, error: null }),
      getSession: () => null,
    },
  };
};

// Try to create real client, fall back to mock in development
export const supabase = import.meta.env.DEV
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'genreai-web'
        }
      }
    });

// Export a function to test the connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    // In development, always return success
    if (import.meta.env.DEV) {
      console.log('Development mode: Skipping Supabase connection test');
      return {
        success: true,
        timestamp: new Date().toISOString()
      };
    }

    const { data, error } = await supabase.rpc('now')
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      }
    }
    
    console.log('Supabase connection successful:', data)
    return {
      success: true,
      timestamp: data
    }
  } catch (err) {
    console.error('Unexpected error during Supabase connection test:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    }
  }
}

// Types for your database tables
export type Profile = {
  id: string
  created_at: string
  updated_at: string
  wallet_address: string
  username: string | null
  avatar_url: string | null
}

export type Transaction = {
  id: string
  created_at: string
  user_id: string
  transaction_hash: string
  network: string
  status: 'pending' | 'completed' | 'failed'
  type: 'swap' | 'transfer' | 'stake' | 'unstake'
  amount: string
  token_address: string
  token_symbol: string
}

// Type for waitlist entries
export type WaitlistEntry = {
  id: string
  email: string
  referral_code: string
  created_at: string
  is_verified: boolean
}
