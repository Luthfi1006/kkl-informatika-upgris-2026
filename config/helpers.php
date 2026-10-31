<?php
/**
 * KKL Informatika UPGRIS 2026 - Helper Functions
 * Core utility functions untuk security, validation, dan formatting
 */

// ===== OUTPUT ENCODING & SECURITY =====

if (!function_exists('e')) {
    /**
     * Escape output untuk prevent XSS attacks
     */
    function e($value) { 
        return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8'); 
    }
}

if (!function_exists('redirect')) {
    /**
     * HTTP redirect dengan cleanup
     */
    function redirect($url, $code = 302) { 
        header("Location: $url", true, $code);
        exit;
    }
}

if (!function_exists('json_response')) {
    /**
     * Return JSON response dengan proper headers
     */
    function json_response($data, $status = 200) {
        header('Content-Type: application/json', true, $status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}

// ===== SESSION MANAGEMENT =====

if (!function_exists('init_session')) {
    /**
     * Initialize session dengan secure parameters
     * Auto-enforce HTTPS pada production
     */
    function init_session() {
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
                    || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
            
            // HTTPS enforcement untuk production
            $appEnv = getenv('APP_ENV') ?: 'development';
            if ($appEnv === 'production' && !$isHttps && $_SERVER['REQUEST_METHOD'] === 'GET') {
                $url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
                header("Location: $url", true, 301);
                exit;
            }
            
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => $isHttps,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
            
            // Initialize activity tracking untuk session timeout
            if (!isset($_SESSION['_created'])) {
                $_SESSION['_created'] = time();
            }
            $_SESSION['_last_activity'] = time();
        }
    }
}

if (!function_exists('check_session_timeout')) {
    /**
     * Check dan enforce session timeout (30 minutes default)
     */
    function check_session_timeout($timeout = 1800) {
        init_session();
        
        $now = time();
        $last = $_SESSION['_last_activity'] ?? 0;
        
        if ($last && ($now - $last > $timeout)) {
            session_destroy();
            return false;
        }
        
        $_SESSION['_last_activity'] = $now;
        return true;
    }
}

// ===== CSRF PROTECTION =====

if (!function_exists('csrf_token')) {
    /**
     * Generate atau retrieve CSRF token
     */
    function csrf_token() {
        init_session();
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
}

if (!function_exists('csrf_field')) {
    /**
     * Return HTML hidden field untuk CSRF token
     */
    function csrf_field() {
        return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">';
    }
}

if (!function_exists('verify_csrf_token')) {
    /**
     * Verify CSRF token dari request
     */
    function verify_csrf_token($token = null) {
        init_session();
        $submitted = $token ?? ($_POST['csrf_token'] ?? ($_GET['csrf_token'] ?? ''));
        if (empty($_SESSION['csrf_token']) || empty($submitted)) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], (string)$submitted);
    }
}

// ===== INPUT VALIDATION =====

if (!function_exists('validate_email')) {
    /**
     * Validate email format
     */
    function validate_email($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
}

if (!function_exists('validate_url')) {
    /**
     * Validate URL format
     */
    function validate_url($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }
}

if (!function_exists('sanitize_input')) {
    /**
     * Sanitize user input dengan whitelist approach
     */
    function sanitize_input($input, $type = 'text') {
        $input = trim($input);
        
        switch ($type) {
            case 'email':
                return filter_var($input, FILTER_SANITIZE_EMAIL);
            case 'url':
                return filter_var($input, FILTER_SANITIZE_URL);
            case 'number':
                return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
            case 'text':
            default:
                return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        }
    }
}

// ===== FILE UPLOAD =====

if (!function_exists('upload_image')) {
    /**
     * Upload dan validate image file
     * Filename: prefix_timestamp_randomhex.ext
     */
    function upload_image($file, $folder, $prefix = "img_") {
        if (!isset($file) || !is_array($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }
        
        $allowed = ['jpg','jpeg','png','webp','gif'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true) || $file['size'] > $maxSize) {
            return null;
        }
        
        // Verify MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($mime, $allowedMimes, true)) {
            return null;
        }
        
        $dir = __DIR__ . "/../assets/uploads/$folder";
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        $name = $prefix . time() . "_" . bin2hex(random_bytes(4)) . "." . $ext;
        $target = $dir . "/" . $name;
        
        if (move_uploaded_file($file['tmp_name'], $target)) {
            return "assets/uploads/$folder/$name";
        }
        
        return null;
    }
}

