<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assistant – Chapitres</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body data-page="chapters" data-next="assistant_conclusion.php">

<div class="bg-aurora"></div>
<div class="light-streak s1"></div>
<div class="light-streak s3"></div>
<div id="hero3d" class="hero3d" data-scene="chapters"></div>

<div class="app-shell">
    <div class="topbar">
        <a class="brand" href="welcome.php"><span class="brand-mark"></span> Rapport Assistant</a>
        <div style="display:flex;align-items:center;gap:14px;">
            <span class="step-label"></span>
            <div class="steps"></div>
        </div>
    </div>
    <main id="qflow-root" class="qflow-stage"></main>
</div>

<script src="../assets/js/app.js?v=2"></script>
<script src="../assets/js/qflow.js?v=2"></script>
<script src="../assets/js/assistant_chapitre.js?v=2"></script>
<script src="../assets/js/hero3d.js?v=2"></script>
<script src="../assets/js/tilt3d.js?v=2"></script>
</body>
</html>
