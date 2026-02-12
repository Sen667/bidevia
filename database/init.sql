-- Script d'initialisation de la base de données pour les incendies
-- À exécuter dans votre base PostgreSQL Docker

-- Création de la table incendies
CREATE TABLE IF NOT EXISTS incendies (
  id SERIAL PRIMARY KEY,
  
  -- Informations de localisation
  city VARCHAR(255),
  rue_sinistre VARCHAR(255),
  department VARCHAR(255),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  
  -- Informations temporelles
  date_event TIMESTAMP,
  date_sinistre VARCHAR(255),
  heure_sinistre VARCHAR(255),
  
  -- Détails de l'incident
  title TEXT,
  summary TEXT,
  type_sinistre VARCHAR(255),
  severity_index INTEGER,
  resources_deployed TEXT DEFAULT 'Inconnu',
  
  -- Informations supplémentaires
  identite VARCHAR(255),
  reason_of_rejection TEXT,
  
  -- Sources
  source_url TEXT,
  source_name VARCHAR(255),
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_incendies_date_event ON incendies(date_event DESC);
CREATE INDEX IF NOT EXISTS idx_incendies_coords ON incendies(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incendies_city ON incendies(city);
CREATE INDEX IF NOT EXISTS idx_incendies_severity ON incendies(severity_index);
CREATE INDEX IF NOT EXISTS idx_incendies_type ON incendies(type_sinistre);

-- Insertion de données de test
INSERT INTO incendies (city, rue_sinistre, department, lat, lng, date_event, title, summary, type_sinistre, severity_index, resources_deployed, source_url, source_name) VALUES
  ('Lille', 'Rue de la République', 'Nord', 50.6292, 3.0573, '2026-02-03 14:30:00', 'Incendie d''appartement', 'Incendie dans un appartement au 3ème étage', 'Habitation', 3, '2 camions, 8 pompiers', 'https://example.com/source1', 'La Voix du Nord'),
  ('Roubaix', 'Avenue Jean Jaurès', 'Nord', 50.6942, 3.1746, '2026-02-03 10:15:00', 'Feu d''entrepôt industriel', 'Feu majeur dans un entrepôt industriel', 'Entrepôt', 5, '5 camions, 20 pompiers', 'https://example.com/source2', 'Nord Éclair'),
  ('Tourcoing', 'Boulevard Gambetta', 'Nord', 50.7234, 3.1605, '2026-02-02 18:45:00', 'Véhicule en feu', 'Voiture en feu sur un parking', 'Véhicule', 2, '1 camion, 4 pompiers', 'https://example.com/source3', 'France 3 Hauts-de-France'),
  ('Armentières', 'Rue du Général de Gaulle', 'Nord', 50.6878, 2.8816, '2026-02-02 08:20:00', 'Incendie de commerce', 'Incendie dans une boulangerie', 'Commerce', 4, '3 camions, 12 pompiers', 'https://example.com/source4', 'La Voix du Nord'),
  ('Villeneuve-d''Ascq', 'Parc Urbain', 'Nord', 50.6193, 3.1378, '2026-02-01 16:00:00', 'Début d''incendie forestier', 'Début d''incendie forestier rapidement maîtrisé', 'Forêt', 3, '2 camions, 6 pompiers', 'https://example.com/source5', 'Nord Éclair')
ON CONFLICT DO NOTHING;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la mise à jour automatique de updated_at
DROP TRIGGER IF EXISTS update_incendies_updated_at ON incendies;
CREATE TRIGGER update_incendies_updated_at
    BEFORE UPDATE ON incendies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Afficher les données insérées
SELECT * FROM incendies ORDER BY date DESC;
