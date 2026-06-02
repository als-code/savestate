const { query } = require('../config/db');

async function listGenres() {
  const result = await query(
    `SELECT id, name
     FROM genres
     ORDER BY name ASC`
  );
  return result.rows;
}

module.exports = { listGenres };

