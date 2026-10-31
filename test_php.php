<?php
/**
 * PHP Test File - Verify PHP is working
 * Access via: http://localhost/kkl-informatika-upgris-2026/test_php.php
 */
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>PHP Test - KKL UPGRIS</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 8px; margin: 20px 0; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🧪 PHP Test - KKL Informatika UPGRIS 2026</h1>
    
    <div class="success">
        <h2>✅ PHP Berjalan dengan Baik!</h2>
        <p>Jika Anda melihat halaman ini, berarti PHP sudah terinstall dan berjalan dengan benar di server Anda.</p>
    </div>

    <div class="info">
        <h3>📋 Informasi Server</h3>
        <ul>
            <li><strong>PHP Version:</strong> <?php echo phpversion(); ?></li>
            <li><strong>Server Software:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></li>
            <li><strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'; ?></li>
            <li><strong>Current Script:</strong> <?php echo $_SERVER['SCRIPT_NAME'] ?? 'Unknown'; ?></li>
            <li><strong>Request URI:</strong> <?php echo $_SERVER['REQUEST_URI'] ?? 'Unknown'; ?></li>
        </ul>
    </div>

    <div class="info">
        <h3>🔧 Extensions Loaded</h3>
        <pre><?php print_r(get_loaded_extensions()); ?></pre>
    </div>

    <div class="info">
        <h3>🔗 Test Links</h3>
        <ul>
            <li><a href="admin/">🔐 Admin Panel</a></li>
            <li><a href="admin/login.php">📝 Admin Login</a></li>
            <li><a href="index.php">🏠 Main Website (PHP)</a></li>
            <li><a href="migrate.php?confirm=yes">🗄️ Database Migration</a></li>
        </ul>
    </div>

    <hr>
    <p style="color: #666; font-size: 14px;">
        <strong>Catatan:</strong> Hapus file ini (<code>test_php.php</code>) setelah verifikasi selesai untuk keamanan.
    </p>
</body>
</html>
