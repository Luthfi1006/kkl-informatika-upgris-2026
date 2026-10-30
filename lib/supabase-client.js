// ==========================================================================
// Supabase Client & Real-time Database Service
// KKL Informatika UPGRIS 2026 - Production Ready (PART 1)
// ==========================================================================

// Import Supabase (CDN)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get credentials from environment or window
const getCredentials = () => {
  const url = window.__SUPABASE_URL__ || import.meta.env.VITE_SUPABASE_URL;
  const key = window.__SUPABASE_KEY__ || import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn("⚠️ Supabase credentials not found. Check .env file.");
    return { url: "", key: "" };
  }
  return { url, key };
};

const { url, key } = getCredentials();
export const supabase = createClient(url, key);

// ===== SETTINGS SERVICE =====
export const SettingsService = {
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      if (error) throw error;
      return data || getDefaultSettings();
    } catch (err) {
      console.error("❌ Error fetching settings:", err);
      return getDefaultSettings();
    }
  },

  async updateSettings(updates) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", 1)
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Settings updated");
      return data;
    } catch (err) {
      console.error("❌ Error updating settings:", err);
      throw err;
    }
  },

  onSettingsChange(callback) {
    if (!url || !key) return () => {};
    
    const subscription = supabase
      .channel("settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        (payload) => {
          callback(payload.new || payload.old);
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }
};

// ===== DESTINATIONS SERVICE =====
export const DestinationsService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("day_no", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("❌ Error fetching destinations:", err);
      return [];
    }
  },

  async create(destination) {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .insert({
          ...destination,
          sort_order: destination.sort_order || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Destination created");
      return data;
    } catch (err) {
      console.error("❌ Error creating destination:", err);
      throw err;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Destination updated");
      return data;
    } catch (err) {
      console.error("❌ Error updating destination:", err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from("destinations")
        .delete()
        .eq("id", id);
      if (error) throw error;
      console.log("✅ Destination deleted");
    } catch (err) {
      console.error("❌ Error deleting destination:", err);
      throw err;
    }
  },

  onDestinationsChange(callback) {
    if (!url || !key) return () => {};
    
    const subscription = supabase
      .channel("destinations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "destinations" },
        () => {
          this.getAll().then(callback);
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }
};

// ===== PROFILES SERVICE =====
export const ProfilesService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("❌ Error fetching profiles:", err);
      return [];
    }
  },

  async create(profile) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          ...profile,
          sort_order: profile.sort_order || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Profile created");
      return data;
    } catch (err) {
      console.error("❌ Error creating profile:", err);
      throw err;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Profile updated");
      return data;
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      console.log("✅ Profile deleted");
    } catch (err) {
      console.error("❌ Error deleting profile:", err);
      throw err;
    }
  },

  onProfilesChange(callback) {
    if (!url || !key) return () => {};
    
    const subscription = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          this.getAll().then(callback);
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }
};

function getDefaultSettings() {
  return {
    id: 1,
    site_title: "KKL Informatika UPGRIS 2026",
    tagline: "Satu Perjalanan. Seribu Kenangan.",
    dates: "18–22 Agustus 2026",
    subtext: "Portal resmi dokumentasi KKL Informatika UPGRIS 2026",
    destination_title: "Semarang → Bali",
    countdown_start: "2026-08-18T06:00:00+07:00",
    logo_url: "assets/uploads/branding/logo.png"
  };
}
