-- ============================================
-- CarbonX Database Setup for Supabase Dashboard
-- ============================================
-- Run this entire file in Supabase Dashboard > SQL Editor
-- Execute in order, section by section
-- ============================================

-- ============================================
-- SECTION 1: Enable UUID Extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SECTION 2: Create Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  wallet_address TEXT,
  balance DECIMAL(10, 2) DEFAULT 1000.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- SECTION 3: Create Helper Functions
-- ============================================
-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- ============================================
-- SECTION 4: Create Triggers
-- ============================================
-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SECTION 5: Create Carbon Credits Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.carbon_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  vintage INT,
  total_tonnes NUMERIC(10,2),
  available_tonnes NUMERIC(10,2),
  price_per_tonne NUMERIC(10,2),
  verification_standard TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Additional columns from later migration
  contributor_id uuid REFERENCES auth.users(id),
  verification_date timestamp with time zone,
  blockchain_hash text,
  verification_method text,
  impact_metrics jsonb,
  status text DEFAULT 'pending'
);

-- Insert sample carbon credit projects
INSERT INTO public.carbon_credits (
  project_name, 
  project_type, 
  description, 
  location, 
  vintage, 
  total_tonnes, 
  available_tonnes, 
  price_per_tonne, 
  verification_standard,
  image_url
) VALUES
(
  'Kisumu Clean Cookstove Distribution',
  'clean_cooking',
  'Distribution of 5,000 improved cookstoves to rural households in Kisumu County, reducing indoor air pollution and deforestation. Each stove saves approximately 2.5 tonnes CO2e annually.',
  'Kisumu County, Kenya',
  2024,
  12500,
  8200,
  8.50,
  'Gold Standard',
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800'
),
(
  'Nairobi Solar Home Systems',
  'solar_energy',
  'Installation of 3,000 solar home systems in peri-urban Nairobi communities, providing clean electricity access and eliminating kerosene lamp usage.',
  'Nairobi, Kenya',
  2024,
  9000,
  6500,
  12.00,
  'Verra VCS',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'
),
(
  'Mombasa Solar Water Pumps',
  'solar_energy',
  'Solar-powered water pumping systems for 25 farming cooperatives in coastal Kenya, replacing diesel pumps and enabling sustainable irrigation.',
  'Mombasa County, Kenya',
  2024,
  4200,
  3800,
  11.00,
  'Verra VCS',
  'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800'
),
(
  'Kakamega Community Reforestation',
  'reforestation',
  'Native tree planting initiative across 800 hectares in Kakamega Forest buffer zones, engaging 200 local families in agroforestry practices.',
  'Kakamega County, Kenya',
  2023,
  15000,
  12000,
  6.50,
  'Plan Vivo',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'
),
(
  'Nakuru Efficient Charcoal Stoves',
  'clean_cooking',
  'Distribution of 8,000 efficient charcoal stoves in Nakuru informal settlements, reducing charcoal consumption by 50% per household.',
  'Nakuru County, Kenya',
  2024,
  18000,
  15000,
  7.50,
  'Gold Standard',
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800'
),
(
  'Garissa Solar Mini-Grids',
  'solar_energy',
  'Three solar mini-grids serving remote villages in Garissa, providing electricity to 1,500 households and local businesses.',
  'Garissa County, Kenya',
  2024,
  7500,
  5000,
  13.50,
  'Verra VCS',
  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SECTION 6: Create Individual Contributions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.individual_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  contribution_type text NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  start_date date,
  verification_status text DEFAULT 'pending',
  verification_method text,
  blockchain_hash text,
  impact_metrics jsonb,
  photo_urls text[],
  coordinates jsonb, 
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone
);

-- Enable RLS on individual_contributions
ALTER TABLE public.individual_contributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own contributions" ON public.individual_contributions;
DROP POLICY IF EXISTS "Users can create their own contributions" ON public.individual_contributions;
DROP POLICY IF EXISTS "Users can update their own contributions" ON public.individual_contributions;
DROP POLICY IF EXISTS "Anyone can view verified contributions" ON public.individual_contributions;

-- RLS policies for individual_contributions
CREATE POLICY "Users can view their own contributions"
ON public.individual_contributions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contributions"
ON public.individual_contributions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions"
ON public.individual_contributions
FOR UPDATE
USING (auth.uid() = user_id);

-- Public viewing of verified contributions
CREATE POLICY "Anyone can view verified contributions"
ON public.individual_contributions
FOR SELECT
USING (verification_status = 'verified');

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_individual_contributions_updated_at ON public.individual_contributions;
CREATE TRIGGER update_individual_contributions_updated_at
BEFORE UPDATE ON public.individual_contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SECTION 7: Create Contribution Likes Table
-- ============================================
-- Note: This references individual_contributions, not contributions
CREATE TABLE IF NOT EXISTS public.contribution_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID REFERENCES public.individual_contributions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contribution_id, user_id)
);

-- Enable RLS on contribution_likes
ALTER TABLE public.contribution_likes ENABLE ROW LEVEL SECURITY;

-- Policies for contribution_likes
DROP POLICY IF EXISTS "Users can view all likes" ON public.contribution_likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.contribution_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.contribution_likes;

CREATE POLICY "Users can view all likes"
ON public.contribution_likes
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own likes"
ON public.contribution_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.contribution_likes
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- SECTION 8: Create Verification Projects Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.verification_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  project_name text NOT NULL,
  project_type text NOT NULL,
  expected_tonnes numeric NOT NULL,
  description text,
  location text,
  document_url text,
  ai_impact_score numeric,
  verification_method text,
  blockchain_hash text,
  verification_date timestamp with time zone,
  impact_metrics jsonb,
  photo_urls text[],
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on verification_projects
ALTER TABLE public.verification_projects ENABLE ROW LEVEL SECURITY;

-- Policies for verification_projects
DROP POLICY IF EXISTS "Users can view their own verification projects" ON public.verification_projects;
DROP POLICY IF EXISTS "Users can create their own verification projects" ON public.verification_projects;
DROP POLICY IF EXISTS "Users can update their own verification projects" ON public.verification_projects;

CREATE POLICY "Users can view their own verification projects"
ON public.verification_projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification projects"
ON public.verification_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification projects"
ON public.verification_projects
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- SECTION 9: Enable Realtime for Contributions
-- ============================================
-- Enable realtime for individual_contributions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.individual_contributions;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Go to Settings > API to get your credentials
-- 2. Update your .env file with:
--    VITE_SUPABASE_URL=https://your-project.supabase.co
--    VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
-- 3. Restart your dev server
-- ============================================

