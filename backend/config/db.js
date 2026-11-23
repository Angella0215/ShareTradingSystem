// PostgreSQL adapter preserving the original controllers' mysql2 result interface.
// SQL and parameters are converted safely, and INSERT returns the generated identity.
require('dotenv').config();
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  max: 10,
  ssl: connectionString && !/localhost|127\.0\.0\.1/.test(connectionString) ? { rejectUnauthorized: true } : undefined,
  connectionTimeoutMillis: 12000,
  idleTimeoutMillis: 30000,
});
const ids = {
  users: 'user_id', investors: 'investor_id', brokers: 'broker_id', companies: 'company_id',
  buy_orders: 'order_id', sell_orders: 'sell_id', portfolio: 'portfolio_id',
  transactions: 'transaction_id', messages: 'message_id', share_prices: 'price_id',
  audit_log: 'log_id', dividends: 'dividend_id', dividend_payouts: 'payout_id'
};
function compile(sql, parameters = []) {
  let values = parameters;
  let query = sql
    .replace(/DATE_FORMAT\((\w+\.\w+),\s*'%Y-%m-%d'\)/gi, 'TO_CHAR($1, \'YYYY-MM-DD\')')
    .replace(/\bCURDATE\(\)/gi, 'CURRENT_DATE')
    .replace(/DATE_ADD\(\?,\s*INTERVAL\s+1\s+DAY\)/gi, "(?::date + INTERVAL '1 day')");
  // Legacy mysql2 bulk INSERT INTO ... VALUES ? syntax, used for dividend payouts.
  if (/VALUES\s*\?/i.test(query) && Array.isArray(values[0]) && Array.isArray(values[0][0])) {
    const rows = values[0];
    if (!rows.length) throw new Error('No rows to insert');
    const count = rows[0].length;
    query = query.replace(/VALUES\s*\?/i, 'VALUES ' + rows.map(() => '(' + new Array(count).fill('?').join(', ') + ')').join(', '));
    values = rows.flat();
  }
  // Only replace placeholders outside SQL string literals; don't interpolate values.
  let index = 0, single = false, double = false, converted = '';
  for (let i = 0; i < query.length; i++) {
    const c = query[i];
    if (c === "'" && !double) { if (single && query[i + 1] === "'") { converted += "''"; i++; continue; } single = !single; }
    else if (c === '"' && !single) double = !double;
    if (c === '?' && !single && !double) converted += '$' + (++index);
    else converted += c;
  }
  if (index !== values.length) throw new Error('SQL parameter count mismatch: expected ' + index + ', received ' + values.length);
  const inserted = /^\s*INSERT\s+INTO\s+"?(\w+)"?/i.exec(converted);
  const id = inserted && ids[inserted[1].toLowerCase()];
  if (id && !/\bRETURNING\b/i.test(converted)) converted += ` RETURNING "${id}"`;
  return { text: converted, values: values.map(x => x === undefined ? null : x), inserted: Boolean(inserted), id };
}
async function run(client, sql, parameters = []) {
  const compiled = compile(sql, parameters);
  const result = await client.query(compiled.text, compiled.values);
  if (/^\s*SELECT\b|^\s*WITH\b/i.test(sql)) return [result.rows, result.fields];
  if (compiled.inserted) return [{ insertId: compiled.id ? result.rows[0]?.[compiled.id] : null, affectedRows: result.rowCount }, result.fields];
  return [{ affectedRows: result.rowCount, changedRows: result.rowCount }, result.fields];
}
module.exports = {
  query: (sql, params) => run(pool, sql, params),
  // MySQL transaction-method compatibility, keeping each operation on one PG client.
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: (sql, params) => run(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release()
    };
  },
  pool, compile
};
