<?php session_start(); ?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rapport Assistant — Connexion</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>

<div class="bg-aurora"></div>
<div class="light-streak s1"></div>
<div class="light-streak s2"></div>
<div class="light-streak s3"></div>

<div class="split-shell">
    <div class="stage-col">
        <div id="hero3d-stage" class="hero3d" data-scene="auth" data-mode="stage"></div>
        <div style="position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:center; padding: 0 clamp(24px,6vw,72px); pointer-events:none;">
            <div class="badge fade-up" style="width:fit-content; margin-bottom:18px;">✨ Assistant IA de rédaction</div>
            <h1 class="fade-up d1" style="font-size:clamp(2rem,4.4vw,3.1rem); max-width:9.5em;">Votre rapport de stage, écrit avec vous.</h1>
            <p class="fade-up d2" style="max-width:32em; font-size:1.02rem;">Une conversation, une question à la fois. L'assistant structure, met en forme et génère le PDF final — vous, vous racontez votre stage.</p>
        </div>
    </div>

    <div class="form-col">
        <div class="card fade-up d1" style="width:400px;">
            <h2>Connexion</h2>
            <p style="margin-bottom:22px;">Accédez à votre espace de rédaction.</p>

            <div class="field-group">
                <input id="email" type="email" placeholder="Adresse email" autocomplete="email">
            </div>
            <div class="field-group">
                <input id="password" type="password" placeholder="Mot de passe" autocomplete="current-password">
            </div>

            <button id="login-btn" onclick="login()">Connexion</button>
            <div style="height:10px;"></div>
            <button class="secondary" id="register-btn" onclick="register()">Créer un compte</button>
            <div style="margin-top:14px; text-align:center;">
                <a href="forgot_password.php">Mot de passe oublié ?</a>
            </div>

            <p id="msg"></p>
        </div>
    </div>
</div>

<script src="/assets/js/app.js"></script>
<script src="/assets/js/hero3d.js"></script>
<script src="/assets/js/tilt3d.js"></script>

</body>
</html>
