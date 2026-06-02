const express = require('express');
const platformsController = require('../controllers/platforms.controller');

const router = express.Router();

// Catálogo (público)
router.get('/', platformsController.listPlatforms);

module.exports = { platformsRouter: router };

