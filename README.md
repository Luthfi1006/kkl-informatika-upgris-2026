# 🏫 KKL Informatika UPGRIS 2026 - Static Portfolio

**Portfolio Website** untuk Kuliah Kerja Lapangan (KKL) Program Studi Informatika **Universitas PGRI Semarang 2026**.

🌐 **Live Demo:** https://luthfi1006.github.io/kkl-informatika-upgris-2026/  
📅 **Event:** 18–22 Agustus 2026 | 📍 **Lokasi:** Bali, Indonesia

---

## ✨ Fitur Website (Static Portfolio)

| Fitur | Status |
|-------|--------|
| 🏠 **Landing Page** | ✅ Hero, Countdown, Stats |
| 🗺️ **Peta Interaktif** | ✅ Leaflet.js |
| 📅 **Itinerary 5 Hari** | ✅ Tab-based timeline |
| 📸 **Galeri Foto** | ✅ Grid + Lightbox-ready |
| 🎬 **Video Kenangan** | ✅ YouTube Embed |
| 👥 **Profil Mahasiswa** | ✅ Grid dengan bio |
| 💬 **Buku Tamu (Feedback)** | ✅ Form + Wall (Supabase) |
| 📱 **Responsive** | ✅ Mobile-first |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JS (ES6+) |
| **Styling** | CSS Variables, Flexbox, Grid |
| **Map** | Leaflet.js |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (untuk admin) |
| **Hosting** | **GitHub Pages** (Static) |
| **Database** | Supabase (Real-time) |

---

## 📁 Project Structure

```
kkl-informatika-upgris-2026/
├── index.html          # Main entry point
├── 404.html            # SPA routing fallback
├── .nojekyll           # Disable Jekyll processing
├── assets/
│   ├── css/
│   │   └── app.css     # Main stylesheet
│   ├── js/
│   │   └── app.js      # Main application logic
│   ├── img/            # Static images
│   └── uploads/        # User uploads (via Supabase)
├── .secure/
│   └── database.sql    # Supabase schema
├── supabase-schema.sql # Database schema
├── CHANGELOG.md
├── README.md
└── SUPABASE-SETUP.md
```

---

## 🚀 Deploy ke GitHub Pages

### 1. Push ke GitHub
```bash
git add .
git commit -m "Deploy static portfolio"
git push origin main
```

### 2. Enable GitHub Pages
1. Buka repository di GitHub
2. **Settings** → **Pages** (sidebar kiri)
3. **Source**: `Deploy from a branch`
4. **Branch**: `main` / `/(root)`
5. **Save**

### 3. Akses Website
```
https://luthfi1006.github.io/kkl-informatika-upgris-2026/
```

---

## 🔧 Supabase Setup (Required untuk Data & Feedback)

### 1. Buat Project Supabase
1. https://supabase.com → New Project
2. Copy **Project URL** & **anon public key**

### 2. Jalankan Schema
- Buka **SQL Editor** di Supabase
- Paste isi `supabase-schema.sql` → Run

### 3. Update Credentials di `assets/js/app.js`
```javascript
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

### 4. Buat Admin User (untuk approve feedback)
- Supabase Dashboard → Authentication → Add User
- Email: `admin@domain.com` / Password: `secure123`

---

## 📱 Features Detail

### 📅 Itinerary (5 Hari)
- Tab-based navigation (Hari 1-5)
- Timeline dengan kategori icon
- Waktu, deskripsi, rute per destinasi

### 📸 Galeri Foto
- Grid responsif
- Lazy loading images
- Overlay info (judul, lokasi)

### 🎬 Video Kenangan
- YouTube embed responsive
- Grid layout

### 👥 Profil Tim
- Foto, nama, role, bio
- Sortable via Supabase

### 💬 Buku Tamu (Feedback)
- Form: Nama, Rating (1-5), Pesan
- Kirim ke Supabase (pending approval)
- Wall of stories (approved only)

### 🗺️ Peta Interaktif
- Leaflet.js + OpenStreetMap
- Marker dari database destinasi

---

## 🔐 Supabase Credentials (Update di `assets/js/app.js`)

```javascript
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
```

> ⚠️ **anon key** aman untuk frontend (public). **service_role key** JANGAN dipakai di frontend.

---

## 📝 Scripts

| Command | Fungsi |
|---------|--------|
| `git push origin main` | Deploy ke GitHub Pages |
| Local testing | Buka `index.html` langsung di browser |

---

## 📄 Documentation

- [CHANGELOG.md](CHANGELOG.md) - Riwayat perubahan
- [SUPABASE-SETUP.md](SUPABASE-SETUP.md) - Setup database lengkap
- [supabase-schema.sql](supabase-schema.sql) - Schema database

---

## 👥 Credits

**Development Team** - Mahasiswa Informatika UPGRIS 2026  
**Lead Developer:** Luthfi Abdullah  
**Institution:** Universitas PGRI Semarang (UPGRIS)  
**Program:** Informatika 2026

---

## 📄 License

Educational Purpose - Portfolio Project

---

## 🔗 Links

- 🌐 **Live:** https://luthfi1006.github.io/kkl-informatika-upgris-2026/
- 📂 **Repo:** https://github.com/Luthfi1006/kkl-informatika-upgris-2026
- 🐛 **Issues:** https://github.com/Luthfi1006/kkl-informatika-upgris-2026/issues
- 📚 **Wiki:** https://github.com/Luthfi1006/kkl-informatika-upgris-2026/wiki

---

> **Built with ❤️ by Mahasiswa Informatika UPGRIS 2026**  
> *Documenting memories, one commit at a time.*
