<?php
require_once "config/database.php";
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS destinations (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, visit_date DATE NULL, description TEXT, day_no INT NOT NULL DEFAULT 1, route VARCHAR(255) NULL, sort_order INT NOT NULL DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    $columns = $pdo->query("SHOW COLUMNS FROM gallery LIKE 'destination_id'")->fetch();
    if (!$columns) $pdo->exec("ALTER TABLE gallery ADD COLUMN destination_id INT NULL AFTER id");
    
    $folders = ['profiles', 'gallery', 'branding'];
    foreach ($folders as $folder) {
        $path = __DIR__ . '/assets/uploads/' . $folder;
        if (!is_dir($path)) @mkdir($path, 0755, true);
        $idx = $path . '/index.html';
        if (!file_exists($idx)) @file_put_contents($idx, '<!doctype html>');
    }
    
    echo '<h2>Upgrade berhasil.</h2><p>Struktur destinasi dan folder upload sudah siap.</p><p>Hapus file upgrade.php setelah ini, lalu buka <a href="admin/dashboard.php">Dashboard Admin</a>.</p>';
} catch (Throwable $e) { 
    http_response_code(500); 
    echo '<h2>Upgrade gagal</h2><pre>'.htmlspecialchars($e->getMessage()).'</pre>'; 
}
