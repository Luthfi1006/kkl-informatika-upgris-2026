<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/data/kkl_data.json';

// GET: Return current JSON data
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Data file not found']);
    }
    exit;
}

// POST: Save updated JSON data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!$payload) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
        exit;
    }

    $currentData = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
    $validPin = $currentData['settings']['admin_pin'] ?? 'upgris2026';

    $providedPin = $payload['pin'] ?? '';
    if ($providedPin !== $validPin) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'PIN admin tidak valid!']);
        exit;
    }

    if (isset($payload['data'])) {
        $saveSuccess = file_put_contents(
            $dataFile,
            json_encode($payload['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        if ($saveSuccess !== false) {
            echo json_encode(['success' => true, 'message' => 'Data berhasil disimpan ke data/kkl_data.json!']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal menulis file. Periksa izin akses folder.']);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
    exit;
}
