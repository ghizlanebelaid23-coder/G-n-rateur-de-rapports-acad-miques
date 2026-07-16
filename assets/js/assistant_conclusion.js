const STEPS = [
    { key: "cover", label: "Page de garde" },
    { key: "dedication", label: "Dédicace" },
    { key: "thanks", label: "Remerciements" },
    { key: "toc", label: "Sommaire" },
    { key: "chapters", label: "Chapitres" },
    { key: "conclusion", label: "Conclusion" },
    { key: "references", label: "Références" }
];

const questions = [
    { key: "summary", text: "Résumez globalement le travail réalisé.", long: true },
    { key: "achievements", text: "Quelles sont les principales réalisations ?", long: true },
    { key: "difficulties", text: "Quelles difficultés avez-vous rencontrées ?", long: true },
    { key: "perspectives", text: "Quelles perspectives ou améliorations futures envisagez-vous ?", long: true }
];

async function run() {
    QFlow.init({ steps: STEPS, current: "conclusion", estimatedTotal: questions.length });

    const conclusion = {};
    for (const q of questions) {
        conclusion[q.key] = await QFlow.ask(q.text, { long: true, eyebrow: "Conclusion générale" });
    }

    await saveToDataJson({ conclusion });

    await QFlow.finish({
        title: "Conclusion enregistrée",
        subtitle: "Une dernière étape : indiquez les sites et ressources utilisés pour vos recherches (webographie).",
        buttonText: "Continuer →",
        onNext: () => { window.location.href = "assistant_references.php"; }
    });
}

run();
