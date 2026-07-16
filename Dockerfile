# === Image de base : PHP + Apache ===
FROM php:8.2-apache

# === Installer Python, une distribution LaTeX minimale (français inclus), et l'extension PHP curl ===
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    cm-super \
    texlive-lang-french \
    libcurl4-openssl-dev \
    && docker-php-ext-install curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
# "python" doit pointer vers python3 (repli utilisé par build_pdf.php si "python3" est introuvable)
RUN ln -sf /usr/bin/python3 /usr/bin/python

# === Configurer Apache pour servir le dossier public/ ===
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# === Rendre backend/ accessible sous /backend ===
# Le frontend appelle des chemins relatifs type "../backend/auth.php" : sans cet
# Alias, ces requêtes retourneraient 404 une fois déployées (docroot = public/).
RUN printf '%s\n' \
    'Alias /backend /var/www/html/backend' \
    '<Directory /var/www/html/backend>' \
    '    Options -Indexes' \
    '    AllowOverride None' \
    '    Require all granted' \
    '    <FilesMatch "\.(json|tex|aux|log|toc|out)$">' \
    '        Require all denied' \
    '    </FilesMatch>' \
    '</Directory>' \
    > /etc/apache2/conf-available/backend-alias.conf \
    && a2enmod alias \
    && a2enconf backend-alias
    RUN printf '%s\n' \
    'Alias /assets /var/www/html/assets' \
    '<Directory /var/www/html/assets>' \
    '    Options -Indexes' \
    '    AllowOverride None' \
    '    Require all granted' \
    '</Directory>' \
    > /etc/apache2/conf-available/assets-alias.conf \
    && a2enconf assets-alias

# === Copier le code source ===
WORKDIR /var/www/html
COPY . /var/www/html

# === Préparer les fichiers de données (à partir des exemples, sans données réelles) ===
RUN cp -n storage/users.json.example storage/users.json \
    && mkdir -p backend/users_data \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 backend storage

# === Render fournit le port via la variable $PORT : on adapte Apache au démarrage ===
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80
CMD ["/usr/local/bin/start.sh"]
