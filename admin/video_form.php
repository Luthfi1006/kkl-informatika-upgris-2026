<?php
require_once "auth.php"; 
require_once "../config/database.php"; 
require_once "../config/helpers.php";

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        $error = "Token keamanan CSRF tidak valid. Silakan coba lagi.";
    } else {
        $title = trim($_POST['title'] ?? '');
        $url = trim($_POST['url'] ?? '');

        if (empty($title)) {
            $error = "Judul video wajib diisi.";
        } elseif (empty($url)) {
            $error = "Link YouTube wajib diisi.";
        } else {
            // Match YouTube ID from watch?v=, youtu.be/, /embed/, or /shorts/
            if (preg_match('~(?:v=|/embed/|/shorts/|youtu\.be/)([a-zA-Z0-9_-]{11})~i', $url, $m)) {
                $id = $m[1];
                $embed = "https://www.youtube.com/embed/" . rawurlencode($id);
                $stmt = $pdo->prepare("INSERT INTO videos(title,embed_url) VALUES(?,?)");
                $stmt->execute([$title, $embed]);
                redirect('dashboard.php');
            } else {
                $error = "Format link YouTube tidak valid. Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/...";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tambah Video</title>
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
</head>
<body class="admin-body">
<form class="form-card" method="post">
  <?= csrf_field() ?>
  <h1>Tambah Video YouTube</h1>
  <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>
  <label>Judul<input name="title" required value="<?= e($_POST['title'] ?? '') ?>"></label>
  <label>Link YouTube<input name="url" placeholder="https://www.youtube.com/watch?v=..." required value="<?= e($_POST['url'] ?? '') ?>"></label>
  <button class="btn btn-primary" type="submit">Simpan</button>
  <a href="dashboard.php">Batal</a>
</form>
</body>
</html>
