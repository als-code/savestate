require('dotenv').config();

const app = require('./app');
const { ensureAdminUser } = require('./bootstrap/ensureAdminUser');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', async () => {
  try {
    await ensureAdminUser();
  } catch (err) {
    console.error('[bootstrap] Failed to ensure admin user', err);
  }
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});
