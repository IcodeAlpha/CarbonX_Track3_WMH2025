-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  wallet_address TEXT,
  balance DECIMAL(10, 2) DEFAULT 1000.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create carbon credits table
CREATE TABLE public.carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL, -- reforestation, renewable, conservation
  description TEXT,
  location TEXT,
  vintage INTEGER, -- year of carbon reduction
  total_tonnes DECIMAL(10, 2) NOT NULL,
  available_tonnes DECIMAL(10, 2) NOT NULL,
  price_per_tonne DECIMAL(10, 2) NOT NULL,
  verification_standard TEXT, -- Verra, Gold Standard, etc
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.carbon_credits ENABLE ROW LEVEL SECURITY;

-- Anyone can view credits
CREATE POLICY "Anyone can view carbon credits"
  ON public.carbon_credits FOR SELECT
  USING (true);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credit_id UUID REFERENCES public.carbon_credits(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL, -- buy or sell
  tonnes DECIMAL(10, 2) NOT NULL,
  price_per_tonne DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create verification projects table
CREATE TABLE public.verification_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  expected_tonnes DECIMAL(10, 2) NOT NULL,
  document_url TEXT,
  ai_impact_score DECIMAL(3, 2), -- mock score between 0-1
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.verification_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification projects"
  ON public.verification_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification projects"
  ON public.verification_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert sample carbon credits
INSERT INTO public.carbon_credits (project_name, project_type, description, location, vintage, total_tonnes, available_tonnes, price_per_tonne, verification_standard, image_url) VALUES
('Amazon Rainforest Preservation', 'reforestation', 'Protecting 50,000 hectares of primary rainforest in the Brazilian Amazon', 'Amazon Basin, Brazil', 2024, 150000, 145000, 25.50, 'Verra VCS', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5'),
('Wind Farm Development', 'renewable', 'Offshore wind farm generating clean energy for 100,000 homes', 'North Sea, UK', 2023, 80000, 75000, 32.00, 'Gold Standard', 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51'),
('Mangrove Restoration', 'conservation', 'Restoring coastal mangrove ecosystems in Southeast Asia', 'Philippines', 2024, 45000, 40000, 28.75, 'Plan Vivo', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19'),
('Solar Power Initiative', 'renewable', 'Large-scale solar installation replacing coal-fired power', 'Rajasthan, India', 2023, 120000, 115000, 30.00, 'Gold Standard', 'https://images.unsplash.com/photo-1509391366360-2e959784a276'),
('Forest Reforestation Program', 'reforestation', 'Planting native species across degraded forestland', 'Kenya', 2024, 65000, 60000, 22.00, 'Verra VCS', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09');

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();