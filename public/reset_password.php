<?php
session_start();
// Firebase ajoute automatiquement ?mode=resetPassword&oobCode=... au lien envoyé par email
$oobCode = isset($_GET['oobCode']) ? trim($_GET['oobCode']) : '';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Réinitialiser le mot de passe — Rapport Assistant</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body class="center" data-oobcode="<?php echo htmlspecialchars($oobCode); ?>">

<div class="bg-aurora"></div>
<div class="light-streak s1"></div>
<div class="light-streak s3"></div>
<div id="hero3d" class="hero3d" data-scene="auth"></div>

<div class="app-shell" style="min-height:100vh;">
    <div class="topbar">
        <a class="brand" href="index.php"><span class="brand-mark"></span> Rapport Assistant</a>
    </div>
    <main id="qflow-root" class="qflow-stage"></main>
</div>

<script src="../assets/js/app.js"></script>
<script src="../assets/js/qflow.js"></script>
<script src="../assets/js/reset_password.js"></script>
<script src="../assets/js/hero3d.js"></script>
<script src="../assets/js/tilt3d.js"></script>
</body>
</html>
