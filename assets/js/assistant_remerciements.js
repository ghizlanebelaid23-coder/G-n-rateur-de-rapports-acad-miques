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
    { key: "thanks_people", text: "À qui souhaitez-vous adresser vos remerciements ?" },
    { key: "thanks_text", text: "Quel texte voulez-vous écrire pour vos remerciements ?", long: true }
];

async function run() {
    QFlow.init({ steps: STEPS, current: "thanks", estimatedTotal: questions.length });

    const answers = {};
    for (const q of questions) {
        answers[q.key] = await QFlow.ask(q.text, { long: !!q.long, eyebrow: "Remerciements" });
    }

    const result = await saveToDataJson({ thanks: answers });

    await QFlow.finish({
        title: "Remerciements terminés",
        subtitle: "Place à la table des matières.",
        buttonText: "Continuer →",
        onNext: () => { window.location.href = "assistant_tablematieres.php"; }
    });
}

run();
