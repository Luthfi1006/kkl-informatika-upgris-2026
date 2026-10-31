<?php
require_once "auth.php"; 
require_once "../config/database.php"; 
require_once "../config/helpers.php";

$id = (int)($_GET['id'] ?? 0); 
$profile = ['name'=>'','role'=>'','bio'=>'','photo'=>'','sort_order'=>0];
if ($id) { 
    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE id=?"); 
    $stmt->execute([$id]); 
    $profile = $stmt->fetch(PDO::FETCH_ASSOC) ?: $profile; 
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        $error = "Token keamanan CSRF tidak valid. Silakan coba lagi.";
    } else {
        $name = trim($_POST['name'] ?? ''); 
        $role = trim($_POST['role'] ?? ''); 
        $bio = trim($_POST['bio'] ?? ''); 
        $sort = (int)($_POST['sort_order'] ?? 0);

        if (empty($name)) {
            $error = "Nama anggota wajib diisi.";
        } else {
            $photo = $profile['photo'];
            if (!empty($_FILES['photo']['name'])) {
                $newPhoto = upload_image($_FILES['photo'], 'profiles', 'profile_');
                if ($newPhoto) {
                    // If old photo was an uploaded file, remove it
                    if ($photo && strpos($photo, 'assets/uploads/profiles/') === 0 && file_exists(__DIR__ . '/../' . $photo)) {
                        @unlink(__DIR__ . '/../' . $photo);
                    }
                    $photo = $newPhoto;
                } else {
                    $error = "Gagal mengunggah foto. Pastikan format JPG, PNG, WEBP, atau GIF dan maksimal 5MB.";
                }
            }

            if (!$error) {
                if (empty($photo)) {
                    $photo = 'assets/img/profile-placeholder.svg';
                }
                if ($id) {
                    $stmt = $pdo->prepare("UPDATE profiles SET name=?,role=?,bio=?,photo=?,sort_order=? WHERE id=?");
                    $stmt->execute([$name, $role, $bio, $photo, $sort, $id]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO profiles(name,role,bio,photo,sort_order) VALUES(?,?,?,?,?)");
                    $stmt->execute([$name, $role, $bio, $photo, $sort]);
                }
                redirect('dashboard.php');
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
<title><?= $id ? 'Edit' : 'Tambah' ?> Profil</title>
<link rel="stylesheet" href="../assets/css/style.css?v=<?= time() ?>">
</head>
<body class="admin-body">
<form class="form-card" method="post" enctype="multipart/form-data">
  <?= csrf_field() ?>
  <h1><?= $id ? 'Edit' : 'Tambah' ?> Profil</h1>
  <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>
  <label>Nama<input name="name" required value="<?= e($profile['name']) ?>"></label>
  <label>Peran / Keterangan<input name="role" value="<?= e($profile['role']) ?>"></label>
  <label>Bio<textarea name="bio"><?= e($profile['bio']) ?></textarea></label>
  <label>Urutan<input type="number" name="sort_order" value="<?= e($profile['sort_order']) ?>"></label>
  <?php if ($id && !empty($profile['photo'])): 
      $thumb = file_exists(__DIR__ . '/../' . $profile['photo']) ? '../' . $profile['photo'] : '../assets/img/profile-placeholder.svg';
  ?>
    <div>
      <small style="display:block;margin-bottom:6px;font-weight:700;">Foto saat ini:</small>
      <img src="<?= e($thumb) ?>" style="width:64px;height:64px;border-radius:12px;object-fit:cover;">
    </div>
  <?php endif; ?>
  <label>Foto Baru<input type="file" name="photo" accept="image/*"></label>
  <button class="btn btn-primary" type="submit">Simpan</button>
  <a href="dashboard.php">Batal</a>
</form>
</body>
</html>
