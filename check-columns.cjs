require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: false,
});

async function checkColumns() {
  try {
    const client = await pool.connect();
    console.log('✅ Connecté à PostgreSQL\n');
    
    // Lister toutes les colonnes
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'log_incendies'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colonnes disponibles dans log_incendies:');
    columns.rows.forEach(col => {
      console.log(`  ✓ ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '- nullable' : ''}`);
    });
    
    // Compter les enregistrements
    const count = await client.query('SELECT COUNT(*) FROM log_incendies');
    console.log(`\n📊 Total d'enregistrements: ${count.rows[0].count}`);
    
    // Compter avec GPS
    const gpsCount = await client.query(
      'SELECT COUNT(*) FROM log_incendies WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
    );
    console.log(`📍 Avec coordonnées GPS: ${gpsCount.rows[0].count}`);
    
    // Afficher un exemple de données
    const sample = await client.query('SELECT * FROM log_incendies LIMIT 1');
    if (sample.rows.length > 0) {
      console.log('\n📝 Exemple de données:');
      console.log(JSON.stringify(sample.rows[0], null, 2));
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkColumns();
