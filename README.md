# KKL Informatika UPGRIS 2026 (Zero-SQL Edition)

Website dokumentasi resmi Kuliah Kerja Lapangan (KKL) Program Studi Informatika Universitas PGRI Semarang 2026.
Dibangun dengan arsitektur **Zero-SQL (Flat-File JSON & Modern Jamstack)**:
- ❌ **TIDAK BUTUH MySQL**
- ❌ **TIDAK BUTUH phpMyAdmin**
- ❌ **TIDAK ADA error koneksi database / SQL Injection**
- ✅ **100% GRATIS dan bisa dideploy di Vercel, Netlify, GitHub Pages, atau XAMPP dalam 30 detik!**

---

## ⚡ Cara Menjalankan di Komputer Lokal

### Opsi A: Langsung Dobel Klik (Tanpa Server Apa Pun)
1. Buka folder `kkl-informatika-upgris-2026`.
2. Klik ganda file **`index.html`**. Website langsung berjalan di browser!

### Opsi B: Lewat XAMPP
1. Letakkan folder `kkl-informatika-upgris-2026` di `C:\xampp\htdocs\`.
2. Cukup nyalakan **Apache** di XAMPP (MySQL **TIDAK PERLU** dinyalakan).
3. Buka browser: `http://localhost/kkl-informatika-upgris-2026/`

---

## 🚀 Cara Deploy GRATIS Selamanya (Paling Mudah)

### Opsi 1: Netlify Drop (Paling Cepat, 10 Detik Online!)
1. Buka situs [https://app.netlify.com/drop](https://app.netlify.com/drop) (login/daftar gratis dengan Google/GitHub).
2. **Seret (drag and drop)** seluruh folder `kkl-informatika-upgris-2026` ke kotak yang disediakan.
3. Website kamu **LANGSUNG ONLINE** dengan domain HTTPS gratis!

### Opsi 2: Vercel (Rekomendasi Developer)
1. Buat repositori baru di GitHub (misal: `kkl-upgris-2026`).
2. Upload semua file dalam folder ini ke GitHub.
3. Buka [https://vercel.com](https://vercel.com), klik **Add New Project**, lalu pilih repositori GitHub tadi.
4. Klik **Deploy**. Selesai!

---

## ⚙️ Pengelolaan Admin Studio (Tanpa SQL)

Akses halaman admin di:
👉 **`admin.html`** (atau `http://localhost/kkl-informatika-upgris-2026/admin.html`)

- **PIN Masuk Bawaan:** `upgris2026`
- **Fitur Studio:**
  - Tambah, Edit, dan Hapus Agenda Destinasi (Hari 1 s/d 5).
  - Tambah dan Hapus Foto Dokumentasi Galeri.
  - Tambah dan Hapus Profil Mahasiswa.
  - Moderasi / Hapus Pesan Buku Tamu.
  - Ganti PIN Admin kapan saja.
- **Penyimpanan:**
  - Di XAMPP: Tombol **"💾 Simpan Perubahan"** akan otomatis menulis data baru ke `data/kkl_data.json` via `api.php`.
  - Di Vercel/Netlify: Kamu bisa klik **"📥 Unduh JSON"** untuk mendownload file data terbaru, lalu replace file `data/kkl_data.json`.

---

## ✨ Fitur Unggulan

1. **Peta Interaktif Semarang — Bali (Leaflet.js):** Menampilkan rute KKL dari Kampus 1 UPGRIS, Tol Trans Jawa, Penyeberangan Ketapang-Gilimanuk, hingga destinasi di Bali lengkap dengan popup foto & rundown.
2. **Itinerary 5 Hari Interaktif:** Tab per hari, live search pencarian agenda instan, dan kategori warna kegiatan (Industri, Budaya, Wisata, Kuliner, Hotel).
3. **Tombol Cetak / PDF Rundown:** 1-klik cetak siap pakai dengan format layout A4 yang rapi untuk dibawa saat perjalanan.
4. **Galeri Foto & Fullscreen Lightbox:** Filter kategori foto dan modal tampilan resolusi tinggi.
5. **Buku Tamu / Cerita Perjalanan:** Pengunjung bisa langsung menulis testimoni yang tersimpan di browser secara instan.
6. **Profil Tim Pengembang:** Menampilkan profil mahasiswa Informatika UPGRIS.
