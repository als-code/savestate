const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validateRequest');
const gameReviewsController = require('../controllers/gameReviews.controller');

const router = express.Router();

// Publico o autenticado (aquí lo dejamos público)
router.get(
  '/games/:id/reviews',
  [param('id').isInt({ min: 1 }).withMessage('id debe ser entero >= 1')],
  validateRequest,
  gameReviewsController.listByGameId
);

// Autenticado: crear reseña
router.post(
  '/game-reviews',
  authenticate,
  [
    body('game_id').isInt({ min: 1 }).withMessage('game_id debe ser entero >= 1'),
    body('rating').isInt({ min: 1, max: 10 }).withMessage('rating debe estar entre 1 y 10'),
    body('comment').optional({ nullable: true }).isString().isLength({ max: 5000 }).withMessage('comment máximo 5000 caracteres'),
  ],
  validateRequest,
  gameReviewsController.createReview
);

// Autenticado: editar reseña propia (por game_id del body)
router.put(
  '/game-reviews',
  authenticate,
  [
    body('game_id').isInt({ min: 1 }).withMessage('game_id debe ser entero >= 1'),
    body('rating').isInt({ min: 1, max: 10 }).withMessage('rating debe estar entre 1 y 10'),
    body('comment').optional({ nullable: true }).isString().isLength({ max: 5000 }).withMessage('comment máximo 5000 caracteres'),
  ],
  validateRequest,
  gameReviewsController.updateOwnReview
);

module.exports = { gameReviewsRouter: router };

