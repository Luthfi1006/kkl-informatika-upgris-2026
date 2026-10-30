# 🚀 SETUP SUPABASE REAL-TIME DATABASE
## KKL Informatika UPGRIS 2026 - Production Ready Guide

---

## 📋 RINGKASAN FITUR YANG AKAN DIDAPAT

✅ **Real-time sync** - Edit langsung terlihat semua orang  
✅ **File upload** - Upload foto langsung ke cloud  
✅ **Gratis selamanya** - Supabase free tier 500MB storage  
✅ **Role-based access** - PIN admin untuk keamanan  
✅ **Auto backup** - Database tersimpan aman di cloud  
✅ **Mobile friendly** - Akses admin dari HP  

---

## 🎯 TAHAP 1: SETUP SUPABASE (15 Menit)

### Step 1: Buat Akun Supabase
1. Buka https://supabase.com
2. Klik **Start your project**
3. Sign up dengan GitHub (recommended) atau email
4. Gratis selamanya, tidak perlu kartu kredit

### Step 2: Create New Project
1. Klik **New Project**
2. Isi:
   - **Name:** `kkl-informatika-upgris-2026`
   - **Database Password:** (simpan password ini!)
   - **Region:** Southeast Asia (Singapore)
3. Klik **Create new project**
4. Tunggu 2-3 menit sampai setup selesai

### Step 3: Dapatkan API Credentials
1. Di dashboard Supabase, klik **Settings** (gear icon)
2. Klik **API**
3. Copy 2 values ini:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (long string)
4. SIMPAN di file .env (next step)

---

## 🗄️ TAHAP 2: CREATE DATABASE SCHEMA (10 Menit)

### Step 1: Buka SQL Editor
1. Di dashboard Supabase, klik **SQL Editor**
2. Klik **New query**

### Step 2: Copy-Paste SQL Schema Berikut:

```sql
-- =====================================================
-- KKL INFORMATIKA UPGRIS 2026 - DATABASE SCHEMA
-- =====================================================

-- Table: settings
CREATE TABLE settings (
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

-- Insert default settings
INSERT INTO settings (site_title, tagline, dates, subtext, destination_title, countdown_start, logo_url)
VALUES (
  'KKL Informatika UPGRIS 2026',
  'Satu Perjalanan. Seribu Kenangan.',
  '18–22 Agustus 2026',
  'Portal resmi dokumentasi Kuliah Kerja Lapangan Program Studi Informatika Universitas PGRI Semarang 2026 ke Pulau Dewata Bali.',
  'Semarang → Bali',
  '2026-08-18 06:00:00+07',
  'assets/uploads/branding/logo.png'
);

-- Table: destinations
CREATE TABLE destinations (
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
CREATE TABLE profiles (
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
CREATE TABLE gallery (
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
CREATE TABLE videos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: feedback
CREATE TABLE feedback (
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

-- RLS Policies: Public READ, Authenticated WRITE
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage destinations" ON destinations FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage videos" ON videos FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can create feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can delete feedback" ON feedback FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX idx_destinations_day ON destinations(day_no, sort_order);
CREATE INDEX idx_profiles_sort ON profiles(sort_order);
CREATE INDEX idx_gallery_sort ON gallery(sort_order);
CREATE INDEX idx_videos_sort ON videos(sort_order);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
```

3. Klik **Run** (atau Ctrl+Enter)
4. Tunggu sampai muncul "Success"

---

## 📦 TAHAP 3: SETUP STORAGE BUCKET (5 Menit)

### Step 1: Create Storage Bucket
1. Di dashboard, klik **Storage**
2. Klik **New bucket**
3. Isi:
   - **Name:** `kkl-uploads`
   - **Public bucket:** ✅ CENTANG (agar foto bisa diakses publik)
4. Klik **Create bucket**

### Step 2: Create Folders
1. Klik bucket `kkl-uploads`
2. Klik **New folder**, buat 3 folder:
   - `profiles` (untuk foto profil mahasiswa)
   - `gallery` (untuk foto galeri)
   - `branding` (untuk logo website)

### Step 3: Set Storage Policy (Public Read)
1. Klik tab **Policies**
2. Klik **New policy**
3. Template: **Allow public read access**
4. Apply ke bucket `kkl-uploads`

---

## 💻 TAHAP 4: IMPORT DATA EXISTING (10 Menit)

### Step 1: Migrasi Data JSON ke Supabase

Buka **SQL Editor** dan jalankan query ini untuk import data existing dari `data/kkl_data.json`:

