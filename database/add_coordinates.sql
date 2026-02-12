-- Ajout des colonnes latitude et longitude à la table log_incendies
ALTER TABLE log_incendies 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Création d'un index pour améliorer les performances des requêtes géographiques
CREATE INDEX IF NOT EXISTS idx_log_incendies_coords 
ON log_incendies(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Afficher la structure de la table
\d log_incendies;
