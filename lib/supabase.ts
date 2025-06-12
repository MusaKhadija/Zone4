import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Check if environment variables are properly set and valid
const hasValidConfig = supabaseUrl && 
  supabaseAnonKey && 
  isValidUrl(supabaseUrl) && 
  !supabaseUrl.includes('your_supabase_project_url_here') &&
  !supabaseAnonKey.includes('your_supabase_anon_key_here')

if (!hasValidConfig) {
  if (!supabaseUrl || supabaseUrl.includes('your_supabase_project_url_here')) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not set or contains placeholder value. Please add your actual Supabase URL to your .env.local file.')
  }
  
  if (!supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key_here')) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or contains placeholder value. Please add your actual Supabase anon key to your .env.local file.')
  }
  
  if (supabaseUrl && !isValidUrl(supabaseUrl)) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not a valid URL format. Please check your .env.local file.')
  }
}

// Create a comprehensive mock query builder that supports all method chaining
const createMockQueryBuilder = (): any => {
  const mockResult = Promise.resolve({ data: [], error: null, count: 0 })
  
  const mockBuilder: any = {
    // Selection methods
    select: () => mockBuilder,
    
    // Filter methods - all return mockBuilder for chaining
    eq: () => mockBuilder,
    neq: () => mockBuilder,
    gt: () => mockBuilder,
    gte: () => mockBuilder,
    lt: () => mockBuilder,
    lte: () => mockBuilder,
    like: () => mockBuilder,
    ilike: () => mockBuilder,
    is: () => mockBuilder,
    in: () => mockBuilder,
    contains: () => mockBuilder,
    containedBy: () => mockBuilder,
    rangeGt: () => mockBuilder,
    rangeGte: () => mockBuilder,
    rangeLt: () => mockBuilder,
    rangeLte: () => mockBuilder,
    rangeAdjacent: () => mockBuilder,
    overlaps: () => mockBuilder,
    textSearch: () => mockBuilder,
    match: () => mockBuilder,
    not: () => mockBuilder,
    or: () => mockBuilder,
    filter: () => mockBuilder,
    
    // Ordering and limiting
    order: () => mockBuilder,
    limit: () => mockBuilder,
    range: () => mockBuilder,
    
    // Terminal methods that return promises
    single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    
    // Make it thenable so it can be awaited directly
    then: (resolve: any) => mockResult.then(resolve),
    catch: (reject: any) => mockResult.catch(reject)
  }
  
  return mockBuilder
}

// Create a mock client if environment variables are missing or invalid (for development)
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    mfa: {
      listFactors: () => Promise.resolve({ data: { totp: [] }, error: null }),
      enroll: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      unenroll: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
    }
  },
  from: () => ({
    select: () => createMockQueryBuilder(),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      })
    }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    delete: () => createMockQueryBuilder()
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  channel: () => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => {} })
    })
  })
})

// Export the Supabase client (real or mock)
export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()

// Types for our database
export interface Profile {
  id: string
  full_name: string
  email: string
  phone_number: string
  date_of_birth: string
  account_type: 'customer' | 'bdc_agent'
  nin: string
  bvn: string
  kyc_status: 'pending' | 'verified' | 'rejected'
  liveness_check_status: 'pending' | 'verified' | 'rejected'
  address_proof_status: 'pending' | 'verified' | 'rejected'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BDCAgent {
  id: string
  company_name: string
  cbn_license_number: string
  company_address: string
  average_rating: number
  total_reviews: number
  transactions_completed: number
  last_active: string
  is_verified_agent: boolean
  created_at: string
  updated_at: string
}

export interface ExchangeRate {
  id: string
  agent_id: string
  currency_from: string
  currency_to: string
  rate: number
  min_amount: number
  max_amount: number
  is_active: boolean
  created_at: string
  updated_at: string
  bdc_agents?: BDCAgent
}

export interface Transaction {
  id: string
  customer_id: string
  agent_id: string
  currency_from: string
  currency_to: string
  amount_sent: number
  amount_received: number
  agreed_rate: number
  zone4_fee: number
  payment_method_customer: 'bank_transfer' | 'physical_cash'
  recipient_details: any
  status: 'pending_agent_offer' | 'offer_accepted' | 'funds_in_escrow' | 'fx_transferred_by_agent' | 'fx_received_by_customer' | 'completed' | 'cancelled' | 'disputed'
  escrow_status: 'held' | 'released_to_agent' | 'returned_to_customer'
  dispute_id?: string
  created_at: string
  updated_at: string
  bdc_agents?: BDCAgent
}

export interface Dispute {
  id: string
  transaction_id: string
  reported_by_user_id: string
  issue_type: string
  description: string
  evidence_urls: string[]
  status: 'open' | 'under_review' | 'resolved' | 'escalated'
  resolution?: string
  resolved_by_admin_id?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  agent_id: string
  customer_id: string
  transaction_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface AuthError {
  message: string
  status?: number
}