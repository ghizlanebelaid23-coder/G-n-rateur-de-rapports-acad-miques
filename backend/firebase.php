<?php
/**
 * firebase.php — client REST minimal pour Firebase Authentication.
 *
 * Utilise l'API "Identity Toolkit" de Firebase (https://identitytoolkit.googleapis.com)
 * avec la clé API Web du projet. Aucun SDK ni dépendance externe requis — juste cURL
 * (extension standard de PHP).
 *
 * Ce module gère :
 *   - la création de compte (signUp)
 *   - la connexion (signInWithPassword)
 *   - l'envoi d'un VRAI email de réinitialisation de mot de passe (sendOobCode)
 *   - la confirmation du nouveau mot de passe via le code reçu par email (resetPassword)
 *
 * Les emails sont envoyés par l'infrastructure de Google — fiable, sans configuration
 * SMTP, sans mot de passe d'application à gérer.
 */

class FirebaseAuthException extends Exception {}

class FirebaseAuth
{
    private string $apiKey;

    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
    }

    private function request(string $path, array $payload): array
    {
        if (!$this->apiKey || $this->apiKey === 'VOTRE_FIREBASE_WEB_API_KEY') {
            throw new FirebaseAuthException('FIREBASE_NOT_CONFIGURED');
        }

        $url = "https://identitytoolkit.googleapis.com/v1/accounts:{$path}?key=" . urlencode($this->apiKey);
        $body = json_encode($payload);

        if (function_exists('curl_init')) {
            [$response, $httpCode, $err] = $this->requestViaCurl($url, $body);
        } else {
            // Secours si l'extension php-curl n'est pas installée sur l'hébergement
            [$response, $httpCode, $err] = $this->requestViaStream($url, $body);
        }

        if ($response === false || $response === null) {
            throw new FirebaseAuthException('NETWORK_ERROR: ' . $err);
        }

        $data = json_decode($response, true) ?: [];

        if ($httpCode >= 400) {
            $message = $data['error']['message'] ?? 'UNKNOWN_ERROR';
            throw new FirebaseAuthException($message, $httpCode);
        }

        return $data;
    }

    private function requestViaCurl(string $url, string $body): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        return [$response, $httpCode, $err];
    }

    private function requestViaStream(string $url, string $body): array
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $body,
                'timeout' => 15,
                'ignore_errors' => true, // pour pouvoir lire le corps même sur code d'erreur 4xx
            ],
        ]);

        $response = @file_get_contents($url, false, $context);
        $httpCode = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
            $httpCode = (int) $m[1];
        }
        $err = $response === false ? (error_get_last()['message'] ?? 'unknown stream error') : '';
        return [$response, $httpCode, $err];
    }

    /** Crée un nouveau compte Firebase (email + mot de passe). */
    public function signUp(string $email, string $password): array
    {
        return $this->request('signUp', [
            'email' => $email,
            'password' => $password,
            'returnSecureToken' => true,
        ]);
    }

    /** Connecte un utilisateur existant. */
    public function signIn(string $email, string $password): array
    {
        return $this->request('signInWithPassword', [
            'email' => $email,
            'password' => $password,
            'returnSecureToken' => true,
        ]);
    }

    /** Envoie un VRAI email de réinitialisation de mot de passe via Google. */
    public function sendPasswordResetEmail(string $email): array
    {
        return $this->request('sendOobCode', [
            'requestType' => 'PASSWORD_RESET',
            'email' => $email,
        ]);
    }

    /** Applique le nouveau mot de passe à partir du code reçu par email (oobCode). */
    public function confirmPasswordReset(string $oobCode, string $newPassword): array
    {
        return $this->request('resetPassword', [
            'oobCode' => $oobCode,
            'newPassword' => $newPassword,
        ]);
    }
}
