const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/http');
const genresService = require('../services/genres.service');

const listGenres = asyncHandler(async (_req, res) => {
  const genres = await genresService.listGenres();
  return ok(res, genres);
});

module.exports = { listGenres };

