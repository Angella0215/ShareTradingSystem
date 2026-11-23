const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
// Mock pg for testing only the statement compiler; no Neon login is necessary.
const realLoad = Module._load;
Module._load = function(name, parent, main) {
 if (name === 'pg') return { Pool: class { query() {} } };
 if (name === 'dotenv') return { config() {} };
 return realLoad.apply(this, arguments);
};
const db = require('../config/db');
Module._load = realLoad;
test('converts positional parameters without altering question marks in SQL strings', () => {
 const q = db.compile("SELECT * FROM users WHERE email = ? AND role = 'broker?'", ['a@example.com']);
 assert.equal(q.text, "SELECT * FROM users WHERE email = $1 AND role = 'broker?'");
 assert.deepEqual(q.values, ['a@example.com']);
});
test('converts MariaDB dates into PostgreSQL expressions', () => {
 const q = db.compile("SELECT DATE_FORMAT(d.record_date, '%Y-%m-%d') AS dt FROM dividends d WHERE d.record_date <= CURDATE() AND d.record_date > DATE_ADD(?, INTERVAL 1 DAY)", ['2026-10-01']);
 assert.match(q.text, /TO_CHAR\(d\.record_date, 'YYYY-MM-DD'\)/);
 assert.match(q.text, /CURRENT_DATE/);
 assert.match(q.text, /\(\$1::date \+ INTERVAL '1 day'\)/);
});
test('INSERT returns correct PostgreSQL identity for historic controllers', () => {
 const q = db.compile('INSERT INTO users(fullname,email) VALUES (?,?)',['Alice','a@example.com']);
 assert.match(q.text, /VALUES \(\$1,\$2\) RETURNING "user_id"$/);
});
test('bulk payout insert expands every row into parameters', () => {
 const q=db.compile('INSERT INTO dividend_payouts(dividend_id, investor_id) VALUES ?', [[[2,3],[2,4]]]);
 assert.match(q.text, /VALUES \(\$1, \$2\), \(\$3, \$4\) RETURNING "payout_id"/);
 assert.deepEqual(q.values,[2,3,2,4]);
});
test('mismatch in number of placeholders is rejected', () => {
 assert.throws(()=>db.compile('SELECT ? + ?', [1]),/parameter count mismatch/);
});
