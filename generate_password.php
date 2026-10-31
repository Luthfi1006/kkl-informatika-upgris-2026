<?php
/**
 * Password Hash Generator
 * Generate secure bcrypt hash untuk admin password
 * 
 * Usage: php generate_password.php
 * Delete this file after use!
 */

echo "=== Password Hash Generator ===\n\n";

// Password recommendations
$passwords = [
    'Admin@KKL2026!',
    'SecurePass@UPGRIS2026',
    'KKL!nformatika#2026',
];

echo "Generating secure hashes (bcrypt cost=12)...\n\n";

foreach ($passwords as $index => $password) {
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    echo "Password " . ($index + 1) . ": $password\n";
    echo "Hash: $hash\n\n";
}

echo "--- Custom Password ---\n";
echo "Enter your custom password: ";
$customPass = trim(fgets(STDIN));

if (!empty($customPass)) {
    $customHash = password_hash($customPass, PASSWORD_BCRYPT, ['cost' => 12]);
    echo "\nYour Password: $customPass\n";
    echo "Your Hash: $customHash\n\n";
    
    echo "SQL Command to update admin:\n";
    echo "UPDATE admins SET password='$customHash' WHERE username='admin';\n\n";
}

echo "=== IMPORTANT ===\n";
echo "1. Copy hash yang diinginkan\n";
echo "2. Run SQL: UPDATE admins SET password='HASH_HERE' WHERE username='admin';\n";
echo "3. Delete file ini: rm generate_password.php\n";
echo "4. Test login dengan password baru\n";

?>
