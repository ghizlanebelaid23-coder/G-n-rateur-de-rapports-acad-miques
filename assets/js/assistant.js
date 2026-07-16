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
    { key: "country", text: "Quel est le pays ?" },
    { key: "university", text: "Quel est le nom de l'université ?" },
    { key: "school", text: "Nom de l'école ou de la faculté ?" },
    { key: "department", text: "Filière ou département ?" },
    { key: "degree", text: "Quel type de diplôme préparez-vous ?" },
    { key: "speciality", text: "Quelle est votre spécialité ?" },
    { key: "academic_year", text: "Quelle est l'année universitaire ?" },
    { key: "project_type", text: "Type de document (Mémoire, Rapport de stage, PFE…) ?" },
    { key: "project_title", text: "Quel est le titre de votre projet ?" },
    { key: "student_name", text: "Quel est votre nom complet ?" },
    { key: "supervisor", text: "Qui sont vos encadrant(s) ? (un par ligne si plusieurs)", long: true },
    { key: "jury", text: "Membres du jury ? (un par ligne si plusieurs)", long: true },
    { key: "defense_date", text: "Quelle est la date de soutenance ?" }
];

async function run() {
    QFlow.init({ steps: STEPS, current: "cover", estimatedTotal: questions.length });

    const answers = {};
    for (const q of questions) {
        answers[q.key] = await QFlow.ask(q.text, { long: !!q.long, eyebrow: "Page de garde" });
    }

    const coverData = {
        cover: {
            country: answers.country || "",
            university: answers.university || "",
            school: answers.school || "",
            department: answers.department || "",
            document_type: answers.project_type || "",
            diploma: answers.degree || "",
            speciality: answers.speciality || "",
            reference: answers.academic_year || "",
            title_line1: answers.project_title || "",
            title_line2: "",
            title_line3: "",
            student: answers.student_name || "",
            jury: answers.jury ? answers.jury.split("\n").filter(Boolean) : [],
            date: answers.defense_date || "",
            supervisor: answers.supervisor ? answers.supervisor.split("\n").filter(Boolean) : [],
            year: answers.academic_year || ""
        }
    };

    const result = await saveToDataJson(coverData);

    await QFlow.finish({
        title: "Page de garde terminée",
        subtitle: "Ces informations formeront la première page de votre rapport.",
        buttonText: "Passer à la dédicace →",
        onNext: () => { window.location.href = "assistant_dedicace.php"; }
    });
}

run();
