<#
.SYNOPSIS
    KKL Informatika UPGRIS 2026 - Windows Deployment Script
    Automated deployment untuk production server Windows/IIS

.DESCRIPTION
    Script ini mengotomatisasi proses deployment website KKL ke server Windows.
    Termasuk: backup, git pull, permission setup, database migration, security cleanup.

.NOTES
    Author: Kiro AI Development Companion
    Date: 2026-10-31
    Version: 1.0
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = "C:\inetpub\wwwroot\kkl-2026",
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = "C:\Backups\kkl-2026",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipMigration,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Log {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
    Add-Content -Path "$Global:LogFile" -Value "[$timestamp] $Message"
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Log $Message $Red
    exit 1
}

function Write-WarningLog {
    param([string]$Message)
    Write-Log $Message $Yellow
}

function Write-SuccessLog {
    param([string]$Message)
    Write-Log $Message $Green
}

function Write-InfoLog {
    param([string]$Message)
    Write-Log $Message $Blue
}

# Initialize
$Global:LogFile = "$env:TEMP\kkl-2026-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
Write-Host "╔═══════════════════════════════════════════════════════════════╗"
Write-Host "║   KKL Informatika UPGRIS 2026 - Windows Deployment           ║"
Write-Host "║   Automated Setup & Verification                             ║"
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Blue
Write-Host ""

Write-InfoLog "Starting deployment..."
Write-InfoLog "Project Path: $ProjectPath"
Write-InfoLog "Backup Path: $BackupPath"

# Step 1: Pre-flight checks
Write-InfoLog "Step 1: Pre-flight checks..."

if (-not (Test-Path $ProjectPath)) {
    Write-ErrorLog "Project directory not found: $ProjectPath"
}

$phpPath = Get-Command php -ErrorAction SilentlyContinue
if (-not $phpPath) {
    Write-ErrorLog "PHP is not installed or not in PATH. Please install PHP 7.4+"
}
Write-SuccessLog "PHP Version: $($phpPath.Version)"

$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-WarningLog "MySQL client not found in PATH"
} else {
    Write-SuccessLog "MySQL client found"
}

# Step 2: Create backup
Write-InfoLog "Step 2: Creating backup..."

if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$BackupPath\backup_$timestamp.zip"

Set-Location $ProjectPath
Write-InfoLog "Creating backup archive: $backupFile"
Compress-Archive -Path * -DestinationPath $backupFile -Force -Exclude @(".git*", "node_modules*", "*.log")
Write-SuccessLog "Backup created: $backupFile"

# Step 3: Git pull
Write-InfoLog "Step 3: Pulling latest code from Git..."

if (Test-Path ".git") {
    try {
        git pull origin main
        Write-SuccessLog "Git pull completed"
    } catch {
        Write-WarningLog "Git pull failed: $_"
    }
} else {
    Write-WarningLog "Not a git repository. Skipping git pull."
}

# Step 4: Environment configuration
Write-InfoLog "Step 4: Checking environment configuration..."

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env" -Force
        Write-WarningLog ".env created from template. PLEASE CONFIGURE IT!"
        Write-Host "Edit .env: notepad $ProjectPath\.env"
        Read-Host "Press Enter after configuring .env..."
    } else {
        Write-ErrorLog ".env file not found and no template available"
    }
} else {
    Write-SuccessLog ".env file exists"
}

# Step 5: Set permissions
Write-InfoLog "Step 5: Setting file permissions..."

try {
    # IIS_IUSRS needs read access
    $acl = Get-Acl $ProjectPath
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS","ReadAndExecute","ContainerInherit,ObjectInherit","None","Allow")
    $acl.AddAccessRule($rule)
    Set-Acl $ProjectPath $acl
    
    # Upload folder needs write
    if (Test-Path "assets/uploads") {
        $acl = Get-Acl "assets/uploads"
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS","Modify","ContainerInherit,ObjectInherit","None","Allow")
        $acl.AddAccessRule($rule)
        Set-Acl "assets/uploads" $acl
    }
    
    # Secure folder - restrict access
    if (Test-Path ".secure") {
        $acl = Get-Acl ".secure"
        $acl.SetAccessRuleProtection($true, $false)
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS","None","ContainerInherit,ObjectInherit","None","Deny")
        $acl.AddAccessRule($rule)
        Set-Acl ".secure" $acl
    }
    
    # Logs folder
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    }
    $acl = Get-Acl "logs"
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS","Modify","ContainerInherit,ObjectInherit","None","Allow")
    $acl.AddAccessRule($rule)
    Set-Acl "logs" $acl
    
    Write-SuccessLog "Permissions configured for IIS_IUSRS"
} catch {
    Write-WarningLog "Permission setup had issues: $_"
}

