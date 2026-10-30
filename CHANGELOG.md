# CHANGELOG - KKL Informatika UPGRIS 2026

## [v2.0.0] - 2026-10-30

### ✨ Fitur Baru Major

#### 🎬 Manajemen Video YouTube
- **Tambah Video YouTube** dengan URL otomatis konversi ke embed
- **Edit Video** dengan live preview iframe
- **Hapus Video** dengan konfirmasi
- **Validasi URL** mendukung format:
  - `https://youtube.com/watch?v=xxx`
  - `https://youtu.be/xxx`
  - `https://youtube.com/embed/xxx`
- **Live Preview** tampilan video langsung di form dan list

#### 👥 Full CRUD Profil Mahasiswa
- **Tambah Profil** dengan modal form profesional
- **Edit Profil** lengkap (nama, role, bio, foto, urutan)
- **Hapus Profil** dengan konfirmasi keamanan
- **Drag & Drop Sorting** untuk mengubah urutan tampilan
- **Live Photo Preview** saat input URL foto
- **Urutan Otomatis** dengan field `sort_order`

#### 🎨 Perbaikan UI/UX Dashboard Admin

**Modal Dialog System:**
- Modal profesional dengan overlay blur
- Animasi smooth (fadeIn + slideUp)
- Responsive design untuk mobile
- Close dengan tombol × / Escape key / klik overlay
- Form validation dengan feedback real-time

**Enhanced Forms:**
- Form layout 2-kolom responsive
- Input focus styling dengan shadow hijau
- Live preview untuk foto & video
- Textarea auto-resize
- Placeholder hints yang jelas

**Button System:**
- `btn-edit-sm` (biru) untuk edit
- `btn-danger-sm` (merah) untuk hapus
- `btn-primary` (hijau) untuk save
- `btn-ghost` untuk cancel/secondary
- `btn-gold` untuk save changes utama
- Hover effects & transitions smooth

**Tab Navigation:**
- 6 Tab menu: ⚙️ Pengaturan | 🗓️ Agenda | 🖼️ Galeri | 👥 Profil | 🎬 Video | 💬 Feedback
- Active state dengan warna hijau
- Smooth transition antar tab
- Sticky position di scroll

#### 🏗️ Refactoring Arsitektur

**File Structure:**
```
admin.html (22KB) - Pure HTML + CSS, load admin.js
assets/js/admin.js (26KB) - All admin logic & CRUD operations
```

**Benefits:**
- Kode lebih maintainable & readable
- Separation of concerns (HTML/CSS vs JavaScript)
- Mudah di-debug dan test
- Performa lebih baik (cache terpisah)

### 🔧 Perbaikan Teknis

**JavaScript Improvements:**
- Helper functions: `escapeHtml()`, `extractYoutubeId()`, `getYoutubeEmbedUrl()`
- Global window exports untuk inline onclick handlers
- Proper modal state management
- Event delegation untuk dynamic content
- localStorage fallback untuk offline editing

**Form Enhancements:**
- Validasi wajib field (nama, role, URL video)
- Auto-trim whitespace
- Number input untuk lat/lng, sort_order
- datetime-local picker untuk countdown
- Select dropdown untuk kategori

**Data Management:**
- Consistent ID generation (`Date.now()`)
- Array sorting dengan multiple keys
- Filter & map operations
- Deep copy untuk edit prevention

### 🐛 Bug Fixes
- Fixed modal not closing on overlay click
- Fixed photo preview not updating on URL change
- Fixed video embed URL parsing for multiple formats
- Fixed escape key handler conflicting with forms
- Fixed form reset after successful save

### 📋 Daftar Perubahan Lengkap

#### File yang Diubah:
1. **admin.html** (rewrite 60%)
   - Struktur HTML lebih semantik
   - CSS terorganisir dengan sections
   - Modal markup untuk Destination & Profile
   - Tab YouTube Video baru
   - Load external admin.js

2. **assets/js/admin.js** (new file)
   - 550+ lines pure JavaScript
   - 8 render functions (Settings, Dest, Gallery, Profile, Video, Feedback)
   - 3 modal handlers (Destination, Profile, Video)
   - CRUD operations untuk 5 entitas
   - Event listeners terorganisir

#### Fitur yang Ditambahkan:
✅ Edit profil mahasiswa (sebelumnya: hanya view)
✅ Kelola video YouTube (sebelumnya: tidak ada)
✅ Live preview foto & video
✅ Drag & drop sorting
✅ Modal dialog system
✅ Form validation
✅ Enhanced UX dengan animasi

#### Backward Compatibility:
✅ Data JSON format tetap sama
✅ API.php tetap berfungsi
✅ localStorage fallback tetap ada
✅ Pin login sistem tidak berubah
✅ Semua fitur lama tetap jalan

### 🚀 Cara Menggunakan Fitur Baru

#### Edit Profil Mahasiswa:
1. Login ke admin panel (PIN: upgris2026)
2. Klik tab **👥 Profil Mahasiswa**
3. Klik tombol **Edit** pada profil yang ingin diubah
4. Ubah Nama / Role / Bio / URL Foto / Urutan
5. Lihat live preview foto jika URL valid
6. Klik **Simpan**

#### Tambah Video YouTube:
1. Klik tab **🎬 Video YouTube**
2. Klik **+ Tambah Video**
3. Paste URL YouTube (contoh: https://youtube.com/watch?v=dQw4w9WgXcQ)
4. Isi judul & deskripsi
5. Lihat live preview embed
6. Klik **Simpan Video**

#### Drag & Drop Sorting:
1. Klik & tahan icon **⋮⋮** di kiri item
2. Drag ke posisi baru
3. Drop untuk pindah urutan
4. Klik **💾 Simpan Perubahan** untuk persist

### 📊 Statistik Update

- **Lines of Code Added:** ~1,100
- **Lines of Code Removed:** ~370
- **Files Changed:** 2
- **New Files:** 1 (admin.js)
- **Functions Added:** 15+
- **Bug Fixes:** 5

### 🎯 Next Steps (Future Enhancements)

Potential improvements untuk versi berikutnya:
- [ ] Image upload langsung (drag & drop file)
- [ ] Bulk edit/delete operations
- [ ] Export/Import JSON dengan validation
- [ ] Dark mode toggle
- [ ] Search & filter di admin lists
- [ ] Activity log/history
- [ ] Multi-language support
- [ ] Role-based access (admin vs editor)

---

**Developed by:** Muhamad Luthfi Abdullah  
**Tech Stack:** Vanilla JavaScript, Zero-SQL Architecture, Modern CSS3  
**Compatibility:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
