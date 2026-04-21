import { Pool } from 'pg';
import { CatastropheNaturelle, Incendie, Inondation, DegatDesEaux } from './types';

export type LiveArticle = {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  category: string;
};

export type CleanupSummary = {
  olderThanHours: number;
  deleted: Record<string, number>;
  totalDeleted: number;
};

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
        created_at,
        latitude,
        longitude
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
            lat: row.latitude ? parseFloat(row.latitude) : 0,
            lng: row.longitude ? parseFloat(row.longitude) : 0,
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
        created_at,
        latitude,
        longitude
      FROM log_incendies 
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} incendies trouvés dans la base`);
    
    return result.rows.map(row => {
      if (row.latitude && row.longitude) {
        console.log(`📍 Raw Incendie #${row.id} - Lat: ${row.latitude}, Lng: ${row.longitude}`);
      }
      return {
        id: row.id.toString(),
        category: row.category || '',
        city: row.city || '',
        ville: row.city || '',
        type: row.building_type || '',
        gravite: row.severity_index || 0,
        resume: row.summary || '',
        date: row.incident_date || row.publication_date || '',
        sources: row.source_url || '',
        ...row,
        lat: row.latitude ? parseFloat(row.latitude) : 0,
        lng: row.longitude ? parseFloat(row.longitude) : 0,
      };
    });
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
        created_at,
        latitude,
        longitude
      FROM log_catastrophenaturelles
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} catastrophes naturelles trouvées dans la base`);
    
    return result.rows.map(row => {
      if (row.latitude && row.longitude) {
        console.log(`📍 Catastrophe #${row.id} - Lat: ${row.latitude}, Lng: ${row.longitude}`);
      }
      return {
        id: row.id.toString(),
        category: row.category || '',
        city: row.city || '',
        ville: row.city || '',
        type: row.building_type || '',
        gravite: row.severity_index || 0,
        resume: row.summary || '',
        date: row.incident_date || row.publication_date || '',
        sources: row.source_url || '',
        ...row,
        lat: row.latitude ? parseFloat(row.latitude) : 0,
        lng: row.longitude ? parseFloat(row.longitude) : 0,
      };
    });
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
        created_at,
        latitude,
        longitude
      FROM log_inondation
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} inondations trouvées dans la base`);
    
    return result.rows.map(row => {
      if (row.latitude && row.longitude) {
        console.log(`📍 Inondation #${row.id} - Lat: ${row.latitude}, Lng: ${row.longitude}`);
      }
      return {
        id: row.id.toString(),
        category: row.category || '',
        city: row.city || '',
        ville: row.city || '',
        type: row.building_type || '',
        gravite: row.severity_index || 0,
        resume: row.summary || '',
        date: row.incident_date || row.publication_date || '',
        sources: row.source_url || '',
        ...row,
        lat: row.latitude ? parseFloat(row.latitude) : 0,
        lng: row.longitude ? parseFloat(row.longitude) : 0,
      };
    });
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
        created_at,
        latitude,
        longitude
      FROM log_degatsdeseaux
      ORDER BY incident_date DESC NULLS LAST, created_at DESC`
    );

    console.log(`✅ ${result.rows.length} dégâts des eaux trouvés dans la base`);
    
    return result.rows.map(row => {
      if (row.latitude && row.longitude) {
        console.log(`📍 Dégât Eaux #${row.id} - Lat: ${row.latitude}, Lng: ${row.longitude}`);
      }
      return {
        id: row.id.toString(),
        category: row.category || '',
        city: row.city || '',
        ville: row.city || '',
        type: row.building_type || '',
        gravite: row.severity_index || 0,
        resume: row.summary || '',
        date: row.incident_date || row.publication_date || '',
        sources: row.source_url || '',
        ...row,
        lat: row.latitude ? parseFloat(row.latitude) : 0,
        lng: row.longitude ? parseFloat(row.longitude) : 0,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dégâts des eaux:', error);
    return [];
  }
}

/**
 * Récupère les derniers articles stockés en base (toutes catégories confondues)
 */
export async function getLatestArticlesFromDatabase(limit = 15): Promise<LiveArticle[]> {
  try {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 15;

    const [incendies, catastrophes, inondations, degats] = await Promise.all([
      getIncendiesRaw(),
      getCatastropheNaturelles(),
      getInondations(),
      getDegatsDesEaux(),
    ]);

    const merged = [...incendies, ...catastrophes, ...inondations, ...degats]
      .map((row, index) => {
        const link = row.source_url || row.sources || '';
        const pubDate = row.publication_date || row.incident_date || row.date || row.created_at || '';
        const sortTs = pubDate ? new Date(pubDate).getTime() : 0;

        return {
          id: `${row.category || 'article'}-${row.id || index}`,
          title: row.title || row.resume || 'Article sans titre',
          link,
          source: row.source_name || row.category || 'Source inconnue',
          pubDate,
          category: row.category || 'incident',
          sortTs: Number.isNaN(sortTs) ? 0 : sortTs,
        };
      })
      .sort((a, b) => b.sortTs - a.sortTs)
      .slice(0, safeLimit)
      .map(({ sortTs, ...article }) => article);

    return merged;
  } catch (error) {
    console.error('Erreur lors de la récupération des derniers articles DB:', error);
    return [];
  }
}

/**
 * Supprime les articles dont created_at est plus ancien que N heures
 */
export async function purgeArticlesOlderThanHours(hours = 48): Promise<CleanupSummary> {
  const safeHours = Number.isFinite(hours) ? Math.min(Math.max(Math.floor(hours), 1), 24 * 365) : 48;

  const tables = [
    'log_incendies',
    'log_catastrophenaturelles',
    'log_inondation',
    'log_degatsdeseaux',
    'fallback',
    'log_rejetcatastrophenaturelles',
    'log_rejetdegatsdeseaux',
    'log_rejetinondations',
    'log_rejetsincendies',
    // Variantes connues potentielles
    'log_rejetincendie',
    'log_rejetinondation',
  ];

  const tableExists = async (table: string): Promise<boolean> => {
    const result = await pool.query(
      `SELECT to_regclass($1) AS regclass_name`,
      [`public.${table}`]
    );
    return !!result.rows[0]?.regclass_name;
  };

  const hasCreatedAtColumn = async (table: string): Promise<boolean> => {
    const result = await pool.query(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = $1
           AND column_name = 'created_at'
       ) AS has_column`,
      [table]
    );
    return !!result.rows[0]?.has_column;
  };

  const deleteFromTable = async (table: string): Promise<number> => {
    const result = await pool.query(
      `DELETE FROM ${table}
       WHERE created_at IS NOT NULL
         AND created_at < NOW() - ($1::int * INTERVAL '1 hour')`,
      [safeHours]
    );
    return result.rowCount || 0;
  };

  try {
    const deleted: Record<string, number> = {};
    let totalDeleted = 0;

    for (const table of tables) {
      const exists = await tableExists(table);
      if (!exists) {
        deleted[table] = 0;
        continue;
      }

      const hasCreatedAt = await hasCreatedAtColumn(table);
      if (!hasCreatedAt) {
        deleted[table] = 0;
        continue;
      }

      const count = await deleteFromTable(table);
      deleted[table] = count;
      totalDeleted += count;
    }

    return {
      olderThanHours: safeHours,
      deleted,
      totalDeleted,
    };
  } catch (error) {
    console.error('Erreur pendant la purge des articles:', error);
    throw error;
  }
}









/**
 * Ferme le pool de connexions (utile pour les tests)
 */
export async function closePool() {
  await pool.end();
}

export default pool;
