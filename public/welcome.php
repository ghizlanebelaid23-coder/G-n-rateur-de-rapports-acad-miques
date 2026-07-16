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
<title>Bienvenue — Rapport Assistant</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body class="center">

<div class="bg-aurora"></div>
<div class="light-streak s1"></div>
<div class="light-streak s2"></div>

<div class="hero-stage-wrap fade-up">
    <div id="hero3d-stage" class="hero3d hero3d--inline" data-scene="default" data-mode="stage"></div>
</div>

<div class="card wide fade-up d1" style="text-align:left;">
    <div class="badge fade-up d1">🤖 Prêt à commencer</div>
    <h1 class="fade-up d1">Comment ça fonctionne</h1>
    <p class="fade-up d2">Oubliez les longs formulaires. Notre assistant vous pose une question à la fois,
    enregistre chaque réponse, et construit votre rapport en temps réel.</p>

    <ul class="feature-list fade-up d3">
        <li><span class="feature-icon">💬</span> Une conversation guidée, jamais un formulaire interminable</li>
        <li><span class="feature-icon">📄</span> Chaque section (page de garde, chapitres, conclusion…) générée automatiquement</li>
        <li><span class="feature-icon">🎓</span> Mise en page conforme aux normes universitaires</li>
        <li><span class="feature-icon">⬇️</span> Téléchargement du PDF final en un clic</li>
    </ul>

    <div class="fade-up d4">
        <button onclick="location.href='assistant.php'">Commencer mon rapport →</button>
        <div style="height:10px;"></div>
        <a href="logout.php">Déconnexion</a>
    </div>
</div>

<script src="../assets/js/app.js"></script>
<script src="../assets/js/hero3d.js"></script>
<script src="../assets/js/tilt3d.js"></script>
</body>
</html>
