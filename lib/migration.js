// ==========================================================================
// Data Migration Tool - JSON to Supabase
// KKL Informatika UPGRIS 2026
// ==========================================================================

import { 
  SettingsService, 
  DestinationsService, 
  ProfilesService, 
  GalleryService, 
  VideosService, 
  FeedbackService 
} from "./supabase-client.js";

export class DataMigration {
  constructor() {
    this.stats = {
      destinations: 0,
      profiles: 0,
      gallery: 0,
      videos: 0,
      feedback: 0,
      errors: []
    };
  }

  async migrateFromJSON(jsonData) {
    console.log("🚀 Starting migration from JSON to Supabase...");
    
    try {
      // 1. Migrate Settings
      if (jsonData.settings) {
        await this.migrateSettings(jsonData.settings);
      }

      // 2. Migrate Destinations
      if (jsonData.destinations) {
        await this.migrateDestinations(jsonData.destinations);
      }

      // 3. Migrate Profiles
      if (jsonData.profiles) {
        await this.migrateProfiles(jsonData.profiles);
      }

      // 4. Migrate Gallery
      if (jsonData.gallery) {
        await this.migrateGallery(jsonData.gallery);
      }

      // 5. Migrate Videos
      if (jsonData.videos) {
        await this.migrateVideos(jsonData.videos);
      }

      // 6. Migrate Feedback
      if (jsonData.feedback) {
        await this.migrateFeedback(jsonData.feedback);
      }

      console.log("✅ Migration completed!", this.stats);
      return this.stats;
    } catch (err) {
      console.error("❌ Migration failed:", err);
      throw err;
    }
  }

  async migrateSettings(settings) {
    try {
      await SettingsService.updateSettings({
        site_title: settings.site_title,
        tagline: settings.tagline,
        dates: settings.dates,
        subtext: settings.subtext,
        destination_title: settings.destination_title,
        countdown_start: settings.countdown_start,
        logo_url: settings.logo
      });
      console.log("✅ Settings migrated");
    } catch (err) {
      console.error("❌ Settings migration error:", err);
      this.stats.errors.push({ type: "settings", error: err.message });
    }
  }

  async migrateDestinations(destinations) {
    for (const dest of destinations) {
      try {
        await DestinationsService.create({
          day_no: dest.day_no,
          name: dest.name,
          time: dest.time,
          category: dest.category,
          route: dest.route,
          lat: dest.lat,
          lng: dest.lng,
          description: dest.desc,
          sort_order: dest.id || 0
        });
        this.stats.destinations++;
      } catch (err) {
        console.error(`❌ Error migrating destination ${dest.name}:`, err);
        this.stats.errors.push({ type: "destination", name: dest.name, error: err.message });
      }
    }
    console.log(`✅ ${this.stats.destinations} destinations migrated`);
  }

  async migrateProfiles(profiles) {
    for (const prof of profiles) {
      try {
        await ProfilesService.create({
          name: prof.name,
          role: prof.role,
          bio: prof.bio,
          photo_url: prof.photo,
          sort_order: prof.sort_order || prof.id || 1
        });
        this.stats.profiles++;
      } catch (err) {
        console.error(`❌ Error migrating profile ${prof.name}:`, err);
        this.stats.errors.push({ type: "profile", name: prof.name, error: err.message });
      }
    }
    console.log(`✅ ${this.stats.profiles} profiles migrated`);
  }

  async migrateGallery(gallery) {
    for (const item of gallery) {
      try {
        await GalleryService.create({
          title: item.title,
          category: item.category,
          location: item.location,
          image_url: item.image,
          sort_order: item.id || 0
        });
        this.stats.gallery++;
      } catch (err) {
        console.error(`❌ Error migrating gallery ${item.title}:`, err);
        this.stats.errors.push({ type: "gallery", title: item.title, error: err.message });
      }
    }
    console.log(`✅ ${this.stats.gallery} gallery items migrated`);
  }

  async migrateVideos(videos) {
    for (const vid of videos) {
      try {
        await VideosService.create({
          title: vid.title,
          youtube_url: vid.embed_url,
          description: vid.desc,
          sort_order: vid.id || 0
        });
        this.stats.videos++;
      } catch (err) {
        console.error(`❌ Error migrating video ${vid.title}:`, err);
        this.stats.errors.push({ type: "video", title: vid.title, error: err.message });
      }
    }
    console.log(`✅ ${this.stats.videos} videos migrated`);
  }

  async migrateFeedback(feedback) {
    for (const fb of feedback) {
      try {
        await FeedbackService.create({
          name: fb.name,
          rating: fb.rating,
          message: fb.message
        });
        this.stats.feedback++;
      } catch (err) {
        console.error(`❌ Error migrating feedback from ${fb.name}:`, err);
        this.stats.errors.push({ type: "feedback", name: fb.name, error: err.message });
      }
    }
    console.log(`✅ ${this.stats.feedback} feedback items migrated`);
  }

  async loadAndMigrate(jsonPath = "./data/kkl_data.json") {
    try {
      const response = await fetch(jsonPath + "?v=" + Date.now());
      if (!response.ok) throw new Error("Failed to load JSON");
      
      const jsonData = await response.json();
      return await this.migrateFromJSON(jsonData);
    } catch (err) {
      console.error("❌ Failed to load JSON file:", err);
      throw err;
    }
  }
}

// Auto-migration helper (call from console)
window.migrateToSupabase = async () => {
  const migrator = new DataMigration();
  try {
    const stats = await migrator.loadAndMigrate();
    alert(`✅ Migration completed!\n\nDestinations: ${stats.destinations}\nProfiles: ${stats.profiles}\nGallery: ${stats.gallery}\nVideos: ${stats.videos}\nFeedback: ${stats.feedback}\n\nErrors: ${stats.errors.length}`);
    return stats;
  } catch (err) {
    alert(`❌ Migration failed: ${err.message}`);
    throw err;
  }
};

console.log("💡 Run window.migrateToSupabase() to migrate JSON data to Supabase");
