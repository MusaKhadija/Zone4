import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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