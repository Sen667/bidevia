-- Création de la base de données pour n8n
CREATE DATABASE n8n_data;

-- On se remet sur la base principale pour la suite du script
\c osint_sinistres;

-- Tes scripts de création de tables (log_incendies, etc.) commencent ici...
CREATE TABLE IF NOT EXISTS public.fallback (...);