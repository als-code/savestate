const { query } = require('../config/db');
const { AppError } = require('../errors/AppError');

async function listReviewsByGameId(gameId) {
  const result = await query(
    `SELECT
      r.id,
      r.user_id,
      r.game_id,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at,
      u.email AS author_email,
      u.display_name AS author_name
    FROM game_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.game_id = $1
    ORDER BY r.created_at DESC`,
    [gameId]
  );

  return result.rows;
}

async function createReview(userId, payload) {
  const result = await query(
    `INSERT INTO game_reviews (user_id, game_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [userId, payload.game_id, payload.rating, payload.comment ?? null]
  );

  const id = result.rows[0].id;
  const created = await query(
    `SELECT
      r.id,
      r.user_id,
      r.game_id,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at
     FROM game_reviews r
     WHERE r.id = $1`,
    [id]
  );

  return created.rows[0];
}

async function updateOwnReview(userId, payload) {
  const result = await query(
    `UPDATE game_reviews
     SET rating = $1,
         comment = $2,
         updated_at = NOW()
     WHERE user_id = $3 AND game_id = $4
     RETURNING id`,
    [payload.rating, payload.comment ?? null, userId, payload.game_id]
  );

  if (!result.rows.length) throw new AppError('Reseña no encontrada', 404);

  const id = result.rows[0].id;
  const updated = await query(
    `SELECT
      r.id,
      r.user_id,
      r.game_id,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at
     FROM game_reviews r
     WHERE r.id = $1`,
    [id]
  );

  return updated.rows[0];
}

module.exports = {
  listReviewsByGameId,
  createReview,
  updateOwnReview,
};

