-- Customer profiles table
CREATE TABLE customer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  
  -- Address Information
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Colombia',
  
  -- Identification
  id_document_type TEXT CHECK (id_document_type IN ('cedula', 'licencia', 'pasaporte', 'prefer_not_to_say')) DEFAULT 'prefer_not_to_say',
  id_document_number TEXT,
  
  -- Preferences
  marketing_emails BOOLEAN DEFAULT true,
  notifications BOOLEAN DEFAULT true
);

-- Customer points table
CREATE TABLE customer_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Points information
  points_earned INTEGER NOT NULL DEFAULT 0,
  points_used INTEGER NOT NULL DEFAULT 0,
  current_balance INTEGER GENERATED ALWAYS AS (points_earned - points_used) STORED,
  
  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  transaction_reference TEXT, -- Order ID, promo code, etc.
  description TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for customer_profiles updated_at
CREATE TRIGGER update_customer_profiles_updated_at 
    BEFORE UPDATE ON customer_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_points ENABLE ROW LEVEL SECURITY;

-- Policies for customer_profiles
CREATE POLICY "Users can view their own profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for customer_points
CREATE POLICY "Users can view their own points" ON customer_points
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_profiles 
      WHERE customer_profiles.id = customer_points.customer_id 
      AND customer_profiles.user_id = auth.uid()
    )
  );

-- Allow system to create points (for when purchases are made)
CREATE POLICY "System can create points" ON customer_points
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_customer_points_customer_id ON customer_points(customer_id);
CREATE INDEX idx_customer_points_created_at ON customer_points(created_at);

-- View for customer points summary (Views inherit RLS from base tables)
CREATE VIEW customer_points_summary AS
SELECT 
  cp.id as customer_id,
  cp.user_id,
  cp.first_name,
  cp.last_name,
  COALESCE(SUM(CASE WHEN cpt.transaction_type = 'earned' THEN cpt.points_earned ELSE 0 END), 0) as total_earned,
  COALESCE(SUM(CASE WHEN cpt.transaction_type = 'redeemed' THEN cpt.points_used ELSE 0 END), 0) as total_used,
  COALESCE(SUM(CASE WHEN cpt.transaction_type = 'earned' THEN cpt.points_earned ELSE 0 END) - 
           SUM(CASE WHEN cpt.transaction_type = 'redeemed' THEN cpt.points_used ELSE 0 END), 0) as current_balance
FROM customer_profiles cp
LEFT JOIN customer_points cpt ON cp.id = cpt.customer_id
GROUP BY cp.id, cp.user_id, cp.first_name, cp.last_name;