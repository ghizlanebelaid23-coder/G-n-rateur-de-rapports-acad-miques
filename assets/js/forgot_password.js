function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function run() {
    QFlow.init({ estimatedTotal: 1 });

    let email = '';
    while (true) {
        email = await QFlow.ask("Quel est l'email associé à votre compte ?", {
            placeholder: 'vous@exemple.com',
            eyebrow: 'Mot de passe oublié'
        });
        if (isValidEmail(email)) break;
        QFlow.say("Merci d'entrer une adresse email valide.");
    }

    QFlow.loading(true, 'Envoi en cours…', "Recherche de votre compte et envoi de l'email.");

    try {
        const res = await fetch('../backend/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=forgot&email=${encodeURIComponent(email)}`
        });
        const text = await res.text();
        QFlow.loading(false);

        if (text.trim() === 'INVALID_EMAIL') {
            await QFlow.finish({
                title: 'Email invalide',
                subtitle: 'Merci de réessayer avec une adresse email correcte.',
                buttonText: 'Réessayer',
                onNext: () => { window.location.href = 'forgot_password.php'; }
            });
            return;
        }

        if (text.trim() === 'NOT_CONFIGURED') {
            await QFlow.finish({
                title: "Firebase n'est pas encore configuré",
                subtitle: "L'administrateur doit renseigner backend/config.php avec une clé API Firebase (voir backend/FIREBASE_SETUP.md).",
                buttonText: 'Retour à la connexion',
                onNext: () => { window.location.href = 'index.php'; }
            });
            return;
        }

        await QFlow.finish({
            title: 'Vérifiez votre boîte mail',
            subtitle: `Si un compte existe pour ${email}, un lien de réinitialisation vient d'être envoyé (pensez aux spams). Le lien est valable une heure.`,
            buttonText: 'Retour à la connexion',
            onNext: () => { window.location.href = 'index.php'; }
        });
    } catch (e) {
        QFlow.loading(false);
        await QFlow.finish({
            title: 'Erreur réseau',
            subtitle: "La demande n'a pas pu être envoyée. Merci de réessayer dans un instant.",
            buttonText: 'Réessayer',
            onNext: () => { window.location.href = 'forgot_password.php'; }
        });
    }
}

run();
