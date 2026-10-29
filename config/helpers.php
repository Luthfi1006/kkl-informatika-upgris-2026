<?php
if (!function_exists('e')) {
    function e($value) { 
        return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8'); 
    }
}

if (!function_exists('redirect')) {
    function redirect($url) { 
        header("Location: $url"); 
        exit; 
    }
}

if (!function_exists('init_session')) {
    function init_session() {
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => $isHttps,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
        }
    }
}

if (!function_exists('csrf_token')) {
    function csrf_token() {
        init_session();
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
}

if (!function_exists('csrf_field')) {
    function csrf_field() {
        return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">';
    }
}

if (!function_exists('verify_csrf_token')) {
    function verify_csrf_token($token = null) {
        init_session();
        $submitted = $token ?? ($_POST['csrf_token'] ?? ($_GET['csrf_token'] ?? ''));
        if (empty($_SESSION['csrf_token']) || empty($submitted)) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], (string)$submitted);
    }
}

if (!function_exists('upload_image')) {
    function upload_image($file, $folder, $prefix = "img_") {
        if (!isset($file) || !is_array($file) || $file['error'] !== UPLOAD_ERR_OK) return null;
        $allowed = ['jpg','jpeg','png','webp','gif'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true) || $file['size'] > 5 * 1024 * 1024) return null;
        $dir = __DIR__ . "/../assets/uploads/$folder";
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $name = $prefix . time() . "_" . bin2hex(random_bytes(4)) . "." . $ext;
        $target = $dir . "/" . $name;
        if (move_uploaded_file($file['tmp_name'], $target)) return "assets/uploads/$folder/$name";
        return null;
    }
}

if (!function_exists('formatTanggalIndo')) {
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
    function getActivityCategory($name, $route) {
        $text = strtolower($name . ' ' . $route);
        if (preg_match('/(kecak|devdan|budaya|pertunjukan|seni)/i', $text)) {
            return ['type' => 'culture', 'label' => 'Seni & Budaya', 'icon' => '🎭'];
        }
        if (preg_match('/(victoria care|balai diklat|pt\.|industri)/i', $text)) {
            return ['type' => 'industry', 'label' => 'Kunjungan Industri', 'icon' => '🏢'];
        }
        if (preg_match('/(makan|breakfast|dinner|makrab|resto|rm\.|r\.m\.|soka indah|puritama|titin caruban|cafe)/i', $text)) {
            return ['type' => 'food', 'label' => 'Konsumsi & Kuliner', 'icon' => '🍽️'];
        }
        if (preg_match('/(hotel|check[- ]?in|chek[- ]?out|check[- ]?out|transit|istirahat)/i', $text)) {
            return ['type' => 'hotel', 'label' => 'Akomodasi & Transit', 'icon' => '🏨'];
        }
        if (preg_match('/(pantai|candi kuning|ulundanu|joger|krisna|karang kurnia|dewata|belanja|oleh-oleh|wisata)/i', $text)) {
            return ['type' => 'tourism', 'label' => 'Wisata & Belanja', 'icon' => '🏖️'];
        }
        return ['type' => 'travel', 'label' => 'Perjalanan / Rute', 'icon' => '🚌'];
    }
}
