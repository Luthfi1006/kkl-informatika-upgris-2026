<?php
require_once __DIR__ . "/auth.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

$type = '';
$id = 0;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        die("Error: Token keamanan CSRF tidak valid.");
    }
    $type = $_POST['type'] ?? '';
    $id = (int)($_POST['id'] ?? 0);
} else {
    // If sent via GET with CSRF parameter
    if (!verify_csrf_token($_GET['csrf'] ?? '')) {
        die("Error: Aksi tidak diizinkan tanpa token keamanan CSRF yang sah.");
    }
    $type = $_GET['type'] ?? '';
    $id = (int)($_GET['id'] ?? 0);
}

$allowed = ['gallery', 'videos', 'feedback', 'profiles', 'destinations'];

if ($id > 0 && in_array($type, $allowed, true)) {
    if ($type === 'destinations') {
        $pdo->prepare("UPDATE gallery SET destination_id = NULL WHERE destination_id = ?")->execute([$id]);
        $stmt = $pdo->prepare("DELETE FROM destinations WHERE id = ?");
        $stmt->execute([$id]);
    } elseif ($type === 'gallery') {
        $stmt = $pdo->prepare("SELECT photo FROM gallery WHERE id = ?");
        $stmt->execute([$id]);
        $photo = $stmt->fetchColumn();
        if ($photo && strpos($photo, 'assets/uploads/gallery/') === 0) {
            $filePath = __DIR__ . '/../' . $photo;
            if (file_exists($filePath)) @unlink($filePath);
        }
        $pdo->prepare("DELETE FROM gallery WHERE id = ?")->execute([$id]);
    } elseif ($type === 'profiles') {
        $stmt = $pdo->prepare("SELECT photo FROM profiles WHERE id = ?");
        $stmt->execute([$id]);
        $photo = $stmt->fetchColumn();
        if ($photo && strpos($photo, 'assets/uploads/profiles/') === 0) {
            $filePath = __DIR__ . '/../' . $photo;
            if (file_exists($filePath)) @unlink($filePath);
        }
        $pdo->prepare("DELETE FROM profiles WHERE id = ?")->execute([$id]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM `$type` WHERE id = ?");
        $stmt->execute([$id]);
    }
}

header("Location: dashboard.php");
exit;
