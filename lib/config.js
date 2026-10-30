// ==========================================================================
// Configuration Manager - Supabase + Environment Setup
// KKL Informatika UPGRIS 2026
// ==========================================================================

export class ConfigManager {
  constructor() {
    this.config = {
      supabase: {
        url: null,
        anonKey: null,
        isConnected: false
      },
      mode: "hybrid", // "supabase" | "json" | "hybrid"
      offlineMode: false
    };
    
    this.init();
  }

  init() {
    // Try to load from window (inline script)
    if (window.__SUPABASE_URL__ && window.__SUPABASE_KEY__) {
      this.config.supabase.url = window.__SUPABASE_URL__;
      this.config.supabase.anonKey = window.__SUPABASE_KEY__;
      this.config.supabase.isConnected = true;
      this.config.mode = "supabase";
      console.log("✅ Supabase configured from window");
      return;
    }

    // Try import.meta.env (Vite)
    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        this.config.supabase.url = import.meta.env.VITE_SUPABASE_URL;
        this.config.supabase.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        this.config.supabase.isConnected = true;
        this.config.mode = "supabase";
        console.log("✅ Supabase configured from .env");
        return;
      }
    } catch (e) {
      // import.meta not available
    }

    // Fallback ke JSON mode
    console.warn("⚠️ No Supabase credentials found. Using JSON fallback mode.");
    this.config.mode = "json";
    this.config.offlineMode = true;
  }

  isSupabaseEnabled() {
    return this.config.supabase.isConnected && this.config.mode !== "json";
  }

  getSupabaseConfig() {
    return {
      url: this.config.supabase.url,
      anonKey: this.config.supabase.anonKey
    };
  }

  getMode() {
    return this.config.mode;
  }

  setOfflineMode(enabled) {
    this.config.offlineMode = enabled;
    if (enabled) {
      console.log("🔌 Offline mode enabled - using JSON fallback");
    }
  }

  isOffline() {
    return this.config.offlineMode;
  }
}

// Global singleton
export const config = new ConfigManager();

// Helper untuk setup credentials via inline script
export function setupSupabaseCredentials(url, anonKey) {
  if (!url || !anonKey) {
    console.error("❌ Invalid Supabase credentials");
    return false;
  }
  
  window.__SUPABASE_URL__ = url;
  window.__SUPABASE_KEY__ = anonKey;
  
  // Re-initialize config
  config.init();
  
  console.log("✅ Supabase credentials set successfully");
  return true;
}
