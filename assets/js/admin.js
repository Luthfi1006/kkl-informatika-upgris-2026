(function () {
  "use strict";

  let data = null;
  let editingDestId = null;
  let editingProfId = null;
  let editingVidId = null;

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'"'"'/g, "&#039;");
  }

  function showModal(id) {
    document.getElementById(id).classList.add("active");
  }

  function hideModal(id) {
    document.getElementById(id).classList.remove("active");
  }

  // Extract YouTube ID dari berbagai format URL
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

  // Load Data dari JSON
  async function loadData() {
    try {
      const res = await fetch("./data/kkl_data.json?v=" + Date.now());
      if (!res.ok) throw new Error("HTTP " + res.status);
      data = await res.json();
    } catch (err) {
      console.warn("Load from fallback:", err);
      data = {
        settings: {},
        destinations: [],
        profiles: [],
        gallery: [],
        videos: [],
        feedback: []
      };
    }
    initAdmin();
  }

  // Auth Check
  function checkAuth() {
    const pin = sessionStorage.getItem("kkl_admin_pin");
    if (pin && data?.settings?.admin_pin && pin === data.settings.admin_pin) {
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

  // Render ALL Panels
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
    document.getElementById("setCountdownStart").value = s.countdown_start
      ? s.countdown_start.slice(0, 16)
      : "";
    document.getElementById("setLogo").value = s.logo || "";
    document.getElementById("setAdminPin").value = "";
  }

  // ===== DESTINATIONS =====
  function renderDestList() {
    const list = document.getElementById("destAdminList");
    const items = (data.destinations || [])
      .slice()
      .sort((a, b) => (a.day_no || 0) - (b.day_no || 0) || (a.id || 0) - (b.id || 0));

    list.innerHTML = items
      .map(
        (d) => `
      <div class="item-row" data-id="${d.id}">
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="sort-handle" title="Seret untuk urutkan">⋮⋮</span>
          <div>
            <strong>${escapeHtml(d.name)}</strong>
            <div style="font-size:12.5px;color:var(--text-muted);">
              <span class="status-badge">${getCatLabel(d.category)}</span>
              Hari ${d.day_no} · ${escapeHtml(d.time)} · ${escapeHtml(d.route)}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="btn-edit-sm" onclick="openDestModal(${d.id})">Edit</button>
          <button class="btn-danger-sm" onclick="deleteDest(${d.id})">Hapus</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  function getCatLabel(cat) {
    const map = {
      travel: "🚌 Travel",
      industry: "🏭 Industri",
      culture: "🎭 Budaya",
      food: "🍽️ Kuliner",
      hotel: "🏨 Hotel",
      tourism: "🏞️ Wisata"
    };
    return map[cat] || cat;
  }

  function openDestModal(id = null) {
    editingDestId = id;
    const modal = document.getElementById("modalDestination");
    const title = document.getElementById("destModalTitle");
    const btnDelete = document.getElementById("btnDeleteDest");

    if (id) {
      const d = data.destinations.find((x) => x.id === id);
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
      document.getElementById("destDesc").value = d.desc;
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

  function saveDest() {
    const id = editingDestId ? parseInt(editingDestId) : Date.now();
    const item = {
      id,
      day_no: parseInt(document.getElementById("destDay").value) || 1,
      name: document.getElementById("destName").value.trim(),
      time: document.getElementById("destTime").value.trim(),
      category: document.getElementById("destCategory").value,
      route: document.getElementById("destRoute").value.trim(),
      lat: parseFloat(document.getElementById("destLat").value) || 0,
      lng: parseFloat(document.getElementById("destLng").value) || 0,
      desc: document.getElementById("destDesc").value.trim()
    };

    if (!item.name) {
      alert("Nama agenda wajib diisi!");
      return;
    }

    if (editingDestId) {
      const idx = data.destinations.findIndex((x) => x.id === editingDestId);
      if (idx >= 0) data.destinations[idx] = item;
    } else {
      data.destinations.push(item);
    }
    hideModal("modalDestination");
    renderDestList();
  }

  function deleteDest(id) {
    if (!confirm("Hapus agenda ini?")) return;
    data.destinations = data.destinations.filter((x) => x.id !== id);
    renderDestList();
  }

  // ===== GALLERY =====
  function renderGalList() {
    const list = document.getElementById("galAdminList");
    const items = data.gallery || [];
    list.innerHTML = items
      .map(
        (g) => `
      <div class="item-row" data-id="${g.id}">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${escapeHtml(g.image)}" class="preview-img" alt="" onerror="this.src='"'"'assets/img/profile-placeholder.svg'"'"'">
          <div>
            <strong>${escapeHtml(g.title)}</strong>
            <div style="font-size:12.5px;color:var(--text-muted);">
              ${escapeHtml(g.location)} · <span class="status-badge">${escapeHtml(g.category)}</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn-edit-sm" onclick="editGal(${g.id})">Edit</button>
          <button class="btn-danger-sm" onclick="deleteGal(${g.id})">Hapus</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  function editGal(id) {
    const g = data.gallery.find((x) => x.id === id);
    if (!g) return;
    document.getElementById("addPhotoBox").style.display = "block";
    document.getElementById("galTitle").value = g.title;
    document.getElementById("galCategory").value = g.category;
    document.getElementById("galLocation").value = g.location;
    document.getElementById("galImage").value = g.image;
    // Replace save handler temporarily
    const saveBtn = document.getElementById("btnSaveGallery");
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.onclick = () => {
      g.title = document.getElementById("galTitle").value.trim();
      g.category = document.getElementById("galCategory").value;
      g.location = document.getElementById("galLocation").value.trim();
      g.image = document.getElementById("galImage").value.trim();
      document.getElementById("addPhotoBox").style.display = "none";
      renderGalList();
    };
  }

  function deleteGal(id) {
    if (!confirm("Hapus foto ini?")) return;
    data.gallery = data.gallery.filter((x) => x.id !== id);
    renderGalList();
  }

  window.openDestModal = openDestModal;
  window.deleteDest = deleteDest;
  window.editGal = editGal;
  window.deleteGal = deleteGal;

  // Continue di file bagian 2...
  loadData();
})();

  // ===== PROFILES (NEW: Full CRUD with Modal) =====
  function renderProfList() {
    const list = document.getElementById("profAdminList");
    const items = (data.profiles || []).slice().sort((a,b) => (a.sort_order||0)-(b.sort_order||0));
    
    list.innerHTML = items.map(p => `
      <div class="item-row" data-id="${p.id}">
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="sort-handle" title="Seret untuk urutkan">⋮⋮</span>
          <img src="${escapeHtml(p.photo || 'assets/img/profile-placeholder.svg')}" class="preview-img" alt="" onerror="this.src='"'"'assets/img/profile-placeholder.svg'"'"'">
          <div>
            <strong>${escapeHtml(p.name)}</strong>
            <div style="font-size:12.5px;color:var(--text-muted);">${escapeHtml(p.role || "")} · Urutan: ${p.sort_order || 0}</div>
            <div style="font-size:12px;color:var(--text-light);">${escapeHtml((p.bio || "").substring(0,80))}${p.bio?.length > 80 ? "..." : ""}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn-edit-sm" onclick="openProfModal(${p.id})">Edit</button>
          <button class="btn-danger-sm" onclick="deleteProf(${p.id})">Hapus</button>
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
      document.getElementById("profPhoto").value = p.photo || "";
      document.getElementById("profSort").value = p.sort_order || 1;
      if (p.photo) { 
        previewImg.src = p.photo; 
        previewBox.style.display = "block"; 
      } else { 
        previewBox.style.display = "none"; 
      }
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
    // Live preview for photo URL
    document.getElementById("profPhoto").oninput = function() {
      const val = this.value.trim();
      if (val) { 
        previewImg.src = val; 
        previewBox.style.display = "block"; 
      } else { 
        previewBox.style.display = "none"; 
      }
    };
    showModal("modalProfile");
  }

  function saveProf() {
    const id = editingProfId ? parseInt(editingProfId) : Date.now();
    const item = {
      id,
      name: document.getElementById("profName").value.trim(),
      role: document.getElementById("profRole").value.trim(),
      bio: document.getElementById("profBio").value.trim(),
      photo: document.getElementById("profPhoto").value.trim() || "assets/img/profile-placeholder.svg",
      sort_order: parseInt(document.getElementById("profSort").value) || 1
    };
    if (!item.name || !item.role) { 
      alert("Nama dan Role wajib diisi!"); 
      return; 
    }

    if (editingProfId) {
      const idx = data.profiles.findIndex(x => x.id === editingProfId);
      if (idx >= 0) data.profiles[idx] = item;
    } else {
      data.profiles.push(item);
    }
    hideModal("modalProfile");
    renderProfList();
  }

  function deleteProf(id) {
    if (!confirm("Hapus profil ini?")) return;
    data.profiles = data.profiles.filter(x => x.id !== id);
    renderProfList();
  }

  window.openProfModal = openProfModal;
  window.deleteProf = deleteProf;

  // ===== VIDEOS (NEW: Full CRUD) =====
  function renderVidList() {
    const list = document.getElementById("vidAdminList");
    const items = data.videos || [];
    list.innerHTML = items.map(v => {
      const embedUrl = getYoutubeEmbedUrl(v.embed_url);
      return `
        <div class="item-row" data-id="${v.id}">
          <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
            <span class="sort-handle">⋮⋮</span>
            <div style="flex:1;min-width:0;">
              <strong style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">${escapeHtml(v.title)}</strong>
              <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(v.embed_url)}</div>
              ${v.desc ? `<div style="font-size:12px;color:var(--text-light);margin-top:2px;">${escapeHtml(v.desc)}</div>` : ""}
            </div>
            ${embedUrl ? `<iframe src="${embedUrl}" class="video-preview" style="max-width:200px;flex-shrink:0;" frameborder="0" allowfullscreen></iframe>` : ""}
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn-edit-sm" onclick="openVidModal(${v.id})">Edit</button>
            <button class="btn-danger-sm" onclick="deleteVid(${v.id})">Hapus</button>
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
      document.getElementById("vidUrl").value = v.embed_url;
      document.getElementById("vidDesc").value = v.desc || "";
      const embedUrl = getYoutubeEmbedUrl(v.embed_url);
      if (embedUrl) { 
        previewFrame.src = embedUrl; 
        previewBox.style.display = "block"; 
      } else { 
        previewBox.style.display = "none"; 
      }
    } else {
      document.querySelector("#addVideoBox h4").textContent = "Tambah Video YouTube";
      document.getElementById("vidTitle").value = "";
      document.getElementById("vidUrl").value = "";
      document.getElementById("vidDesc").value = "";
      previewBox.style.display = "none";
    }
    // Live preview
    document.getElementById("vidUrl").oninput = function() {
      const embedUrl = getYoutubeEmbedUrl(this.value.trim());
      if (embedUrl) { 
        previewFrame.src = embedUrl; 
        previewBox.style.display = "block"; 
      } else { 
        previewBox.style.display = "none"; 
      }
    };
    box.style.display = "block";
    // Replace save handler
    const saveBtn = document.getElementById("btnSaveVideo");
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.onclick = saveVid;
  }

  function saveVid() {
    const id = editingVidId ? parseInt(editingVidId) : Date.now();
    const url = document.getElementById("vidUrl").value.trim();
    const embedUrl = getYoutubeEmbedUrl(url);
    if (!embedUrl) { 
      alert("URL YouTube tidak valid! Contoh: https://youtube.com/watch?v=xxx atau https://youtu.be/xxx"); 
      return; 
    }
    const item = {
      id,
      title: document.getElementById("vidTitle").value.trim() || "Video KKL",
      embed_url: url,
      desc: document.getElementById("vidDesc").value.trim()
    };
    if (editingVidId) {
      const idx = data.videos.findIndex(x => x.id === editingVidId);
      if (idx >= 0) data.videos[idx] = item;
    } else {
      data.videos.push(item);
    }
    document.getElementById("addVideoBox").style.display = "none";
    editingVidId = null;
    renderVidList();
  }

  function deleteVid(id) {
    if (!confirm("Hapus video ini?")) return;
    data.videos = data.videos.filter(x => x.id !== id);
    renderVidList();
  }

  window.openVidModal = openVidModal;
  window.deleteVid = deleteVid;

  // ===== FEEDBACK =====
  function renderFbList() {
    const list = document.getElementById("fbAdminList");
    let localFeedbacks = [];
    try { 
      localFeedbacks = JSON.parse(localStorage.getItem("kkl_user_feedbacks") || "[]"); 
    } catch(e) {}
    const allFb = [...localFeedbacks, ...(data.feedback || [])];
    list.innerHTML = allFb.map((fb, idx) => `
      <div class="item-row">
        <div>
          <strong>${escapeHtml(fb.name)} (${fb.rating}⭐)</strong>
          <p style="margin:4px 0 0;font-size:13px;color:var(--text-muted);">${escapeHtml(fb.message)}</p>
          <small style="color:var(--text-light);">${escapeHtml(fb.date || "Baru saja")}</small>
        </div>
        <button class="btn-danger-sm" onclick="window._delFb(${idx})">Hapus</button>
      </div>
    `).join("");
  }

  window._delFb = function(idx) {
    if (!confirm("Hapus komentar ini?")) return;
    let localFeedbacks = [];
    try { 
      localFeedbacks = JSON.parse(localStorage.getItem("kkl_user_feedbacks") || "[]"); 
    } catch(e) {}
    if (idx < localFeedbacks.length) {
      localFeedbacks.splice(idx, 1);
      localStorage.setItem("kkl_user_feedbacks", JSON.stringify(localFeedbacks));
    } else {
      const dataIdx = idx - localFeedbacks.length;
      data.feedback.splice(dataIdx, 1);
    }
    renderFbList();
  };

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Add Buttons
    document.getElementById("btnAddDestination")?.addEventListener("click", () => openDestModal(null));
    document.getElementById("btnAddProfile")?.addEventListener("click", () => openProfModal(null));
    document.getElementById("btnAddVideo")?.addEventListener("click", () => openVidModal(null));
    document.getElementById("btnAddGallery")?.addEventListener("click", () => {
      document.getElementById("addPhotoBox").style.display = "block";
      document.getElementById("galTitle").value = "";
      document.getElementById("galCategory").value = "wisata";
      document.getElementById("galLocation").value = "Bali, Indonesia";
      document.getElementById("galImage").value = "";
    });

    // Gallery Save
    document.getElementById("btnSaveGallery")?.addEventListener("click", () => {
      const item = {
        id: Date.now(),
        title: document.getElementById("galTitle").value.trim(),
        category: document.getElementById("galCategory").value,
        location: document.getElementById("galLocation").value.trim(),
        image: document.getElementById("galImage").value.trim()
      };
      if (!item.title || !item.image) { 
        alert("Judul dan URL gambar wajib diisi!"); 
        return; 
      }
      data.gallery.push(item);
      document.getElementById("addPhotoBox").style.display = "none";
      renderGalList();
    });

    document.getElementById("btnCancelGallery")?.addEventListener("click", () => {
      document.getElementById("addPhotoBox").style.display = "none";
    });

    // Video Cancel
    document.getElementById("btnCancelVideo")?.addEventListener("click", () => {
      document.getElementById("addVideoBox").style.display = "none";
      editingVidId = null;
    });

    // Modal Close Handlers
    document.getElementById("btnCancelDest")?.addEventListener("click", () => hideModal("modalDestination"));
    document.getElementById("btnCancelProf")?.addEventListener("click", () => hideModal("modalProfile"));
    document.getElementById("closeDestModal")?.addEventListener("click", () => hideModal("modalDestination"));
    document.getElementById("closeProfModal")?.addEventListener("click", () => hideModal("modalProfile"));

    document.getElementById("btnSaveDest")?.addEventListener("click", saveDest);
    document.getElementById("btnSaveProf")?.addEventListener("click", saveProf);
    document.getElementById("btnDeleteDest")?.addEventListener("click", () => {
      if (editingDestId && confirm("Yakin hapus agenda ini?")) {
        data.destinations = data.destinations.filter(x => x.id !== editingDestId);
        hideModal("modalDestination");
        renderDestList();
      }
    });
    document.getElementById("btnDeleteProf")?.addEventListener("click", () => {
      if (editingProfId && confirm("Yakin hapus profil ini?")) {
        data.profiles = data.profiles.filter(x => x.id !== editingProfId);
        hideModal("modalProfile");
        renderProfList();
      }
    });

    // Tab Switching
    document.querySelectorAll(".admin-nav-tab").forEach(tab => {
      tab.addEventListener("click", function() {
        document.querySelectorAll(".admin-nav-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        this.classList.add("active");
        document.getElementById(this.dataset.tab).classList.add("active");
      });
    });

    // Save Changes
    document.getElementById("btnSaveData")?.addEventListener("click", async () => {
      data.settings.site_title = document.getElementById("setSiteTitle").value.trim();
      data.settings.tagline = document.getElementById("setTagline").value.trim();
      data.settings.dates = document.getElementById("setDates").value.trim();
      data.settings.subtext = document.getElementById("setSubtext").value.trim();
      data.settings.destination_title = document.getElementById("setDestTitle").value.trim();
      data.settings.countdown_start = document.getElementById("setCountdownStart").value ? 
        document.getElementById("setCountdownStart").value + ":00" : 
        (data.settings.countdown_start || "");
      data.settings.logo = document.getElementById("setLogo").value.trim();
      const newPin = document.getElementById("setAdminPin").value.trim();
      if (newPin) data.settings.admin_pin = newPin;

      try {
        const res = await fetch("./api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: data.settings.admin_pin, data: data })
        });
        const result = await res.json();
        if (result.success) {
          alert("✅ Berhasil! Data tersimpan permanen ke data/kkl_data.json di server.");
          return;
        }
      } catch(e) {
        // Fallback
      }

      localStorage.setItem("kkl_cached_data", JSON.stringify(data));
      alert("💾 Perubahan tersimpan di browser! Untuk deploy Vercel/Netlify: klik \"📥 Unduh JSON\" lalu replace file data/kkl_data.json.");
    });

    // Download JSON
    document.getElementById("btnDownloadJson")?.addEventListener("click", () => {
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const a = document.createElement("a");
      a.href = jsonStr;
      a.download = "kkl_data.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    // Close modals on overlay click
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
          editingDestId = editingProfId = editingVidId = null;
        }
      });
    });

    // Escape key to close modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
        document.getElementById("addPhotoBox").style.display = "none";
        document.getElementById("addVideoBox").style.display = "none";
        editingDestId = editingProfId = editingVidId = null;
      }
    });

    // Login
    document.getElementById("loginForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const pin = document.getElementById("pinInput").value.trim();
      if (data?.settings?.admin_pin && pin === data.settings.admin_pin) {
        sessionStorage.setItem("kkl_admin_pin", pin);
        showAdmin();
      } else {
        alert("PIN salah! Default: upgris2026");
      }
    });

    // Logout
    document.getElementById("btnLogout")?.addEventListener("click", () => {
      sessionStorage.removeItem("kkl_admin_pin");
      document.getElementById("adminScreen").style.display = "none";
      document.getElementById("loginScreen").style.display = "block";
      document.getElementById("pinInput").value = "";
    });
  }

  // Load Data
  loadData();
})();
