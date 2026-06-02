const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/http');
const gamesService = require('../services/games.service');

const listGames = asyncHandler(async (req, res) => {
  const { limit, offset, q } = req.query;
  const games = await gamesService.listGames({
    limit: limit != null ? Number(limit) : undefined,
    offset: offset != null ? Number(offset) : undefined,
    q: q != null ? String(q) : undefined,
  });
  return ok(res, games);
});

const getGameById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const game = await gamesService.getGameById(Number(id));
  return ok(res, game);
});

const createGame = asyncHandler(async (req, res) => {
  const game = await gamesService.createGame(req.body);
  return ok(res, game, 201);
});

const updateGame = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const game = await gamesService.updateGame(Number(id), req.body);
  return ok(res, game);
});

const deleteGame = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await gamesService.deleteGame(Number(id));
  return ok(res, result);
});

const uploadCover = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) return ok(res, await gamesService.getGameById(Number(id)));

  const filename = req.file.filename;
  const game = await gamesService.updateGameCover(Number(id), filename);
  return ok(res, game);
});

module.exports = {
  listGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  uploadCover,
};

