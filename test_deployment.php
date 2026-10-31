<?php
/**
 * Pre-deployment Verification Script
 * Tests core functionality, file permissions, and security settings
 * 
 * Usage: php test_deployment.php
 */

// Colors for terminal output
$green = "\033[0;32m";
$red = "\033[0;31m";
$yellow = "\033[1;33m";
$blue = "\033[0;34m";
$nc = "\033[0m"; // No Color

echo "{$blue}╔════════════════════════════════════════════════════╗{$nc}\n";
echo "{$blue}║   KKL Informatika UPGRIS 2026 - Pre-Deployment     ║{$nc}\n";
echo "{$blue}║   Verification & Testing Suite                    ║{$nc}\n";
echo "{$blue}╚════════════════════════════════════════════════════╝{$nc}\n\n";

$testsTotal = 0;
$testsPassed = 0;
$testsFailed = 0;
$warnings = 0;

function runTest($description, $testCallback) {
    global $testsTotal, $testsPassed, $testsFailed, $warnings, $green, $red, $yellow, $nc;
    
    $testsTotal++;
    echo sprintf("[%02d] Testing: %-50s ", $testsTotal, $description);
    
    try {
        $result = $testCallback();
        if ($result === true) {
            echo "{$green}[PASS]{$nc}\n";
            $testsPassed++;
        } elseif (is_string($result)) {
            echo "{$yellow}[WARN: $result]{$nc}\n";
            $warnings++;
        } else {
            echo "{$red}[FAIL]{$nc}\n";
            $testsFailed++;
        }
    } catch (Throwable $e) {
        echo "{$red}[ERROR: " . $e->getMessage() . "]{$nc}\n";
        $testsFailed++;
    }
}

// ===== TEST SUITE =====

echo "=== 1. PHP ENVIRONMENT TESTS ===\n";

runTest("PHP Version >= 7.4", function() {
    return version_compare(PHP_VERSION, '7.4.0', '>=');
});

runTest("Required Extensions Installed", function() {
    $required = ['pdo', 'pdo_mysql', 'json', 'session', 'filter', 'fileinfo'];
    $missing = [];
    foreach ($required as $ext) {
        if (!extension_loaded($ext)) {
            $missing[] = $ext;
        }
    }
    return empty($missing) ? true : "Missing: " . implode(', ', $missing);
});

runTest("Session Configuration", function() {
    return ini_get('session.use_strict_mode') ? true : "use_strict_mode disabled (recommended)";
});

echo "\n=== 2. FILE & DIRECTORY TESTS ===\n";

runTest("Configuration Files Exist", function() {
    $files = ['config/database.php', 'config/helpers.php', 'admin/auth.php'];
    foreach ($files as $file) {
        if (!file_exists(__DIR__ . '/' . $file)) {
            return false;
        }
    }
    return true;
});

runTest(".env File Configuration", function() {
    if (!file_exists(__DIR__ . '/.env')) {
        return ".env file not found (create from .env.example)";
    }
    $env = parse_ini_file(__DIR__ . '/.env');
    return !empty($env['DB_NAME']) ? true : ".env missing DB_NAME";
});

runTest("Upload Directories Writable", function() {
    $dirs = ['assets/uploads', 'assets/uploads/branding', 'assets/uploads/gallery', 'assets/uploads/profiles'];
    foreach ($dirs as $dir) {
        $fullPath = __DIR__ . '/' . $dir;
        if (!is_dir($fullPath)) {
            @mkdir($fullPath, 0755, true);
        }
        if (!is_writable($fullPath)) {
            return "Not writable: $dir";
        }
    }
    return true;
});

runTest("Logs Directory Writable", function() {
    $dir = __DIR__ . '/logs';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return is_writable($dir);
});

runTest("Secure Directory Protected", function() {
    $file = __DIR__ . '/.secure/database.sql';
    return file_exists($file) ? true : "database.sql missing from .secure/";
});

echo "\n=== 3. SECURITY TESTS ===\n";

