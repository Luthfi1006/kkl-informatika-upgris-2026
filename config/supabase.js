// ==========================================================================
// KKL Informatika UPGRIS 2026 - Supabase Configuration
// ==========================================================================

// IMPORTANT: Create .env file dengan nilai ini:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key-here

export const supabaseConfig = {
  // Masukkan credentials Supabase kamu di sini
  url: import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key-here"
};

// Database schema documentation:
// 
// Table: settings
// - id (int, pk)
// - site_title (text)
// - tagline (text)
// - dates (text)
// - subtext (text)
// - destination_title (text)
// - countdown_start (timestamp)
// - logo_url (text)
// - admin_pin_hash (text) - hashed PIN untuk security
// - updated_at (timestamp)
// 
// Table: destinations
// - id (bigint, pk)
// - day_no (int)
// - name (text)
// - time (text)
// - category (text)
// - route (text)
// - lat (numeric)
// - lng (numeric)
// - description (text)
// - sort_order (int)
// - created_at (timestamp)
// - updated_at (timestamp)
//
// Table: profiles
// - id (bigint, pk)
// - name (text)
// - role (text)
// - bio (text)
// - photo_url (text)
// - sort_order (int)
// - created_at (timestamp)
// - updated_at (timestamp)
//
// Table: gallery
// - id (bigint, pk)
// - title (text)
// - category (text)
// - location (text)
// - image_url (text)
// - sort_order (int)
// - created_at (timestamp)
// - updated_at (timestamp)
//
// Table: videos
// - id (bigint, pk)
// - title (text)
// - youtube_url (text)
// - description (text)
// - sort_order (int)
// - created_at (timestamp)
// - updated_at (timestamp)
//
// Table: feedback
// - id (bigint, pk)
// - name (text)
// - rating (int)
// - message (text)
// - created_at (timestamp)
//
// Storage: kkl-uploads (for photos & files)
// - profiles/ (profile pictures)
// - gallery/ (gallery images)
// - branding/ (logo & branding)
