<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
init_session();

if (isset($_SESSION['admin_id'])) {
    redirect('dashboard.php');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        $error = "Sesi telah kedaluwarsa. Silakan coba lagi.";
    } else {
        $user = trim($_POST['username'] ?? '');
        $pass = $_POST['password'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username=? LIMIT 1");
        $stmt->execute([$user]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin && password_verify($pass, $admin['password'])) {
            session_regenerate_id(true);
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            redirect('dashboard.php');
        } else {
            $error = "Username atau password salah. Jika lupa password, gunakan link pemulihan di bawah.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Login Admin - KKL Informatika UPGRIS</title>
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
</head>
<body class="admin-body">
<form class="login-card" method="post">
  <?= csrf_field() ?>
  <h1>Admin KKL</h1>
  <p>Masuk untuk mengelola website KKL Informatika 2026.</p>
  
  <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>
  
  <label>Username
    <input name="username" required autocomplete="username" value="<?= e($_POST['username'] ?? '') ?>">
  </label>
  
  <label>Password
    <input type="password" name="password" required autocomplete="current-password">
  </label>
  
  <button class="btn btn-primary" type="submit">Masuk ke Dashboard</button>
  
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:13px;">
    <a href="../index.php">← Kembali ke Website</a>
    <a href="reset_password.php" style="color:var(--text-muted);">Lupa / Reset Sandi?</a>
  </div>
</form>
</body>
</html>