```sql
-- Import Destinations
INSERT INTO destinations (id, day_no, name, time, category, route, lat, lng, description, sort_order)
VALUES
(1, 1, 'Pemberangkatan Kampus 1 UPGRIS', '06.00 – 07.00 WIB', 'travel', 'Semarang', -6.9858, 110.4357, 'Titik kumpul dan apel pelepasan', 1),
(2, 1, 'Kunjungan Industri PT Victoria Care Indonesia', '08.00 – 09.30 WIB', 'industry', 'Kawasan Industri Candi', -6.9748, 110.367, 'Kunjungan industri manufaktur', 2);
-- ... tambahkan semua destinations lainnya

-- Import Profiles
INSERT INTO profiles (id, name, role, bio, photo_url, sort_order)
VALUES
(1, 'Muhamad Luthfi Abdullah', 'Lead Developer & System Architect', 'Pengembang Utama Web Portal KKL', 'assets/uploads/profiles/profile_xxx.jpeg', 1),
(2, 'Dita Nur Ristiyana', 'Mahasiswa Informatika', 'Tim Dokumentasi & Creative Content', 'assets/img/profile-placeholder.svg', 2);
-- ... tambahkan semua profiles lainnya

-- Import Gallery
INSERT INTO gallery (id, title, category, location, image_url, sort_order)
VALUES
(1, 'Kemegahan Pura Ulun Danu Beratan', 'wisata', 'Bedugul, Bali', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', 1);
-- ... tambahkan semua gallery lainnya

-- Import Videos
INSERT INTO videos (id, title, youtube_url, description, sort_order)
VALUES
(1, 'Aftermovie KKL Informatika UPGRIS', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Dokumentasi sinematik KKL', 1);

-- Import Feedback
INSERT INTO feedback (id, name, rating, message, created_at)
VALUES
(1, 'Dimas Arya (Informatika 23)', 5, 'KKL terbaik sepanjang masa!', NOW());
-- ... tambahkan feedback lainnya
```

**NOTE:** Saya sudah siapkan script generator otomatis. Kalau mau saya buatkan script Python yang auto-convert `kkl_data.json` ke SQL INSERT statements?

---

## 🔌 TAHAP 5: INTEGRA SI KE WEBSITE (Yang Perlu Dikoding)

### File yang Perlu Dibuat/Diubah:

1. **`.env`** (baru)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

2. **`lib/supabase-client.js`** (baru) - Sudah saya buat strukturnya
3. **`assets/js/app-supabase.js`** (baru) - Ganti app.js pakai Supabase
4. **`assets/js/admin-supabase.js`** (baru) - Ganti admin.js pakai Supabase
5. **`admin.html`** - Update load admin-supabase.js
6. **`index.html`** - Update load app-supabase.js

---

## 🎯 OPSI DEPLOYMENT

### Option A: Saya Coding Lengkap (Butuh Waktu ~2 Jam)
Saya selesaikan semua file integrasi Supabase secara professional

### Option B: Kamu Follow Tutorial (Lebih Belajar)
Saya kasih tutorial step-by-step, kamu yang coding sambil belajar

### Option C: Hybrid Supabase + JSON (Recommended untuk Sekarang)
- Website tetap pakai `data/kkl_data.json` (cepat deploy)
- Admin panel pakai Supabase (real-time untuk editor)
- Best of both worlds!

---

## 💰 BIAYA & LIMIT GRATIS SUPABASE

**Free Tier (Selamanya):**
- ✅ 500MB Database storage
- ✅ 1GB File storage
- ✅ 2GB Bandwidth/bulan
- ✅ 50,000 Monthly Active Users
- ✅ Unlimited API requests
- ✅ Real-time subscriptions

**Cukup untuk:**
- 🎓 Website kampus dengan ~1000 visitors/bulan
- 📸 ~500 foto galeri
- 👥 Unlimited mahasiswa & admin
- 💬 ~10,000 feedback

---

## ❓ NEXT STEPS - PILIH SALAH SATU:

**A. "Saya mau langsung pakai Supabase sekarang!"**
→ Saya lanjutkan coding integration files sekarang

**B. "Setup Supabase dulu, coding nanti"**
→ Kamu setup Supabase pakai guide ini, nanti saya coding integrationnya

**C. "Stick dengan JSON dulu, Supabase fase 2"**
→ Push website yang sudah jadi ke GitHub Pages dulu, Supabase nanti

**D. "Mau yang hybrid (JSON + Supabase)"**
→ Website pakai JSON, Admin panel pakai Supabase

---

Mana yang kamu pilih? Atau ada pertanyaan tentang Supabase setup?
