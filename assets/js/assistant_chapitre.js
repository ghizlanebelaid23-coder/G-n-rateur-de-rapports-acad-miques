const STEPS = [
    { key: "cover", label: "Page de garde" },
    { key: "dedication", label: "Dédicace" },
    { key: "thanks", label: "Remerciements" },
    { key: "toc", label: "Sommaire" },
    { key: "chapters", label: "Chapitres" },
    { key: "conclusion", label: "Conclusion" },
    { key: "references", label: "Références" }
];

// Commandes LaTeX de sectionnement selon la profondeur du sous-titre
// niveau 1 = \section (juste sous le chapitre), 2 = \subsection, etc.
const SECTION_CMDS = ["", "\\section", "\\subsection", "\\subsubsection", "\\paragraph", "\\subparagraph"];

/* ---------------- utilitaires LaTeX ---------------- */

function escapeLatex(str) {
    if (!str) return "";
    return String(str)
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/\$/g, "\\$")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/\^/g, "\\textasciicircum{}");
}

function figureToLatex(block) {
    return `\\begin{figure}[H]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${block.path}}\n\\caption{${escapeLatex(block.caption)}}\n\\end{figure}\n\n`;
}

function fileToLatex(f) {
    return `\\noindent\\textit{Fichier joint : \\texttt{${escapeLatex(f.name)}} -- ${escapeLatex(f.label)}}\n\n`;
}

function blockToLatex(block) {
    switch (block.type) {
        case "paragraph":
            return `${escapeLatex(block.text)}\n\n`;
        case "table":
        case "schema":
        case "image":
            return figureToLatex(block);
        case "file":
            return fileToLatex(block);
        case "subtitle": {
            const cmd = SECTION_CMDS[block.level];
            let latex = cmd ? `${cmd}{${escapeLatex(block.title)}}\n` : `\\textbf{${escapeLatex(block.title)}} \\\\\n`;
            block.blocks.forEach((b) => { latex += blockToLatex(b); });
            return latex;
        }
        default:
            return "";
    }
}

function chaptersToLatex(chapters) {
    let latex = "";
    chapters.forEach((chap) => {
        latex += `\\chapter{${escapeLatex(chap.title)}}\n`;
        chap.blocks.forEach((b) => { latex += blockToLatex(b); });
    });
    return latex;
}

/* ---------------- upload (images / fichiers joints) ---------------- */

function uploadFile(file, kind) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    return fetch("../backend/upload_file.php", { method: "POST", body: formData })
        .then((res) => res.json())
        .catch(() => ({ success: false, error: "Erreur réseau" }));
}

function askFileUpload(question, kind, eyebrow) {
    return new Promise((resolve) => {
        QFlow.custom(() => {
            const card = document.createElement("div");
            card.className = "qcard";

            const head = document.createElement("div");
            head.className = "qcard-head";
            const orb = document.createElement("div");
            orb.className = "orb";
            const titles = document.createElement("div");
            const eyebrowEl = document.createElement("p");
            eyebrowEl.className = "qcard-eyebrow";
            eyebrowEl.textContent = eyebrow || "Assistant IA";
            const q = document.createElement("h2");
            q.className = "qcard-question";
            q.textContent = question;
            titles.appendChild(eyebrowEl);
            titles.appendChild(q);
            head.appendChild(orb);
            head.appendChild(titles);
            card.appendChild(head);

            const body = document.createElement("div");
            body.className = "qcard-body";
            const input = document.createElement("input");
            input.type = "file";
            if (kind === "image") input.accept = ".png,.jpg,.jpeg,.gif,.pdf";
            input.style.marginBottom = "10px";
            body.appendChild(input);

            const status = document.createElement("p");
            status.style.opacity = "0.75";
            status.style.fontSize = ".85rem";
            status.style.marginTop = "8px";
            body.appendChild(status);
            card.appendChild(body);

            const actions = document.createElement("div");
            actions.className = "qcard-actions";
            const hint = document.createElement("span");
            hint.className = "qcard-hint";
            hint.textContent = "Formats acceptés : " + (kind === "image" ? "PNG, JPG, GIF, PDF" : "PDF, ZIP, DOCX, XLSX, PPTX, CSV, TXT, code source");
            const btnSkip = document.createElement("button");
            btnSkip.className = "chip";
            btnSkip.type = "button";
            btnSkip.style.width = "auto";
            btnSkip.textContent = "Annuler";
            const btn = document.createElement("button");
            btn.className = "pill";
            btn.type = "button";
            btn.style.width = "auto";
            btn.textContent = "Téléverser →";
            actions.appendChild(hint);
            actions.appendChild(btnSkip);
            actions.appendChild(btn);
            card.appendChild(actions);

            btnSkip.addEventListener("click", () => resolve(null));

            btn.addEventListener("click", async () => {
                if (!input.files || !input.files[0]) {
                    status.textContent = "Veuillez choisir un fichier.";
                    return;
                }
                btn.disabled = true;
                status.textContent = "Téléversement en cours…";
                const result = await uploadFile(input.files[0], kind);
                if (result.success) {
                    status.textContent = "✓ Fichier envoyé : " + result.original_name;
                    resolve(result);
                } else {
                    status.textContent = "Erreur : " + (result.error || "échec de l'envoi");
                    btn.disabled = false;
                }
            });

            return card;
        });
    });
}

