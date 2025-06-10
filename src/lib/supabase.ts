import { createClient } from '@supabase/supabase-js'
import { generateUUID } from '../utils/crypto'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Configure Supabase client with custom ID generator
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

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
export interface WaitlistEntry {
  id: string
  email: string
  referral_code: string
  created_at: string
  is_verified: boolean
}
