<?php
if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    session_start();
}
session_destroy();
header("Location: login.php");
exit;
