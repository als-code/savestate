const { query } = require('../config/db');
const { AppError } = require('../errors/AppError');

async function listMyGames(userId) {
  const result = await query(
    `SELECT
      ug.id AS user_game_id,
      ug.user_id,
      ug.game_id,
      ug.owned,
      ug.status,
      ug.hours_played,
      ug.notes,
      ug.created_at,
      ug.updated_at,
      g.title,
      g.cover,
      g.release_year,
      g.platform_id,
      g.genre_id,
      p.slug AS platform_slug,
      p.name AS platform_name,
      gr.name AS genre_name
    FROM user_games ug
    INNER JOIN games g ON g.id = ug.game_id
    INNER JOIN platforms p ON g.platform_id = p.id
    LEFT JOIN genres gr ON g.genre_id = gr.id
    WHERE ug.user_id = $1
    ORDER BY ug.updated_at DESC`,
    [userId]
  );

  return result.rows;
}

async function getMyGameByKey(userId, gameId) {
  const result = await query(
    `SELECT
      ug.id AS user_game_id,
      ug.user_id,
      ug.game_id,
      ug.owned,
      ug.status,
      ug.hours_played,
      ug.notes,
      ug.created_at,
      ug.updated_at,
      g.title,
      g.cover,
      g.release_year,
      g.platform_id,
      g.genre_id,
      p.slug AS platform_slug,
      p.name AS platform_name,
      gr.name AS genre_name
    FROM user_games ug
    INNER JOIN games g ON g.id = ug.game_id
    INNER JOIN platforms p ON g.platform_id = p.id
    LEFT JOIN genres gr ON g.genre_id = gr.id
    WHERE ug.user_id = $1 AND ug.game_id = $2`,
    [userId, gameId]
  );

  const row = result.rows[0];
  if (!row) throw new AppError('No está en tu backlog', 404);
  return row;
}

async function addMyGame(userId, gameId) {
  await query(`INSERT INTO user_games (user_id, game_id) VALUES ($1, $2)`, [userId, gameId]);
  return getMyGameByKey(userId, gameId);
}

async function patchMyGameStatus(userId, gameId, payload) {
  const { status, hours_played, notes, owned } = payload;

  const result = await query(
    `UPDATE user_games
     SET owned = $1,
         status = $2,
         hours_played = $3,
         notes = $4,
         updated_at = NOW()
     WHERE user_id = $5 AND game_id = $6
     RETURNING id`,
    [Boolean(owned), status, hours_played, notes ?? null, userId, gameId]
  );

  if (!result.rows.length) throw new AppError('No está en tu backlog', 404);
  return getMyGameByKey(userId, gameId);
}

async function removeMyGame(userId, gameId) {
  const result = await query(
    `DELETE FROM user_games
     WHERE user_id = $1 AND game_id = $2
     RETURNING id`,
    [userId, gameId]
  );

  if (!result.rows.length) throw new AppError('No está en tu backlog', 404);
  return { deleted: true, game_id: gameId };
}

module.exports = {
  listMyGames,
  addMyGame,
  getMyGameByKey,
  patchMyGameStatus,
  removeMyGame,
};

