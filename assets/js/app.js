/* ==========================================================================
   KKL Informatika UPGRIS 2026 - Master JavaScript Controller
   Supabase API Integration Version
   ========================================================================== */

import { api } from './api.js';

(function () {
  'use strict';

  let appData = null;
  let activeDay = 'all';
  let activeGalCat = 'all';
  let mapInstance = null;

  // Fallback initial data in case API fails
  const fallbackData = {
    settings: {
      site_title: "KKL Informatika UPGRIS 2026",
      tagline: "Satu Perjalanan. Seribu Kenangan.",
      subtext: "Portal resmi dokumentasi Kuliah Kerja Lapangan Program Studi Informatika Universitas PGRI Semarang 2026 ke Pulau Dewata Bali.",
      dates: "18–22 Agustus 2026",
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

  // 1. Fetch Data from Supabase API
  async function loadData() {
    try {
      console.log('Loading data from Supabase API...');
      
      // Fetch all data in parallel
      const [profiles, destinations, gallery, videos, feedback, settings] = await Promise.all([
        api.getProfiles(),
        api.getDestinations(),
        api.getGallery(),
        api.getVideos(),
        api.getFeedback(),
        api.getSettings()
      ]);

      appData = {
        settings: { ...fallbackData.settings, ...settings.data },
        profiles: profiles.data || [],
        destinations: destinations.data || [],
        gallery: gallery.data || [],
        videos: videos.data || [],
        feedback: feedback.data || []
      };

      console.log('Data loaded successfully:', {
        profiles: appData.profiles.length,
        destinations: appData.destinations.length,
        gallery: appData.gallery.length,
        videos: appData.videos.length,
        feedback: appData.feedback.length
      });

    } catch (err) {
      console.warn('API failed, using fallback data:', err);
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

  // Itinerary Rendering
  function renderItinerary() {
    const container = document.getElementById('itineraryContent');
    if (!container) return;

    // Group by day
    const byDay = {};
    (appData.destinations || []).forEach(item => {
      const day = item.day_no || 1;
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(item);
    });

    const dayLabels = {
      1: 'Hari 1: Semarang → Bali',
      2: 'Hari 2: Penyeberangan & Eksplorasi Bali',
      3: 'Hari 3: Industri, Budaya & Pantai',
      4: 'Hari 4: Bali → Pulang ke Semarang',
      5: 'Hari 5: Tiba di UPGRIS'
    };

    let html = '';
    for (let day = 1; day <= 5; day++) {
      const items = byDay[day] || [];
      if (items.length === 0) continue;

      html += `
        <div class="itinerary-day" data-day="${day}">
          <h3 class="day-title">${dayLabels[day] || `Hari ${day}`}</h3>
          <div class="timeline">
      `;

      items.forEach((item, index) => {
        const time = item.visit_date ? new Date(item.visit_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
        const category = getCategoryIcon(item.route || item.name);
        
        html += `
          <div class="timeline-item">
            <div class="timeline-marker">${category}</div>
            <div class="timeline-content">
              <h4>${escapeHtml(item.name)}</h4>
              ${time ? `<span class="timeline-time">${time}</span>` : ''}
              ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
              ${item.route ? `<span class="timeline-route">${escapeHtml(item.route)}</span>` : ''}
            </div>
          </div>
        `;
      });

      html += '</div></div>';
    }

    container.innerHTML = html || '<p class="empty">Belum ada jadwal.</p>';
  }

  // Gallery Rendering
  function renderGallery() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;

    const items = appData.gallery || [];
    
    if (items.length === 0) {
      container.innerHTML = '<p class="empty">Belum ada foto dokumentasi.</p>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="gallery-item" data-id="${item.id}">
        <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <div class="gallery-overlay">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.location || '')}</p>
        </div>
      </div>
    `).join('');
  }

  // Profiles Rendering
  function renderProfiles() {
    const container = document.getElementById('profilesGrid');
    if (!container) return;

    const items = appData.profiles || [];
    
    if (items.length === 0) {
      container.innerHTML = '<p class="empty">Belum ada profil tim.</p>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="profile-card">
        <img src="${escapeHtml(item.photo || 'assets/img/profile-placeholder.svg')}" alt="${escapeHtml(item.name)}" loading="lazy">
        <h4>${escapeHtml(item.name)}</h4>
        <span class="profile-role">${escapeHtml(item.role || 'Mahasiswa Informatika')}</span>
        ${item.bio ? `<p class="profile-bio">${escapeHtml(item.bio)}</p>` : ''}
      </div>
    `).join('');
  }

  // Videos Rendering
  function renderVideos() {
    const container = document.getElementById('videoGrid');
    if (!container) return;

    const items = appData.videos || [];
    
    if (items.length === 0) {
      container.innerHTML = '<p class="empty">Belum ada video.</p>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="video-card">
        <div class="video-wrapper">
          <iframe src="${escapeHtml(item.embed_url)}" 
                  title="${escapeHtml(item.title)}" 
                  allowfullscreen loading="lazy"></iframe>
        </div>
        <h4>${escapeHtml(item.title)}</h4>
      </div>
    `).join('');
  }

  // Feedback Rendering
  function renderFeedback() {
    const container = document.getElementById('feedbackWall');
    if (!container) return;

    const items = appData.feedback || [];
    
    if (items.length === 0) {
      container.innerHTML = '<p class="empty">Belum ada cerita. Jadilah yang pertama!</p>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="feedback-card">
        <div class="feedback-header">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="feedback-rating">${'⭐'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</span>
        </div>
        <p>${escapeHtml(item.message)}</p>
        <small class="feedback-date">${new Date(item.created_at).toLocaleDateString('id-ID', { 
          day: 'numeric', month: 'long', year: 'numeric' 
        })}</small>
      </div>
    `).join('');
  }

  // Map Initialization (Leaflet)
  function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;

    if (mapInstance) {
      mapInstance.remove();
    }

    mapInstance = L.map('map').setView([-8.3405, 115.0920], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Add markers for destinations
    (appData.destinations || []).forEach(item => {
      if (item.latitude && item.longitude) {
        L.marker([item.latitude, item.longitude])
          .addTo(mapInstance)
          .bindPopup(`<b>${escapeHtml(item.name)}</b><br>${escapeHtml(item.description || '')}`);
      }
    });
  }

  // Event Listeners
  function setupEventListeners() {
    // Feedback Form Submission
    const form = document.getElementById('feedbackForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const feedback = {
          name: formData.get('name'),
          rating: parseInt(formData.get('rating')),
          message: formData.get('message')
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim...';

        try {
          await api.submitFeedback(feedback);
          alert('Terima kasih! Ceritamu akan muncul setelah disetujui admin.');
          form.reset();
        } catch (err) {
          alert('Gagal mengirim: ' + err.message);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Utility: Escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Utility: Get category icon
  function getCategoryIcon(text) {
    const t = (text || '').toLowerCase();
    if (t.includes('industri') || t.includes('victoria') || t.includes('balai diklat')) return '🏭';
    if (t.includes('makan') || t.includes('breakfast') || t.includes('dinner') || t.includes('resto')) return '🍽️';
    if (t.includes('hotel') || t.includes('check-in') || t.includes('istirahat')) return '🏨';
    if (t.includes('pantai') || t.includes('candi') || t.includes('wisata') || t.includes('belanja')) return '🏖️';
    if (t.includes('kecak') || t.includes('devdan') || t.includes('budaya') || t.includes('tari')) return '🎭';
    return '🚌';
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', loadData);
})();
