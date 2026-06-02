const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validateRequest');
const gamesController = require('../controllers/games.controller');
const { uploadCover } = require('../middlewares/uploadCover');

const router = express.Router();

// Catálogo (público)
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit 1–100'),
    query('offset').optional().isInt({ min: 0, max: 100000 }).withMessage('offset 0–100000'),
    query('q').optional({ nullable: true }).isString().isLength({ min: 1, max: 80 }).withMessage('q 1–80 chars'),
  ],
  validateRequest,
  gamesController.listGames
);
router.get('/:id', gamesController.getGameById);

// Admin (protegido)
router.post(
  '/',
  authenticate,
  authorizeRoles('admin'),
  [
    body('title').isLength({ min: 1, max: 150 }).withMessage('title 1–150 caracteres'),
    body('platform_id').isInt({ min: 1 }).withMessage('platform_id debe ser un entero >= 1'),
    body('genre_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('genre_id entero >= 1'),
    body('release_year')
      .optional({ nullable: true })
      .isInt({ min: 1970, max: 2100 })
      .withMessage('release_year entre 1970 y 2100'),
    body('description').optional({ nullable: true }).isString().withMessage('description debe ser texto'),
    body('cover').optional({ nullable: true }).isString().withMessage('cover debe ser texto'),
  ],
  validateRequest,
  gamesController.createGame
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  [
    param('id').isInt({ min: 1 }).withMessage('id debe ser entero >= 1'),
    body('title').isLength({ min: 1, max: 150 }).withMessage('title 1–150 caracteres'),
    body('platform_id').isInt({ min: 1 }).withMessage('platform_id debe ser un entero >= 1'),
    body('genre_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('genre_id entero >= 1'),
    body('release_year')
      .optional({ nullable: true })
      .isInt({ min: 1970, max: 2100 })
      .withMessage('release_year entre 1970 y 2100'),
    body('description').optional({ nullable: true }).isString().withMessage('description debe ser texto'),
    body('cover').optional({ nullable: true }).isString().withMessage('cover debe ser texto'),
  ],
  validateRequest,
  gamesController.updateGame
);

router.patch(
  '/:id/cover',
  authenticate,
  authorizeRoles('admin'),
  [param('id').isInt({ min: 1 }).withMessage('id debe ser entero >= 1')],
  validateRequest,
  uploadCover.single('cover'),
  gamesController.uploadCover
);

router.delete('/:id', authenticate, authorizeRoles('admin'), gamesController.deleteGame);

module.exports = { gamesRouter: router };

