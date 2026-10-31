<?php
require_once "auth.php"; 
require_once "../config/database.php"; 
require_once "../config/helpers.php";

try {
    $destinations = $pdo->query('SELECT * FROM destinations ORDER BY day_no, sort_order, visit_date, name')->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $destinations = $pdo->query('SELECT * FROM destinations ORDER BY visit_date, name')->fetchAll(PDO::FETCH_ASSOC);
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        $error = "Token keamanan CSRF tidak valid. Silakan coba lagi.";
    } else {
        $title = trim($_POST['title'] ?? '');
        $location = trim($_POST['location'] ?? '');
        $destination = (int)($_POST['destination_id'] ?? 0) ?: null;

        if (empty($title)) {
            $error = "Judul foto wajib diisi.";
        } elseif (empty($_FILES['photo']['name']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            $error = "Silakan pilih file foto untuk diunggah.";
        } else {
            $photo = upload_image($_FILES['photo'], 'gallery', 'gallery_');
            if ($photo) {
                $stmt = $pdo->prepare('INSERT INTO gallery(destination_id,title,location,photo) VALUES(?,?,?,?)');
                $stmt->execute([$destination, $title, $location, $photo]);
                redirect('dashboard.php');
            } else {
                $error = "Gagal mengunggah foto. Pastikan format JPG, PNG, WEBP, atau GIF dan ukuran maksimal 5MB.";
            }
        }
    }
}
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tambah Foto</title>
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
</head>
<body class="admin-body">
<form class="form-card" method="post" enctype="multipart/form-data">
  <?= csrf_field() ?>
  <h1>Tambah Foto Dokumentasi</h1>
  <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>
  <label>Destinasi
    <select name="destination_id">
      <option value="">Tanpa destinasi</option>
      <?php foreach($destinations as $d): ?>
        <option value="<?= $d['id'] ?>"><?= e($d['name']) ?><?= !empty($d['visit_date']) ? ' (' . e($d['visit_date']) . ')' : '' ?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <label>Judul foto<input name="title" required value="<?= e($_POST['title'] ?? '') ?>"></label>
  <label>Lokasi tambahan<input name="location" value="<?= e($_POST['location'] ?? '') ?>"></label>
  <label>Foto<input type="file" name="photo" accept="image/*" required></label>
  <button class="btn btn-primary" type="submit">Upload</button> 
  <a href="dashboard.php">Batal</a>
</form>
</body>
</html>
