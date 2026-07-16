#!/bin/bash
set -e

# Render injecte le port à écouter via la variable $PORT
PORT="${PORT:-80}"

sed -ri "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -ri "s/:80>/:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

exec apache2-foreground
