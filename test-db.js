// Script de test pour vérifier la connexion PostgreSQL
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    console.log('🔄 Tentative de connexion à PostgreSQL...');
    console.log('Host:', process.env.POSTGRES_HOST);
    console.log('Port:', process.env.POSTGRES_PORT);
    console.log('Database:', process.env.POSTGRES_DATABASE);
    console.log('User:', process.env.POSTGRES_USER);
    
    // Test de connexion
    const client = await pool.connect();
    console.log('✅ Connexion réussie !');
    
    // Vérifier si la table existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'log_incendies'
      );
    `);
    console.log('\n📋 Table log_incendies existe:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Compter les lignes
      const count = await client.query('SELECT COUNT(*) FROM log_incendies');
      console.log('📊 Nombre total de lignes:', count.rows[0].count);
      
      // Compter les lignes avec coordonnées
      const countWithGPS = await client.query(`
        SELECT COUNT(*) FROM log_incendies 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      `);
      console.log('📍 Nombre avec coordonnées GPS:', countWithGPS.rows[0].count);
      
      // Afficher les 3 premières lignes
      const sample = await client.query('SELECT * FROM log_incendies LIMIT 3');
      console.log('\n📝 Exemple de données:');
      console.log(JSON.stringify(sample.rows, null, 2));
      
      // Lister les colonnes
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'log_incendies'
        ORDER BY ordinal_position
      `);
      console.log('\n📋 Colonnes de la table:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
    
    client.release();
    await pool.end();
    console.log('\n✅ Test terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  }
}

testConnection();
