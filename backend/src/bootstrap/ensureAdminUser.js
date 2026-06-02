const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_DISPLAY_NAME || 'Admin';

  if (!email || !password) return;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows[0]) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await query(
    'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4)',
    [email, passwordHash, displayName, 'admin']
  );

  console.log(`[bootstrap] Admin user created for ${email}`);
}

module.exports = { ensureAdminUser };

