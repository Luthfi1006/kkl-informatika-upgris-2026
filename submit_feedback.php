<?php
/**
 * Feedback Submission Handler
 * Enhanced dengan input validation, rate limiting, dan security features
 */

require_once 'config/database.php';
require_once 'config/helpers.php';

init_session();

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('index.php#feedback');
}

// Honeypot bot protection: if hidden bot field is filled, silently discard
if (!empty($_POST['user_honeypot'])) {
    log_error('Bot detected in feedback submission from IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 'WARNING');
    redirect('index.php?sent=1#feedback');
}

// CSRF verification
if (!verify_csrf_token()) {
    log_error('CSRF token validation failed for feedback submission', 'WARNING');
    redirect('index.php?error=invalid#feedback');
}

// Rate limiting: max 3 feedback per hour per IP
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rate_key = 'feedback_rate_' . md5($ip);
$submissions = $_SESSION[$rate_key] ?? [];
$now = time();

// Clean old submissions (older than 1 hour)
$submissions = array_filter($submissions, function($timestamp) use ($now) {
    return ($now - $timestamp) < 3600; // 1 hour
});

if (count($submissions) >= 3) {
    log_error("Feedback rate limit exceeded for IP: $ip", 'WARNING');
    redirect('index.php?error=rate_limit#feedback');
}

// Input validation & sanitization
$name = sanitize_input($_POST['name'] ?? '', 'text');
$rating = (int)($_POST['rating'] ?? 0);
$message = sanitize_input($_POST['message'] ?? '', 'text');

// Validate required fields
if (empty($name) || $rating < 1 || $rating > 5 || empty($message)) {
    redirect('index.php?error=invalid_input#feedback');
}

// Validate lengths
if (strlen($name) > 100 || strlen($message) > 1000) {
    redirect('index.php?error=too_long#feedback');
}

// Additional validation: check for spam patterns
$spamPatterns = [
    '/\b(viagra|cialis|casino|poker)\b/i',
    '/https?:\/\/[^\s]{30,}/i', // Long URLs
    '/(.)\1{10,}/', // Repeated characters
];

foreach ($spamPatterns as $pattern) {
    if (preg_match($pattern, $message)) {
        log_error("Spam pattern detected in feedback from IP: $ip", 'WARNING');
        redirect('index.php?sent=1#feedback'); // Fake success to confuse spammers
    }
}

// Insert feedback
try {
    $stmt = $pdo->prepare("INSERT INTO feedback(name, rating, message, approved, created_at) VALUES(?, ?, ?, 0, NOW())");
    $stmt->execute([$name, $rating, $message]);
    
    // Update rate limiting
    $submissions[] = $now;
    $_SESSION[$rate_key] = $submissions;
    
    log_error("New feedback submitted from: $name (IP: $ip)", 'INFO');
    redirect('index.php?sent=1#feedback');
    
} catch (PDOException $e) {
    log_error('Failed to save feedback: ' . $e->getMessage());
    redirect('index.php?error=server#feedback');
}

?>
