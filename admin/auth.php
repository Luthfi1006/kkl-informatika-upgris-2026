<?php
/**
 * Admin Authentication Module
 * Handles login state verification dan session security
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

/**
 * Verify admin is logged in
 * Enforces session timeout dan HTTPS on production
 */
function require_admin_login() {
    init_session();
    
    // Check session timeout
    if (!check_session_timeout(1800)) { // 30 minutes
        session_destroy();
        redirect('login.php?expired=1');
    }
    
    // Verify admin_id exists
    if (!isset($_SESSION['admin_id']) || empty($_SESSION['admin_id'])) {
        redirect('login.php');
    }
    
    // Verify admin still exists in database
    global $pdo;
    try {
        $stmt = $pdo->prepare('SELECT id FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['admin_id']]);
        if (!$stmt->fetch()) {
            session_destroy();
            redirect('login.php?invalid=1');
        }
    } catch (PDOException $e) {
        log_error('Admin verification failed: ' . $e->getMessage());
        session_destroy();
        redirect('login.php?error=1');
    }
}

/**
 * Set admin session dengan security data
 */
function set_admin_session($admin_id, $username) {
    init_session();
    
    $_SESSION['admin_id'] = $admin_id;
    $_SESSION['admin_name'] = $username;
    $_SESSION['_created'] = time();
    $_SESSION['_last_activity'] = time();
    $_SESSION['_ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
    $_SESSION['_user_agent'] = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
    
    // Regenerate session ID untuk prevent fixation
    session_regenerate_id(true);
}

/**
 * Verify admin credentials dengan rate limiting
 */
function verify_admin_credentials($username, $password) {
    global $pdo;
    
    // Rate limiting: max 5 attempts per 15 minutes
    init_session();
    
    $attempts_key = 'login_attempts_' . md5($_SERVER['REMOTE_ADDR'] ?? '');
    $attempts = $_SESSION[$attempts_key] ?? 0;
    $last_attempt = $_SESSION[$attempts_key . '_time'] ?? 0;
    $now = time();
    
    if ($last_attempt && ($now - $last_attempt) > 900) { // 15 minutes
        $_SESSION[$attempts_key] = 0;
        $attempts = 0;
    }
    
    if ($attempts >= 5) {
        log_error("Login rate limit exceeded for IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        return ['success' => false, 'message' => 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.'];
    }
    
    try {
        $stmt = $pdo->prepare('SELECT id, username, password FROM admins WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $admin = $stmt->fetch();
        
        if ($admin && password_verify($password, $admin['password'])) {
            // Success - reset attempts
            $_SESSION[$attempts_key] = 0;
            set_admin_session($admin['id'], $admin['username']);
            log_error("Successful login for admin: " . $admin['username'], 'INFO');
            return ['success' => true];
        }
        
    } catch (PDOException $e) {
        log_error('Login database error: ' . $e->getMessage());
        return ['success' => false, 'message' => 'Terjadi kesalahan server. Silakan coba lagi.'];
    }
    
    // Failed attempt
    $_SESSION[$attempts_key] = $attempts + 1;
    $_SESSION[$attempts_key . '_time'] = $now;
    
    log_error("Failed login attempt for username: " . sanitize_input($username), 'WARNING');
    return ['success' => false, 'message' => 'Username atau password salah.'];
}

/**
 * Logout admin
 */
function logout_admin() {
    init_session();
    $username = $_SESSION['admin_name'] ?? 'unknown';
    log_error("Admin logout: $username", 'INFO');
    session_destroy();
}

/**
 * Verify password strength
 * Min: 8 chars, 1 uppercase, 1 number, 1 special char
 */
function verify_password_strength($password) {
    if (strlen($password) < 8) {
        return ['valid' => false, 'message' => 'Password minimal 8 karakter'];
    }
    if (!preg_match('/[A-Z]/', $password)) {
        return ['valid' => false, 'message' => 'Password harus mengandung minimal 1 huruf besar'];
    }
    if (!preg_match('/[0-9]/', $password)) {
        return ['valid' => false, 'message' => 'Password harus mengandung minimal 1 angka'];
    }
    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>?\\/]/', $password)) {
        return ['valid' => false, 'message' => 'Password harus mengandung minimal 1 karakter spesial'];
    }
    return ['valid' => true];
}

/**
 * Hash password dengan bcrypt
 */
function hash_password($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

// Auto-protect routes yang require authentication
if (basename($_SERVER['SCRIPT_NAME']) !== 'login.php' && 
    basename($_SERVER['SCRIPT_NAME']) !== 'reset_password.php') {
    require_admin_login();
}

?>
