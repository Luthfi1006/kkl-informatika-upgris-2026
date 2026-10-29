<?php 
require_once __DIR__ . "/auth.php"; 
require_once __DIR__ . "/../config/database.php"; 
require_once __DIR__ . "/../config/helpers.php";

$id = 0;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token()) {
        die("Error: Token keamanan CSRF tidak valid.");
    }
    $id = (int)($_POST['id'] ?? 0);
} else {
    if (!verify_csrf_token($_GET['csrf'] ?? '')) {
        die("Error: Aksi tidak diizinkan tanpa token keamanan CSRF yang sah.");
    }
    $id = (int)($_GET['id'] ?? 0);
}

if ($id > 0) {
    $stmt = $pdo->prepare("UPDATE feedback SET approved=1 WHERE id=?");
    $stmt->execute([$id]);
}

header("Location: dashboard.php");
exit;