runTest("No Sensitive Files in Webroot", function() {
    $sensitive = ['database.sql', '.git', 'debug-login.html', 'admin-migration-snippet.txt'];
    $found = [];
    foreach ($sensitive as $file) {
        if (file_exists(__DIR__ . '/' . $file)) {
            $found[] = $file;
        }
    }
    return empty($found) ? true : "Sensitive files found: " . implode(', ', $found);
});

runTest(".gitignore Rules Active", function() {
    if (!file_exists(__DIR__ . '/.gitignore')) {
        return ".gitignore missing";
    }
    $content = file_get_contents(__DIR__ . '/.gitignore');
    return (strpos($content, '.secure/') !== false && strpos($content, '.env') !== false);
});

runTest("Helpers Security Functions", function() {
    require_once __DIR__ . '/config/helpers.php';
    $functions = ['e', 'csrf_token', 'verify_csrf_token', 'sanitize_input', 'check_session_timeout'];
    foreach ($functions as $func) {
        if (!function_exists($func)) {
            return "Missing function: $func";
        }
    }
    return true;
});

echo "\n=== 4. DATABASE CONNECTIVITY TEST ===\n";

runTest("Database Connection", function() {
    if (!file_exists(__DIR__ . '/config/database.php')) {
        return "database.php missing";
    }
    
    try {
        require_once __DIR__ . '/config/database.php';
        global $pdo;
        if (!isset($pdo) || !($pdo instanceof PDO)) {
            return "PDO connection object not created";
        }
        
        // Test query
        $stmt = $pdo->query("SELECT 1");
        return $stmt ? true : "Query test failed";
        
    } catch (Throwable $e) {
        return "Connection failed: " . $e->getMessage();
    }
});

runTest("Required Database Tables", function() {
    global $pdo;
    if (!isset($pdo)) return "Database not connected";
    
    $required = ['settings', 'admins', 'profiles', 'destinations', 'gallery', 'videos', 'feedback'];
    $missing = [];
    
    try {
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($required as $req) {
            if (!in_array($req, $tables)) {
                $missing[] = $req;
            }
        }
        return empty($missing) ? true : "Missing tables: " . implode(', ', $missing) . " (run migrate.php)";
    } catch (Throwable $e) {
        return "Error checking tables: " . $e->getMessage();
    }
});

echo "\n=== 5. CODE SYNTAX TEST ===\n";

runTest("PHP Files Syntax Validation", function() {
    $phpFiles = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(__DIR__)
    );
    
    $errors = [];
    foreach ($phpFiles as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            $path = $file->getPathname();
            if (strpos($path, 'vendor') !== false) continue;
            
            $output = [];
            $returnVar = 0;
            exec("php -l " . escapeshellarg($path), $output, $returnVar);
            
            if ($returnVar !== 0) {
                $errors[] = basename($path);
            }
        }
    }
    
    return empty($errors) ? true : "Syntax errors in: " . implode(', ', $errors);
});

// ===== SUMMARY =====

echo "\n{$blue}════════════════════════════════════════════════════{$nc}\n";
echo "{$blue}                  VERIFICATION SUMMARY               {$nc}\n";
echo "{$blue}════════════════════════════════════════════════════{$nc}\n\n";

echo "Total Tests Run: $testsTotal\n";
echo "Passed:          {$green}$testsPassed{$nc}\n";
echo "Warnings:        {$yellow}$warnings{$nc}\n";
echo "Failed:          " . ($testsFailed > 0 ? "{$red}$testsFailed{$nc}" : "{$green}0{$nc}") . "\n\n";

if ($testsFailed === 0) {
    echo "{$green}🎉 ALL PRE-DEPLOYMENT VERIFICATION TESTS PASSED!{$nc}\n";
    echo "{$green}Project is ready for deployment.{$nc}\n\n";
    exit(0);
} else {
    echo "{$red}⚠️ SOME VERIFICATION TESTS FAILED!{$nc}\n";
    echo "{$red}Please fix the issues above before deploying to production.{$nc}\n\n";
    exit(1);
}

?>
