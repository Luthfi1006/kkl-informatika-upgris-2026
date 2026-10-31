# 🏫 KKL Informatika UPGRIS 2026 - Event Portal Website

**Official Digital Documentation Platform** untuk Kuliah Kerja Lapangan (KKL) Program Studi Informatika **Universitas PGRI Semarang 2026**.

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/Luthfi1006/kkl-informatika-upgris-2026/releases)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4.svg)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-4479A1.svg)](https://mysql.com)
[![Security](https://img.shields.io/badge/Security-Hardened-green.svg)](SECURITY.md)
[![License](https://img.shields.io/badge/license-Educational-orange.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)]()

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Security](#-security)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [Admin Panel](#-admin-panel)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

| Property | Details |
|----------|---------|
| **Event** | Kuliah Kerja Lapangan (KKL) |
| **Program** | Informatika UPGRIS 2026 |
| **Date** | 18–22 Agustus 2026 |
| **Location** | Bali, Indonesia |
| **Purpose** | Digital documentation, itinerary, gallery, team profiles, testimonials |

---

## ✨ Features

### 🌐 Public Website (`index.php`)
| Feature | Description |
|---------|-------------|
| **Hero & Countdown** | Event info + live timer to departure |
| **Itinerary Timeline** | 5-day schedule grouped by day, searchable |
| **Photo Gallery** | Lightbox-enabled, categorized by destination |
| **Video Memory** | YouTube embeds with responsive players |
| **Team Profiles** | Developer crew with photos, roles, bios |
| **Feedback System** | Public testimonials with rating & moderation |
| **Responsive Design** | Mobile-first, works on all devices |

### 🔐 Admin Panel (`/admin/`)
| Feature | Description |
|---------|-------------|
| **Unified Dashboard** | Single view: Settings, Destinations, Gallery, Profiles, Videos, Feedback |
| **CRUD Operations** | Create, Read, Update, Delete for all entities |
| **File Upload** | Drag-drop images (JPG/PNG/WebP/GIF, max 5MB) |
| **Real-time Preview** | Instant preview before saving |
| **Feedback Moderation** | Approve/Reject with one click |
| **Drag & Drop Sorting** | Reorder items visually |
| **Session Management** | 30-min timeout, secure cookies |
| **Rate Limiting** | 5 login attempts / 15 min |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | PHP 7.4+ (native, no framework) |
| **Database** | MySQL 5.7+ / MariaDB 10.3+ (InnoDB, UTF8MB4) |
| **Frontend** | Vanilla JS (ES6+), Modern CSS3 (CSS Variables, Grid, Flexbox) |
| **Security** | PDO Prepared Statements, Bcrypt (cost=12), CSRF Tokens, Rate Limiting |
| **Deployment** | Apache / Nginx, Let\'s Encrypt SSL, Docker-ready |

---

## 🏗 Architecture

```
kkl-informatika-upgris-2026/
├── index.php                    # Public entry point
├── admin/                       # Admin panel (server-rendered)
│   ├── login.php               # Authentication
│   ├── dashboard.php           # Main dashboard
│   ├── *_form.php              # CRUD forms
│   └── auth.php                # Auth middleware
├── admin-api.php               # REST API for AJAX integration
├── config/
│   ├── database.php            # PDO connection + env support
│   ├── helpers.php             # Security, validation, logging
├── assets/
│   ├── css/                    # Stylesheets
│   ├── js/                     # Vanilla JS modules
│   └── uploads/                # User-generated content
├── .secure/
│   └── database.sql            # Schema + seed data (protected)
├── migrate.php                 # Web-based DB migration
├── test_deployment.php         # Pre-deployment verification
└── .htaccess                   # Security & performance rules
```

**Data Flow:**
```
Admin Panel → MySQL Database ← Public Website
     ↓                              ↑
File Uploads ────────────────────────┘
```

---

## 🔐 Security (v2.1.0 Hardening)

| Layer | Implementation |
|-------|----------------|
| **Authentication** | Bcrypt (cost=12), session regeneration, 30-min timeout |
| **Authorization** | Admin-only routes, session validation on every request |
| **Rate Limiting** | Login: 5/15min, Feedback: 3/hr per IP |
| **Input Validation** | Whitelist sanitization, MIME verification, spam detection |
| **CSRF Protection** | Per-session tokens, constant-time verification |
| **SQL Injection** | PDO prepared statements, `EMULATE_PREPARES=false` |
| **XSS Prevention** | `htmlspecialchars()` on all output |
| **File Security** | Extension + MIME check, random filenames, type restrictions |
| **HTTPS Enforcement** | Auto-redirect on production, HSTS headers |
| **Logging** | Daily logs, error/warning/info levels, audit trail |

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- PHP 7.4+ with PDO, JSON, Session, Fileinfo extensions
- MySQL 5.7+ / MariaDB 10.3+
- Web server (Apache/Nginx) with SSL
- Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Luthfi1006/kkl-informatika-upgris-2026.git
cd kkl-informatika-upgris-2026

# 2. Configure environment
cp .env.example .env
nano .env  # Set DB credentials, APP_ENV=production

# 3. Deploy (choose one)

# Option A: Automated Linux/macOS
chmod +x deploy.sh
sudo ./deploy.sh

# Option B: Automated Windows
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy.ps1

# Option C: Manual (see Deployment section)

# 4. Database migration
# Via browser: https://your-domain.com/migrate.php?confirm=yes
# Or CLI: mysql -u user -p db < .secure/database.sql

# 5. Set admin password
php generate_password.php
# Copy hash → UPDATE admins SET password='hash' WHERE username='admin';

# 6. Cleanup
rm migrate.php generate_password.php test_deployment.php

# 7. Test
open https://your-domain.com/
```

---

## 📦 Deployment

### Linux/macOS (Automated)
```bash
chmod +x deploy.sh
sudo ./deploy.sh
# Handles: backup, git pull, permissions, migration, cleanup, web server restart
```

### Windows/IIS (PowerShell)
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy.ps1 -ProjectPath "C:\inetpub\wwwroot\kkl-2026"
```

### Docker
```dockerfile
FROM php:8.0-apache
RUN docker-php-ext-install pdo pdo_mysql && a2enmod rewrite
COPY . /var/www/html
RUN chown -R www-data:www-data /var/www/html
EXPOSE 80
```

### Web Server Configs
| Server | Config File |
|--------|-------------|
| **Nginx** | `nginx.conf.example` |
| **Apache** | `apache.conf.example` |
| **.htaccess** | Included (security + caching + HTTPS redirect) |

### SSL/HTTPS (Required for Production)
```bash
# Let's Encrypt
sudo certbot --nginx -d kkl-informatika.upgris.ac.id

# Security headers auto-applied via .htaccess/nginx.conf
```

---

## ⚙ Configuration

### Environment Variables (`.env`)
```bash
# Application
APP_ENV=production              # development | production
APP_URL=https://kkl-2026.upgris.ac.id
APP_TIMEZONE=Asia/Jakarta

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kkl_upgris_2026
DB_USER=kkl_user
DB_PASS=YourSecurePassword@2026

# Security
SESSION_TIMEOUT=1800            # 30 minutes
SESSION_NAME=kkl_session
ADMIN_LOGIN_ATTEMPTS=5
ADMIN_LOCKOUT_TIME=900

# Features
FEEDBACK_RATE_LIMIT=3
UPLOAD_MAX_SIZE=5242880         # 5MB
```

### Database Setup
```sql
CREATE DATABASE kkl_upgris_2026 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kkl_user'@'localhost' IDENTIFIED BY 'SecurePass@2026';
GRANT ALL PRIVILEGES ON kkl_upgris_2026.* TO 'kkl_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 👑 Admin Panel

### Access
```
URL: https://your-domain.com/admin/login.php
Default: admin / [your-generated-password]
```

### Dashboard Tabs
| Tab | Description |
|-----|-------------|
| ⚙️ **Pengaturan** | Site title, logo upload |
| 🗓️ **Agenda** | Destinations/Itinerary CRUD |
| 🖼️ **Galeri** | Photo upload, categorize by destination |
| 👥 **Profil** | Team members with photos, roles, drag-drop sort |
| 🎬 **Video** | YouTube embeds with live preview |
| 💬 **Feedback** | Moderate user testimonials |

### Key Workflows

**Add Team Member with Photo:**
1. Click **Profil** → **+ Tambah**
2. Fill name, role, bio, sort order
3. Upload photo (auto-resized, optimized)
4. **Save** → Instantly visible on public site

**Moderate Feedback:**
1. User submits via website → Stored as `approved=0`
2. Admin sees in **Feedback** tab
3. Click **Setujui** → `approved=1` → Shows on website
4. Click **Hapus** → Permanently removed

**Manage Itinerary:**
1. **Agenda** → **+ Tambah**
2. Set day number (1-5), time, description, route
3. Auto-grouped by day on public timeline

---

## 📡 API Documentation

### Public Endpoints
```
GET  /api.php?action=destinations     # All itinerary items
GET  /api.php?action=gallery          # Gallery photos with destination names
GET  /api.php?action=videos           # YouTube embeds
GET  /api.php?action=feedback         # Approved testimonials only
POST /submit_feedback.php             # Submit new feedback (rate limited)
```

### Admin API (`admin-api.php`)
```
GET  /admin-api.php?action=profiles_list
POST /admin-api.php?action=profile_save      # multipart/form-data
POST /admin-api.php?action=profile_delete

GET  /admin-api.php?action=feedback_list
POST /admin-api.php?action=feedback_approve
POST /admin-api.php?action=feedback_delete

GET  /admin-api.php?action=destinations_list
POST /admin-api.php?action=destination_save
POST /admin-api.php?action=destination_delete

GET  /admin-api.php?action=gallery_list
POST /admin-api.php?action=gallery_save      # multipart/form-data
POST /admin-api.php?action=gallery_delete

GET  /admin-api.php?action=videos_list
POST /admin-api.php?action=video_save
POST /admin-api.php?action=video_delete
```

**All admin endpoints require:**
- Valid admin session
- CSRF token (`X-CSRF-TOKEN` header or `csrf_token` field)

---

## 🗄 Database Schema

### Core Tables
| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `settings` | Site config | `idx_name` |
| `admins` | Admin accounts | `idx_username` |
| `profiles` | Team members | `idx_sort` |
| `destinations` | Itinerary items | `idx_day_sort`, `idx_visit_date` |
| `gallery` | Photo metadata | `idx_destination`, `idx_created` |
| `videos` | YouTube embeds | `idx_created` |
| `feedback` | User testimonials | `idx_approved`, `idx_created` |

### Relationships
```sql
gallery.destination_id → destinations.id (FK, SET NULL)
feedback.approved      → CHECK (1-5) constraint
profiles.sort_order    → INDEX for ordering
```

### Migration
```bash
# Web-based (recommended)
https://domain.com/migrate.php?confirm=yes

# Manual
mysql -u kkl_user -p kkl_upgris_2026 < .secure/database.sql
```

---

## 🐛 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **Database connection failed** | Wrong credentials in `.env` | Check `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` |
| **Admin login fails** | Wrong password / rate limited | Wait 15 min or reset via SQL: `UPDATE admins SET password='new_hash' WHERE username='admin'` |
| **Photo upload fails** | Permissions / size limit | `chmod 755 assets/uploads`; check `php.ini` upload limits |
| **Feedback not showing** | Not approved | Admin → Feedback → Click **Setujui** |
| **Session expires fast** | HTTPS not configured | Set `APP_ENV=production` + valid SSL cert |
| **404 on admin pages** | Rewrite module disabled | `a2enmod rewrite` (Apache) or check Nginx config |
| **Emoji/encoding issues** | File encoding | All PHP files are UTF-8; ensure editor saves as UTF-8 |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style
- PSR-12 for PHP
- ES6+ for JavaScript
- CSS Variables for theming
- Comments in Indonesian/English

---

## 📄 License

**Educational Use Only** - Built for KKL Informatika UPGRIS 2026.

Modify freely for your event documentation needs. Attribution appreciated.

---

## 👥 Credits

| Role | Name |
|------|------|
| **Lead Developer** | Muhamad Luthfi Abdullah |
| **Team Members** | Dita, Maeladia, Deva, Panji, Ridho, Andrey, Danar, Afrizal, Ismail, Rizki, Abdullah Faza |
| **Institution** | Universitas PGRI Semarang (UPGRIS) |
| **Program** | Informatika 2026 |

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| **Live Demo** | https://kkl-informatika.upgris.ac.id |
| **Repository** | https://github.com/Luthfi1006/kkl-informatika-upgris-2026 |
| **Issues** | https://github.com/Luthfi1006/kkl-informatika-upgris-2026/issues |
| **Wiki** | https://github.com/Luthfi1006/kkl-informatika-upgris-2026/wiki |
| **Changelog** | [CHANGELOG.md](CHANGELOG.md) |
| **Deployment Checklist** | [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) |
| **Quick Start** | [QUICKSTART.md](QUICKSTART.md) |
| **Admin Integration** | [ADMIN-INTEGRATION.md](ADMIN-INTEGRATION.md) |

---

## 📊 Project Status

```
Version:       2.1.0 (Security Hardening + Admin Integration)
Last Updated:  2026-10-31
Status:        ✅ Production Ready
Security:      🔒 Enterprise-grade
Tests:         ✅ Pre-deployment verification suite
Docs:          📚 Comprehensive
```

---

> **Built with ❤️ by Mahasiswa Informatika UPGRIS 2026**  
> *Documenting memories, one commit at a time.*

---
