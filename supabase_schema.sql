-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (For users logging in with Phone)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Barbers Table
CREATE TABLE public.barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  salon_name TEXT NOT NULL,
  address TEXT NOT NULL,
  distance NUMERIC(5,2),
  rating NUMERIC(3,1) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  main_image TEXT,
  gallery TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Services Table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Appointments Table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- e.g., '2023-11-20'
  time TEXT NOT NULL, -- e.g., '10:00 AM'
  status TEXT DEFAULT 'Confirmed', -- 'Pending', 'Confirmed', 'Completed', 'Cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Reviews Table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to public data (barbers, services, reviews)
CREATE POLICY "Barbers are viewable by everyone" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

-- Allow users to manage their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow users to manage their own appointments
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to insert reviews
CREATE POLICY "Users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- INSERT MOCK DATA
-- ==========================================

-- Insert some mock barbers
INSERT INTO public.barbers (id, name, salon_name, address, distance, rating, reviews, main_image, gallery)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111', 
    'Ahmed Youssef', 
    'The Gentleman Lounge', 
    'Zamalek, Cairo', 
    1.2, 
    4.8, 
    120, 
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop']
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'Karim Hassan', 
    'Urban Cuts Studio', 
    'Maadi, Cairo', 
    2.5, 
    4.9, 
    340, 
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop']
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'Mostafa Ali', 
    'Classic Barber Co.', 
    'Heliopolis, Cairo', 
    3.1, 
    4.6, 
    85, 
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1583592398553-625d97f8c055?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop']
  );

-- Insert services for the barbers
INSERT INTO public.services (barber_id, name, duration, price)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Haircut', '30 min', 15.00),
  ('11111111-1111-1111-1111-111111111111', 'Hair & Beard', '45 min', 25.00),
  ('11111111-1111-1111-1111-111111111111', 'VIP Cut', '60 min', 40.00),
  ('22222222-2222-2222-2222-222222222222', 'Haircut', '30 min', 20.00),
  ('22222222-2222-2222-2222-222222222222', 'Hair & Beard', '45 min', 30.00),
  ('33333333-3333-3333-3333-333333333333', 'Classic Cut', '30 min', 12.00);
