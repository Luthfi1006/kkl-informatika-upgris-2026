<?php
/**
 * Admin API Endpoints
 * Menghubungkan admin.html dengan database MySQL
 * 
 * Endpoints:
 * POST /api/admin/profile/save
 * POST /api/admin/profile/delete
 * GET  /api/admin/profiles
 * POST /api/admin/feedback/approve
 * POST /api/admin/feedback/delete
 * GET  /api/admin/feedback
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/helpers.php';
require_once __DIR__ . '/admin/auth.php';

// Header JSON
header('Content-Type: application/json');

// Get action
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// CSRF validation
if ($method === 'POST' || $method === 'PUT' || $method === 'DELETE') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'CSRF token invalid']);
        exit;
    }
}

try {
    switch ($action) {
        // PROFILES
        case 'profiles_list':
            $stmt = $pdo->query('SELECT * FROM profiles ORDER BY sort_order, id');
            $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $profiles]);
            break;
            
        case 'profile_save':
            $id = (int)($_POST['id'] ?? 0);
            $name = trim($_POST['name'] ?? '');
            $role = trim($_POST['role'] ?? '');
            $bio = trim($_POST['bio'] ?? '');
            $sort_order = (int)($_POST['sort_order'] ?? 0);
            
            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nama wajib diisi']);
                exit;
            }
            
            $photo = $_POST['photo'] ?? '';
            
            // Handle file upload
            if (!empty($_FILES['photo']['name'])) {
                $photo = upload_image($_FILES['photo'], 'profiles', 'profile_');
                if (!$photo) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Gagal upload foto']);
                    exit;
                }
            }
            
            if (empty($photo)) {
                $photo = 'assets/img/profile-placeholder.svg';
            }
            
            if ($id > 0) {
                // Update
                $stmt = $pdo->prepare('UPDATE profiles SET name=?, role=?, bio=?, photo=?, sort_order=? WHERE id=?');
                $stmt->execute([$name, $role, $bio, $photo, $sort_order, $id]);
                log_error("Profile updated: ID=$id by admin", 'INFO');
            } else {
                // Insert
                $stmt = $pdo->prepare('INSERT INTO profiles(name, role, bio, photo, sort_order) VALUES(?, ?, ?, ?, ?)');
                $stmt->execute([$name, $role, $bio, $photo, $sort_order]);
                $id = $pdo->lastInsertId();
                log_error("Profile created: ID=$id by admin", 'INFO');
            }
            
            echo json_encode(['success' => true, 'message' => 'Profil tersimpan', 'id' => $id]);
            break;
            
        case 'profile_delete':
            $id = (int)($_POST['id'] ?? 0);
            if ($id > 0) {
                // Get photo path
                $stmt = $pdo->prepare('SELECT photo FROM profiles WHERE id=?');
                $stmt->execute([$id]);
                $photo = $stmt->fetchColumn();
                
                // Delete from DB
                $pdo->prepare('DELETE FROM profiles WHERE id=?')->execute([$id]);
                
                // Delete file if exists
                if ($photo && strpos($photo, 'assets/uploads/profiles/') === 0) {
                    $filePath = __DIR__ . '/' . $photo;
                    if (file_exists($filePath)) {
                        @unlink($filePath);
                    }
                }
                
                log_error("Profile deleted: ID=$id by admin", 'INFO');
                echo json_encode(['success' => true, 'message' => 'Profil dihapus']);
            }
            break;
            
        // FEEDBACK
        case 'feedback_list':
            $stmt = $pdo->query('SELECT * FROM feedback ORDER BY created_at DESC');
            $feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $feedback]);
            break;
            
        case 'feedback_approve':
            $id = (int)($_POST['id'] ?? 0);
            if ($id > 0) {
                $pdo->prepare('UPDATE feedback SET approved=1 WHERE id=?')->execute([$id]);
                log_error("Feedback approved: ID=$id by admin", 'INFO');
                echo json_encode(['success' => true, 'message' => 'Feedback disetujui']);
            }
            break;
            
        case 'feedback_delete':
            $id = (int)($_POST['id'] ?? 0);
            if ($id > 0) {
                $pdo->prepare('DELETE FROM feedback WHERE id=?')->execute([$id]);
                log_error("Feedback deleted: ID=$id by admin", 'INFO');
                echo json_encode(['success' => true, 'message' => 'Feedback dihapus']);
            }
            break;
            
        // DESTINATIONS
        case 'destinations_list':
            $stmt = $pdo->query('SELECT * FROM destinations ORDER BY day_no, sort_order, id');
            $destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $destinations]);
            break;
            
        case 'destination_save':
            $id = (int)($_POST['id'] ?? 0);
            $name = trim($_POST['name'] ?? '');
            $day_no = (int)($_POST['day_no'] ?? 1);
            $description = trim($_POST['description'] ?? '');
            $route = trim($_POST['route'] ?? '');
            $sort_order = (int)($_POST['sort_order'] ?? 1);
            
            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nama destinasi wajib diisi']);
                exit;
            }
            
            if ($id > 0) {
                $stmt = $pdo->prepare('UPDATE destinations SET name=?, day_no=?, description=?, route=?, sort_order=? WHERE id=?');
                $stmt->execute([$name, $day_no, $description, $route, $sort_order, $id]);
                log_error("Destination updated: ID=$id by admin", 'INFO');
            } else {
                $stmt = $pdo->prepare('INSERT INTO destinations(name, day_no, description, route, sort_order) VALUES(?, ?, ?, ?, ?)');
                $stmt->execute([$name, $day_no, $description, $route, $sort_order]);
                $id = $pdo->lastInsertId();
                log_error("Destination created: ID=$id by admin", 'INFO');
            }
            
            echo json_encode(['success' => true, 'message' => 'Destinasi tersimpan', 'id' => $id]);
            break;
            
        case 'destination_delete':
            $id = (int)($_POST['id'] ?? 0);
            if ($id > 0) {
                $pdo->prepare('UPDATE gallery SET destination_id = NULL WHERE destination_id = ?')->execute([$id]);
                $pdo->prepare('DELETE FROM destinations WHERE id=?')->execute([$id]);
                log_error("Destination deleted: ID=$id by admin", 'INFO');
                echo json_encode(['success' => true, 'message' => 'Destinasi dihapus']);
            }
            break;
            
        // GALLERY
        case 'gallery_list':
            $stmt = $pdo->query('SELECT g.*, d.name AS destination_name FROM gallery g LEFT JOIN destinations d ON d.id=g.destination_id ORDER BY g.created_at DESC');
            $gallery = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $gallery]);
            break;
            
        case 'gallery_save':
            $id = (int)($_POST['id'] ?? 0);
            $title = trim($_POST['title'] ?? '');
            $location = trim($_POST['location'] ?? '');
            $destination_id = (int)($_POST['destination_id'] ?? 0);
            $destination_id = $destination_id > 0 ? $destination_id : null;
            
            if (empty($title)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Judul foto wajib diisi']);
                exit;
            }
            
            $photo = $_POST['photo'] ?? '';
            if (!empty($_FILES['photo']['name'])) {
                $photo = upload_image($_FILES['photo'], 'gallery', 'gallery_');
                if (!$photo) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Gagal upload foto']);
                    exit;
                }
            }
            
            if (empty($photo)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Foto wajib diupload']);
                exit;
            }
            
            if ($id > 0) {
                $stmt = $pdo->prepare('UPDATE gallery SET title=?, location=?, destination_id=?, photo=? WHERE id=?');
                $stmt->execute([$title, $location, $destination_id, $photo, $id]);
            } else {
                $stmt = $pdo->prepare('INSERT INTO gallery(title, location, destination_id, photo) VALUES(?, ?, ?, ?)');
                $stmt->execute([$title, $location, $destination_id, $photo]);
                $id = $pdo->lastInsertId();
            }
            
            log_error("Gallery item saved: ID=$id by admin", 'INFO');
            echo json_encode(['success' => true, 'message' => 'Foto tersimpan', 'id' => $id, 'photo' => $photo]);
            break;
            
        case 'gallery_delete':
            $id = (int)($_POST['id'] ?? 0);
            if ($id > 0) {
                $stmt = $pdo->prepare('SELECT photo FROM gallery WHERE id=?');
                $stmt->execute([$id]);
                $photo = $stmt->fetchColumn();
                
                $pdo->prepare('DELETE FROM gallery WHERE id=?')->execute([$id]);
                
                if ($photo && strpos($photo, 'assets/uploads/gallery/') === 0) {
                    $filePath = __DIR__ . '/' . $photo;
                    if (file_exists($filePath)) {
                        @unlink($filePath);
                    }
                }
                
                log_error("Gallery item deleted: ID=$id by admin", 'INFO');
                echo json_encode(['success' => true, 'message' => 'Foto dihapus']);
            }
            break;
            
        // VIDEOS
        case 'videos_list':
            $stmt = $pdo->query('SELECT * FROM videos ORDER BY created_at DESC');
            $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $videos]);
            break;
            
        case 'video_save':
            $id = (int)($_POST['id'] ?? 0);
            $title = trim($_POST['title'] ?? '');
            $embed_url = trim($_POST['embed_url'] ?? '');
            
            if (empty($title) || empty($embed_url)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Judul dan URL wajib diisi']);
                exit;
            }
            
            if ($id > 0) {
                $stmt = $pdo->prepare('UPDATE videos SET title=?, embed_url=? WHERE id=?');
                $stmt->execute([$title, $embed_url, $id]);
            } else {
                $stmt = $pdo->prepare('INSERT INTO videos(title, embed_url) VALUES(?, ?)');
                $stmt->execute([$title, $embed_url]);
                $id = $pdo->lastInsertId();
            }
            
            log_error("Video saved: ID=$id by admin", 'INFO');
            echo json_encode(['success' => true, 'message' => 'Video tersimpan', 'id' => $id]);
            break;
            
        case 'video_delete':
            $id = (int)($_POST['id'] ?? 0);
            if ($id > 0) {
                $pdo->prepare('DELETE FROM videos WHERE id=?')->execute([$id]);
                log_error("Video deleted: ID=$id by admin", 'INFO');
                echo json_encode(['success' => true, 'message' => 'Video dihapus']);
            }
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Action not found']);
            break;
    }
    
} catch (Throwable $e) {
    log_error("API Error in action '$action': " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

?>
