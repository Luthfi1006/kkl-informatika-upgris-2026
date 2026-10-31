<?php
require_once __DIR__ . "/auth.php"; 
require_once __DIR__ . "/../config/database.php"; 
require_once __DIR__ . "/../config/helpers.php";

$id = (int)($_GET['id'] ?? 0); 
$item = ['name' => '', 'visit_date' => '', 'description' => '', 'day_no' => 1, 'route' => '', 'sort_order' => 1];
if ($id) {
    $s = $pdo->prepare('SELECT * FROM destinations WHERE id = ?');
    $s->execute([$id]);
    $item = $s->fetch(PDO::FETCH_ASSOC) ?: $item;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        $error = "Token keamanan CSRF tidak valid. Silakan coba lagi.";
    } else {
        $name = trim($_POST['name'] ?? ''); 
        $date = !empty($_POST['visit_date']) ? $_POST['visit_date'] : null; 
        $desc = trim($_POST['description'] ?? '');
        $day = (int)($_POST['day_no'] ?? 1);
        $route = trim($_POST['route'] ?? '');
        $sort = (int)($_POST['sort_order'] ?? 1);

        if (empty($name)) {
            $error = "Nama kegiatan/destinasi wajib diisi.";
        } else {
            if ($id) {
                $s = $pdo->prepare('UPDATE destinations SET name=?, visit_date=?, description=?, day_no=?, route=?, sort_order=? WHERE id=?');
                $s->execute([$name, $date, $desc, $day, $route, $sort, $id]);
            } else {
                $s = $pdo->prepare('INSERT INTO destinations(name, visit_date, description, day_no, route, sort_order) VALUES(?,?,?,?,?,?)');
                $s->execute([$name, $date, $desc, $day, $route, $sort]);
            }
            redirect('dashboard.php');
        }
    }
}
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= $id ? 'Edit' : 'Tambah' ?> Destinasi</title>
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
</head>
<body class="admin-body">
<form class="form-card" method="post">
  <?= csrf_field() ?>
  <h1><?= $id ? 'Edit' : 'Tambah' ?> Agenda / Destinasi</h1>
  <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>
  
  <label>Hari ke-
    <select name="day_no" required>
      <option value="1" <?= $item['day_no'] == 1 ? 'selected' : '' ?>>Hari 1 (18 Agustus 2026)</option>
      <option value="2" <?= $item['day_no'] == 2 ? 'selected' : '' ?>>Hari 2 (19 Agustus 2026)</option>
      <option value="3" <?= $item['day_no'] == 3 ? 'selected' : '' ?>>Hari 3 (20 Agustus 2026)</option>
      <option value="4" <?= $item['day_no'] == 4 ? 'selected' : '' ?>>Hari 4 (21 Agustus 2026)</option>
      <option value="5" <?= $item['day_no'] == 5 ? 'selected' : '' ?>>Hari 5 (22 Agustus 2026)</option>
    </select>
  </label>

  <label>Nama Destinasi / Kegiatan
    <input name="name" required placeholder="Contoh: Pantai Pandawa" value="<?= e($item['name']) ?>">
  </label>

  <label>Jadwal / Jam (Waktu)
    <input name="description" placeholder="Contoh: Pukul 15.30 – 17.00" value="<?= e($item['description']) ?>">
  </label>

  <label>Rute / Keterangan Tambahan
    <input name="route" placeholder="Contoh: Menuju Pantai Pandawa" value="<?= e($item['route']) ?>">
  </label>

  <label>Tanggal Perjalanan
    <input type="date" name="visit_date" value="<?= e($item['visit_date']) ?>">
  </label>

  <label>Nomor Urutan Jadwal
    <input type="number" name="sort_order" min="1" value="<?= (int)($item['sort_order'] ?: 1) ?>">
  </label>

  <button class="btn btn-primary" type="submit">Simpan Agenda</button> 
  <a href="dashboard.php">← Kembali ke Dashboard</a>
</form>
</body>
</html>
