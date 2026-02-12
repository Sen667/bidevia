import { Pool } from 'pg';
import { Incendie } from './types';

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // nombre maximum de connexions dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL inattendue:', err);
});

/**
 * Récupère tous les incendies avec coordonnées GPS
 */
export async function getIncendies(): Promise<Incendie[]> {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        city,
        rue_sinistre,
        department,
        latitude, 
        longitude, 
        date_event,
        date_sinistre,
        heure_sinistre,
        title,
        summary,
        type_sinistre,
        severity_index,
        resources_deployed,
        identite,
        reason_of_rejection,
        source_url,
        source_name,
        created_at
      FROM log_incendies 
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL 
      ORDER BY date_event DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} incendies trouvés dans la base`);

    const validIncendies = result.rows
      .map(row => {
        try {
          // Vérifier que les coordonnées sont des nombres valides
          const lat = parseFloat(row.latitude);
          const lng = parseFloat(row.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`⚠️ Coordonnées invalides pour l'incendie #${row.id}: lat=${row.latitude}, lng=${row.longitude}`);
            return null;
          }

          // Vérifier que les coordonnées sont dans les limites géographiques
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn(`⚠️ Coordonnées hors limites pour l'incendie #${row.id}: lat=${lat}, lng=${lng}`);
            return null;
          }

          return {
            id: row.id.toString(),
            city: row.city || '',
            rue_sinistre: row.rue_sinistre,
            department: row.department,
            lat,
            lng,
            date_event: row.date_event,
            date_sinistre: row.date_sinistre,
            heure_sinistre: row.heure_sinistre,
            title: row.title || '',
            summary: row.summary,
            type_sinistre: row.type_sinistre || '',
            severity_index: row.severity_index,
            resources_deployed: row.resources_deployed,
            identite: row.identite,
            reason_of_rejection: row.reason_of_rejection,
            source_url: row.source_url,
            source_name: row.source_name,
            created_at: row.created_at,
            // Champs de compatibilité
            ville: row.city,
            type: row.type_sinistre,
            gravite: row.severity_index,
            resume: row.summary,
            date: row.date_event,
            sources: row.source_url,
          };
        } catch (rowError) {
          console.error(`❌ Erreur lors du traitement de l'incendie #${row.id}:`, rowError);
          return null;
        }
      })
      .filter((inc) => inc !== null) as Incendie[];

    console.log(`✅ ${validIncendies.length} incendies avec coordonnées GPS valides`);
    
    return validIncendies;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des incendies:', error);
    return [];
  }
}

/**
 * Récupère tous les incendies (même sans GPS) pour le tableau
 */
export async function getIncendiesRaw(): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        city,
        rue_sinistre,
        department,
        latitude, 
        longitude, 
        date_event,
        date_sinistre,
        heure_sinistre,
        title,
        summary,
        type_sinistre,
        severity_index,
        resources_deployed,
        identite,
        reason_of_rejection,
        source_url,
        source_name,
        created_at
      FROM log_incendies 
      ORDER BY date_event DESC NULLS LAST, created_at DESC`
    );

    return result.rows.map(row => ({
      id: row.id.toString(),
      city: row.city || '',
      rue_sinistre: row.rue_sinistre,
      department: row.department,
      lat: row.latitude ? parseFloat(row.latitude) : null,
      lng: row.longitude ? parseFloat(row.longitude) : null,
      date_event: row.date_event,
      date_sinistre: row.date_sinistre,
      heure_sinistre: row.heure_sinistre,
      title: row.title || '',
      summary: row.summary,
      type_sinistre: row.type_sinistre || '',
      severity_index: row.severity_index,
      resources_deployed: row.resources_deployed,
      identite: row.identite,
      reason_of_rejection: row.reason_of_rejection,
      source_url: row.source_url,
      source_name: row.source_name,
      created_at: row.created_at,
      // Champs de compatibilité
      ville: row.city,
      type: row.type_sinistre,
      gravite: row.severity_index,
      resume: row.summary,
      date: row.date_event,
      sources: row.source_url,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des incendies (raw):', error);
    return [];
  }
}

/**
 * Ferme le pool de connexions (utile pour les tests)
 */
export async function closePool() {
  await pool.end();
}

export default pool;
