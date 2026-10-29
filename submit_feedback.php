<?php
require_once "config/database.php";
require_once "config/helpers.php";
init_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('index.php#feedback');
}

// Honeypot bot protection: if hidden bot field is filled, silently discard
if (!empty($_POST['user_honeypot'])) {
    redirect('index.php?sent=1#feedback');
}

// CSRF verification
if (!verify_csrf_token()) {
    redirect('index.php#feedback');
}

$name = trim($_POST['name'] ?? '');
$rating = (int)($_POST['rating'] ?? 0);
$message = trim($_POST['message'] ?? '');

if ($name && $rating >= 1 && $rating <= 5 && $message) {
    $stmt = $pdo->prepare("INSERT INTO feedback(name,rating,message,approved) VALUES(?,?,?,0)");
    $stmt->execute([$name,$rating,$message]);
}

redirect('index.php?sent=1#feedback');
