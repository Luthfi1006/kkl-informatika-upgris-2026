// ==========================================================================
// Admin Panel Controller - Fully Integrated with Supabase Real-time Database
// KKL Informatika UPGRIS 2026 - Production Ready v3.0.0
// ==========================================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let supabase = null;
let data = {
  settings: {},
  destinations: [],
  profiles: [],
  gallery: [],
  videos: [],
  feedback: []
};

let editingDestId = null;
let editingProfId = null;
let editingVidId = null;

// Initialize Supabase Client
function initSupabase() {
  const url = window.__SUPABASE_URL__;
  const key = window.__SUPABASE_KEY__;

  if (url && key) {
    supabase = createClient(url, key);
    console.log("✅ Supabase client initialized in admin");
    return true;
  } else {
    console.warn("⚠️ Supabase credentials missing");
    return false;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showModal(id) {
  document.getElementById(id).classList.add("active");
}

function hideModal(id) {
  document.getElementById(id).classList.remove("active");
}

function extractYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match) return match[1];
  }
  return null;
}

function getYoutubeEmbedUrl(url) {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

// Load Data from Supabase (with fallback to JSON)
async function loadData() {
  console.log("⏳ Loading data for admin...");

  if (initSupabase()) {
    try {
      // 1. Settings
      const { data: setRes } = await supabase.from("settings").select("*").single();
      if (setRes) data.settings = setRes;

      // 2. Destinations
      const { data: destRes } = await supabase.from("destinations").select("*").order("day_no", { ascending: true }).order("sort_order", { ascending: true });
      if (destRes) data.destinations = destRes;

      // 3. Profiles
      const { data: profRes } = await supabase.from("profiles").select("*").order("sort_order", { ascending: true });
      if (profRes) data.profiles = profRes;

      // 4. Gallery
      const { data: galRes } = await supabase.from("gallery").select("*").order("sort_order", { ascending: true });
      if (galRes) data.gallery = galRes;

      // 5. Videos
      const { data: vidRes } = await supabase.from("videos").select("*").order("sort_order", { ascending: true });
      if (vidRes) data.videos = vidRes;

      // 6. Feedback
      const { data: fbRes } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      if (fbRes) data.feedback = fbRes;

      console.log("✅ Data loaded from Supabase successfully!");
      initAdmin();
      setupRealtimeListeners();
      return;
    } catch (err) {
      console.warn("⚠️ Error loading from Supabase, falling back to JSON:", err);
    }
  }

  // Fallback to JSON
  try {
    const res = await fetch("./data/kkl_data.json?v=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    data = await res.json();
    console.log("✅ Data loaded from JSON fallback");
  } catch (err) {
    console.error("❌ Failed to load JSON fallback:", err);
    data = {
      settings: { admin_pin: "upgris2026" },
      destinations: [],
      profiles: [],
      gallery: [],
      videos: [],
      feedback: []
    };
  }

  initAdmin();
}

// Real-time Supabase Listeners
function setupRealtimeListeners() {
  if (!supabase) return;

  console.log("⚡ Subscribing to Supabase Real-time updates...");

  supabase.channel("admin-sync")
    .on("postgres_changes", { event: "*", schema: "public" }, () => {
      console.log("⚡ Real-time update received! Refreshing admin data...");
      loadDataSilently();
    })
    .subscribe();
}

async function loadDataSilently() {
  if (!supabase) return;

  const { data: setRes } = await supabase.from("settings").select("*").single();
  if (setRes) data.settings = setRes;

  const { data: destRes } = await supabase.from("destinations").select("*").order("day_no", { ascending: true });
  if (destRes) data.destinations = destRes;

  const { data: profRes } = await supabase.from("profiles").select("*").order("sort_order", { ascending: true });
  if (profRes) data.profiles = profRes;

  const { data: galRes } = await supabase.from("gallery").select("*").order("sort_order", { ascending: true });
  if (galRes) data.gallery = galRes;

  const { data: vidRes } = await supabase.from("videos").select("*").order("sort_order", { ascending: true });
  if (vidRes) data.videos = vidRes;

  const { data: fbRes } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
  if (fbRes) data.feedback = fbRes;

  renderAll();
}

// Auth Check
function checkAuth() {
  const pin = sessionStorage.getItem("kkl_admin_pin");
  const defaultPin = "upgris2026";

  if (pin && (pin === defaultPin || pin === data?.settings?.admin_pin)) {
    showAdmin();
  }
}

function showAdmin() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminScreen").style.display = "block";
  renderAll();
}

function initAdmin() {
  checkAuth();
  setupEventListeners();
}

function renderAll() {
  renderSettings();
  renderDestList();
  renderGalList();
  renderProfList();
  renderVidList();
  renderFbList();
}

// ===== SETTINGS =====
function renderSettings() {
  const s = data.settings || {};
  document.getElementById("setSiteTitle").value = s.site_title || "";
  document.getElementById("setTagline").value = s.tagline || "";
  document.getElementById("setDates").value = s.dates || "";
  document.getElementById("setSubtext").value = s.subtext || "";
  document.getElementById("setDestTitle").value = s.destination_title || "";
  document.getElementById("setCountdownStart").value = s.countdown_start ? s.countdown_start.slice(0, 16) : "";
  document.getElementById("setLogo").value = s.logo_url || s.logo || "";
  document.getElementById("setAdminPin").value = "";
}

async function saveSettings() {
  const updates = {
    site_title: document.getElementById("setSiteTitle").value.trim(),
    tagline: document.getElementById("setTagline").value.trim(),
    dates: document.getElementById("setDates").value.trim(),
    subtext: document.getElementById("setSubtext").value.trim(),
    destination_title: document.getElementById("setDestTitle").value.trim(),
    countdown_start: document.getElementById("setCountdownStart").value ? document.getElementById("setCountdownStart").value + ":00" : (data.settings.countdown_start || ""),
    logo_url: document.getElementById("setLogo").value.trim()
  };

  const newPin = document.getElementById("setAdminPin").value.trim();
  if (newPin) updates.admin_pin = newPin;

  if (supabase) {
    try {
      const { error } = await supabase.from("settings").update(updates).eq("id", 1);
      if (error) throw error;
      alert("✅ Pengaturan berhasil disimpan ke Supabase Database!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error saving settings to Supabase:", err);
      alert("⚠️ Gagal menyimpan ke Supabase: " + err.message);
    }
  }

  // Fallback to local storage
  data.settings = { ...data.settings, ...updates };
  localStorage.setItem("kkl_cached_data", JSON.stringify(data));
  alert("💾 Perubahan tersimpan di browser!");
}

// ===== DESTINATIONS =====
function renderDestList() {
  const list = document.getElementById("destAdminList");
  const items = (data.destinations || []).slice().sort((a, b) => (a.day_no || 0) - (b.day_no || 0));
  
  list.innerHTML = items.map(d => `
    <div class="item-row" data-id="${d.id}">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="sort-handle">⋮⋮</span>
        <div>
          <strong>${escapeHtml(d.name)}</strong>
          <div style="font-size:12.5px;color:var(--text-muted);">
            Hari ${d.day_no} · ${escapeHtml(d.time)} · ${escapeHtml(d.route)}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn-edit-sm" onclick="window.openDestModal(${d.id})">Edit</button>
        <button class="btn-danger-sm" onclick="window.deleteDest(${d.id})">Hapus</button>
      </div>
    </div>
  `).join("");
}

function openDestModal(id = null) {
  editingDestId = id;
  const title = document.getElementById("destModalTitle");
  const btnDelete = document.getElementById("btnDeleteDest");

  if (id) {
    const d = data.destinations.find(x => x.id === id);
    if (!d) return;
    title.textContent = "Edit Agenda";
    document.getElementById("destId").value = d.id;
    document.getElementById("destDay").value = d.day_no;
    document.getElementById("destCategory").value = d.category;
    document.getElementById("destName").value = d.name;
    document.getElementById("destTime").value = d.time;
    document.getElementById("destRoute").value = d.route;
    document.getElementById("destLat").value = d.lat ?? "";
    document.getElementById("destLng").value = d.lng ?? "";
    document.getElementById("destDesc").value = d.description || d.desc || "";
    btnDelete.style.display = "inline-block";
  } else {
    title.textContent = "Tambah Agenda Baru";
    document.getElementById("destId").value = "";
    document.getElementById("destDay").value = "1";
    document.getElementById("destCategory").value = "travel";
    document.getElementById("destName").value = "";
    document.getElementById("destTime").value = "";
    document.getElementById("destRoute").value = "";
    document.getElementById("destLat").value = "";
    document.getElementById("destLng").value = "";
    document.getElementById("destDesc").value = "";
    btnDelete.style.display = "none";
  }
  showModal("modalDestination");
}

async function saveDest() {
  const item = {
    day_no: parseInt(document.getElementById("destDay").value) || 1,
    name: document.getElementById("destName").value.trim(),
    time: document.getElementById("destTime").value.trim(),
    category: document.getElementById("destCategory").value,
    route: document.getElementById("destRoute").value.trim(),
    lat: parseFloat(document.getElementById("destLat").value) || 0,
    lng: parseFloat(document.getElementById("destLng").value) || 0,
    description: document.getElementById("destDesc").value.trim()
  };

  if (!item.name) { alert("Nama agenda wajib diisi!"); return; }

  if (supabase) {
    try {
      if (editingDestId) {
        const { error } = await supabase.from("destinations").update(item).eq("id", editingDestId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("destinations").insert(item);
        if (error) throw error;
      }
      hideModal("modalDestination");
      alert("✅ Agenda berhasil disimpan ke Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error saving destination to Supabase:", err);
      alert("⚠️ Gagal simpan ke Supabase: " + err.message);
    }
  }

  // Fallback
  if (editingDestId) {
    const idx = data.destinations.findIndex(x => x.id === editingDestId);
    if (idx >= 0) data.destinations[idx] = { ...item, id: editingDestId };
  } else {
    data.destinations.push({ ...item, id: Date.now() });
  }
  hideModal("modalDestination");
  renderDestList();
}

async function deleteDest(id) {
  if (!confirm("Hapus agenda ini?")) return;

  if (supabase) {
    try {
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) throw error;
      alert("✅ Agenda dihapus dari Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error deleting destination:", err);
      alert("⚠️ Gagal hapus dari Supabase: " + err.message);
    }
  }

  data.destinations = data.destinations.filter(x => x.id !== id);
  renderDestList();
}

// ===== GALLERY =====
function renderGalList() {
  const list = document.getElementById("galAdminList");
  list.innerHTML = (data.gallery || []).map(g => `
    <div class="item-row" data-id="${g.id}">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="${escapeHtml(g.image_url || g.image)}" class="preview-img" alt="" onerror="this.src='assets/img/profile-placeholder.svg'">
        <div>
          <strong>${escapeHtml(g.title)}</strong>
          <div style="font-size:12.5px;color:var(--text-muted);">${escapeHtml(g.location)}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-edit-sm" onclick="window.editGal(${g.id})">Edit</button>
        <button class="btn-danger-sm" onclick="window.deleteGal(${g.id})">Hapus</button>
      </div>
    </div>
  `).join("");
}

function editGal(id) {
  const g = data.gallery.find(x => x.id === id);
  if (!g) return;
  document.getElementById("addPhotoBox").style.display = "block";
  document.getElementById("galTitle").value = g.title;
  document.getElementById("galCategory").value = g.category;
  document.getElementById("galLocation").value = g.location;
  document.getElementById("galImage").value = g.image_url || g.image;
}

async function saveGal() {
  const item = {
    title: document.getElementById("galTitle").value.trim(),
    category: document.getElementById("galCategory").value,
    location: document.getElementById("galLocation").value.trim(),
    image_url: document.getElementById("galImage").value.trim()
  };

  if (!item.title || !item.image_url) { alert("Judul dan URL gambar wajib diisi!"); return; }

  if (supabase) {
    try {
      const { error } = await supabase.from("gallery").insert(item);
      if (error) throw error;
      document.getElementById("addPhotoBox").style.display = "none";
      alert("✅ Foto galeri berhasil disimpan ke Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error saving gallery to Supabase:", err);
      alert("⚠️ Gagal simpan ke Supabase: " + err.message);
    }
  }

  data.gallery.push({ ...item, id: Date.now() });
  document.getElementById("addPhotoBox").style.display = "none";
  renderGalList();
}

async function deleteGal(id) {
  if (!confirm("Hapus foto ini?")) return;

  if (supabase) {
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      alert("✅ Foto dihapus dari Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error deleting gallery:", err);
      alert("⚠️ Gagal hapus dari Supabase: " + err.message);
    }
  }

  data.gallery = data.gallery.filter(x => x.id !== id);
  renderGalList();
}

