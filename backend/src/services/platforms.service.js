const { query } = require('../config/db');

async function listPlatforms() {
  const result = await query(
    `SELECT id, slug, name, sort_order
     FROM platforms
     ORDER BY sort_order ASC, name ASC`
  );
  return result.rows;
}

module.exports = { listPlatforms };

