<?php
// ===============================================================
// PENGATURAN DATABASE KKL INFORMATIKA UPGRIS 2026
// ===============================================================
// Jika di Hosting Gratis (InfinityFree / dll), ganti nilai di bawah ini
// sesuai data akun dari panel hosting Anda.

$host     = getenv('DB_HOST') ?: "localhost";         // Contoh di hosting: sql100.infinityfree.com
$dbname   = getenv('DB_NAME') ?: "kkl_upgris_2026";    // Contoh di hosting: epiz_12345678_kkl
$username = getenv('DB_USER') ?: "root";               // Contoh di hosting: epiz_12345678
$password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : ""; // Password hosting Anda

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die("<div style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:50px auto;background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;color:#9f1239;line-height:1.6;'>
        <h3 style='margin-top:0;'>⚠️ Gagal Terhubung ke Database MySQL</h3>
        <p>Pastikan informasi <strong>Host, Database, Username, dan Password</strong> di file <code>config/database.php</code> sudah sesuai dengan data dari panel hosting Anda.</p>
        <p style='font-size:13px;color:#666;'>Pesan Error Teknis: <code>" . htmlspecialchars($e->getMessage()) . "</code></p>
    </div>");
}
?>
