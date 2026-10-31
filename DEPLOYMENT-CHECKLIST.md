# ✅ KKL INFORMATIKA UPGRIS 2026 - PRE-DEPLOYMENT CHECKLIST

**Version**: 2.1.0 (Security Hardening)  
**Date**: 2026-10-31  
**Environment**: Production

---

## 📋 PRE-DEPLOYMENT VERIFICATION

### Phase 1: Code & Configuration (1-2 hours)

- [ ] **Git Status**
  - [ ] All changes committed: `git status` shows clean
  - [ ] Latest code pulled: `git log --oneline -5`
  - [ ] No uncommitted files: `git diff --stat`

- [ ] **Environment Setup**
  - [ ] `.env` file created from `.env.example`
  - [ ] All database credentials updated
  - [ ] APP_ENV set to `production`
  - [ ] APP_URL set to correct domain
  - [ ] SESSION variables configured
  - [ ] File permissions: `chmod 600 .env`

- [ ] **Security Review**
  - [ ] No sensitive files in git: `git ls-files | grep -E "(\.env|\.sql|debug|\.bak)"`
  - [ ] `.gitignore` properly configured
  - [ ] `.secure/database.sql` exists & protected
  - [ ] `migrate.php`, `debug-login.html` ready for deletion

- [ ] **Code Quality**
  - [ ] Run PHP syntax check: `php test_deployment.php`
  - [ ] No hardcoded credentials in code: `grep -r "password\|apikey\|secret" --include="*.php"`
  - [ ] All PDO queries use prepared statements
  - [ ] All output properly escaped with `e()`

---

### Phase 2: Database Preparation (30-45 min)

- [ ] **Database Created**
  - [ ] Database name: `kkl_upgris_2026`
  - [ ] Dedicated user created: `kkl_user`
  - [ ] Permissions granted: `GRANT ALL PRIVILEGES ON kkl_upgris_2026.* TO 'kkl_user'@'localhost';`
  - [ ] User cannot connect via remote: HostLimit set to `localhost` or specific IP

- [ ] **Admin Password Prepared**
  - [ ] Generated secure hash: `php generate_password.php`
  - [ ] Hash copied (start with `$2y$12$`)
  - [ ] Temporary file will be deleted

- [ ] **Database Migration Tested**
  - [ ] Migration script accessible: `/migrate.php`
  - [ ] SQL schema reviewed: `.secure/database.sql`
  - [ ] Indexes verified for performance
  - [ ] Foreign keys & constraints present

---

### Phase 3: Server & Infrastructure (1-2 hours)

- [ ] **Web Server**
  - [ ] PHP 7.4+ installed (version: ______)
  - [ ] Required extensions loaded:
    - [ ] pdo
    - [ ] pdo_mysql
    - [ ] json
    - [ ] session
    - [ ] filter
    - [ ] fileinfo
  - [ ] Web server running (Apache/Nginx): ____________
  - [ ] Rewrite module enabled (for .htaccess or nginx rules)

- [ ] **SSL/HTTPS**
  - [ ] SSL certificate installed & valid
  - [ ] HTTPS port (443) responding
  - [ ] HTTP redirects to HTTPS
  - [ ] Security headers configured (HSTS, X-Frame-Options, etc.)

- [ ] **File System**
  - [ ] Project directory writable by web server user
  - [ ] `assets/uploads/` directory writable
  - [ ] `logs/` directory writable
  - [ ] `.secure/` directory NOT accessible via web
  - [ ] File permissions set: `755` dirs, `644` files

- [ ] **Database Connection**
  - [ ] MySQL/MariaDB running
  - [ ] Test connection: `mysql -u kkl_user -p kkl_upgris_2026 -e "SELECT 1;"`
  - [ ] Connection timeout reasonable
  - [ ] Charset UTF8MB4 configured

---

### Phase 4: Application Setup (30-45 min)

- [ ] **Run Tests**
  - [ ] Execute: `php test_deployment.php`
  - [ ] All tests pass or acceptable warnings
  - [ ] No critical failures

- [ ] **Database Migration**
  - [ ] Access `/migrate.php?confirm=yes` in browser
  - [ ] All tables created successfully
  - [ ] Seed data loaded
  - [ ] Verify tables: `SHOW TABLES;`

- [ ] **Admin Account**
  - [ ] Update admin password: `UPDATE admins SET password='$2y$12$...' WHERE username='admin';`
  - [ ] Test login: `/admin/login.php`
  - [ ] Credentials: admin / [your_password]

- [ ] **Delete Temporary Files**
  - [ ] `rm migrate.php`
  - [ ] `rm generate_password.php`
  - [ ] `rm test_deployment.php`
  - [ ] `rm debug-login.html`
  - [ ] `rm admin-migration-snippet.txt`

---

### Phase 5: Functional Testing (1-2 hours)

- [ ] **Public Website**
  - [ ] Homepage loads: `https://your-domain.com/`
  - [ ] All sections visible:
    - [ ] Hero section with countdown
    - [ ] Itinerary displays correctly
    - [ ] Gallery photos load
    - [ ] Videos embed properly
    - [ ] Team profiles display
  - [ ] Mobile responsive (test on phone/tablet)
  - [ ] No console errors (check browser dev tools)

- [ ] **Feedback Form**
  - [ ] Form accessible: Scroll to "Bagaimana perjalananmu?"
  - [ ] Can submit feedback
  - [ ] Rate limiting works (max 3 per hour)
  - [ ] Feedback appears in admin panel (pending approval)

