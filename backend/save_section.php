<?php
header("Content-Type: application/json");
require_once __DIR__ . "/user_paths.php";
require_login_json();

$raw = file_get_contents("php://input");
if (!$raw) {
    echo json_encode(["success" => false, "error" => "No data"]);
    exit;
}

$data = json_decode($raw, true);
if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit;
}

$filePath = current_user_dir() . "/data.json";

// Lire les données existantes de CET utilisateur
$existingData = file_exists($filePath) && filesize($filePath) > 0
    ? json_decode(file_get_contents($filePath), true)
    : [];

// Fusionner les nouvelles données
$newData = array_merge($existingData, $data);

// Sauvegarder
if (file_put_contents($filePath, json_encode($newData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Cannot write file"]);
}
