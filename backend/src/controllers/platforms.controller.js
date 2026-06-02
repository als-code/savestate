const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/http');
const platformsService = require('../services/platforms.service');

const listPlatforms = asyncHandler(async (_req, res) => {
  const platforms = await platformsService.listPlatforms();
  return ok(res, platforms);
});

module.exports = { listPlatforms };

