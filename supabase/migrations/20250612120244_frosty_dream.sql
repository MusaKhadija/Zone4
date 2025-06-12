/*
  # Zone4 Database Schema Setup

  1. New Tables
    - `profiles` - Core user information for customers and BDC agents
    - `bdc_agents` - Specific details for licensed BDC agents  
    - `exchange_rates` - Exchange rates posted by BDC agents
    - `transactions` - Currency exchange transaction records
    - `disputes` - Transaction dispute management
    - `reviews` - Customer reviews for BDC agents

  2. Security
    - Enable RLS on all tables
    - Add policies for secure data access based on user roles and ownership
    - Ensure users can only access their own data or publicly viewable data

  3. Features
    - Enum types for status fields
    - JSONB for flexible recipient details storage
    - Proper foreign key relationships with cascade rules
    - Automatic timestamps for audit trails
*/

-- Create enum types
CREATE TYPE account_type AS ENUM ('customer', 'bdc_agent');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'physical_cash');
CREATE TYPE transaction_status AS ENUM (
  'pending_agent_offer', 
  'offer_accepted', 
  'funds_in_escrow', 
  'fx_transferred_by_agent', 
  'fx_received_by_customer', 
  'completed', 
  'cancelled', 
  'disputed'
);
CREATE TYPE escrow_status AS ENUM ('held', 'released_to_agent', 'returned_to_customer');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'escalated');

-- 1. Profiles table - Core user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone_number text UNIQUE NOT NULL,
  date_of_birth date NOT NULL,
  account_type account_type NOT NULL,
  nin text UNIQUE NOT NULL,
  bvn text UNIQUE NOT NULL,
  kyc_status kyc_status DEFAULT 'pending' NOT NULL,
  liveness_check_status kyc_status DEFAULT 'pending' NOT NULL,
  address_proof_status kyc_status DEFAULT 'pending' NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. BDC Agents table - Licensed agent details
CREATE TABLE IF NOT EXISTS bdc_agents (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  cbn_license_number text UNIQUE NOT NULL,
  company_address text NOT NULL,
  average_rating numeric DEFAULT 0.0,
  total_reviews integer DEFAULT 0,
  transactions_completed integer DEFAULT 0,
  last_active timestamptz,
  is_verified_agent boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Exchange Rates table - Agent posted rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES bdc_agents(id) ON DELETE CASCADE NOT NULL,
  currency_from text NOT NULL,
  currency_to text NOT NULL,
  rate numeric NOT NULL,
  min_amount numeric NOT NULL,
  max_amount numeric NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Transactions table - Exchange transaction records
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  agent_id uuid REFERENCES bdc_agents(id) ON DELETE RESTRICT NOT NULL,
  currency_from text NOT NULL,
  currency_to text NOT NULL,
  amount_sent numeric NOT NULL,
  amount_received numeric NOT NULL,
  agreed_rate numeric NOT NULL,
  zone4_fee numeric NOT NULL,
  payment_method_customer payment_method NOT NULL,
  recipient_details jsonb NOT NULL,
  status transaction_status NOT NULL,
  escrow_status escrow_status NOT NULL,
  dispute_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 5. Disputes table - Transaction dispute management
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE RESTRICT UNIQUE NOT NULL,
  reported_by_user_id uuid REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  issue_type text NOT NULL,
  description text NOT NULL,
  evidence_urls text[],
  status dispute_status DEFAULT 'open' NOT NULL,
  resolution text,
  resolved_by_admin_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 6. Reviews table - Customer reviews for agents
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES bdc_agents(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  transaction_id uuid REFERENCES transactions(id) ON DELETE RESTRICT UNIQUE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint for disputes in transactions
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_dispute_id 
FOREIGN KEY (dispute_id) REFERENCES disputes(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_bdc_agents_verified ON bdc_agents(is_verified_agent);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active ON exchange_rates(is_active);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(currency_from, currency_to);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_agent ON transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_reviews_agent ON reviews(agent_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bdc_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for bdc_agents table
CREATE POLICY "Anyone can read agent profiles"
  ON bdc_agents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Agents can update own profile"
  ON bdc_agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "BDC agents can insert own profile"
  ON bdc_agents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND account_type = 'bdc_agent'
    )
  );

-- RLS Policies for exchange_rates table
CREATE POLICY "Anyone can read active exchange rates"
  ON exchange_rates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Agents can manage own rates"
  ON exchange_rates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bdc_agents 
      WHERE id = agent_id AND id = auth.uid()
    )
  );

-- RLS Policies for transactions table
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = customer_id OR 
    auth.uid() = agent_id
  );

CREATE POLICY "Customers can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Transaction participants can update"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = customer_id OR 
    auth.uid() = agent_id
  );

-- RLS Policies for disputes table
CREATE POLICY "Users can read own disputes"
  ON disputes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reported_by_user_id);

CREATE POLICY "Users can create own disputes"
  ON disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by_user_id);

CREATE POLICY "Users can update own disputes"
  ON disputes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reported_by_user_id);

-- RLS Policies for reviews table
CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can create reviews for completed transactions"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE id = transaction_id 
      AND customer_id = auth.uid() 
      AND status = 'completed'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bdc_agents_updated_at 
  BEFORE UPDATE ON bdc_agents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_rates_updated_at 
  BEFORE UPDATE ON exchange_rates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at 
  BEFORE UPDATE ON disputes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();