<?php
/**
 * upload_file.php — reçoit une image ou un fichier joint depuis l'assistant
 * et le stocke dans le dossier propre à l'utilisateur connecté. Retourne un
 * chemin relatif utilisable directement dans le LaTeX généré
 * (ex: \includegraphics{uploads/xxx.png}).
 */
header("Content-Type: application/json");
require_once __DIR__ . "/user_paths.php";
require_login_json();

if (!isset($_FILES['file'])) {
    echo json_encode(["success" => false, "error" => "Aucun fichier reçu"]);
    exit;
}

$uploadDir = current_user_dir() . "/uploads/";

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "error" => "Erreur d'upload (code " . $file['error'] . ")"]);
    exit;
}

// Limite : 15 Mo
$maxSize = 15 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    echo json_encode(["success" => false, "error" => "Fichier trop volumineux (15 Mo max)"]);
    exit;
}

$kind = isset($_POST['kind']) && $_POST['kind'] === 'image' ? 'image' : 'file';

$originalName = $file['name'];
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

$allowedImage = ["png", "jpg", "jpeg", "gif", "pdf"];
$allowedFile  = ["pdf", "zip", "docx", "xlsx", "pptx", "csv", "txt", "py", "c", "cpp", "java", "json", "png", "jpg", "jpeg"];
$allowed = $kind === 'image' ? $allowedImage : $allowedFile;

if (!in_array($ext, $allowed, true)) {
    echo json_encode(["success" => false, "error" => "Type de fichier .$ext non autorisé"]);
    exit;
}

$safeName = uniqid($kind . "_", true) . "." . $ext;
$safeName = preg_replace('/[^a-zA-Z0-9._-]/', '', $safeName);
$destination = $uploadDir . $safeName;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    echo json_encode(["success" => false, "error" => "Impossible d'enregistrer le fichier"]);
    exit;
}

echo json_encode([
    "success" => true,
    "path" => "uploads/" . $safeName,
    "original_name" => $originalName
]);