# Step 6: Database migration
if (-not $SkipMigration) {
    Write-InfoLog "Step 6: Database migration..."
    
    Write-Host ""
    Write-Host "Database Migration Options:" -ForegroundColor $Yellow
    Write-Host "1. Run migration via web (recommended) - access /migrate.php?confirm=yes"
    Write-Host "2. Import SQL manually"
    Write-Host "3. Skip migration"
    $migrationOption = Read-Host "Choose option [1-3]"
    
    switch ($migrationOption) {
        "1" {
            Write-InfoLog "Please access: http://your-domain.com/migrate.php?confirm=yes"
            Read-Host "Press Enter after migration completes..."
        }
        "2" {
            $dbUser = Read-Host "Enter MySQL username"
            $dbPass = Read-Host -AsSecureString "Enter MySQL password" | ConvertFrom-SecureString -AsPlainText
            $dbName = Read-Host "Enter database name"
            
            if (Test-Path ".secure\database.sql") {
                & mysql -u $dbUser -p$dbPass $dbName < .secure\database.sql
                Write-SuccessLog "Database imported successfully"
            } else {
                Write-ErrorLog "Database SQL file not found: .secure\database.sql"
            }
        }
        "3" {
            Write-WarningLog "Skipping database migration"
        }
        default {
            Write-WarningLog "Invalid option. Skipping migration."
        }
    }
}

# Step 7: Generate admin password
Write-InfoLog "Step 7: Admin password setup..."

if (Test-Path "generate_password.php") {
    Write-Host ""
    Write-InfoLog "Generating secure password hashes..."
    & php generate_password.php
} else {
    Write-WarningLog "generate_password.php not found"
}

# Step 8: Security cleanup
Write-InfoLog "Step 8: Security cleanup..."

$filesToDelete = @("migrate.php", "debug-login.html", "generate_password.php", "admin-migration-snippet.txt")
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-SuccessLog "Deleted: $file"
    }
}

# Step 9: IIS Restart
Write-InfoLog "Step 9: Restarting IIS..."
try {
    iisreset /restart
    Write-SuccessLog "IIS restarted successfully"
} catch {
    Write-WarningLog "IIS restart failed: $_"
}

# Step 10: Final verification
Write-InfoLog "Step 10: Final verification..."

Write-Host ""
Write-InfoLog "Checking PHP syntax..."
$phpFiles = Get-ChildItem -Recurse -Filter "*.php" | Where-Object { $_.FullName -notmatch "vendor" }
$hasErrors = $false
foreach ($file in $phpFiles) {
    $result = & php -l $file.FullName
    if ($result -match "Error") {
        Write-ErrorLog "PHP syntax error in $($file.Name): $result"
        $hasErrors = $true
    }
}
if (-not $hasErrors) {
    Write-SuccessLog "PHP syntax OK for all files"
}

# Check upload directory
if (Test-Path "assets/uploads") {
    $acl = Get-Acl "assets/uploads"
    $hasWrite = $acl.Access | Where-Object { $_.FileSystemRights -band "Write" -and $_.IdentityReference -eq "IIS_IUSRS" }
    if ($hasWrite) {
        Write-SuccessLog "Upload directory writable by IIS_IUSRS: OK"
    } else {
        Write-WarningLog "Upload directory may not be writable by IIS_IUSRS"
    }
}

# Final Summary
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗"
Write-Host "║          DEPLOYMENT COMPLETED SUCCESSFULLY                    ║"
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor $Blue
Write-Host "1. Access website: http://your-domain.com"
Write-Host "2. Login admin: http://your-domain.com/admin/login.php"
Write-Host "3. Verify all features working"
Write-Host "4. Check logs: $ProjectPath\logs\*.log"
Write-Host "5. Enable HTTPS if not already configured" -ForegroundColor $Yellow
Write-Host ""
Write-Host "Backup Location: $backupFile" -ForegroundColor $Yellow
Write-Host "Log File: $Global:LogFile" -ForegroundColor $Yellow
Write-Host ""
Write-SuccessLog "Deployment completed at $(Get-Date)"
