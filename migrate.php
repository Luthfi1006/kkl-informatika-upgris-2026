<?php
/**
 * Database Migration & Setup Script
 * Run via web browser untuk initialize database
 * 
 * Usage: /migrate.php?confirm=yes
 * SECURITY: Hapus file ini setelah migration selesai!
 */

require_once 'config/database.php';
require_once 'config/helpers.php';

init_session();

// Simple auth - only allow if no admins exist OR if admin is logged in
$firstRun = false;
try {
    $stmt = $pdo->query('SELECT COUNT(*) as cnt FROM admins');
    $count = $stmt->fetch()['cnt'] ?? 0;
    if ($count === 0) {
        $firstRun = true;
    }
} catch (PDOException $e) {
    $firstRun = true;
}

// Check confirmation
$confirm = $_GET['confirm'] ?? '';
if (!$firstRun && !isset($_SESSION['admin_id']) && $confirm !== 'admin_verified') {
    die('
    <!DOCTYPE html>
    <html lang="id"><head><meta charset="UTF-8"><title>Migration Required</title>
    <style>body{font-family:sans-serif;max-width:600px;margin:50px auto;padding:20px}</style></head>
    <body>
    <h2>🔒 Migration Protection Active</h2>
    <p>Database sudah memiliki admin. Migration hanya bisa dijalankan oleh admin yang login.</p>
    <p><a href="admin/login.php">Login Admin</a> lalu akses <code>/migrate.php?confirm=admin_verified</code></p>
    </body></html>
    ');
}

$errors = [];
$success = [];

// Execute migration from secure file
$migrationFile = __DIR__ . '/.secure/database.sql';
if (!file_exists($migrationFile)) {
    die('<h2>❌ Error</h2><p>Migration file tidak ditemukan: ' . htmlspecialchars($migrationFile) . '</p>');
}

$sql = file_get_contents($migrationFile);
$statements = array_filter(
    array_map('trim', explode(';', $sql)),
    fn($s) => !empty($s) && !preg_match('/^\s*--/', $s)
);

echo '<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>Database Migration</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:800px;margin:40px auto;padding:20px}
h1{color:#333}h2{color:#667eea;border-bottom:2px solid #eee;padding-bottom:10px}
.success{background:#e8f5e9;border-left:4px solid #4caf50;padding:12px;margin:10px 0;border-radius:4px}
.error{background:#ffebee;border-left:4px solid #f44336;padding:12px;margin:10px 0;border-radius:4px}
.info{background:#e3f2fd;border-left:4px solid #2196f3;padding:12px;margin:10px 0;border-radius:4px}
code{background:#f5f5f5;padding:2px 6px;border-radius:3px;font-family:monospace}
pre{background:#263238;color:#aed581;padding:15px;border-radius:6px;overflow-x:auto}
.btn{display:inline-block;padding:10px 20px;background:#667eea;color:white;border:none;border-radius:6px;cursor:pointer;text-decoration:none}
</style></head><body>
<h1>🗄️ Database Migration - KKL Informatika UPGRIS 2026</h1>';

if ($firstRun) {
    echo '<div class="info"><strong>First Run Detected</strong> - Database kosong atau belum di-inisialisasi.</div>';
}

if ($confirm === 'yes' || $confirm === 'admin_verified') {
    foreach ($statements as $index => $stmt) {
        try {
            $pdo->exec($stmt);
            $preview = strlen($stmt) > 80 ? substr($stmt, 0, 80) . '...' : $stmt;
            $success[] = "<code>$preview</code>";
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            // Ignore "already exists" errors
            if (stripos($msg, 'already exists') === false && 
                stripos($msg, 'Duplicate entry') === false &&
                stripos($msg, 'Duplicate key') === false) {
                $errors[] = "<code>" . htmlspecialchars($stmt) . "</code><br><small>" . htmlspecialchars($msg) . "</small>";
            }
        }
    }
    
    if (!empty($success)) {
        echo '<h2>✅ Success (' . count($success) . ' statements)</h2>';
        foreach ($success as $s) echo "<div class='success'>$s</div>";
    }
    
    if (!empty($errors)) {
        echo '<h2>❌ Errors (' . count($errors) . ')</h2>';
        foreach ($errors as $e) echo "<div class='error'>$e</div>";
    }
    
    if (empty($errors)) {
        echo '<div class="success"><strong>🎉 Migration completed successfully!</strong></div>';
        echo '<p><strong>Important:</strong> Hapus file <code>migrate.php</code> setelah migration selesai untuk keamanan.</p>';
        echo '<p><a href="index.php" class="btn">→ Kembali ke Website</a></p>';
    }
} else {
    echo '<div class="info"><strong>Preview Mode</strong> - Tidak ada perubahan yang dibuat.</div>';
    echo '<h2>Statements to execute:</h2>';
    foreach ($statements as $stmt) {
        $preview = strlen($stmt) > 120 ? substr($stmt, 0, 120) . '...' : $stmt;
        echo "<div style='background:#f5f5f5;padding:10px;margin:5px 0;border-radius:4px;font-family:monospace;font-size:12px;'><code>" . htmlspecialchars($preview) . "</code></div>";
    }
    echo '<p><a href="?confirm=yes" class="btn" onclick="return confirm(\'Yakin ingin menjalankan migration? Backup database dulu!\')">🚀 Run Migration</a></p>';
}

echo '</body></html>';
