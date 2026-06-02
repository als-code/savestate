const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/http');
const gameReviewsService = require('../services/gameReviews.service');

const createReview = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const created = await gameReviewsService.createReview(userId, req.body);
  return ok(res, created, 201);
});

const updateOwnReview = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const updated = await gameReviewsService.updateOwnReview(userId, req.body);
  return ok(res, updated);
});

const listByGameId = asyncHandler(async (req, res) => {
  const gameId = Number(req.params.id);
  const items = await gameReviewsService.listReviewsByGameId(gameId);
  return ok(res, items);
});

module.exports = {
  createReview,
  updateOwnReview,
  listByGameId,
};

