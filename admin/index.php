<?php
/**
 * Admin Panel Entry Point
 * Redirects to login if not authenticated, otherwise to dashboard
 */

require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/helpers.php";
require_once __DIR__ . "/auth.php";

// If already logged in, go to dashboard
if (isset($_SESSION['admin_id'])) {
    redirect('dashboard.php');
} else {
    redirect('login.php');
}
?>
