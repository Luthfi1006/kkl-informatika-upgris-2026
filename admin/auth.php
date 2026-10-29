<?php
require_once __DIR__ . "/../config/helpers.php";
init_session();
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}
