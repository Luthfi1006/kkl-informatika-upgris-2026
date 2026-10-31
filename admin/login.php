<?php
/**
 * Admin Login Page
 * Enhanced dengan rate limiting, error messages, dan security features
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

init_session();

// Redirect jika sudah login
if (isset($_SESSION['admin_id'])) {
    redirect('dashboard.php');
}

$error = '';
$info = '';

// Handle URL parameters
if (isset($_GET['expired'])) {
    $info = 'Sesi Anda telah berakhir. Silakan login kembali.';
}
if (isset($_GET['invalid'])) {
    $error = 'Sesi tidak valid. Silakan login kembali.';
}
if (isset($_GET['logout'])) {
    $info = 'Anda telah logout dengan sukses.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        $error = 'Token keamanan tidak valid. Silakan refresh halaman dan coba lagi.';
    } else {
        $user = trim($_POST['username'] ?? '');
        $pass = $_POST['password'] ?? '';
        
        // Validate input
        if (empty($user) || empty($pass)) {
            $error = 'Username dan password harus diisi.';
        } else {
            // Use enhanced auth module
            require_once __DIR__ . '/auth.php';
            $result = verify_admin_credentials($user, $pass);
            
            if ($result['success']) {
                redirect('dashboard.php');
            } else {
                $error = $result['message'];
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
<title>Login Admin - KKL Informatika UPGRIS 2026</title>
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
<style>
.admin-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}
.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 420px;
  width: 100%;
}
.login-card h1 {
  margin: 0 0 10px;
  font-size: 28px;
  color: #333;
}
.login-card p {
  margin: 0 0 25px;
  color: #666;
  font-size: 14px;
}
.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}
.alert-error {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
}
.alert-info {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  color: #1976d2;
}
.login-card label {
  display: block;
  margin-bottom: 15px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
}
.login-card input {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.2s;
}
.login-card input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}
.login-card button {
  width: 100%;
  margin-top: 10px;
}
.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 13px;
}
.login-footer a {
  color: #667eea;
  text-decoration: none;
}
.login-footer a:hover {
  text-decoration: underline;
}
</style>
</head>
<body class="admin-body">
<form class="login-card" method="post" autocomplete="off">
  <?= csrf_field() ?>
  
  <h1>🔐 Admin Panel</h1>
  <p>Masuk untuk mengelola website KKL Informatika UPGRIS 2026.</p>
  
  <?php if ($error): ?>
    <div class="alert alert-error"><?= e($error) ?></div>
  <?php endif; ?>
  
  <?php if ($info): ?>
    <div class="alert alert-info"><?= e($info) ?></div>
  <?php endif; ?>
  
  <label>
    Username
    <input type="text" name="username" required autocomplete="username" 
           value="<?= e($_POST['username'] ?? '') ?>" 
           placeholder="Masukkan username Anda">
  </label>
  
  <label>
    Password
    <input type="password" name="password" required autocomplete="current-password"
           placeholder="Masukkan password Anda">
  </label>
  
  <button class="btn btn-primary" type="submit">Masuk ke Dashboard</button>
  
  <div class="login-footer">
    <a href="../index.php">← Kembali ke Website</a>
    <a href="reset_password.php">Lupa Password?</a>
  </div>
</form>

<script>
// Auto-clear error messages after 8 seconds
setTimeout(() => {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    alert.style.transition = 'opacity 0.5s';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  });
}, 8000);
</script>
</body>
</html>