/* ---------------- collecte des blocs de contenu ---------------- */

async function collectTable(eyebrow) {
    const upload = await askFileUpload("Choisissez le fichier du tableau (image ou PDF)", "image", eyebrow);
    if (!upload) return null;
    const caption = await QFlow.ask("Légende du tableau ?", { eyebrow, placeholder: "Ex : Comparaison des solutions" });
    return { path: upload.path, caption };
}

async function collectSchema(eyebrow) {
    const upload = await askFileUpload("Choisissez le fichier du schéma (image ou PDF)", "image", eyebrow);
    if (!upload) return null;
    const caption = await QFlow.ask("Légende du schéma ?", { eyebrow, placeholder: "Ex : Architecture générale du système" });
    return { path: upload.path, caption };
}

async function collectImage(eyebrow) {
    const upload = await askFileUpload("Choisissez l'image à insérer", "image", eyebrow);
    if (!upload) return null;
    const caption = await QFlow.ask("Légende de l'image ?", { eyebrow, placeholder: "Ex : Interface de l'application" });
    return { path: upload.path, caption };
}

async function collectFileAttachment(eyebrow) {
    const upload = await askFileUpload("Choisissez le fichier à joindre", "file", eyebrow);
    if (!upload) return null;
    const label = await QFlow.ask("Description du fichier joint ?", { eyebrow, placeholder: "Ex : Code source complet (voir annexe)" });
    return { path: upload.path, name: upload.original_name, label };
}

// Boucle générique : "que voulez-vous ajouter à cette partie ?"
// Se répète après chaque titre (chapitre, section, sous-titre...) tant que
// l'utilisateur ne choisit pas "Terminer".
async function collectBlocks(level, breadcrumb) {
    const blocks = [];
    while (true) {
        const choice = await QFlow.askChoice(
            "Que voulez-vous ajouter ?",
            [
                { label: "📝 Paragraphe", value: "paragraph" },
                { label: "📊 Tableau", value: "table" },
                { label: "🗺️ Schéma", value: "schema" },
                { label: "🖼️ Image", value: "image" },
                { label: "📎 Fichier joint", value: "file" },
                { label: "➕ Sous-titre", value: "subtitle" },
                { label: "✅ Terminer cette partie", value: "done" }
            ],
            { eyebrow: breadcrumb }
        );

        if (choice === "done") break;

        if (choice === "paragraph") {
            const text = await QFlow.ask("Texte du paragraphe ?", { long: true, eyebrow: breadcrumb });
            blocks.push({ type: "paragraph", text });
        } else if (choice === "table") {
            const table = await collectTable(breadcrumb);
            if (table) blocks.push({ type: "table", ...table });
        } else if (choice === "schema") {
            const schema = await collectSchema(breadcrumb);
            if (schema) blocks.push({ type: "schema", ...schema });
        } else if (choice === "image") {
            const img = await collectImage(breadcrumb);
            if (img) blocks.push({ type: "image", ...img });
        } else if (choice === "file") {
            const file = await collectFileAttachment(breadcrumb);
            if (file) blocks.push({ type: "file", ...file });
        } else if (choice === "subtitle") {
            const subTitle = await QFlow.ask("Titre du sous-titre ?", { eyebrow: breadcrumb });
            const childBreadcrumb = `${breadcrumb} › ${subTitle}`;
            const subBlocks = await collectBlocks(level + 1, childBreadcrumb);
            blocks.push({ type: "subtitle", title: subTitle, level: level + 1, blocks: subBlocks });
        }
    }
    return blocks;
}

/* ---------------- flux principal ---------------- */

async function run() {
    QFlow.init({ steps: STEPS, current: "chapters", estimatedTotal: 12 });

    const allChapters = [];
    let chapitreIndex = 1;

    while (true) {
        const eyebrow = `Chapitre ${chapitreIndex}`;
        const title = await QFlow.ask("Quel est le titre de ce chapitre ?", { eyebrow });
        const blocks = await collectBlocks(1, eyebrow);
        allChapters.push({ title, blocks });

        const anotherChapter = await QFlow.askYesNo("Ajouter un autre chapitre ?", { eyebrow: "Chapitres" });
        if (!anotherChapter) break;
        chapitreIndex++;
    }

    const latexChapters = chaptersToLatex(allChapters);
    const result = await saveToDataJson({ chapters: latexChapters });

    await QFlow.finish({
        title: "Tous les chapitres sont rédigés",
        subtitle: `${allChapters.length} chapitre(s) enregistré(s). Place à la conclusion générale.`,
        buttonText: "Continuer →",
        onNext: () => { window.location.href = "assistant_conclusion.php"; }
    });
}

run();
