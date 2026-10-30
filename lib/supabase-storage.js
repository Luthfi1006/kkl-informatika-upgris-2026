// ==========================================================================
// Supabase Storage & File Upload Service
// KKL Informatika UPGRIS 2026
// ==========================================================================

import { supabase } from "./supabase-client.js";

export const StorageService = {
  // Upload file ke Supabase Storage
  async uploadFile(bucket, folder, file, filename = null) {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error("Invalid file object");
      }

      const finalFilename = filename || `${Date.now()}_${file.name}`;
      const filepath = `${folder}/${finalFilename}`;

      console.log(`📤 Uploading to ${bucket}/${filepath}...`);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filepath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log("✅ File uploaded:", publicUrl.publicUrl);
      return publicUrl.publicUrl;
    } catch (err) {
      console.error("❌ Upload error:", err);
      throw err;
    }
  },

  // Upload profile photo
  async uploadProfilePhoto(file) {
    return this.uploadFile("kkl-uploads", "profiles", file);
  },

  // Upload gallery image
  async uploadGalleryImage(file) {
    return this.uploadFile("kkl-uploads", "gallery", file);
  },

  // Upload logo/branding
  async uploadBrandingImage(file) {
    return this.uploadFile("kkl-uploads", "branding", file);
  },

  // Delete file
  async deleteFile(bucket, filepath) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filepath]);

      if (error) throw error;
      console.log("✅ File deleted");
    } catch (err) {
      console.error("❌ Delete error:", err);
      throw err;
    }
  },

  // Get public URL from path
  getPublicUrl(bucket, filepath) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filepath);
    return data.publicUrl;
  }
};

// ===== GALLERY SERVICE (continued) =====
export const GalleryService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("❌ Error fetching gallery:", err);
      return [];
    }
  },

  async create(item) {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .insert({
          ...item,
          sort_order: item.sort_order || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Gallery item created");
      return data;
    } catch (err) {
      console.error("❌ Error creating gallery:", err);
      throw err;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Gallery item updated");
      return data;
    } catch (err) {
      console.error("❌ Error updating gallery:", err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", id);
      if (error) throw error;
      console.log("✅ Gallery item deleted");
    } catch (err) {
      console.error("❌ Error deleting gallery:", err);
      throw err;
    }
  },

  onGalleryChange(callback) {
    const subscription = supabase
      .channel("gallery")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery" },
        () => {
          this.getAll().then(callback);
        }
      )
      .subscribe();
    return () => subscription.unsubscribe();
  }
};

// ===== VIDEOS SERVICE =====
export const VideosService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("❌ Error fetching videos:", err);
      return [];
    }
  },

  async create(video) {
    try {
      const { data, error } = await supabase
        .from("videos")
        .insert({
          ...video,
          sort_order: video.sort_order || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Video created");
      return data;
    } catch (err) {
      console.error("❌ Error creating video:", err);
      throw err;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from("videos")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Video updated");
      return data;
    } catch (err) {
      console.error("❌ Error updating video:", err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", id);
      if (error) throw error;
      console.log("✅ Video deleted");
    } catch (err) {
      console.error("❌ Error deleting video:", err);
      throw err;
    }
  },

  onVideosChange(callback) {
    const subscription = supabase
      .channel("videos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        () => {
          this.getAll().then(callback);
        }
      )
      .subscribe();
    return () => subscription.unsubscribe();
  }
};

// ===== FEEDBACK SERVICE =====
export const FeedbackService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("❌ Error fetching feedback:", err);
      return [];
    }
  },

  async create(feedback) {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .insert({
          ...feedback,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      console.log("✅ Feedback submitted");
      return data;
    } catch (err) {
      console.error("❌ Error creating feedback:", err);
      throw err;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", id);
      if (error) throw error;
      console.log("✅ Feedback deleted");
    } catch (err) {
      console.error("❌ Error deleting feedback:", err);
      throw err;
    }
  },

  onFeedbackChange(callback) {
    const subscription = supabase
      .channel("feedback")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedback" },
        () => {
          this.getAll().then(callback);
        }
      )
      .subscribe();
    return () => subscription.unsubscribe();
  }
};
