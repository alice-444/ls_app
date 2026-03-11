import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: './.env' });

const { Pool } = pg;

console.log('Testing connection to:', process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

try {
  const client = await pool.connect();
  console.log('Successfully connected!');
  const res = await client.query('SELECT NOW()');
  console.log('Query result:', res.rows[0]);
  client.release();
} catch (err) {
  console.error('Connection error:', err.message);
  console.error('Full error:', err);
} finally {
  await pool.end();
}
