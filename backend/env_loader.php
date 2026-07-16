<?php
/**
 * env_loader.php — charge les variables d'environnement depuis un fichier
 * .env à la racine du projet (s'il existe), sans dépendance externe (pas
 * besoin de Composer / vlucas/phpdotenv).
 *
 * Utile en local (XAMPP), où définir de vraies variables d'environnement
 * système est peu pratique. Sur Render, les variables sont déjà injectées
 * directement par la plateforme (dashboard) — s'il n'y a pas de fichier
 * .env, cette fonction ne fait simplement rien.
 */

function load_env_file($path) {
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);

        // Ignorer les lignes vides et les commentaires
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        if (strpos($line, '=') === false) {
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        // Retirer d'éventuels guillemets autour de la valeur
        $value = trim($value, "\"'");

        // Ne pas écraser une variable déjà définie par le système/la plateforme
        if ($key !== '' && getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

load_env_file(__DIR__ . '/../.env');