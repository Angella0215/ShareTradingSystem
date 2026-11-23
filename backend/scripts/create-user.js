require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const ask = q => new Promise(resolve => rl.question(q, resolve));
async function main() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('USER:PASSWORD')) throw new Error('Configure backend/.env and run db:setup first.');
  const role = (await ask('Role (admin/broker/investor): ')).trim().toLowerCase();
  if (!['admin','broker','investor'].includes(role)) throw new Error('Invalid role');
  const fullname = (await ask('Full name: ')).trim();
  const email = (await ask('Email: ')).trim().toLowerCase();
  const password = await ask('Password (min 10 chars; use terminal privately): ');
  if (!fullname || !/^\S+@\S+\.\S+$/.test(email) || password.length < 10) throw new Error('Enter valid name, email and password (10+ characters).');
  const hash = await bcrypt.hash(password, 12);
  await pool.query('INSERT INTO users(fullname,email,password,role,status) VALUES($1,$2,$3,$4,$5) ON CONFLICT(email) DO UPDATE SET fullname=EXCLUDED.fullname, password=EXCLUDED.password, role=EXCLUDED.role, status=EXCLUDED.status', [fullname,email,hash,role,'approved']);
  console.log('Account saved. Sign in using your entered email and password.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(async()=>{rl.close();await pool.end()});
