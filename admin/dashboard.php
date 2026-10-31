<?php
require_once __DIR__ . "/auth.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
$pageTitle = "Dashboard Admin - KKL Informatika UPGRIS";
$profiles = $pdo->query("SELECT * FROM profiles ORDER BY sort_order,id")->fetchAll(PDO::FETCH_ASSOC);
$gallery = $pdo->query("SELECT g.*, d.name AS destination_name FROM gallery g LEFT JOIN destinations d ON d.id=g.destination_id ORDER BY g.created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

try {
    $destinations = $pdo->query("SELECT * FROM destinations ORDER BY day_no, sort_order, id")->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $destinations = $pdo->query("SELECT * FROM destinations ORDER BY visit_date, name")->fetchAll(PDO::FETCH_ASSOC);
}

$videos = $pdo->query("SELECT * FROM videos ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
$feedbacks = $pdo->query("SELECT * FROM feedback ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= e($pageTitle) ?></title>
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
</head>
<body class="admin-body">
<div class="admin-shell">
  <div class="admin-top">
    <div>
      <h1>Dashboard KKL</h1>
      <small style="color:var(--text-muted);font-weight:600;">Login sebagai: <strong><?= e($_SESSION['admin_username'] ?? 'admin') ?></strong></small>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      <a class="btn btn-ghost" href="change_password.php" style="border:1px solid var(--border);">🔑 Ganti Password</a>
      <a class="btn btn-ghost" href="../index.php" target="_blank" style="border:1px solid var(--border);">Lihat Website ↗</a> 
      <a class="btn btn-primary" href="logout.php">Keluar</a>
    </div>
  </div>

  <div class="admin-grid">
    <!-- Panel 1: Settings -->
    <section class="admin-panel">
      <h2>Logo & Judul Website</h2>
      <form action="save_settings.php" method="post" enctype="multipart/form-data">
        <?= csrf_field() ?>
        <label>Judul Website
          <input name="site_title" value="<?= e($pdo->query("SELECT value FROM settings WHERE name='site_title'")->fetchColumn()) ?>">
        </label>
        <label>Upload Logo Baru
          <input type="file" name="logo" accept="image/*">
        </label>
        <button class="btn btn-primary" type="submit">Simpan Pengaturan</button>
      </form>
    </section>

    <!-- Panel 2: Profiles -->
    <section class="admin-panel">
      <h2>Profil Pembuat <a class="btn btn-primary" style="font-size:12px;padding:6px 14px;" href="profile_form.php">+ Tambah</a></h2>
      <div class="admin-list">
        <?php foreach($profiles as $p): 
            $pPhoto = (!empty($p['photo']) && file_exists(__DIR__ . '/../' . $p['photo'])) ? '../' . $p['photo'] : '../assets/img/profile-placeholder.svg';
        ?>
          <div>
            <img src="<?= e($pPhoto) ?>" alt="<?= e($p['name']) ?>">
            <span><?= e($p['name']) ?><small><?= e($p['role']) ?></small></span>
            <a href="profile_form.php?id=<?= $p['id'] ?>">Edit</a>
            <form method="post" action="delete.php" style="display:inline;" onsubmit="return confirm('Hapus profil <?= e(addslashes($p['name'])) ?>?')">
              <?= csrf_field() ?>
              <input type="hidden" name="type" value="profiles">
              <input type="hidden" name="id" value="<?= $p['id'] ?>">
              <button type="submit" class="admin-del-btn">Hapus</button>
            </form>
          </div>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- Panel 3: Destinations -->
    <section class="admin-panel">
      <h2>Destinasi & Jadwal <a class="btn btn-primary" style="font-size:12px;padding:6px 14px;" href="destination_form.php">+ Tambah</a></h2>
      <div class="admin-list" style="max-height: 480px; overflow-y: auto;">
        <?php foreach($destinations as $d): ?>
          <div>
            <span>
              <strong>[Hari <?= (int)($d['day_no'] ?? 1) ?>]</strong> <?= e($d["name"]) ?>
              <small><?= e($d["visit_date"]) ?><?= !empty($d["description"]) ? ' • ' . e($d["description"]) : '' ?></small>
            </span>
            <a href="destination_form.php?id=<?= $d["id"] ?>">Edit</a>
            <form method="post" action="delete.php" style="display:inline;" onsubmit="return confirm('Hapus agenda ini?')">
              <?= csrf_field() ?>
              <input type="hidden" name="type" value="destinations">
              <input type="hidden" name="id" value="<?= $d["id"] ?>">
              <button type="submit" class="admin-del-btn">Hapus</button>
            </form>
          </div>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- Panel 4: Gallery -->
    <section class="admin-panel">
      <h2>Dokumentasi Foto <a class="btn btn-primary" style="font-size:12px;padding:6px 14px;" href="gallery_form.php">+ Upload Foto</a></h2>
      <div class="admin-list">
        <?php foreach($gallery as $g): 
            $gPhoto = (!empty($g['photo']) && file_exists(__DIR__ . '/../' . $g['photo'])) ? '../' . $g['photo'] : '../assets/img/profile-placeholder.svg';
        ?>
          <div>
            <img src="<?= e($gPhoto) ?>" alt="<?= e($g['title']) ?>">
            <span><?= e($g['title']) ?><small><?= e($g['destination_name'] ?: $g['location']) ?></small></span>
            <form method="post" action="delete.php" style="display:inline;" onsubmit="return confirm('Hapus foto ini?')">
              <?= csrf_field() ?>
              <input type="hidden" name="type" value="gallery">
              <input type="hidden" name="id" value="<?= $g['id'] ?>">
              <button type="submit" class="admin-del-btn">Hapus</button>
            </form>
          </div>
        <?php endforeach; ?>
        <?php if(!$gallery): ?><p class="muted">Belum ada foto dokumentasi diunggah.</p><?php endif; ?>
      </div>
    </section>

    <!-- Panel 5: Videos -->
    <section class="admin-panel">
      <h2>Video YouTube <a class="btn btn-primary" style="font-size:12px;padding:6px 14px;" href="video_form.php">+ Tambah Video</a></h2>
      <div class="admin-list">
        <?php foreach($videos as $v): ?>
          <div>
            <span><?= e($v['title']) ?></span>
            <form method="post" action="delete.php" style="display:inline;" onsubmit="return confirm('Hapus video ini?')">
              <?= csrf_field() ?>
              <input type="hidden" name="type" value="videos">
              <input type="hidden" name="id" value="<?= $v['id'] ?>">
              <button type="submit" class="admin-del-btn">Hapus</button>
            </form>
          </div>
        <?php endforeach; ?>
        <?php if(!$videos): ?><p class="muted">Belum ada video YouTube ditambahkan.</p><?php endif; ?>
      </div>
    </section>

    <!-- Panel 6: Feedback Moderation -->
    <section class="admin-panel">
      <h2>Moderasi Feedback</h2>
      <div>
        <?php foreach($feedbacks as $f): ?>
          <div class="feedback-admin">
            <strong><?= e($f['name']) ?> — <?= (int)$f['rating'] ?>/5</strong>
            <p><?= nl2br(e($f['message'])) ?></p>
            <div style="display:flex;gap:10px;align-items:center;">
              <?php if(!$f['approved']): ?>
                <form method="post" action="approve_feedback.php" style="display:inline;">
                  <?= csrf_field() ?>
                  <input type="hidden" name="id" value="<?= $f['id'] ?>">
                  <button type="submit" class="admin-approve-btn">Setujui</button>
                </form>
              <?php endif; ?>
              <form method="post" action="delete.php" style="display:inline;" onsubmit="return confirm('Hapus feedback ini?')">
                <?= csrf_field() ?>
                <input type="hidden" name="type" value="feedback">
                <input type="hidden" name="id" value="<?= $f['id'] ?>">
                <button type="submit" class="admin-del-btn">Hapus</button>
              </form>
            </div>
          </div>
        <?php endforeach; ?>
        <?php if(!$feedbacks): ?><p class="muted">Belum ada feedback yang masuk.</p><?php endif; ?>
      </div>
    </section>
  </div>
</div>
</body>
</html>
