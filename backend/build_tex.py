import json
from pathlib import Path
import subprocess
import sys

# BASE est le dossier de travail : soit un dossier utilisateur passé en
# argument (backend/users_data/{uid}/, pour isoler les rapports entre
# utilisateurs), soit le dossier du script par défaut (usage local/dev).
if len(sys.argv) > 1:
    BASE = Path(sys.argv[1])
else:
    BASE = Path(__file__).parent


def escape_latex(text):
    """
    Échappe les caractères spéciaux LaTeX dans du texte libre saisi par
    l'utilisateur (page de garde, dédicace, remerciements, conclusion...).
    Sans ça, un simple "%" ou "&" tapé par un étudiant casse toute la
    compilation du PDF.

    NE PAS appliquer aux champs "chapters" / "references" : ce sont déjà des
    fragments LaTeX complets (générés côté JS avec leur propre échappement
    interne pour le texte utilisateur qu'ils contiennent).
    """
    if text is None:
        return ""
    text = str(text)
    replacements = [
        ("\\", r"\textbackslash{}"),
        ("&", r"\&"),
        ("%", r"\%"),
        ("$", r"\$"),
        ("#", r"\#"),
        ("_", r"\_"),
        ("{", r"\{"),
        ("}", r"\}"),
        ("~", r"\textasciitilde{}"),
        ("^", r"\textasciicircum{}"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text


# Lire data.json
try:
    with open(BASE / "data.json", encoding="utf-8") as f:
        data = json.load(f)
except Exception as e:
    print(f"Erreur lecture data.json: {e}")
    sys.exit(1)

cover = data.get("cover", {})
dedication = data.get("dedication", "")
thanks = data.get("thanks", "")
chapters = data.get("chapters", "")
conclusion = data.get("conclusion", "")
references = data.get("references", "")

# Créer la structure LaTeX
tex_content = r"""\documentclass[12pt,a4paper]{report}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[french]{babel}
\usepackage{geometry}
\geometry{margin=2.5cm}
\usepackage{graphicx}
\usepackage{float}
\usepackage{array}
\usepackage{hyperref}
\hypersetup{colorlinks=true, urlcolor=blue, linkcolor=black, citecolor=black}

\begin{document}
\begin{titlepage}
\begin{center}

\textbf{""" + escape_latex(cover.get("country", "")) + r"""} \\[0.2cm]
\textbf{""" + escape_latex(cover.get("university", "")) + r"""} \\[0.2cm]
\textbf{""" + escape_latex(cover.get("school", "")) + r"""} \\[0.2cm]
\textbf{""" + escape_latex(cover.get("department", "")) + r"""} \\[1cm]

\vspace{1cm}
\textbf{\Large """ + escape_latex(cover.get("document_type", "")) + r"""} \\[0.5cm]
Présenté en vue d'obtenir \\[0.2cm]
\textbf{""" + escape_latex(cover.get("diploma", "")) + r"""} \\[0.2cm]
Spécialité : """ + escape_latex(cover.get("speciality", "")) + r""" \\[0.2cm]
N° : """ + escape_latex(cover.get("reference", "")) + r"""

\vspace{1cm}
\textbf{Sujet :}

\vspace{0.5cm}
\rule{\textwidth}{0.4pt}

\Large \textbf{""" + escape_latex(cover.get("title_line1", "")) + r"""} \\ 
\Large \textbf{""" + escape_latex(cover.get("title_line2", "")) + r"""} \\ 
\Large \textbf{""" + escape_latex(cover.get("title_line3", "")) + r"""} 

\rule{\textwidth}{0.4pt}

\vspace{1cm}

\noindent
\begin{minipage}[t]{0.48\textwidth}
\textbf{Réalisé par :}\\
\rule{\linewidth}{0.6pt}
\vspace{0.2cm}
""" + escape_latex(cover.get("student", "")) + r"""

\vspace{0.8cm}

\textbf{Membres du jury :}\\
\rule{\linewidth}{0.6pt}
\vspace{0.2cm}
"""

# Ajouter les membres du jury
if isinstance(cover.get("jury"), list):
    for jury_member in cover.get("jury", []):
        tex_content += escape_latex(jury_member) + r""" \\
"""
else:
    tex_content += escape_latex(cover.get("jury", ""))

tex_content += r"""\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\textbf{Soutenu le :}\\
\rule{\linewidth}{0.6pt}
\vspace{0.2cm}
""" + escape_latex(cover.get("date", "")) + r"""

\vspace{0.8cm}

\textbf{Encadré par :}\\
\rule{\linewidth}{0.6pt}
\vspace{0.2cm}
"""

# Ajouter les encadrants
if isinstance(cover.get("supervisor"), list):
    for supervisor in cover.get("supervisor", []):
        tex_content += escape_latex(supervisor) + r""" \\
"""
else:
    tex_content += escape_latex(cover.get("supervisor", ""))

tex_content += r"""\end{minipage}

\vfill
Année Universitaire : """ + escape_latex(cover.get("year", "")) + r"""

\end{center}
\end{titlepage}

% TABLE DES MATIÈRES
\tableofcontents
\newpage

\chapter*{Dédicace}
"""

# Ajouter dédicace
if isinstance(dedication, dict):
    if "message" in dedication:
        tex_content += escape_latex(dedication["message"])
else:
    tex_content += escape_latex(dedication)

tex_content += r"""

\chapter*{Remerciements}
"""

# Ajouter remerciements
if isinstance(thanks, dict):
    if "thanks_text" in thanks:
        tex_content += escape_latex(thanks["thanks_text"])
else:
    tex_content += escape_latex(thanks)

tex_content += r"""

"""

# Ajouter les chapitres (déjà du LaTeX généré côté JS — ne pas ré-échapper)
if chapters:
    tex_content += chapters

tex_content += r"""

\chapter*{Conclusion Générale}
"""

# Ajouter conclusion
if isinstance(conclusion, dict):
    if "summary" in conclusion:
        tex_content += escape_latex(conclusion["summary"]) + "\n\n"
    if "achievements" in conclusion:
        tex_content += r"\textbf{Réalisations :} " + escape_latex(conclusion["achievements"]) + "\n\n"
    if "difficulties" in conclusion:
        tex_content += r"\textbf{Difficultés :} " + escape_latex(conclusion["difficulties"]) + "\n\n"
    if "perspectives" in conclusion:
        tex_content += r"\textbf{Perspectives :} " + escape_latex(conclusion["perspectives"]) + "\n\n"
else:
    tex_content += escape_latex(conclusion)

tex_content += r"""

"""

# Ajouter les références / webographie (déjà du LaTeX généré côté JS)
if references:
    tex_content += references

tex_content += r"""

\end{document}
"""

# Écrire le fichier LaTeX
rapport_file = BASE / "rapport.tex"
try:
    with open(rapport_file, "w", encoding="utf-8") as f:
        f.write(tex_content)
except Exception as e:
    print(f"Erreur écriture rapport.tex: {e}")
    sys.exit(1)

# Compiler en PDF
try:
    # Chercher un compilateur LaTeX
    import shutil
    latex_cmd = None

    # Essayer xelatex (meilleure support UTF-8)
    if shutil.which("xelatex"):
        latex_cmd = "xelatex"
    elif shutil.which("pdflatex"):
        latex_cmd = "pdflatex"
    else:
        print("Erreur: xelatex ou pdflatex n'ont pas été trouvés dans le PATH.")
        sys.exit(1)

    print(f"Utilisation de: {latex_cmd}")

    # Première compilation
    result1 = subprocess.run(
        [latex_cmd, "-interaction=nonstopmode", "-output-directory=" + str(BASE), str(rapport_file)],
        capture_output=True,
        text=True,
        cwd=str(BASE),
        timeout=60
    )

    if result1.returncode != 0:
        print("Erreur compilation 1:")
        print(result1.stdout[-2000:] if len(result1.stdout) > 2000 else result1.stdout)
        sys.exit(1)

    # Deuxième compilation
    result2 = subprocess.run(
        [latex_cmd, "-interaction=nonstopmode", "-output-directory=" + str(BASE), str(rapport_file)],
        capture_output=True,
        text=True,
        cwd=str(BASE),
        timeout=60
    )

    if result2.returncode != 0:
        print("Erreur compilation 2:")
        print(result2.stdout[-2000:] if len(result2.stdout) > 2000 else result2.stdout)
        sys.exit(1)

    print("PDF généré avec succès: rapport.pdf")
    sys.exit(0)

except subprocess.TimeoutExpired:
    print("Erreur: La compilation a dépassé le délai imparti.")
    sys.exit(1)
except Exception as e:
    print(f"Erreur lors de la génération du PDF: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
