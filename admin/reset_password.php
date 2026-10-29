<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
init_session();

$success = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'custom';
    
    if ($action === 'default') {
        $username = 'admin';
        $newPass = 'password';
    } else {
        $username = trim($_POST['username'] ?? 'admin');
        $newPass = $_POST['new_password'] ?? '';
    }

    if (empty($username)) {
        $error = "Username tidak boleh kosong.";
    } elseif (empty($newPass)) {
        $error = "Password baru tidak boleh kosong.";
    } elseif (strlen($newPass) < 4) {
        $error = "Password minimal terdiri dari 4 karakter.";
    } else {
        try {
            $hashed = password_hash($newPass, PASSWORD_BCRYPT);
            
            // Check if admin exists
            $stmt = $pdo->prepare("SELECT id FROM admins WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $existing = $stmt->fetchColumn();

            if ($existing) {
                $update = $pdo->prepare("UPDATE admins SET password = ? WHERE id = ?");
                $update->execute([$hashed, $existing]);
            } else {
                // If username not found, check if there's any admin record to update, or insert new
                $firstAdmin = $pdo->query("SELECT id FROM admins ORDER BY id ASC LIMIT 1")->fetchColumn();
                if ($firstAdmin) {
                    $update = $pdo->prepare("UPDATE admins SET username = ?, password = ? WHERE id = ?");
                    $update->execute([$username, $hashed, $firstAdmin]);
                } else {
                    $insert = $pdo->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
                    $insert->execute([$username, $hashed]);
                }
            }

            $success = "Password admin berhasil diperbarui! Username: <strong>" . e($username) . "</strong> | Password: <strong>" . e($newPass) . "</strong>";
        } catch (PDOException $ex) {
            $error = "Terjadi kesalahan database: " . $ex->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reset Password Admin - KKL Informatika UPGRIS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
<style>
.reset-card {
    max-width: 480px;
    margin: 40px auto;
    background: #ffffff;
    padding: 36px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
}
.reset-card h1 {
    font-family: var(--font-heading);
    font-size: 26px;
    color: var(--primary);
    margin-bottom: 8px;
}
.alert-success {
    background: #dcfce7;
    border: 1px solid #86efac;
    padding: 14px 18px;
    border-radius: var(--radius-sm);
    color: #166534;
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.5;
}
.btn-reset-default {
    background: #e2e8f0;
    color: #1e293b;
    border: 1px solid #cbd5e1;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    font-weight: 700;
    font-size: 13.5px;
    cursor: pointer;
    width: 100%;
    transition: all .2s;
}
.btn-reset-default:hover {
    background: #cbd5e1;
}
.divider {
    text-align: center;
    position: relative;
    margin: 20px 0;
}
.divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border);
}
.divider span {
    position: relative;
    background: #ffffff;
    padding: 0 12px;
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
}
</style>
</head>
<body class="admin-body">
<div class="reset-card">
  <h1>Pemulihan Password</h1>
  <p style="font-size: 14px; margin-bottom: 20px;">Gunakan halaman darurat ini jika kamu tidak bisa masuk ke dashboard admin karena password salah.</p>

  <?php if ($success): ?>
    <div class="alert-success">
      <?= $success ?><br><br>
      <a href="login.php" class="btn btn-primary" style="display:inline-block;padding:8px 18px;font-size:13px;">→ Buka Halaman Login</a>
    </div>
  <?php endif; ?>

  <?php if ($error): ?>
    <div class="alert" style="margin-bottom: 20px;">
      <?= e($error) ?>
    </div>
  <?php endif; ?>

  <!-- Pilihan 1: Reset langsung ke default -->
  <form method="post" style="margin-bottom: 15px;">
    <input type="hidden" name="action" value="default">
    <button type="submit" class="btn-reset-default" onclick="return confirm('Reset akun admin ke default (Username: admin, Password: password)?')">
      ⚡ 1-Klik Reset ke Default (admin / password)
    </button>
  </form>

  <div class="divider">
    <span>atau buat sandi baru</span>
  </div>

  <!-- Pilihan 2: Buat sandi baru sesuai keinginan -->
  <form method="post" style="display: grid; gap: 14px;">
    <input type="hidden" name="action" value="custom">
    <label style="display:grid;gap:6px;font-weight:700;font-size:13px;">
      Username Admin
      <input name="username" value="admin" required style="padding:10px 14px;border:1px solid #ccd9d0;border-radius:var(--radius-sm);">
    </label>

    <label style="display:grid;gap:6px;font-weight:700;font-size:13px;">
      Password Baru
      <input type="password" name="new_password" placeholder="Masukkan password baru" required style="padding:10px 14px;border:1px solid #ccd9d0;border-radius:var(--radius-sm);">
    </label>

    <button class="btn btn-primary" type="submit" style="margin-top: 8px;">Simpan Password Baru</button>
  </form>

  <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
    <a href="login.php">← Kembali ke Login</a>
    <span style="font-size: 11.5px; color: #b45309;">⚠️ Hapus file ini di server produksi</span>
  </div>
</div>
</body>
</html>
