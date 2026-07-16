function login() {
    send('login');
}

function register() {
    send('register');
}

function setBusy(busy) {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    [loginBtn, registerBtn].forEach((b) => { if (b) b.disabled = busy; });
}

function send(action) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        msg('Merci de renseigner email et mot de passe.');
        return;
    }

    setBusy(true);
    msg('');

    fetch('../backend/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=${action}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(r => r.text())
    .then(res => {
        const code = res.trim();
        if (code === 'OK') {
            msg('Connexion réussie — redirection…');
            setTimeout(() => { window.location = 'welcome.php'; }, 350);
            return;
        }

        setBusy(false);
        if (code === 'EXISTS') {
            msg('Ce compte existe déjà — essayez de vous connecter plutôt.');
        } else if (code === 'INVALID_EMAIL') {
            msg("Cette adresse email n'est pas valide.");
        } else if (code === 'NOT_CONFIGURED') {
            msg("Firebase n'est pas encore configuré côté serveur (backend/config.php) — voir backend/FIREBASE_SETUP.md.");
        } else if (code === 'NETWORK_ERROR') {
            msg("Le serveur n'a pas pu contacter Firebase (réseau sortant bloqué ou extension curl manquante). Vérifiez les logs serveur.");
        } else if (action === 'register') {
            msg("Impossible de créer le compte (mot de passe trop court : 6 caractères minimum, ou email déjà utilisé).");
        } else {
            msg('Email ou mot de passe incorrect.');
        }
    })
    .catch(() => {
        setBusy(false);
        msg('Erreur réseau, merci de réessayer.');
    });
}

function msg(t) {
    const node = document.getElementById('msg');
    if (node) node.innerText = t;
}

// =====================
// SAUVEGARDE DANS data.json
// =====================
function saveToDataJson(data) {
    return fetch("../backend/save_section.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (!result.success) {
            console.error("Erreur sauvegarde:", result.error);
        }
        return result;
    })
    .catch(err => {
        console.error("Erreur réseau:", err);
        return { success: false };
    });
}


// =====================
// GÉNÉRATION DU PDF
// =====================
function generatePDF() {
    if (window.QFlow) {
        QFlow.loading(true, 'Génération de votre rapport…', 'Compilation LaTeX en cours, quelques secondes.');
    }

    // Ouvrir une fenêtre immédiatement pour éviter le blocage par le bloqueur de popups
    const win = window.open('', '_blank');
    if (win) {
        try {
            win.document.write('<p>Génération du PDF en cours...</p>');
        } catch (e) {
            // Si écriture bloquée, ignore
        }
    }

    fetch("../backend/build_pdf.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
    })
    .then(res => res.json())
    .then(data => {
        if (window.QFlow) QFlow.loading(false);
        if (data.success) {
            const url = "../backend/" + data.pdf + "?v=" + Date.now();
            if (win && !win.closed) {
                win.location.href = url;
            } else {
                window.open(url, '_blank');
            }
            if (window.QFlow) {
                QFlow.custom(() => {
                    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
                    const card = el('div', 'qcard');
                    card.style.textAlign = 'center';
                    const check = el('div', 'success-check', '✓');
                    check.style.color = '#05060f'; check.style.fontSize = '28px'; check.style.fontWeight = '700';
                    card.appendChild(check);
                    card.appendChild(el('h2', 'qcard-question', 'Votre rapport est prêt 🎉'));
                    card.appendChild(el('p', '', 'Le PDF a été généré et ouvert dans un nouvel onglet.'));
                    const btn = el('button', 'pill', 'Télécharger à nouveau');
                    btn.style.marginTop = '22px'; btn.style.width = 'auto';
                    btn.addEventListener('click', () => window.open(url, '_blank'));
                    card.appendChild(btn);
                    return card;
                });
            }
        } else {
            if (win && !win.closed) win.close();
            alert("Erreur PDF: " + (data.error || "Erreur inconnue"));
        }
    })
    .catch(err => {
        if (window.QFlow) QFlow.loading(false);
        if (win && !win.closed) win.close();
        console.error("Erreur:", err);
        alert("Erreur de génération PDF");
    });
}
