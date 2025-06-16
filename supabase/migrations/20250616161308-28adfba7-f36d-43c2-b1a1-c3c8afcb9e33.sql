
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create user sessions table to store chat conversations
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_data JSONB,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit cards table to store dynamic card data
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  image TEXT,
  joining_fee INTEGER DEFAULT 0,
  annual_fee INTEGER DEFAULT 0,
  reward_type TEXT,
  reward_rate TEXT,
  eligibility TEXT[],
  special_perks TEXT[],
  apply_link TEXT,
  category TEXT,
  min_income INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample credit cards data
INSERT INTO public.credit_cards (name, issuer, image, joining_fee, annual_fee, reward_type, reward_rate, eligibility, special_perks, apply_link, category, min_income) VALUES
('SBI SimplyCLICK Credit Card', 'State Bank of India', '/placeholder.svg', 499, 499, 'Cashback', '5% on online shopping, 1% on others', ARRAY['Age 21-60 years', 'Monthly income ₹15,000+'], ARRAY['5% cashback on online shopping', 'Fuel surcharge waiver', 'Welcome bonus'], 'https://www.sbi.co.in', 'Shopping', 15000),
('HDFC Regalia Credit Card', 'HDFC Bank', '/placeholder.svg', 2500, 2500, 'Reward Points', '4 points per ₹150 spent', ARRAY['Age 21-60 years', 'Monthly income ₹25,000+'], ARRAY['Airport lounge access', 'Travel insurance', 'Dining privileges'], 'https://www.hdfcbank.com', 'Premium', 25000),
('ICICI Amazon Pay Credit Card', 'ICICI Bank', '/placeholder.svg', 0, 0, 'Cashback', '5% on Amazon, 2% on others', ARRAY['Age 18-65 years', 'Monthly income ₹12,000+'], ARRAY['Prime membership benefits', 'Instant discounts', 'Welcome gift'], 'https://www.icicibank.com', 'Shopping', 12000),
('Axis Bank MY ZONE Credit Card', 'Axis Bank', '/placeholder.svg', 500, 500, 'Cashback', '2% on all spends', ARRAY['Age 18-60 years', 'Monthly income ₹15,000+'], ARRAY['Movie ticket discounts', 'Dining offers', 'Fuel benefits'], 'https://www.axisbank.com', 'Lifestyle', 15000),
('Kotak 811 #Dream Different Credit Card', 'Kotak Mahindra Bank', '/placeholder.svg', 0, 499, 'Reward Points', '1 point per ₹100 spent', ARRAY['Age 18-65 years', 'Monthly income ₹10,000+'], ARRAY['Lifestyle benefits', 'Online shopping offers', 'Welcome bonus'], 'https://www.kotak.com', 'Entry Level', 10000);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for credit_cards (public read access)
CREATE POLICY "Anyone can view active credit cards" ON public.credit_cards
  FOR SELECT USING (is_active = true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
