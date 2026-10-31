# KKL Informatika UPGRIS 2026 - Website Documentation

**Event Portal** untuk Kuliah Kerja Lapangan (KKL) Program Studi Informatika Universitas PGRI Semarang 2026.

📅 **Event**: 18-22 Agustus 2026 | 📍 **Location**: Bali, Indonesia

---

## 🚀 Quick Start

### Requirements

- PHP 7.4+ (Rekomendasi 8.0+)
- MySQL 5.7+ atau MariaDB 10.3+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- HTTPS (required untuk production)

### Installation (5 minutes)

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/Luthfi1006/kkl-informatika-upgris-2026.git
cd kkl-informatika-upgris-2026
```

#### 2️⃣ Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env dengan database credentials
nano .env
```

**`.env` template:**
```env
APP_ENV=production
APP_URL=https://kkl-informatika.upgris.ac.id

DB_HOST=localhost
DB_NAME=kkl_upgris_2026
DB_USER=kkl_user
DB_PASS=SecurePassword@2026
```

#### 3️⃣ Database Migration
```bash
# Akses via browser:
# https://your-domain.com/migrate.php?confirm=yes

# Atau manual import:
mysql -u kkl_user -p kkl_upgris_2026 < .secure/database.sql
```

#### 4️⃣ Set Admin Password
```bash
# Generate secure password hash
php -r "echo password_hash('Admin@Password2026', PASSWORD_BCRYPT, ['cost' => 12]);"

# Copyoutput hash ke database
UPDATE admins SET password='$2y$12$...' WHERE username='admin';
```

#### 5️⃣ Cleanup & Verify
```bash
# Delete migration file (security)
rm migrate.php

# Test website
# Open: https://your-domain.com/
```

---

## 📋 Configuration

### Environment Variables (`.env`)

```bash
# Application
APP_ENV=production              # development | production
APP_URL=https://kkl-2026.id

# Database
DB_HOST=localhost              # Database host
DB_NAME=kkl_upgris_2026        # Database name
DB_USER=kkl_user               # Database user
DB_PASS=SecurePass@2026        # Database password

# Session
SESSION_TIMEOUT=1800           # 30 minutes in seconds
SESSION_NAME=kkl_session       # Session cookie name

# Admin
ADMIN_LOGIN_ATTEMPTS=5         # Max login attempts
ADMIN_LOCKOUT_TIME=900         # Lockout duration (seconds)
```

### Database Configuration

The application uses MySQL 5.7+ with InnoDB engine.

**Key Tables:**
- `settings` - Site configuration
- `admins` - Administrator accounts
- `profiles` - Team member directory
- `destinations` - Event itinerary/schedule
- `gallery` - Photo metadata
- `videos` - YouTube embeds
- `feedback` - User testimonials

See `.secure/database.sql` untuk schema lengkap.

---

## 🔐 Security Setup

### 1. SSL/HTTPS Certificate

```bash
# Using Let's Encrypt (Recommended)
sudo certbot certonly --webroot -w /path/to/webroot -d kkl-2026.upgris.id

# Auto-redirect HTTP to HTTPS
# Di .htaccess atau server config:
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 2. Admin Access

**First Login:**
- Username: `admin`
- Password: [Your custom password set during installation]

**Change Password Immediately:**
1. Login to `/admin/login.php`
2. Go to Settings → Change Password
3. Use strong password (min 8 chars, 1 uppercase, 1 number, 1 special char)

### 3. Security Headers

Add ke web server config (nginx/apache):

```nginx
# Nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

```apache
# Apache (.htaccess)
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "no-referrer-when-downgrade"
```

### 4. File Permissions

```bash
# Set proper permissions
chmod 755 /var/www/kkl-2026                    # Root dir
chmod 755 /var/www/kkl-2026/{admin,assets}     # Folders
chmod 644 /var/www/kkl-2026/*.php              # PHP files
chmod 755 /var/www/kkl-2026/assets/uploads     # Upload dir
chmod 700 /var/www/kkl-2026/.secure            # Secure dir (no web access)

# Set proper ownership
chown -R www-data:www-data /var/www/kkl-2026
```

### 5. .htaccess Configuration

