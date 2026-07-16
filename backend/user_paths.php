<?php
/**
 * user_paths.php — détermine le dossier de données propre à l'utilisateur connecté.
 *
 * Avant : data.json / rapport.pdf / uploads/ étaient partagés par TOUS les
 * utilisateurs de l'application (un seul fichier sur le serveur). Résultat :
 * dès que deux personnes utilisaient l'appli, elles écrasaient mutuellement
 * leurs rapports.
 *
 * Maintenant : chaque utilisateur (identifié par son UID Firebase, unique et
 * stable) a son propre sous-dossier isolé :
 *   backend/users_data/{uid}/data.json
 *   backend/users_data/{uid}/uploads/...
 *   backend/users_data/{uid}/rapport.pdf
 */

function require_login_json() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (!isset($_SESSION['user'])) {
        header("Content-Type: application/json");
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Non authentifié"]);
        exit;
    }
}

/**
 * Retourne (et crée si besoin) le dossier de données de l'utilisateur connecté.
 * @return string chemin absolu du dossier
 */
function current_user_dir() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // L'UID Firebase est stable et unique par compte : identifiant idéal.
    // Repli sur l'email si absent (anciennes sessions).
    $identifier = $_SESSION['firebase_uid'] ?? ($_SESSION['user'] ?? 'anonymous');

    // Nom de dossier sûr : uniquement lettres/chiffres/tirets/underscores.
    $safeId = preg_replace('/[^a-zA-Z0-9_-]/', '_', $identifier);

    $dir = __DIR__ . "/users_data/" . $safeId;
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    if (!is_dir($dir . "/uploads")) {
        mkdir($dir . "/uploads", 0775, true);
    }

    return $dir;
}
