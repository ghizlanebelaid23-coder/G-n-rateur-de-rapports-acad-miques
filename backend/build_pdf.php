<?php
header("Content-Type: application/json");
require_once __DIR__ . "/user_paths.php";
require_login_json();

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = [];
}

$userDir = current_user_dir();
$filePath = $userDir . "/data.json";

// Sauvegarder dans le data.json de CET utilisateur
$existingData = file_exists($filePath) && filesize($filePath) > 0
    ? json_decode(file_get_contents($filePath), true)
    : [];

$mergedData = array_merge($existingData, $data);

if (!file_put_contents($filePath, json_encode($mergedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(["success" => false, "error" => "Cannot save data"]);
    exit;
}

// Compiler le rapport DANS le dossier de l'utilisateur (isolé des autres)
$script = escapeshellarg(__DIR__ . "/build_tex.py");
$dirArg = escapeshellarg($userDir);
exec("python3 $script $dirArg 2>&1", $out, $code);

if ($code !== 0) {
    // Repli si "python3" n'est pas dans le PATH (ex: certains environnements Windows)
    $out = [];
    exec("python $script $dirArg 2>&1", $out, $code);
}

if ($code !== 0) {
    echo json_encode(["success" => false, "debug" => $out]);
    exit;
}

$userFolderName = basename($userDir);

echo json_encode([
    "success" => true,
    "pdf" => "users_data/" . $userFolderName . "/rapport.pdf"
]);
