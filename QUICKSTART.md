# 🚀 KKL INFORMATIKA UPGRIS 2026 - QUICK START GUIDE

**Version**: 2.1.0 Security Hardening  
**Target Audience**: Developers & System Administrators  
**Time to Deploy**: 30-60 minutes

---

## ⚡ TL;DR - Fastest Deployment (5 Commands)

```bash
# 1. Clone & Navigate
git clone https://github.com/Luthfi1006/kkl-informatika-upgris-2026.git kkl-2026
cd kkl-2026

# 2. Configure Environment
cp .env.production .env
nano .env  # Edit DB credentials

# 3. Run Deployment Script
chmod +x deploy.sh
sudo ./deploy.sh

# 4. Access & Migrate
# Open: https://your-domain.com/migrate.php?confirm=yes

# 5. Cleanup
rm migrate.php generate_password.php test_deployment.php
```

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [x] **Server Access**
  - SSH access with sudo privileges
  - Root or www-data user access
  
- [x] **Software Installed**
  - PHP 7.4+ (8.0+ recommended)
  - MySQL 5.7+ or MariaDB 10.3+
  - Apache 2.4+ OR Nginx 1.18+
  - Git 2.x
  
- [x] **Domain & SSL**
  - Domain name pointing to server IP
  - SSL certificate (Let''s Encrypt recommended)
  
- [x] **Database Ready**
  - Empty database created
  - Dedicated database user with privileges

---

## 📦 Option 1: Linux/macOS Deployment (Automated)

### Step 1: Clone Repository
```bash
cd /var/www
git clone https://github.com/Luthfi1006/kkl-informatika-upgris-2026.git kkl-2026
cd kkl-2026
```

### Step 2: Configure Environment
```bash
cp .env.production .env
nano .env
```

**Required Configuration:**
```env
APP_ENV=production
APP_URL=https://your-domain.com
DB_HOST=localhost
DB_NAME=kkl_upgris_2026
DB_USER=kkl_user
DB_PASS=YOUR_SECURE_PASSWORD
```

### Step 3: Run Automated Deployment
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

The script will:
- ✅ Create backup
- ✅ Set permissions
- ✅ Verify environment
- ✅ Prompt for database migration
- ✅ Generate admin password
- ✅ Clean up sensitive files
- ✅ Restart web server

### Step 4: Database Migration
Choose one option:

**Option A: Web-based (Recommended)**
```
https://your-domain.com/migrate.php?confirm=yes
```

**Option B: Manual Import**
```bash
mysql -u kkl_user -p kkl_upgris_2026 < .secure/database.sql
```

### Step 5: Set Admin Password
```bash
# Generate hash
php generate_password.php

# Update database (copy hash from output)
mysql -u kkl_user -p kkl_upgris_2026 -e "UPDATE admins SET password='$2y$12$...' WHERE username='admin';"
```

### Step 6: Final Cleanup
```bash
rm migrate.php generate_password.php test_deployment.php
```

### Step 7: Test
```bash
# Homepage
curl -k https://your-domain.com/

# Admin login
curl -k https://your-domain.com/admin/login.php
```

---

## 🪟 Option 2: Windows/IIS Deployment (PowerShell)

### Step 1: Clone Repository
```powershell
cd C:\inetpub\wwwroot
git clone https://github.com/Luthfi1006/kkl-informatika-upgris-2026.git kkl-2026
cd kkl-2026
```

### Step 2: Configure Environment
```powershell
Copy-Item .env.production .env
notepad .env  # Edit configuration
```

### Step 3: Run Deployment Script
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy.ps1 -ProjectPath "C:\inetpub\wwwroot\kkl-2026"
```

### Step 4: Database Migration
Access in browser:
```
https://your-domain.com/migrate.php?confirm=yes
```

### Step 5: Set Admin Password
```powershell
php generate_password.php
# Copy hash and update via phpMyAdmin or SQL query
```

### Step 6: Cleanup
```powershell
Remove-Item migrate.php, generate_password.php, test_deployment.php
```

---

## 🏗️ Option 3: Manual Step-by-Step (Maximum Control)

### 1. Clone & Setup
```bash
git clone https://github.com/Luthfi1006/kkl-informatika-upgris-2026.git
cd kkl-informatika-upgris-2026
```

### 2. Create Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE kkl_upgris_2026 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kkl_user'@'localhost' IDENTIFIED BY 'SecurePassword@2026';
GRANT ALL PRIVILEGES ON kkl_upgris_2026.* TO 'kkl_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env
```

### 4. Import Database
```bash
mysql -u kkl_user -p kkl_upgris_2026 < .secure/database.sql
```

