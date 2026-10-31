<?php
/**
 * Database Configuration & Connection
 * KKL Informatika UPGRIS 2026
 * 
 * Environment variables (dari .env):
 * - DB_HOST: Database host
 * - DB_NAME: Database name
 * - DB_USER: Database username
 * - DB_PASS: Database password
 * - APP_ENV: development | production
 */

require_once __DIR__ . '/helpers.php';

$host     = getenv('DB_HOST') ?: 'localhost';
$dbname   = getenv('DB_NAME') ?: 'kkl_upgris_2026';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$appEnv   = getenv('APP_ENV') ?: 'development';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false, // Prevent SQL injection
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ]
    );
    
    // Set connection charset explicitly
    $pdo->exec("SET NAMES utf8mb4");
    
} catch (PDOException $e) {
    $errorMsg = $e->getMessage();
    
    // Log error untuk debugging
    if (function_exists('log_error')) {
        log_error("Database Connection Failed: $errorMsg");
    }
    
    // Show user-friendly error message
    if ($appEnv === 'production') {
        // Production: Generic message
        $displayError = "Layanan sedang mengalami gangguan teknis. Silakan coba lagi dalam beberapa saat.";
    } else {
        // Development: Technical details
        $displayError = htmlspecialchars($errorMsg);
    }
    
    die("
    <div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; padding: 40px 20px; max-width: 600px; margin: 60px auto; background: #fee; border: 1px solid #fcc; border-radius: 8px; color: #c33; line-height: 1.6;'>
        <h3 style='margin-top: 0; color: #c33;'>⚠️ Database Connection Error</h3>
        <p>$displayError</p>
        " . ($appEnv === 'development' ? "<details style='margin-top: 20px; padding: 10px; background: #fff8f8; border-radius: 4px;'><summary style='cursor: pointer; font-weight: 600;'>Technical Details</summary><code style='display: block; overflow-x: auto; font-size: 12px; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;'>$displayError</code></details>" : "") . "
    </div>
    ");
}

/**
 * Helper function untuk prepare statement dengan error handling
 */
if (!function_exists('db_execute')) {
    function db_execute($pdo, $query, $params = []) {
        try {
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            log_error("Query Error: " . $e->getMessage() . " | Query: $query");
            throw $e;
        }
    }
}

?>
