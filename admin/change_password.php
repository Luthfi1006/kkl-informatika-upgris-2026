<?php
require_once __DIR__ . "/auth.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

$adminId = (int)$_SESSION['admin_id'];
$stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ? LIMIT 1");
$stmt->execute([$adminId]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    redirect("logout.php");
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        $error = "Token keamanan CSRF tidak valid atau sesi berakhir. Silakan muat ulang.";
    } else {
        $newUsername = trim($_POST['username'] ?? '');
        $currentPass = $_POST['current_password'] ?? '';
        $newPass     = $_POST['new_password'] ?? '';
        $confirmPass = $_POST['confirm_password'] ?? '';

        if (empty($newUsername)) {
            $error = "Username tidak boleh kosong.";
        } elseif (empty($currentPass)) {
            $error = "Password saat ini wajib diisi.";
        } elseif (!password_verify($currentPass, $admin['password'])) {
            $error = "Password saat ini yang Anda masukkan salah.";
        } elseif (empty($newPass)) {
            $error = "Password baru tidak boleh kosong.";
        } elseif (strlen($newPass) < 5) {
            $error = "Password baru minimal terdiri dari 5 karakter.";
        } elseif ($newPass !== $confirmPass) {
            $error = "Konfirmasi password baru tidak cocok.";
        } else {
            // Check if username taken by another admin
            $check = $pdo->prepare("SELECT id FROM admins WHERE username = ? AND id != ? LIMIT 1");
            $check->execute([$newUsername, $adminId]);
            if ($check->fetchColumn()) {
                $error = "Username '$newUsername' sudah digunakan oleh akun lain.";
            } else {
                $hashed = password_hash($newPass, PASSWORD_BCRYPT);
                $update = $pdo->prepare("UPDATE admins SET username = ?, password = ? WHERE id = ?");
                $update->execute([$newUsername, $hashed, $adminId]);

                $_SESSION['admin_username'] = $newUsername;
                $admin['username'] = $newUsername;
                $admin['password'] = $hashed;
                $success = "Username dan password admin berhasil diperbarui!";
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
<title>Ganti Password Admin - KKL Informatika UPGRIS</title>
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
<style>
.alert-success {
    background: #dcfce7;
    border: 1px solid #86efac;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    color: #166534;
    font-size: 14px;
}
</style>
</head>
<body class="admin-body">
<form class="form-card" method="post" style="max-width: 520px;">
  <?= csrf_field() ?>
  <h1>Ganti Password Admin</h1>
  <p>Perbarui kredensial akun administrator website KKL.</p>

  <?php if ($success): ?>
    <div class="alert-success"><?= e($success) ?></div>
  <?php endif; ?>

  <?php if ($error): ?>
    <div class="alert"><?= e($error) ?></div>
  <?php endif; ?>

  <label>Username Admin
    <input name="username" required value="<?= e($admin['username']) ?>" autocomplete="username">
  </label>

  <label>Password Saat Ini (Lama)
    <input type="password" name="current_password" required placeholder="Masukkan password lama Anda" autocomplete="current-password">
  </label>

  <label>Password Baru
    <input type="password" name="new_password" required placeholder="Minimal 5 karakter" autocomplete="new-password">
  </label>

  <label>Konfirmasi Password Baru
    <input type="password" name="confirm_password" required placeholder="Ketik ulang password baru" autocomplete="new-password">
  </label>

  <div style="display:flex;gap:12px;align-items:center;margin-top:10px;">
    <button class="btn btn-primary" type="submit">Simpan Perubahan</button>
    <a href="dashboard.php" class="btn btn-ghost" style="padding:10px 18px;">Kembali ke Dashboard</a>
  </div>
</form>
</body>
</html>
