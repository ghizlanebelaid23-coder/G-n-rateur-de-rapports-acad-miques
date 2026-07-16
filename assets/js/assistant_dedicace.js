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
    { key: "to", text: "À qui souhaitez-vous dédier ce rapport ?" },
    { key: "reason", text: "Pourquoi cette personne, ou ces personnes ?" },
    { key: "message", text: "Écrivez le texte complet de votre dédicace.", long: true }
];

async function run() {
    QFlow.init({ steps: STEPS, current: "dedication", estimatedTotal: questions.length });

    const answers = {};
    for (const q of questions) {
        answers[q.key] = await QFlow.ask(q.text, { long: !!q.long, eyebrow: "Dédicace" });
    }

    const result = await saveToDataJson({ dedication: answers });

    await QFlow.finish({
        title: "Dédicace terminée",
        subtitle: "Passons maintenant aux remerciements.",
        buttonText: "Continuer →",
        onNext: () => { window.location.href = "assistant_remerciements.php"; }
    });
}

run();
