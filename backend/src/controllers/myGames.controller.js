const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/http');
const myGamesService = require('../services/myGames.service');

const listMyGames = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const items = await myGamesService.listMyGames(userId);
  return ok(res, items);
});

const addMyGame = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const gameId = Number(req.params.gameId);
  const item = await myGamesService.addMyGame(userId, gameId);
  return ok(res, item, 201);
});

const getMyGame = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const gameId = Number(req.params.gameId);
  const item = await myGamesService.getMyGameByKey(userId, gameId);
  return ok(res, item);
});

const patchMyGameStatus = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const gameId = Number(req.params.gameId);
  const item = await myGamesService.patchMyGameStatus(userId, gameId, req.body);
  return ok(res, item);
});

const removeMyGame = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const gameId = Number(req.params.gameId);
  const result = await myGamesService.removeMyGame(userId, gameId);
  return ok(res, result);
});

module.exports = {
  listMyGames,
  addMyGame,
  getMyGame,
  patchMyGameStatus,
  removeMyGame,
};

