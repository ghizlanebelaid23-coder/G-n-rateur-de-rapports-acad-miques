<?php
require_once __DIR__ . '/env_loader.php';


return [
    
    'firebase_api_key' => getenv('FIREBASE_API_KEY') ?: 'VOTRE_FIREBASE_WEB_API_KEY',
];