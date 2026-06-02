const express = require('express');
const genresController = require('../controllers/genres.controller');

const router = express.Router();

// Catálogo (público)
router.get('/', genresController.listGenres);

module.exports = { genresRouter: router };

