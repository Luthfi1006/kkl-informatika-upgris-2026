-- =====================================================
-- KKL INFORMATIKA UPGRIS 2026 - DATABASE SCHEMA
-- Copy seluruh SQL ini ke Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  site_title TEXT NOT NULL,
  tagline TEXT,
  dates TEXT,
  subtext TEXT,
  destination_title TEXT,
  countdown_start TIMESTAMP WITH TIME ZONE,
  logo_url TEXT,
  admin_pin_hash TEXT NOT NULL DEFAULT crypt('upgris2026', gen_salt('bf')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings (only if table is empty)
INSERT INTO settings (site_title, tagline, dates, subtext, destination_title, countdown_start, logo_url)
SELECT 
  'KKL Informatika UPGRIS 2026',
  'Satu Perjalanan. Seribu Kenangan.',
  '18–22 Agustus 2026',
  'Portal resmi dokumentasi Kuliah Kerja Lapangan Program Studi Informatika Universitas PGRI Semarang 2026 ke Pulau Dewata Bali.',
  'Semarang → Bali',
  '2026-08-18 06:00:00+07'::TIMESTAMP WITH TIME ZONE,
  'assets/uploads/branding/logo.png'
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- Table: destinations
CREATE TABLE IF NOT EXISTS destinations (
  id BIGSERIAL PRIMARY KEY,
  day_no INT NOT NULL,
  name TEXT NOT NULL,
  time TEXT,
  category TEXT NOT NULL,
  route TEXT,
  lat NUMERIC,
  lng NUMERIC,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: gallery
CREATE TABLE IF NOT EXISTS gallery (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: videos
CREATE TABLE IF NOT EXISTS videos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: feedback
CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read settings" ON settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON settings;
DROP POLICY IF EXISTS "Public can read destinations" ON destinations;
DROP POLICY IF EXISTS "Anyone can manage destinations" ON destinations;
DROP POLICY IF EXISTS "Public can read profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Public can read gallery" ON gallery;
DROP POLICY IF EXISTS "Anyone can manage gallery" ON gallery;
DROP POLICY IF EXISTS "Public can read videos" ON videos;
DROP POLICY IF EXISTS "Anyone can manage videos" ON videos;
DROP POLICY IF EXISTS "Public can read feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can create feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can delete feedback" ON feedback;

-- RLS Policies: Public READ, Anyone can WRITE (for MVP - tighten later)
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON settings FOR UPDATE USING (true);

CREATE POLICY "Public can read destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Anyone can manage destinations" ON destinations FOR ALL USING (true);

CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can manage profiles" ON profiles FOR ALL USING (true);

CREATE POLICY "Public can read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Anyone can manage gallery" ON gallery FOR ALL USING (true);

CREATE POLICY "Public can read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Anyone can manage videos" ON videos FOR ALL USING (true);

CREATE POLICY "Public can read feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can create feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete feedback" ON feedback FOR DELETE USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_destinations_day ON destinations(day_no, sort_order);
CREATE INDEX IF NOT EXISTS idx_profiles_sort ON profiles(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery(sort_order);
CREATE INDEX IF NOT EXISTS idx_videos_sort ON videos(sort_order);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Database schema created successfully!'; 
END $$;
