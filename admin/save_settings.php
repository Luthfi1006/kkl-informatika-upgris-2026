<?php
require_once __DIR__ . "/auth.php"; 
require_once __DIR__ . "/../config/database.php"; 
require_once __DIR__ . "/../config/helpers.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !verify_csrf_token()) {
    die("Error: Token keamanan CSRF tidak valid.");
}

$title = trim($_POST['site_title'] ?? '');
if ($title !== '') {
    $stmt = $pdo->prepare("INSERT INTO settings(name,value) VALUES('site_title',?) ON DUPLICATE KEY UPDATE value=VALUES(value)");
    $stmt->execute([$title]);
}

if (!empty($_FILES['logo']['name'])) {
    $logo = upload_image($_FILES['logo'], 'branding', 'logo_');
    if ($logo) {
        $stmt = $pdo->prepare("INSERT INTO settings(name,value) VALUES('logo',?) ON DUPLICATE KEY UPDATE value=VALUES(value)");
        $stmt->execute([$logo]);
    }
}
redirect('dashboard.php');
?>