```apache
# Block direct access ke sensitive folders
<FilesMatch "\.env$|\.git|\.secure|\.sql$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Enable mod_rewrite
RewriteEngine On
RewriteBase /

# Redirect to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Block direct access to PHP files in admin folder
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

---

## 🐳 Deployment Options

### Option 1: Shared Hosting (InfinityFree, Netlify, Vercel)

**Via FTP/SFTP:**
1. Upload files using FTP client
2. Create database via hosting panel
3. Edit database credentials di `.env`
4. Access `/migrate.php` untuk setup database
5. Delete `migrate.php` setelah selesai

**Important:**
- Some hosts may require different paths
- Check hosting documentation untuk PHP version
- Ensure SSL certificate is activated

### Option 2: VPS/Dedicated Server (Recommended)

```bash
# SSH ke server
ssh user@server.com

# Clone repository
cd /var/www
git clone https://github.com/Luthfi1006/kkl-informatika-upgris-2026.git kkl-2026

# Setup permissions
sudo chown -R www-data:www-data kkl-2026
chmod -R 755 kkl-2026
chmod 700 kkl-2026/.secure
chmod 700 kkl-2026/logs

# Install PHP dependencies (if any)
cd kkl-2026

# Create .env
cp .env.example .env
nano .env

# Setup database
mysql -u root -p < .secure/database.sql

# Access migration (if needed)
# https://your-domain.com/migrate.php

# Delete migration file
rm migrate.php
```

### Option 3: Docker Deployment

```dockerfile
# Dockerfile
FROM php:8.0-apache
RUN docker-php-ext-install pdo pdo_mysql
RUN a2enmod rewrite
COPY . /var/www/html
RUN chown -R www-data:www-data /var/www/html
EXPOSE 80
```

```bash
# Build & run
docker build -t kkl-2026 .
docker run -p 80:80 -e DB_HOST=db kkl-2026
```

---

## 🔧 Admin Panel

### Features

| Feature | Status | Description |
|---------|--------|-------------|
| Manage Itinerary | ✅ | Add, edit, delete destinations |
| Manage Gallery | ✅ | Upload & organize photos |
| Manage Videos | ✅ | Add YouTube videos |
| Manage Profiles | ✅ | Team member directory |
| Manage Settings | ✅ | Site configuration |
| Approve Feedback | ✅ | User testimonials moderation |
| Change Password | ✅ | Account security |

### Access Admin Panel

1. Go to: `https://your-domain.com/admin/login.php`
2. Login dengan admin credentials
3. Session timeout: 30 minutes inactivity
4. Rate limiting: Max 5 login attempts per 15 minutes

---

## 📊 Database Schema

### Tables Overview

**settings** - Configuration
```sql
id | name | value | updated_at
```

**admins** - Admin accounts
```sql
id | username | password | created_at | last_login
```

**profiles** - Team members
```sql
id | name | role | bio | photo | sort_order | created_at | updated_at
```

**destinations** - Itinerary items
```sql
id | name | visit_date | description | day_no | route | sort_order | created_at | updated_at
```

**gallery** - Photo metadata
```sql
id | destination_id | title | location | photo | created_at | updated_at
```

**videos** - YouTube embeds
```sql
id | title | embed_url | created_at | updated_at
```

**feedback** - User testimonials
```sql
id | name | rating | message | approved | created_at
```

---

## 🐛 Troubleshooting

### Database Connection Error

**Problem:** `Failed to connect to database`

**Solution:**
```bash
# 1. Verify credentials di .env
cat .env | grep DB_

# 2. Test database manually
mysql -h localhost -u kkl_user -p kkl_upgris_2026

# 3. Check permissions
GRANT ALL PRIVILEGES ON kkl_upgris_2026.* TO 'kkl_user'@'localhost';
FLUSH PRIVILEGES;

# 4. Check PHP PDO extension
php -m | grep pdo
```

### Login Failed

**Problem:** Username/password incorrect

**Solution:**
```bash
# Reset admin password
php -r "echo password_hash('NewPassword@2026', PASSWORD_BCRYPT, ['cost' => 12]);"

# Update database
mysql> UPDATE admins SET password='$2y$12$...' WHERE username='admin';
```

### Session Timeout

**Problem:** Logged out after 30 minutes

**Solution:**
- This is by design (security feature)
- Login again ke continue
- Edit SESSION_TIMEOUT di .env if needed