// ===== FORMATTING & DISPLAY =====

if (!function_exists('formatTanggalIndo')) {
    /**
     * Format tanggal ke format Indonesia
     * Example: 2026-08-18 -> 18 Agustus 2026
     */
    function formatTanggalIndo($dateStr) {
        if (!$dateStr) return '';
        
        $bulanIndo = [
            1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        $ts = strtotime($dateStr);
        if (!$ts) return $dateStr;
        
        $d = date('j', $ts);
        $m = (int)date('n', $ts);
        $y = date('Y', $ts);
        
        return "$d " . ($bulanIndo[$m] ?? '') . " $y";
    }
}

if (!function_exists('cleanTimeBadge')) {
    /**
     * Clean dan format time/schedule description
     */
    function cleanTimeBadge($desc) {
        $t = trim((string)$desc);
        if (empty($t)) return 'Jadwal';
        
        if (stripos($t, 'Pukul') === false && preg_match('/^\d/', $t)) {
            $t = 'Pukul ' . $t;
        }
        
        $t = str_replace('-', ' – ', $t);
        $t = preg_replace('/\s+/', ' ', $t);
        
        return $t;
    }
}

if (!function_exists('getActivityCategory')) {
    /**
     * Categorize activity berdasarkan name dan route
     * Returns: ['type', 'label', 'icon']
     */
    function getActivityCategory($name, $route) {
        $text = strtolower($name . ' ' . $route);
        
        if (preg_match('/(kecak|devdan|budaya|pertunjukan|seni|tari)/i', $text)) {
            return ['type' => 'culture', 'label' => 'Seni & Budaya', 'icon' => '🎭'];
        }
        if (preg_match('/(victoria care|balai diklat|pt\.|industri)/i', $text)) {
            return ['type' => 'industry', 'label' => 'Kunjungan Industri', 'icon' => '🏢'];
        }
        if (preg_match('/(makan|breakfast|dinner|makrab|resto|rm\.|r\.m\.|soka indah|puritama|titin caruban|cafe)/i', $text)) {
            return ['type' => 'food', 'label' => 'Konsumsi & Kuliner', 'icon' => '🍽️'];
        }
        if (preg_match('/(hotel|check[- ]?in|chek[- ]?out|transit|istirahat)/i', $text)) {
            return ['type' => 'hotel', 'label' => 'Akomodasi & Transit', 'icon' => '🏨'];
        }
        if (preg_match('/(pantai|candi kuning|ulundanu|joger|krisna|karang kurnia|dewata|belanja|oleh-oleh|wisata)/i', $text)) {
            return ['type' => 'tourism', 'label' => 'Wisata & Belanja', 'icon' => '🏖️'];
        }
        
        return ['type' => 'travel', 'label' => 'Perjalanan / Rute', 'icon' => '🚌'];
    }
}

// ===== LOGGING & ERROR HANDLING =====

if (!function_exists('log_error')) {
    /**
     * Log error ke file (non-blocking)
     */
    function log_error($message, $level = 'ERROR') {
        $logDir = __DIR__ . '/../logs';
        if (!is_dir($logDir)) mkdir($logDir, 0755, true);
        
        $logFile = $logDir . '/' . date('Y-m-d') . '.log';
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] [$level] $message\n";
        
        error_log($logMessage, 3, $logFile);
    }
}

?>
