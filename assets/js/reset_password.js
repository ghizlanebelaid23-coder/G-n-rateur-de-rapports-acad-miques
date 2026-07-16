async function run() {
    const oobCode = document.body.getAttribute('data-oobcode') || '';
    QFlow.init({ estimatedTotal: 2 });

    if (!oobCode) {
        await QFlow.finish({
            title: 'Lien invalide',
            subtitle: "Ce lien de réinitialisation est incomplet ou a expiré. Merci de refaire une demande.",
            buttonText: 'Faire une nouvelle demande',
            onNext: () => { window.location.href = 'forgot_password.php'; }
        });
        return;
    }

    let password = '';
    while (true) {
        password = await QFlow.ask('Choisissez un nouveau mot de passe.', {
            placeholder: '6 caractères minimum',
            eyebrow: 'Réinitialisation',
            password: true
        });
        if (password.length >= 6) break;
        QFlow.say('Le mot de passe doit contenir au moins 6 caractères.');
    }

    let confirm = '';
    while (true) {
        confirm = await QFlow.ask('Confirmez ce mot de passe.', {
            placeholder: 'Retapez le mot de passe',
            eyebrow: 'Réinitialisation',
            password: true
        });
        if (confirm === password) break;
        QFlow.say('Les deux mots de passe ne correspondent pas.');
    }

    QFlow.loading(true, 'Mise à jour…', 'Application de votre nouveau mot de passe.');

    try {
        const res = await fetch('../backend/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=reset&oobCode=${encodeURIComponent(oobCode)}&password=${encodeURIComponent(password)}`
        });
        const text = (await res.text()).trim();
        QFlow.loading(false);

        if (text === 'OK') {
            await QFlow.finish({
                title: 'Mot de passe mis à jour',
                subtitle: 'Vous pouvez désormais vous connecter avec votre nouveau mot de passe.',
                buttonText: 'Se connecter →',
                onNext: () => { window.location.href = 'index.php'; }
            });
        } else if (text === 'EXPIRED') {
            await QFlow.finish({
                title: 'Lien expiré',
                subtitle: 'Ce lien de réinitialisation a expiré. Merci de refaire une demande.',
                buttonText: 'Faire une nouvelle demande',
                onNext: () => { window.location.href = 'forgot_password.php'; }
            });
        } else {
            await QFlow.finish({
                title: 'Lien invalide',
                subtitle: "Ce lien de réinitialisation n'est plus valide.",
                buttonText: 'Faire une nouvelle demande',
                onNext: () => { window.location.href = 'forgot_password.php'; }
            });
        }
    } catch (e) {
        QFlow.loading(false);
        await QFlow.finish({
            title: 'Erreur réseau',
            subtitle: "La mise à jour n'a pas pu être effectuée. Merci de réessayer.",
            buttonText: 'Réessayer',
            onNext: () => { window.location.reload(); }
        });
    }
}

run();