### Upload Failing

**Problem:** Cannot upload photos

**Solution:**
```bash
# Check permissions
chmod 755 assets/uploads
chmod 755 assets/uploads/*

# Check disk space
df -h

# Check file size limit (php.ini)
upload_max_filesize = 10M
post_max_size = 20M
```

### Feedback Not Showing

**Problem:** Feedback submitted but not visible

**Solution:**
1. Check di admin panel: Feedback tab
2. Click "Approve" untuk publish feedback
3. Verify `approved` field is 1 di database

---

## 📁 Project Structure

```
kkl-informatika-upgris-2026/
├── .env                       # Environment config (local only)
├── .env.example              # Template untuk .env
├── .gitignore                # Git ignore rules
├── .secure/                  # Sensitive files (not in webroot)
│   └── database.sql         # Database schema & seed data
├── index.php                 # Main entry point
├── index.html                # Static redirect fallback
├── migrate.php               # Database migration script
├── submit_feedback.php       # Feedback submission handler
├── api.php                   # API endpoints
├── admin/                    # Admin panel
│   ├── login.php            # Login page
│   ├── auth.php             # Authentication module
│   ├── dashboard.php        # Admin dashboard
│   ├── [entity]_form.php    # CRUD forms
│   └── logout.php           # Logout handler
├── assets/                   # Static files
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript
│   ├── img/                 # Images
│   └── uploads/             # User uploads
│       ├── branding/        # Site logos
│       ├── gallery/         # Event photos
│       └── profiles/        # Team photos
├── config/                   # Configuration
│   ├── database.php         # Database connection
│   ├── helpers.php          # Utility functions
│   └── supabase.js          # (Legacy)
├── lib/                      # Libraries
│   └── (Legacy Supabase files)
├── partials/                 # Template partials
│   ├── header.php           # Page header
│   └── footer.php           # Page footer
├── data/                     # Data files (legacy)
└── logs/                     # Application logs

```

---

## 🚀 API Endpoints

### Public Endpoints

```
GET  /api.php?action=destinations     # Get all destinations
GET  /api.php?action=gallery          # Get gallery items
GET  /api.php?action=videos           # Get videos
GET  /api.php?action=feedback         # Get approved feedback
POST /submit_feedback.php             # Submit feedback
```

### Admin Endpoints

All admin endpoints require authentication. Access via admin panel or API calls with session.

---

## 📝 Features

### Public Website
- ✅ Event itinerary with timeline view
- ✅ Photo gallery with lightbox
- ✅ YouTube video embeds
- ✅ Team member profiles
- ✅ User feedback & testimonials
- ✅ Countdown timer to event
- ✅ Mobile responsive design

### Admin Panel
- ✅ CRUD operations untuk semua entities
- ✅ Real-time preview
- ✅ Drag & drop sorting
- ✅ File upload management
- ✅ Feedback moderation
- ✅ Settings configuration
- ✅ Session-based authentication
- ✅ Rate limiting & brute force protection

### Security Features
- ✅ HTTPS enforcement
- ✅ CSRF token protection
- ✅ SQL injection prevention
- ✅ XSS output escaping
- ✅ Secure password hashing (bcrypt)
- ✅ Session timeout (30 min)
- ✅ Rate limiting
- ✅ Input validation & sanitization
- ✅ Activity logging

---

## 📞 Support & Contributing

### Issues & Bug Reports
Report issues di GitHub Issues: https://github.com/Luthfi1006/kkl-informatika-upgris-2026/issues

### Contributing
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is for educational purposes. Modify freely untuk kebutuhan event KKL Anda.

## 👥 Team

**Development Team**: Mahasiswa Informatika UPGRIS 2026
- Luthfi Abdullah (Lead Developer)
- Dan anggota tim lainnya

**Last Updated**: 2026-10-31
**Version**: 2.1.0
**Status**: Production Ready

---

## 🔗 Links

- 🌐 Website: https://kkl-informatika.upgris.ac.id
- 📚 Documentation: https://github.com/Luthfi1006/kkl-informatika-upgris-2026/wiki
- 🐛 Issue Tracker: https://github.com/Luthfi1006/kkl-informatika-upgris-2026/issues
- 📧 Contact: contact@upgris.ac.id

---

**Happy coding! 🚀**
