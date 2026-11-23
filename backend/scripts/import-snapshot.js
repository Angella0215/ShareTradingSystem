require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/original-data.json'), 'utf8'));
// Historic rows come from the SQL export, NOT the potentially damaged .ibd tables.
const order = ['users', 'companies', 'investors', 'brokers', 'share_prices', 'portfolio',
  'buy_orders', 'sell_orders', 'transactions', 'messages'];
const pk = { users: 'user_id', companies: 'company_id', investors: 'investor_id', brokers: 'broker_id',
  share_prices: 'price_id', portfolio: 'portfolio_id', buy_orders: 'order_id', sell_orders: 'sell_id',
  transactions: 'transaction_id', messages: 'message_id' };
async function main() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('USER:PASSWORD')) throw new Error('Configure backend/.env DATABASE_URL first.');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const table of order) {
      const { columns, rows } = data[table];
      const cols = columns.map(c => '"' + c + '"').join(', ');
      const placeholders = columns.map((_, i) => '$' + (i + 1)).join(', ');
      let count = 0;
      for (const values of rows) {
        const r = await client.query(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
        count += r.rowCount;
      }
      // Align identity counters after explicit historic IDs.
      await client.query(`SELECT setval(pg_get_serial_sequence('${table}', '${pk[table]}'), COALESCE((SELECT MAX("${pk[table]}") FROM "${table}"), 1), (SELECT COUNT(*) > 0 FROM "${table}"))`);
      console.log(`${table}: ${count} imported, ${rows.length-count} already present`);
    }
    // Original schema lacked available_shares; reconstruct availability using historical holdings.
    await client.query(`UPDATE companies c SET available_shares = GREATEST(COALESCE(c.total_shares_issued,0) -
      COALESCE((SELECT SUM(p.shares_owned) FROM portfolio p WHERE p.company_id = c.company_id), 0), 0)
      WHERE c.available_shares = 0`);
    await client.query('COMMIT');
    console.log('Historical data restored from the project SQL dump.');
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); await pool.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
