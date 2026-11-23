require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
async function main() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('USER:PASSWORD')) throw new Error('Set the real DATABASE_URL in backend/.env first.');
  const sql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('PostgreSQL tables, relationships and indexes are ready. No old data was deleted.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
}
main().catch(e => { console.error(e.message); process.exit(1); });
