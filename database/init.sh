#!/bin/bash
# Script pour initialiser la base de données PostgreSQL

echo "🔄 Initialisation de la base de données PostgreSQL..."

# Exécuter le script SQL dans le conteneur Docker
docker exec -i $(docker ps -q -f name=postgres) psql -U postgres -d postgres < database/init.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de données initialisée avec succès!"
else
    echo "❌ Erreur lors de l'initialisation de la base de données"
    exit 1
fi
