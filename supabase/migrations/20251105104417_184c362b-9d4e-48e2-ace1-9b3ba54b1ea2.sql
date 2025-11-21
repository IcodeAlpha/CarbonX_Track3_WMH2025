
-- Update carbon_credits to be a verified contributions ledger
ALTER TABLE public.carbon_credits
ADD COLUMN IF NOT EXISTS contributor_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS blockchain_hash text,
ADD COLUMN IF NOT EXISTS verification_method text,
ADD COLUMN IF NOT EXISTS impact_metrics jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update verification_projects for all contribution types
ALTER TABLE public.verification_projects
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS verification_method text,
ADD COLUMN IF NOT EXISTS blockchain_hash text,
ADD COLUMN IF NOT EXISTS verification_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS impact_metrics jsonb,
ADD COLUMN IF NOT EXISTS photo_urls text[];

-- Create individual_contributions table for personal projects
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
  coordinates jsonb, -- <--- Add this line
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone
);

-- Enable RLS on individual_contributions
ALTER TABLE public.individual_contributions ENABLE ROW LEVEL SECURITY;

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
CREATE TRIGGER update_individual_contributions_updated_at
BEFORE UPDATE ON public.individual_contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();