### 5. Set Permissions
```bash
chown -R www-data:www-data .
chmod -R 755 .
chmod 700 .secure logs
chmod 755 assets/uploads
chmod 644 *.php
```

### 6. Configure Web Server

**Apache:**
```bash
cp apache.conf.example /etc/apache2/sites-available/kkl-2026.conf
nano /etc/apache2/sites-available/kkl-2026.conf  # Edit domain
a2ensite kkl-2026
a2enmod rewrite ssl headers expires
systemctl restart apache2
```

**Nginx:**
```bash
cp nginx.conf.example /etc/nginx/sites-available/kkl-2026
nano /etc/nginx/sites-available/kkl-2026  # Edit domain
ln -s /etc/nginx/sites-available/kkl-2026 /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 7. Generate Admin Password
```bash
php -r "echo password_hash('YourPassword@2026', PASSWORD_BCRYPT, ['cost' => 12]);"
```

Copy hash and update:
```bash
mysql -u kkl_user -p kkl_upgris_2026
```
```sql
UPDATE admins SET password='$2y$12$YOUR_HASH_HERE' WHERE username='admin';
EXIT;
```

### 8. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-apache  # Or certbot-nginx
sudo certbot --apache -d your-domain.com -d www.your-domain.com
# OR
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 9. Test Deployment
```bash
php test_deployment.php
```

### 10. Cleanup
```bash
rm migrate.php generate_password.php test_deployment.php debug-login.html
```

---

## ✅ Post-Deployment Verification

### Test Homepage
```bash
curl -I https://your-domain.com/
# Should return: HTTP/2 200
```

### Test Admin Login
```
https://your-domain.com/admin/login.php
Username: admin
Password: [your_generated_password]
```

### Check Logs
```bash
tail -f logs/$(date +%Y-%m-%d).log
tail -f /var/log/nginx/kkl-2026-error.log  # Nginx
tail -f /var/log/apache2/kkl-2026-error.log  # Apache
```

### Verify Security
```bash
# HTTPS redirect working
curl -I http://your-domain.com/
# Should return: 301 redirect to https://

# Sensitive files blocked
curl -I https://your-domain.com/.env
# Should return: 403 Forbidden

curl -I https://your-domain.com/.secure/database.sql
# Should return: 403 Forbidden
```

---

## 🆘 Common Issues & Solutions

### Issue: "Database Connection Failed"
**Solution:**
```bash
# Verify credentials
cat .env | grep DB_

# Test connection
mysql -h localhost -u kkl_user -p kkl_upgris_2026 -e "SELECT 1;"

# Check MySQL running
systemctl status mysql
```

### Issue: "Permission Denied" on uploads
**Solution:**
```bash
chown -R www-data:www-data assets/uploads
chmod -R 755 assets/uploads
```

### Issue: "404 Not Found" on pages
**Solution:**
```bash
# Apache: Enable rewrite module
a2enmod rewrite
systemctl restart apache2

# Nginx: Check config
nginx -t
```

### Issue: "Session Expired Immediately"
**Solution:**
Check `.env`:
```env
SESSION_TIMEOUT=1800  # 30 minutes
SESSION_SECURE=true   # Only if HTTPS enabled
```

### Issue: "HTTPS Not Working"
**Solution:**
```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443

# Renew Let's Encrypt
certbot renew
```

---

## 📊 Performance Optimization (Optional)

### Enable PHP OPcache
Edit `/etc/php/8.0/fpm/php.ini`:
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

### Enable Redis for Sessions (Advanced)
```bash
apt install redis-server php-redis
systemctl start redis
```

Edit `.env`:
```env
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Database Optimization
```sql
-- Analyze tables
ANALYZE TABLE destinations, gallery, profiles, feedback;

-- Check indexes
SHOW INDEX FROM destinations;
```

---

## 🔒 Security Hardening Checklist

- [x] HTTPS enabled & HTTP redirects
- [x] Strong admin password (min 12 chars)
- [x] `.env` file has `chmod 600`
- [x] `.secure/` directory blocked from web
- [x] `migrate.php` deleted after use
- [x] Security headers configured
- [x] Rate limiting active
- [x] Session timeout enforced (30 min)
- [x] File upload restrictions
- [x] Error logs not exposed
- [x] Database user has limited privileges

---

## 📞 Support

**Documentation**: See `README.md` for detailed documentation  
**Deployment Checklist**: See `DEPLOYMENT-CHECKLIST.md`  
**Troubleshooting**: Check logs in `logs/` directory  
**GitHub Issues**: https://github.com/Luthfi1006/kkl-informatika-upgris-2026/issues

---

**Good luck with your deployment! 🚀**

Last Updated: 2026-10-31
