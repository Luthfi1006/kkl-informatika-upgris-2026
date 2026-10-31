#!/bin/bash
#############################################################
# KKL Informatika UPGRIS 2026 - Deployment Script
# Automated deployment untuk production server
# Author: Kiro AI Development Companion
# Date: 2026-10-31
#############################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   KKL Informatika UPGRIS 2026 - Deployment        ║${NC}"
echo -e "${BLUE}║   Automated Setup & Verification                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
PROJECT_DIR="/var/www/kkl-2026"
BACKUP_DIR="/var/backups/kkl-2026"
LOG_FILE="/var/log/kkl-2026-deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Step 1: Pre-flight checks
log "Step 1: Pre-flight checks..."

if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory not found: $PROJECT_DIR"
fi

if ! command -v php &> /dev/null; then
    error "PHP is not installed. Please install PHP 7.4+"
fi

if ! command -v mysql &> /dev/null; then
    error "MySQL client is not installed"
fi

PHP_VERSION=$(php -r "echo PHP_VERSION;")
log "PHP Version: $PHP_VERSION"

# Step 2: Backup existing data
log "Step 2: Creating backup..."

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

cd "$PROJECT_DIR"
tar -czf "$BACKUP_FILE" --exclude='.git' --exclude='node_modules' .
log "Backup created: $BACKUP_FILE"

# Step 3: Pull latest code
log "Step 3: Pulling latest code from Git..."

if [ -d ".git" ]; then
    git pull origin main || warning "Git pull failed. Continuing..."
else
    warning "Not a git repository. Skipping git pull."
fi

# Step 4: Check environment file
log "Step 4: Checking environment configuration..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        warning ".env created from template. PLEASE CONFIGURE IT!"
        echo "Edit .env: nano $PROJECT_DIR/.env"
        read -p "Press Enter after configuring .env..."
    else
        error ".env file not found and no template available"
    fi
fi

# Step 5: Set permissions
log "Step 5: Setting file permissions..."

chown -R www-data:www-data "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"
chmod 700 "$PROJECT_DIR/.secure" 2>/dev/null || true
chmod 700 "$PROJECT_DIR/logs" 2>/dev/null || mkdir -p "$PROJECT_DIR/logs" && chmod 700 "$PROJECT_DIR/logs"
chmod 755 "$PROJECT_DIR/assets/uploads"
chmod 644 "$PROJECT_DIR"/*.php

log "Permissions set successfully"

# Step 6: Database migration check
log "Step 6: Database migration..."

echo ""
echo -e "${YELLOW}Database Migration Options:${NC}"
echo "1. Run migration via web (recommended)"
echo "2. Import SQL manually"
echo "3. Skip migration"
read -p "Choose option [1-3]: " migration_option

case $migration_option in
    1)
        log "Please access: http://your-domain.com/migrate.php?confirm=yes"
        read -p "Press Enter after migration completes..."
        ;;
    2)
        read -p "Enter MySQL user: " db_user
        read -sp "Enter MySQL password: " db_pass
        echo ""
        read -p "Enter database name: " db_name
        
        if [ -f ".secure/database.sql" ]; then
            mysql -u "$db_user" -p"$db_pass" "$db_name" < .secure/database.sql
            log "Database imported successfully"
        else
            error "Database SQL file not found: .secure/database.sql"
        fi
        ;;
    3)
        warning "Skipping database migration"
        ;;
    *)
        warning "Invalid option. Skipping migration."
        ;;
esac

# Step 7: Generate admin password
log "Step 7: Admin password setup..."

if [ -f "generate_password.php" ]; then
    echo ""
    echo -e "${BLUE}Generating secure password hashes...${NC}"
    php generate_password.php
else
    warning "generate_password.php not found"
fi

# Step 8: Security cleanup
log "Step 8: Security cleanup..."

rm -f migrate.php 2>/dev/null && log "Deleted: migrate.php" || true
rm -f debug-login.html 2>/dev/null && log "Deleted: debug-login.html" || true
rm -f generate_password.php 2>/dev/null && log "Deleted: generate_password.php" || true
rm -f admin-migration-snippet.txt 2>/dev/null && log "Deleted: admin-migration-snippet.txt" || true

# Step 9: Web server configuration check
log "Step 9: Web server configuration..."

if systemctl is-active --quiet apache2; then
    log "Apache detected. Restarting..."
    systemctl restart apache2
elif systemctl is-active --quiet nginx; then
    log "Nginx detected. Restarting..."
    systemctl restart nginx
else
    warning "No web server detected (Apache/Nginx)"
fi

# Step 10: Final verification
log "Step 10: Final verification..."

# Check PHP syntax
echo ""
echo -e "${BLUE}Checking PHP syntax...${NC}"
find . -name "*.php" -not -path "./vendor/*" -exec php -l {} \; 2>&1 | grep -i "error" && error "PHP syntax errors found" || log "PHP syntax OK"

# Check file permissions
if [ -w "assets/uploads" ]; then
    log "Upload directory writable: OK"
else
    error "Upload directory not writable"
fi

# Check logs directory
if [ -d "logs" ]; then
    log "Logs directory exists: OK"
else
    warning "Logs directory not found. Creating..."
    mkdir -p logs
    chmod 700 logs
fi

# Final summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          DEPLOYMENT COMPLETED SUCCESSFULLY         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Access website: http://your-domain.com"
echo "2. Login admin: http://your-domain.com/admin/login.php"
echo "3. Verify all features working"
echo "4. Check logs: tail -f $PROJECT_DIR/logs/*.log"
echo "5. Enable HTTPS if not already configured"
echo ""
echo -e "${YELLOW}Backup Location:${NC} $BACKUP_FILE"
echo -e "${YELLOW}Log File:${NC} $LOG_FILE"
echo ""

log "Deployment completed at $(date)"
