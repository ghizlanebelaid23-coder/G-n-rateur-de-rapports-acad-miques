const STEPS = [
    { key: "cover", label: "Page de garde" },
    { key: "dedication", label: "Dédicace" },
    { key: "thanks", label: "Remerciements" },
    { key: "toc", label: "Sommaire" },
    { key: "chapters", label: "Chapitres" },
    { key: "conclusion", label: "Conclusion" },
    { key: "references", label: "Références" }
];

async function run() {
    QFlow.init({ steps: STEPS, current: "toc", estimatedTotal: 1 });

    await QFlow.finish({
        title: "Table des matières",
        subtitle: "Elle sera générée automatiquement à partir des chapitres que vous allez rédiger. Passons à la rédaction.",
        buttonText: "Commencer les chapitres →",
        onNext: () => { window.location.href = "assistant_chapitre.php"; }
    });
}

run();