// ===== PROFILES =====
function renderProfList() {
  const list = document.getElementById("profAdminList");
  const items = (data.profiles || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  
  list.innerHTML = items.map(p => `
    <div class="item-row" data-id="${p.id}">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="sort-handle">⋮⋮</span>
        <img src="${escapeHtml(p.photo_url || p.photo || 'assets/img/profile-placeholder.svg')}" class="preview-img" alt="" onerror="this.src='assets/img/profile-placeholder.svg'">
        <div>
          <strong>${escapeHtml(p.name)}</strong>
          <div style="font-size:12.5px;color:var(--text-muted);">${escapeHtml(p.role || "")}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-edit-sm" onclick="window.openProfModal(${p.id})">Edit</button>
        <button class="btn-danger-sm" onclick="window.deleteProf(${p.id})">Hapus</button>
      </div>
    </div>
  `).join("");
}

function openProfModal(id = null) {
  editingProfId = id;
  const title = document.getElementById("profModalTitle");
  const btnDelete = document.getElementById("btnDeleteProf");
  const previewBox = document.getElementById("profPreviewBox");
  const previewImg = document.getElementById("profPreview");

  if (id) {
    const p = data.profiles.find(x => x.id === id);
    if (!p) return;
    title.textContent = "Edit Profil Mahasiswa";
    document.getElementById("profId").value = p.id;
    document.getElementById("profName").value = p.name;
    document.getElementById("profRole").value = p.role;
    document.getElementById("profBio").value = p.bio;
    document.getElementById("profPhoto").value = p.photo_url || p.photo || "";
    document.getElementById("profSort").value = p.sort_order || 1;
    const photo = p.photo_url || p.photo;
    if (photo) { previewImg.src = photo; previewBox.style.display = "block"; } else { previewBox.style.display = "none"; }
    btnDelete.style.display = "inline-block";
  } else {
    title.textContent = "Tambah Profil Mahasiswa";
    document.getElementById("profId").value = "";
    document.getElementById("profName").value = "";
    document.getElementById("profRole").value = "";
    document.getElementById("profBio").value = "";
    document.getElementById("profPhoto").value = "";
    document.getElementById("profSort").value = (data.profiles?.length || 0) + 1;
    previewBox.style.display = "none";
    btnDelete.style.display = "none";
  }

  document.getElementById("profPhoto").oninput = function() {
    if (this.value.trim()) { previewImg.src = this.value; previewBox.style.display = "block"; } else { previewBox.style.display = "none"; }
  };
  showModal("modalProfile");
}

async function saveProf() {
  const item = {
    name: document.getElementById("profName").value.trim(),
    role: document.getElementById("profRole").value.trim(),
    bio: document.getElementById("profBio").value.trim(),
    photo_url: document.getElementById("profPhoto").value.trim() || "assets/img/profile-placeholder.svg",
    sort_order: parseInt(document.getElementById("profSort").value) || 1
  };

  if (!item.name || !item.role) { alert("Nama dan Role wajib diisi!"); return; }

  if (supabase) {
    try {
      if (editingProfId) {
        const { error } = await supabase.from("profiles").update(item).eq("id", editingProfId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert(item);
        if (error) throw error;
      }
      hideModal("modalProfile");
      alert("✅ Profil mahasiswa berhasil disimpan ke Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error saving profile to Supabase:", err);
      alert("⚠️ Gagal simpan ke Supabase: " + err.message);
    }
  }

  // Fallback
  if (editingProfId) {
    const idx = data.profiles.findIndex(x => x.id === editingProfId);
    if (idx >= 0) data.profiles[idx] = { ...item, id: editingProfId };
  } else {
    data.profiles.push({ ...item, id: Date.now() });
  }
  hideModal("modalProfile");
  renderProfList();
}

async function deleteProf(id) {
  if (!confirm("Hapus profil ini?")) return;

  if (supabase) {
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      alert("✅ Profil dihapus dari Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error deleting profile:", err);
      alert("⚠️ Gagal hapus dari Supabase: " + err.message);
    }
  }

  data.profiles = data.profiles.filter(x => x.id !== id);
  renderProfList();
}

// ===== VIDEOS =====
function renderVidList() {
  const list = document.getElementById("vidAdminList");
  list.innerHTML = (data.videos || []).map(v => {
    const embedUrl = getYoutubeEmbedUrl(v.youtube_url || v.embed_url);
    return `
      <div class="item-row" data-id="${v.id}">
        <div style="display:flex;align-items:center;gap:12px;flex:1;">
          <div style="flex:1;">
            <strong>${escapeHtml(v.title)}</strong>
            <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(v.youtube_url || v.embed_url)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn-edit-sm" onclick="window.openVidModal(${v.id})">Edit</button>
          <button class="btn-danger-sm" onclick="window.deleteVid(${v.id})">Hapus</button>
        </div>
      </div>
    `;
  }).join("");
}

function openVidModal(id = null) {
  editingVidId = id;
  const previewBox = document.getElementById("vidPreviewBox");
  const previewFrame = document.getElementById("vidPreview");
  const box = document.getElementById("addVideoBox");

  if (id) {
    const v = data.videos.find(x => x.id === id);
    if (!v) return;
    document.querySelector("#addVideoBox h4").textContent = "Edit Video YouTube";
    document.getElementById("vidTitle").value = v.title;
    document.getElementById("vidUrl").value = v.youtube_url || v.embed_url;
    document.getElementById("vidDesc").value = v.description || v.desc || "";
    const embedUrl = getYoutubeEmbedUrl(v.youtube_url || v.embed_url);
    if (embedUrl) { previewFrame.src = embedUrl; previewBox.style.display = "block"; } else { previewBox.style.display = "none"; }
  } else {
    document.querySelector("#addVideoBox h4").textContent = "Tambah Video YouTube";
    document.getElementById("vidTitle").value = "";
    document.getElementById("vidUrl").value = "";
    document.getElementById("vidDesc").value = "";
    previewBox.style.display = "none";
  }

  document.getElementById("vidUrl").oninput = function() {
    const embedUrl = getYoutubeEmbedUrl(this.value.trim());
    if (embedUrl) { previewFrame.src = embedUrl; previewBox.style.display = "block"; } else { previewBox.style.display = "none"; }
  };
  box.style.display = "block";
}

async function saveVid() {
  const url = document.getElementById("vidUrl").value.trim();
  const embedUrl = getYoutubeEmbedUrl(url);
  if (!embedUrl) { alert("URL YouTube tidak valid!"); return; }

  const item = {
    title: document.getElementById("vidTitle").value.trim() || "Video KKL",
    youtube_url: url,
    description: document.getElementById("vidDesc").value.trim()
  };

  if (supabase) {
    try {
      if (editingVidId) {
        const { error } = await supabase.from("videos").update(item).eq("id", editingVidId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("videos").insert(item);
        if (error) throw error;
      }
      document.getElementById("addVideoBox").style.display = "none";
      editingVidId = null;
      alert("✅ Video berhasil disimpan ke Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error saving video to Supabase:", err);
      alert("⚠️ Gagal simpan ke Supabase: " + err.message);
    }
  }

  if (editingVidId) {
    const idx = data.videos.findIndex(x => x.id === editingVidId);
    if (idx >= 0) data.videos[idx] = { ...item, id: editingVidId };
  } else {
    data.videos.push({ ...item, id: Date.now() });
  }
  document.getElementById("addVideoBox").style.display = "none";
  editingVidId = null;
  renderVidList();
}

async function deleteVid(id) {
  if (!confirm("Hapus video ini?")) return;

  if (supabase) {
    try {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
      alert("✅ Video dihapus dari Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error deleting video:", err);
      alert("⚠️ Gagal hapus dari Supabase: " + err.message);
    }
  }

  data.videos = data.videos.filter(x => x.id !== id);
  renderVidList();
}

// ===== FEEDBACK =====
function renderFbList() {
  const list = document.getElementById("fbAdminList");
  list.innerHTML = (data.feedback || []).map((fb, idx) => `
    <div class="item-row">
      <div>
        <strong>${escapeHtml(fb.name)} (${fb.rating}⭐)</strong>
        <p style="margin:4px 0 0;font-size:13px;color:var(--text-muted);">${escapeHtml(fb.message)}</p>
        <small style="color:var(--text-light);">${escapeHtml(fb.created_at ? new Date(fb.created_at).toLocaleDateString("id-ID") : fb.date || "Baru saja")}</small>
      </div>
      <button class="btn-danger-sm" onclick="window._delFb(${fb.id || idx})">Hapus</button>
    </div>
  `).join("");
}

async function deleteFb(id) {
  if (!confirm("Hapus komentar ini?")) return;

  if (supabase && typeof id === "number" && id > 100) {
    try {
      const { error } = await supabase.from("feedback").delete().eq("id", id);
      if (error) throw error;
      alert("✅ Feedback dihapus dari Supabase!");
      loadDataSilently();
      return;
    } catch (err) {
      console.error("Error deleting feedback:", err);
    }
  }

  data.feedback = data.feedback.filter((_, idx) => idx !== id);
  renderFbList();
}

// Event Listeners
function setupEventListeners() {
  document.getElementById("btnAddDestination")?.addEventListener("click", () => openDestModal(null));
  document.getElementById("btnAddProfile")?.addEventListener("click", () => openProfModal(null));
  document.getElementById("btnAddVideo")?.addEventListener("click", () => openVidModal(null));
  document.getElementById("btnAddGallery")?.addEventListener("click", () => {
    document.getElementById("addPhotoBox").style.display = "block";
    document.getElementById("galTitle").value = "";
    document.getElementById("galImage").value = "";
  });

  document.getElementById("btnSaveGallery")?.addEventListener("click", saveGal);
  document.getElementById("btnCancelGallery")?.addEventListener("click", () => { document.getElementById("addPhotoBox").style.display = "none"; });
  document.getElementById("btnCancelVideo")?.addEventListener("click", () => { document.getElementById("addVideoBox").style.display = "none"; editingVidId = null; });
  document.getElementById("btnCancelDest")?.addEventListener("click", () => hideModal("modalDestination"));
  document.getElementById("btnCancelProf")?.addEventListener("click", () => hideModal("modalProfile"));

  document.getElementById("btnSaveDest")?.addEventListener("click", saveDest);
  document.getElementById("btnSaveProf")?.addEventListener("click", saveProf);
  document.getElementById("btnSaveVideo")?.addEventListener("click", saveVid);
  document.getElementById("btnSaveData")?.addEventListener("click", saveSettings);

  document.getElementById("btnDeleteDest")?.addEventListener("click", () => { if (editingDestId) deleteDest(editingDestId); });
  document.getElementById("btnDeleteProf")?.addEventListener("click", () => { if (editingProfId) deleteProf(editingProfId); });

  document.querySelectorAll(".admin-nav-tab").forEach(tab => {
    tab.addEventListener("click", function() {
      document.querySelectorAll(".admin-nav-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      this.classList.add("active");
      document.getElementById(this.dataset.tab).classList.add("active");
    });
  });

  document.getElementById("btnDownloadJson")?.addEventListener("click", () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement("a");
    a.href = jsonStr;
    a.download = "kkl_data.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
        editingDestId = editingProfId = editingVidId = null;
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
      document.getElementById("addPhotoBox").style.display = "none";
      document.getElementById("addVideoBox").style.display = "none";
      editingDestId = editingProfId = editingVidId = null;
    }
  });

  // LOGIN
  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const pinInput = document.getElementById("pinInput").value.trim();
    const defaultPin = "upgris2026";
    if (pinInput === defaultPin || pinInput === (data?.settings?.admin_pin)) {
      sessionStorage.setItem("kkl_admin_pin", pinInput);
      showAdmin();
    } else {
      alert("❌ PIN salah!\n\nDefault PIN: upgris2026");
      document.getElementById("pinInput").focus();
    }
  });

  document.getElementById("btnLogout")?.addEventListener("click", () => {
    sessionStorage.removeItem("kkl_admin_pin");
    document.getElementById("adminScreen").style.display = "none";
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("pinInput").value = "";
  });
}

// Window Exposes
window.openDestModal = openDestModal;
window.deleteDest = deleteDest;
window.editGal = editGal;
window.deleteGal = deleteGal;
window.openProfModal = openProfModal;
window.deleteProf = deleteProf;
window.openVidModal = openVidModal;
window.deleteVid = deleteVid;
window._delFb = deleteFb;

// Start load
loadData();
