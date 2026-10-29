<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';
$siteLogo = $pdo->query("SELECT value FROM settings WHERE name='logo' LIMIT 1")->fetchColumn();
$siteTitle = $pdo->query("SELECT value FROM settings WHERE name='site_title' LIMIT 1")->fetchColumn() ?: 'KKL Informatika UPGRIS 2026';
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e($pageTitle ?? $siteTitle) ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v=<?= time() ?>">
</head>
<body>
<header class="site-header">
  <div class="container nav-wrap">
    <a class="brand" href="index.php">
      <?php if ($siteLogo): ?><img src="<?= e($siteLogo) ?>" alt="Logo"><?php else: ?><span class="brand-mark">K</span><?php endif; ?>
      <span><?= e($siteTitle) ?></span>
    </a>
    <nav>
      <a href="index.php#tentang">Tentang</a>
      <a href="index.php#timeline">Perjalanan</a>
      <a href="index.php#profil">Pembuat</a>
      <a href="index.php#galeri">Galeri</a>
      <a href="index.php#feedback">Feedback</a>
      <a class="nav-admin" href="admin/login.php">Admin</a>
    </nav>
  </div>
</header>
