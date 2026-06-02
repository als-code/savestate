const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || '';
const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  /supabase\.co|neon\.tech|sslmode=require/i.test(connectionString);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(useSsl && { ssl: { rejectUnauthorized: false } }),
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