- [ ] **Admin Panel**
  - [ ] Login page accessible: `/admin/login.php`
  - [ ] Rate limiting works (test wrong password 6x)
  - [ ] Session timeout (wait 30+ min, auto-logout)
  - [ ] All CRUD operations work:
    - [ ] Add/Edit/Delete Destination
    - [ ] Add/Edit/Delete Profile
    - [ ] Add/Edit/Delete Gallery Photo
    - [ ] Add/Edit/Delete Video
    - [ ] Approve/Reject Feedback
    - [ ] Change Password

- [ ] **Security Features**
  - [ ] CSRF tokens present in forms
  - [ ] XSS protection (try `<script>alert('xss')</script>` in forms - should be escaped)
  - [ ] SQL injection protection (test with `' OR '1'='1`)
  - [ ] HTTPS enforced (HTTP redirects)
  - [ ] No sensitive info in errors

---

### Phase 6: Monitoring & Logging (15-30 min)

- [ ] **Logs Setup**
  - [ ] `logs/` directory exists & writable
  - [ ] Log files being created: `ls -la logs/`
  - [ ] Check log format: `cat logs/2026-10-31.log`

- [ ] **Error Handling**
  - [ ] 404 errors handled gracefully
  - [ ] 500 errors not showing technical details
  - [ ] Users see friendly error messages

- [ ] **Monitoring Setup (Optional)**
  - [ ] Server monitoring tool installed (New Relic, DataDog, etc.)
  - [ ] Error tracking configured (Sentry)
  - [ ] Uptime monitoring setup
  - [ ] Alerts configured for critical issues

---

### Phase 7: Backup & Recovery (15-30 min)

- [ ] **Backup Strategy**
  - [ ] Full backup created before deployment
  - [ ] Backup location: ___________________
  - [ ] Backup includes database & files
  - [ ] Recovery procedure documented

- [ ] **Automated Backups**
  - [ ] Daily backup scheduled (e.g., 2 AM)
  - [ ] Backup retention policy set (e.g., 30 days)
  - [ ] Backup verification process defined

---

### Phase 8: Documentation & Handover (30-45 min)

- [ ] **Documentation Complete**
  - [ ] README.md updated with deployment info
  - [ ] CHANGELOG.md reflects v2.1.0
  - [ ] Admin credentials stored securely (password manager)
  - [ ] Emergency contacts documented
  - [ ] Troubleshooting guide created

- [ ] **Team Handover**
  - [ ] Admin team trained on login & basic operations
  - [ ] Support contacts identified
  - [ ] Escalation procedures documented
  - [ ] On-call rotation established

---

## 🚀 DEPLOYMENT EXECUTION

### Step-by-Step Deployment

```bash
# 1. Backup current production (if upgrading)
mysqldump -u kkl_user -p kkl_upgris_2026 > backup_pre-deployment.sql
tar -czf kkl-2026-backup-$(date +%Y%m%d).tar.gz /var/www/kkl-2026

# 2. Clone/pull latest code
cd /var/www
git clone https://github.com/Luthfi1006/kkl-informatika-upgris-2026.git kkl-2026
cd kkl-2026

# 3. Setup environment
cp .env.production .env
nano .env  # Edit with your values

# 4. Set permissions
chown -R www-data:www-data .
chmod -R 755 .
chmod 700 .secure logs
chmod 755 assets/uploads

# 5. Run tests
php test_deployment.php

# 6. Database migration
# Access via browser: https://your-domain.com/migrate.php?confirm=yes
# OR run manually:
mysql -u kkl_user -p kkl_upgris_2026 < .secure/database.sql

# 7. Update admin password
php generate_password.php
# Copy hash and run:
mysql -u kkl_user -p kkl_upgris_2026 -e "UPDATE admins SET password='HASH' WHERE username='admin';"

# 8. Security cleanup
rm migrate.php generate_password.php test_deployment.php debug-login.html

# 9. Restart web server
systemctl restart apache2
# OR
systemctl restart nginx

# 10. Test website
curl -k https://your-domain.com/  # Should redirect to HTTPS
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

- [ ] **Website Accessible**
  - [ ] Homepage loads without errors
  - [ ] HTTPS working (lock icon in browser)
  - [ ] No 404 or 500 errors

- [ ] **Admin Panel Working**
  - [ ] Can login successfully
  - [ ] Can CRUD data
  - [ ] Can approve feedback

- [ ] **Logs Monitoring**
  - [ ] No error messages in logs
  - [ ] Activity logged properly
  - [ ] Log rotation working

- [ ] **Performance**
  - [ ] Page load time < 3 seconds
  - [ ] Database queries optimized (check slow query log)
  - [ ] No memory leaks (monitor PHP processes)

---

## 🆘 TROUBLESHOOTING REFERENCE

### Problem: Database Connection Failed
```bash
# Check credentials
grep DB_ .env

# Test connection
mysql -h localhost -u kkl_user -p

# Check MySQL running
systemctl status mysql
```

### Problem: Permission Denied on uploads
```bash
chown -R www-data:www-data assets/uploads
chmod -R 755 assets/uploads
```

### Problem: 404 on /admin/login.php
```bash
# Check rewrite module
a2enmod rewrite  # Apache
systemctl restart apache2

# OR check nginx config
nginx -t
systemctl restart nginx
```

### Problem: HTTPS not redirecting
```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443

# Check .htaccess or nginx redirect
cat .htaccess | grep -i https
```

---

## 📞 SUPPORT CONTACTS

| Role | Name | Contact |
|------|------|---------|
| Tech Lead | _________ | _________ |
| Database Admin | _________ | _________ |
| Server Admin | _________ | _________ |
| On-Call Support | _________ | _________ |

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Approved By**: _______________  

**Sign-off**: 🎉 DEPLOYMENT COMPLETE & VERIFIED

---

Last Updated: 2026-10-31
