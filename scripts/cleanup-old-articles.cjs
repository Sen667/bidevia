require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const DEFAULT_HOURS = 48;

function parseHoursArg() {
  const arg = process.argv.find((value) => value.startsWith('--hours='));
  if (!arg) return DEFAULT_HOURS;
  const value = Number.parseInt(arg.split('=')[1], 10);
  if (!Number.isFinite(value) || value < 1) return DEFAULT_HOURS;
  return value;
}

async function purgeOldArticles() {
  const hours = parseHoursArg();
  const thresholdHours = Math.min(Math.max(hours, 1), 24 * 365);

  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  const deleteQuery = (tableName) => `
    DELETE FROM ${tableName}
    WHERE created_at IS NOT NULL
      AND created_at < NOW() - ($1::int * INTERVAL '1 hour')
  `;

  const tableExistsQuery = `
    SELECT to_regclass($1) AS regclass_name
  `;

  const hasCreatedAtQuery = `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = 'created_at'
    ) AS has_column
  `;

  try {
    const client = await pool.connect();
    console.log(`Purging rows older than ${thresholdHours}h based on created_at...`);

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
      // Variantes connues
      'log_rejetincendie',
      'log_rejetinondation',
    ];

    let totalDeleted = 0;

    for (const table of tables) {
      const existsResult = await client.query(tableExistsQuery, [`public.${table}`]);
      if (!existsResult.rows[0]?.regclass_name) {
        console.log(`${table}: skipped (table not found)`);
        continue;
      }

      const hasCreatedAtResult = await client.query(hasCreatedAtQuery, [table]);
      if (!hasCreatedAtResult.rows[0]?.has_column) {
        console.log(`${table}: skipped (created_at column not found)`);
        continue;
      }

      const result = await client.query(deleteQuery(table), [thresholdHours]);
      const deleted = result.rowCount || 0;
      totalDeleted += deleted;
      console.log(`${table}: ${deleted} row(s) deleted`);
    }

    client.release();
    console.log(`Done. Total deleted: ${totalDeleted}`);
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

purgeOldArticles();
