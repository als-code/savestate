const { query } = require('../config/db');
const { AppError } = require('../errors/AppError');

async function listGames({ limit, offset, q } = {}) {
  const values = [];
  const where = [];

  if (q) {
    values.push(`%${q}%`);
    where.push(`g.title ILIKE $${values.length}`);
  }

  let sql = `SELECT
      g.*,
      gr.name AS genre_name,
      p.slug AS platform_slug,
      p.name AS platform_name
    FROM games g
    LEFT JOIN genres gr ON g.genre_id = gr.id
    INNER JOIN platforms p ON g.platform_id = p.id`;

  if (where.length) sql += `\n    WHERE ${where.join(' AND ')}`;
  sql += `\n    ORDER BY g.created_at DESC`;

  if (limit != null) {
    values.push(limit);
    sql += `\n    LIMIT $${values.length}`;
  }

  if (offset != null) {
    values.push(offset);
    sql += `\n    OFFSET $${values.length}`;
  }

  const result = await query(sql, values);
  return result.rows;
}

async function getGameById(id) {
  const result = await query(
    `SELECT
      g.*,
      gr.name AS genre_name,
      p.slug AS platform_slug,
      p.name AS platform_name
    FROM games g
    LEFT JOIN genres gr ON g.genre_id = gr.id
    INNER JOIN platforms p ON g.platform_id = p.id
    WHERE g.id = $1`,
    [id]
  );

  const game = result.rows[0];
  if (!game) throw new AppError('Juego no encontrado', 404);
  return game;
}

async function ensureGenreExists(genreId) {
  const result = await query('SELECT 1 FROM genres WHERE id = $1', [genreId]);
  if (!result.rows.length) {
    throw new AppError(`genre_id ${genreId} no existe`, 400);
  }
}

async function createGame(payload) {
  if (payload.genre_id != null) {
    await ensureGenreExists(payload.genre_id);
  }

  const result = await query(
    `INSERT INTO games (title, description, platform_id, genre_id, release_year, cover)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      payload.title,
      payload.description ?? null,
      payload.platform_id,
      payload.genre_id ?? null,
      payload.release_year ?? null,
      payload.cover ?? null,
    ]
  );

  const id = result.rows[0].id;
  return getGameById(id);
}

async function updateGame(id, payload) {
  if (payload.genre_id != null) {
    await ensureGenreExists(payload.genre_id);
  }
  const existingCoverResult = await query('SELECT cover FROM games WHERE id = $1', [id]);
  if (!existingCoverResult.rows.length) throw new AppError('Juego no encontrado', 404);
  const existingCover = existingCoverResult.rows[0].cover;
  const coverToSave = payload.cover === undefined ? existingCover : payload.cover;

  const result = await query(
    `UPDATE games
     SET
       title = $1,
       description = $2,
       platform_id = $3,
       genre_id = $4,
       release_year = $5,
       cover = $6,
       updated_at = NOW()
     WHERE id = $7
     RETURNING id`,
    [
      payload.title,
      payload.description ?? null,
      payload.platform_id,
      payload.genre_id ?? null,
      payload.release_year ?? null,
      coverToSave ?? null,
      id,
    ]
  );

  return getGameById(id);
}

async function deleteGame(id) {
  const result = await query('DELETE FROM games WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) throw new AppError('Juego no encontrado', 404);
  return { deleted: true, id };
}

async function updateGameCover(id, cover) {
  const result = await query(
    `UPDATE games
     SET cover = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [cover, id]
  );

  if (!result.rows.length) throw new AppError('Juego no encontrado', 404);
  return getGameById(id);
}

module.exports = {
  listGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  updateGameCover,
};

