import { Pool } from 'pg';
import { CatastropheNaturelle, Incendie, Inondation, DegatDesEaux } from './types';

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
        category,
        title,
        city,
        identity,
        department,
        incident_street,
        publication_date,
        incident_date,
        incident_time,
        building_type,
        severity_index,
        resources_deployed,
        summary,
        source_url,
        source_name,
        created_at
      FROM log_incendies 
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} incendies trouvés dans la base`);

    const validIncendies = result.rows
      .map(row => {
        try {
          return {
            id: row.id.toString(),
            category: row.category || '',
            city: row.city || '',
            incident_street: row.incident_street || '',
            department: row.department || '',
            lat: 0,
            lng: 0,
            publication_date: row.publication_date,
            incident_date: row.incident_date || '',
            incident_time: row.incident_time || '',
            title: row.title || '',
            summary: row.summary || '',
            building_type: row.building_type || '',
            severity_index: row.severity_index || 0,
            resources_deployed: row.resources_deployed || '',
            identity: row.identity || '',
            source_url: row.source_url || '',
            source_name: row.source_name || '',
            created_at: row.created_at,
            // Champs de compatibilité
            ville: row.city,
            type: row.building_type,
            gravite: row.severity_index,
            resume: row.summary,
            date: row.incident_date,
            sources: row.source_url,
          };
        } catch (rowError) {
          console.error(`❌ Erreur lors du traitement de l'incendie #${row.id}:`, rowError);
          return null;
        }
      })
      .filter((inc) => inc !== null) as Incendie[];

    console.log(`✅ ${validIncendies.length} incendies valides`);
    
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
        category,
        title,
        city,
        identity,
        department,
        incident_street,
        publication_date,
        incident_date,
        incident_time,
        building_type,
        severity_index,
        resources_deployed,
        summary,
        source_url,
        source_name,
        created_at
      FROM log_incendies 
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} incendies trouvés dans la base`);

    return result.rows.map(row => ({
      id: row.id.toString(),
      category: row.category || '',
      city: row.city || '',
      incident_street: row.incident_street || '',
      department: row.department || '',
      lat: 0,
      lng: 0,
      publication_date: row.publication_date,
      incident_date: row.incident_date || '',
      incident_time: row.incident_time || '',
      title: row.title || '',
      summary: row.summary || '',
      building_type: row.building_type || '',
      severity_index: row.severity_index || 0,
      resources_deployed: row.resources_deployed || '',
      identity: row.identity || '',
      source_url: row.source_url || '',
      source_name: row.source_name || '',
      created_at: row.created_at,
      // Champs de compatibilité
      ville: row.city,
      type: row.building_type,
      gravite: row.severity_index,
      resume: row.summary,
      date: row.incident_date,
      sources: row.source_url,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des incendies (raw):', error);
    return [];
  }
}


export async function getCatastropheNaturelles(): Promise<CatastropheNaturelle[]> {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        category,
        title,
        city,
        identity,
        department,
        incident_street,
        publication_date,
        incident_date,
        incident_time,
        building_type,
        severity_index,
        resources_deployed,
        summary,
        source_url,
        source_name,
        created_at
      FROM log_catastrophenaturelles
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} catastrophes naturelles trouvées dans la base`);

    return result.rows.map(row => ({
      id: row.id.toString(),
      category: row.category || '',
      city: row.city || '',
      incident_street: row.incident_street || '',
      department: row.department || '',
      lat: 0,
      lng: 0,
      publication_date: row.publication_date,
      incident_date: row.incident_date || '',
      incident_time: row.incident_time || '',
      title: row.title || '',
      summary: row.summary || '',
      building_type: row.building_type || '',
      severity_index: row.severity_index || 0,
      resources_deployed: row.resources_deployed || '',
      identity: row.identity || '',
      source_url: row.source_url || '',
      source_name: row.source_name || '',
      created_at: row.created_at,
      // Champs de compatibilité
      ville: row.city,
      type: row.building_type,
      gravite: row.severity_index,
      resume: row.summary,
      date: row.incident_date,
      sources: row.source_url,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des catastrophes naturelles:', error);
    return [];
  }
}

export async function getInondations(): Promise<Inondation[]> {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        category,
        title,
        city,
        identity,
        department,
        incident_street,
        publication_date,
        incident_date,
        incident_time,
        building_type,
        severity_index,
        resources_deployed,
        summary,
        source_url,
        source_name,
        created_at
      FROM log_inondation
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} inondations trouvées dans la base`);

    return result.rows.map(row => ({
      id: row.id.toString(),
      category: row.category || '',
      city: row.city || '',
      incident_street: row.incident_street || '',
      department: row.department || '',
      lat: 0,
      lng: 0,
      publication_date: row.publication_date,
      incident_date: row.incident_date || '',
      incident_time: row.incident_time || '',
      title: row.title || '',
      summary: row.summary || '',
      building_type: row.building_type || '',
      severity_index: row.severity_index || 0,
      resources_deployed: row.resources_deployed || '',
      identity: row.identity || '',
      source_url: row.source_url || '',
      source_name: row.source_name || '',
      created_at: row.created_at,
      // Champs de compatibilité
      ville: row.city,
      type: row.building_type,
      gravite: row.severity_index,
      resume: row.summary,
      date: row.incident_date,
      sources: row.source_url,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des inondations:', error);
    return [];
  }
}

export async function getDegatsDesEaux(): Promise<DegatDesEaux[]> {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        category,
        title,
        city,
        identity,
        department,
        incident_street,
        publication_date,
        incident_date,
        incident_time,
        building_type,
        severity_index,
        resources_deployed,
        summary,
        source_url,
        source_name,
        created_at
      FROM log_degatsdeseaux
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} dégâts des eaux trouvés dans la base`);

    return result.rows.map(row => ({
      id: row.id.toString(),
      category: row.category || '',
      city: row.city || '',
      incident_street: row.incident_street || '',
      department: row.department || '',
      lat: 0,
      lng: 0,
      publication_date: row.publication_date,
      incident_date: row.incident_date || '',
      incident_time: row.incident_time || '',
      title: row.title || '',
      summary: row.summary || '',
      building_type: row.building_type || '',
      severity_index: row.severity_index || 0,
      resources_deployed: row.resources_deployed || '',
      identity: row.identity || '',
      source_url: row.source_url || '',
      source_name: row.source_name || '',
      created_at: row.created_at,
      ville: row.city,
      type: row.building_type,
      gravite: row.severity_index,
      resume: row.summary,
      date: row.incident_date,
      sources: row.source_url,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des dégâts des eaux:', error);
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
