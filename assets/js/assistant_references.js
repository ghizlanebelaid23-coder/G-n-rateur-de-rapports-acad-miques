const STEPS = [
    { key: "cover", label: "Page de garde" },
    { key: "dedication", label: "Dédicace" },
    { key: "thanks", label: "Remerciements" },
    { key: "toc", label: "Sommaire" },
    { key: "chapters", label: "Chapitres" },
    { key: "conclusion", label: "Conclusion" },
    { key: "references", label: "Références" }
];

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

function cleanUrl(url) {
    return String(url || "").trim().replace(/\s+/g, "");
}

function referencesToLatex(refs) {
    if (!refs.length) return "";
    let latex = "\\chapter*{Références et Webographie}\n\\addcontentsline{toc}{chapter}{Références et Webographie}\n\\begin{enumerate}\n";
    refs.forEach((r) => {
        latex += `\\item ${escapeLatex(r.title)} -- \\url{${cleanUrl(r.url)}}`;
        if (r.author) latex += ` \\textit{(consulté par : ${escapeLatex(r.author)})}`;
        latex += "\n";
    });
    latex += "\\end{enumerate}\n";
    return latex;
}

async function collectReference(eyebrow) {
    const title = await QFlow.ask("Nom ou titre de la ressource consultée ?", { eyebrow, placeholder: "Ex : Documentation officielle React" });
    const url = await QFlow.ask("Lien (URL) de cette ressource ?", { eyebrow, placeholder: "https://..." });
    const author = await QFlow.ask("Ajoutée par (optionnel, nom de l'étudiant·e concerné·e) ?", { eyebrow, optional: true, placeholder: "Ex : Btihaje Mallal" });
    return { title, url, author };
}

function showFinalScreen(count) {
    QFlow.custom(() => {
        const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
        const card = el('div', 'qcard');
        card.style.textAlign = 'center';
        const check = el('div', 'success-check', '✓');
        check.style.color = '#05060f'; check.style.fontSize = '28px'; check.style.fontWeight = '700';
        card.appendChild(check);
        card.appendChild(el('h2', 'qcard-question', 'Votre rapport est prêt à être généré'));
        const subtitleText = count > 0
            ? `Toutes les sections ont été enregistrées, avec ${count} référence(s). Générez le PDF final de votre rapport de stage.`
            : `Toutes les sections ont été enregistrées. Générez le PDF final de votre rapport de stage.`;
        card.appendChild(el('p', '', subtitleText));
        const btn = el('button', 'pill', '📄 Générer le PDF');
        btn.style.marginTop = '22px'; btn.style.width = 'auto';
        btn.addEventListener('click', generatePDF);
        card.appendChild(btn);
        return card;
    });
}

async function run() {
    QFlow.init({ steps: STEPS, current: "references", estimatedTotal: 4 });

    const eyebrow = "Références";
    const references = [];

    const wantsRef = await QFlow.askYesNo(
        "Souhaitez-vous citer les sites/ressources utilisés pour vos recherches (webographie) ?",
        { eyebrow }
    );

    if (wantsRef) {
        references.push(await collectReference(eyebrow));
        while (await QFlow.askYesNo("Ajouter une autre référence ?", { eyebrow })) {
            references.push(await collectReference(eyebrow));
        }
    }

    const latexReferences = referencesToLatex(references);
    await saveToDataJson({ references: latexReferences });

    showFinalScreen(references.length);
}

run();
