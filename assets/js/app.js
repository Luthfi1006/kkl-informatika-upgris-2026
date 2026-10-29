/* ==========================================================================
   KKL Informatika UPGRIS 2026 - Master JavaScript Controller
   Zero-SQL & Client-Side Interactive Engine
   ========================================================================== */

(function () {
  'use strict';

  let appData = null;
  let activeDay = 'all';
  let activeGalCat = 'all';
  let mapInstance = null;

  // Fallback initial data in case fetch is blocked by strict local browser file:// policy
  const fallbackData = {
    settings: {
      site_title: "KKL Informatika UPGRIS 2026",
      tagline: "Satu Perjalanan. Seribu Kenangan.",
      subtext: "Portal resmi dokumentasi Kuliah Kerja Lapangan Program Studi Informatika Universitas PGRI Semarang 2026 ke Pulau Dewata Bali.",
      dates: "18—22 Agustus 2026",
      destination_title: "Semarang → Bali",
      countdown_start: "2026-08-18T06:00:00+07:00",
      logo: "assets/uploads/branding/logo_1793049567_7af0ed47.png"
    },
    destinations: [],
    profiles: [],
    gallery: [],
    videos: [],
    feedback: []
  };

  // 1. Fetch JSON Data
  async function loadData() {
    try {
      const res = await fetch('./data/kkl_data.json?v=' + Date.now());
      if (!res.ok) throw new Error("HTTP error " + res.status);
      appData = await res.json();
    } catch (err) {
      console.warn("Notice: Loading from local fallback data due to:", err);
      appData = fallbackData;
    }
    initApp();
  }

  // 2. Initialize App
  function initApp() {
    renderStats();
    initCountdown();
    renderItinerary();
    initMap();
    renderGallery();
    renderProfiles();
    renderFeedback();
    setupEventListeners();
  }

  // Render Stats
  function renderStats() {
    const statDays = document.getElementById('statDays');
    const statAgendas = document.getElementById('statAgendas');
    const statStudents = document.getElementById('statStudents');
    const statPhotos = document.getElementById('statPhotos');

    if (statDays) statDays.textContent = '5';
    if (statAgendas) statAgendas.textContent = (appData.destinations || []).length || '27';
    if (statStudents) statStudents.textContent = (appData.profiles || []).length || '10';
    if (statPhotos) statPhotos.textContent = (appData.gallery || []).length || '6';
  }

  // Live Timer (Countdown or Count-up)
  function initCountdown() {
    const targetDate = new Date(appData.settings?.countdown_start || "2026-08-18T06:00:00+07:00").getTime();
    const cdDays = document.getElementById('cdDays');
    const cdHours = document.getElementById('cdHours');
    const cdMinutes = document.getElementById('cdMinutes');
    const cdSeconds = document.getElementById('cdSeconds');
    const cdLabel = document.getElementById('cdLabel');

    if (!cdDays) return;

    function update() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        if (cdLabel) cdLabel.textContent = "⏳ Hitung Mundur Keberangkatan:";
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        cdDays.textContent = String(d).padStart(2, '0');
        cdHours.textContent = String(h).padStart(2, '0');
        cdMinutes.textContent = String(m).padStart(2, '0');
        cdSeconds.textContent = String(s).padStart(2, '0');
      } else {
        if (cdLabel) cdLabel.textContent = "✨ Jejak Kenangan Terukir Sejak:";
        const passed = Math.abs(diff);
        const d = Math.floor(passed / (1000 * 60 * 60 * 24));
        const h = Math.floor((passed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((passed % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((passed % (1000 * 60)) / 1000);

        cdDays.textContent = String(d).padStart(2, '0');
        cdHours.textContent = String(h).padStart(2, '0');
        cdMinutes.textContent = String(m).padStart(2, '0');
        cdSeconds.textContent = String(s).padStart(2, '0');
      }
    }
    update();
    setInterval(update, 1000);
  }

  // Category tags helper
  function getCategoryMeta(cat) {
    const map = {
      industry: { label: '🏢 Kunjungan Industri', cls: 'cat-industry' },
      culture:  { label: '🎭 Seni & Budaya', cls: 'cat-culture' },
      tourism:  { label: '🏖️ Wisata & Belanja', cls: 'cat-tourism' },
      food:     { label: '🍽️ Kuliner & Makan', cls: 'cat-food' },
      hotel:    { label: '🏨 Akomodasi Hotel', cls: 'cat-hotel' },
      travel:   { label: '🚌 Rute Perjalanan', cls: 'cat-travel' }
    };
    return map[cat] || { label: '📍 Agenda', cls: 'cat-travel' };
  }

  // Render Itinerary per Day
  function renderItinerary() {
    const container = document.getElementById('itineraryList');
    const searchInput = document.getElementById('itinerarySearch');
    if (!container) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const dayTitles = {
      1: { title: "Semarang → Menyeberang ke Pulau Dewata", date: "Selasa, 18 Agustus 2026" },
      2: { title: "Penyeberangan, Bedugul & Devdan Show", date: "Rabu, 19 Agustus 2026" },
      3: { title: "Balai Diklat Industri, Pandawa & Makrab Jimbaran", date: "Kamis, 20 Agustus 2026" },
      4: { title: "Belanja Oleh-Oleh & Perjalanan Pulang ke Jawa", date: "Jumat, 21 Agustus 2026" },
      5: { title: "Tiba Kembali di Kampus Tercinta UPGRIS", date: "Sabtu, 22 Agustus 2026" }
    };

    // Group items by day
    const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    (appData.destinations || []).forEach(item => {
      const day = item.day_no || 1;
      if (!grouped[day]) grouped[day] = [];

      // Search matching
      const matchesSearch = !query || 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.desc && item.desc.toLowerCase().includes(query)) ||
        (item.route && item.route.toLowerCase().includes(query));

      if (matchesSearch) {
        grouped[day].push(item);
      }
    });

    let html = '';
    let totalMatches = 0;

    for (let day = 1; day <= 5; day++) {
      if (activeDay !== 'all' && parseInt(activeDay) !== day) continue;
      const items = grouped[day] || [];
      if (items.length === 0 && query) continue;

      totalMatches += items.length;
      const meta = dayTitles[day] || { title: `Hari ${day}`, date: "" };

      html += `
        <div class="day-card" data-day="${day}">
          <div class="day-card-header">
            <div>
              <span class="day-badge">HARI KE-${day}</span>
              <h3 style="margin-top:6px;">${meta.title}</h3>
            </div>
            <div class="day-date">${meta.date}</div>
          </div>
          <div class="timeline-items">
            ${items.map(item => {
              const catMeta = getCategoryMeta(item.category);
              return `
                <div class="timeline-row">
                  <div class="timeline-time">${item.time || 'Waktu Fleksibel'}</div>
                  <div>
                    <div class="timeline-title">${escapeHtml(item.name)}</div>
                    <p class="timeline-desc">${escapeHtml(item.desc || '')}</p>
                    ${item.route ? `<small style="color:var(--text-light);font-size:12px;">📍 ${escapeHtml(item.route)}</small>` : ''}
                  </div>
                  <div>
                    <span class="cat-tag ${catMeta.cls}">${catMeta.label}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (totalMatches === 0 && query) {
      html = `<div style="text-align:center;padding:50px;background:#ffffff;border-radius:16px;border:1px solid var(--border);">
        <p style="font-size:18px;font-weight:700;">Tidak ditemukan agenda untuk pencarian "${escapeHtml(query)}"</p>
        <p class="muted">Coba ketik kata kunci lain seperti "Pandawa", "Kecak", atau "Victoria Care".</p>
      </div>`;
    }

    container.innerHTML = html;
  }

  // Interactive Leaflet Map
  function initMap() {
    const mapContainer = document.getElementById('kklMap');
    if (!mapContainer || typeof L === 'undefined') return;

    if (mapInstance) {
      mapInstance.remove();
    }

    // Default center around Bali
    mapInstance = L.map('kklMap').setView([-8.4095, 115.1889], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    const points = [];
    (appData.destinations || []).forEach(d => {
      if (d.lat && d.lng) {
        points.push([d.lat, d.lng]);
        const catMeta = getCategoryMeta(d.category);
        const popupContent = `
          <div style="font-family:var(--font-sans);min-width:180px;">
            <strong style="color:var(--primary);font-size:14px;display:block;">${escapeHtml(d.name)}</strong>
            <span style="font-size:12px;color:#d4a753;font-weight:700;">Hari ke-${d.day_no} • ${d.time || ''}</span>
            <p style="font-size:12px;color:#555;margin:4px 0 0;">${escapeHtml(d.desc || '')}</p>
          </div>
        `;
        L.marker([d.lat, d.lng]).addTo(mapInstance).bindPopup(popupContent);
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      mapInstance.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // Render Gallery with Filter
  function renderGallery() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;

    const items = (appData.gallery || []).filter(item => {
      return activeGalCat === 'all' || item.category === activeGalCat;
    });

    container.innerHTML = items.map(item => `
      <div class="gallery-card" data-img="${escapeHtml(item.image)}" data-title="${escapeHtml(item.title)}" data-loc="${escapeHtml(item.location || '')}">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <div class="gallery-info">
          <strong>${escapeHtml(item.title)}</strong>
          <span>📍 ${escapeHtml(item.location || 'Pulau Bali')}</span>
        </div>
      </div>
    `).join('');

    // Attach Lightbox triggers
    container.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        openLightbox(card.dataset.img, card.dataset.title, card.dataset.loc);
      });
    });
  }

  // Lightbox functions
  function openLightbox(imgSrc, title, loc) {
    const lightbox = document.getElementById('galleryLightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    if (!lightbox || !img) return;

    img.src = imgSrc;
    if (cap) cap.innerHTML = `<strong>${title}</strong><br><small>${loc}</small>`;
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    const lightbox = document.getElementById('galleryLightbox');
    if (lightbox) lightbox.classList.remove('active');
  }

  // Render Profiles
  function renderProfiles() {
    const container = document.getElementById('profilesGrid');
    if (!container) return;

    const list = appData.profiles || [];
    container.innerHTML = list.map(p => `
      <div class="profile-card">
        <img class="profile-avatar" src="${escapeHtml(p.photo || 'assets/img/profile-placeholder.svg')}" alt="${escapeHtml(p.name)}" onerror="this.src='assets/img/profile-placeholder.svg'">
        <h4>${escapeHtml(p.name)}</h4>
        <div class="profile-role">${escapeHtml(p.role || 'Mahasiswa Informatika')}</div>
        <p class="profile-bio">${escapeHtml(p.bio || '')}</p>
      </div>
    `).join('');
  }

  // Render Feedback Wall (Pre-seeded + LocalStorage)
  function renderFeedback() {
    const wall = document.getElementById('feedbackWall');
    if (!wall) return;

    // Load custom feedbacks stored locally in browser
    let localFeedbacks = [];
    try {
      localFeedbacks = JSON.parse(localStorage.getItem('kkl_user_feedbacks') || '[]');
    } catch(e) {}

    const allFeedback = [...localFeedbacks, ...(appData.feedback || [])];

    if (allFeedback.length === 0) {
      wall.innerHTML = '<p class="muted">Belum ada cerita yang dibagikan. Jadilah yang pertama!</p>';
      return;
    }

    wall.innerHTML = allFeedback.map(fb => {
      const stars = '★'.repeat(Math.min(5, Math.max(1, fb.rating || 5))) + '☆'.repeat(5 - Math.min(5, Math.max(1, fb.rating || 5)));
      return `
        <div class="feedback-item">
          <div class="feedback-item-header">
            <span class="feedback-author">${escapeHtml(fb.name)}</span>
            <span class="feedback-stars">${stars}</span>
          </div>
          <p class="feedback-msg">${escapeHtml(fb.message)}</p>
          <span class="feedback-date">${escapeHtml(fb.date || 'Baru saja')}</span>
        </div>
      `;
    }).join('');
  }

  // Event Listeners
  function setupEventListeners() {
    // 1. Day Filter Tabs
    document.querySelectorAll('.day-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        activeDay = this.dataset.day || 'all';
        renderItinerary();
      });
    });

    // 2. Itinerary Search
    const searchInput = document.getElementById('itinerarySearch');
    if (searchInput) {
      searchInput.addEventListener('input', renderItinerary);
    }

    // 3. Print Itinerary Button
    const printBtn = document.getElementById('btnPrintItinerary');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // 4. Gallery Filter Buttons
    document.querySelectorAll('.gal-filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.gal-filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeGalCat = this.dataset.cat || 'all';
        renderGallery();
      });
    });

    // 5. Lightbox close
    const closeBtn = document.getElementById('lightboxClose');
    const lightbox = document.getElementById('galleryLightbox');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    // 6. Feedback Form Submission (100% Zero SQL, Instant Client-Side Save)
    const fbForm = document.getElementById('feedbackForm');
    if (fbForm) {
      fbForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const nameInput = document.getElementById('fbName');
        const ratingInput = document.getElementById('fbRating');
        const msgInput = document.getElementById('fbMessage');

        const newFb = {
          id: Date.now(),
          name: nameInput.value.trim(),
          rating: parseInt(ratingInput.value) || 5,
          message: msgInput.value.trim(),
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        };

        if (!newFb.name || !newFb.message) {
          alert('Mohon lengkapi nama dan pesan cerita Anda.');
          return;
        }

        let localFeedbacks = [];
        try {
          localFeedbacks = JSON.parse(localStorage.getItem('kkl_user_feedbacks') || '[]');
        } catch(e) {}

        localFeedbacks.unshift(newFb);
        localStorage.setItem('kkl_user_feedbacks', JSON.stringify(localFeedbacks));

        // Reset form & re-render feedback
        fbForm.reset();
        renderFeedback();
        alert('✨ Terima kasih! Cerita dan kesan pesan Anda telah berhasil dibagikan.');
      });
    }

    // 7. Back to Top Button
    const bttBtn = document.getElementById('btnBackToTop');
    if (bttBtn) {
      window.addEventListener('scroll', () => {
        bttBtn.style.display = window.scrollY > 400 ? 'grid' : 'none';
      });
      bttBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }
})();
