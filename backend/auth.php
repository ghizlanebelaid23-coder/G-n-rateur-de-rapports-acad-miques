<?php
session_start();
require_once __DIR__ . '/firebase.php';

$config = file_exists(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
$firebase = new FirebaseAuth($config['firebase_api_key'] ?? '');

$action = $_POST['action'] ?? '';

function firebaseErrorTo($code) {
    // Normalise les codes d'erreur Firebase vers des réponses simples pour le frontend
    $map = [
        'EMAIL_EXISTS' => 'EXISTS',
        'EMAIL_NOT_FOUND' => 'ERROR',
        'INVALID_PASSWORD' => 'ERROR',
        'INVALID_LOGIN_CREDENTIALS' => 'ERROR',
        'USER_DISABLED' => 'ERROR',
        'INVALID_EMAIL' => 'INVALID_EMAIL',
        'EXPIRED_OOB_CODE' => 'EXPIRED',
        'INVALID_OOB_CODE' => 'INVALID',
        'FIREBASE_NOT_CONFIGURED' => 'NOT_CONFIGURED',
        'NETWORK_ERROR' => 'NETWORK_ERROR',
    ];
    foreach ($map as $needle => $out) {
        if (strpos($code, $needle) !== false) return $out;
    }
    return 'ERROR';
}

if ($action === 'register') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    try {
        $result = $firebase->signUp($email, $password);
        $_SESSION['user'] = $result['email'] ?? $email;
        $_SESSION['firebase_uid'] = $result['localId'] ?? null;
        echo 'OK';
    } catch (FirebaseAuthException $e) {
        error_log('[auth.php][register] ' . $e->getMessage());
        echo firebaseErrorTo($e->getMessage());
    }
    exit;
}

if ($action === 'login') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    try {
        $result = $firebase->signIn($email, $password);
        $_SESSION['user'] = $result['email'] ?? $email;
        $_SESSION['firebase_uid'] = $result['localId'] ?? null;
        echo 'OK';
    } catch (FirebaseAuthException $e) {
        error_log('[auth.php][login] ' . $e->getMessage());
        echo firebaseErrorTo($e->getMessage());
    }
    exit;
}

// =========================================================
// MOT DE PASSE OUBLIÉ — étape 1 : envoi du VRAI email via Firebase
// =========================================================
if ($action === 'forgot') {
    $email = trim($_POST['email'] ?? '');

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo 'INVALID_EMAIL';
        exit;
    }

    try {
        $firebase->sendPasswordResetEmail($email);
    } catch (FirebaseAuthException $e) {
        $code = firebaseErrorTo($e->getMessage());
        if ($code === 'NOT_CONFIGURED') {
            error_log('[auth.php] Firebase non configuré — voir backend/config.php et FIREBASE_SETUP.md');
            echo 'NOT_CONFIGURED';
            exit;
        }
        // Pour tout autre cas (ex. EMAIL_NOT_FOUND), on ne révèle rien côté client :
        // même réponse que l'email existe ou non, pour éviter l'énumération de comptes.
        error_log('[auth.php] sendOobCode: ' . $e->getMessage());
    }

    echo 'OK';
    exit;
}

// =========================================================
// MOT DE PASSE OUBLIÉ — étape 2 : confirmation via le code reçu par email
// =========================================================
if ($action === 'reset') {
    $oobCode = trim($_POST['oobCode'] ?? $_POST['token'] ?? '');
    $newPassword = $_POST['password'] ?? '';

    if (!$oobCode || strlen($newPassword) < 6) {
        echo 'INVALID';
        exit;
    }

    try {
        $firebase->confirmPasswordReset($oobCode, $newPassword);
        echo 'OK';
    } catch (FirebaseAuthException $e) {
        error_log('[auth.php][reset] ' . $e->getMessage());
        echo firebaseErrorTo($e->getMessage());
    }
    exit;
}

echo 'UNKNOWN_ACTION';
