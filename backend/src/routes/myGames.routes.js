const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validateRequest');
const myGamesController = require('../controllers/myGames.controller');

const router = express.Router();

const allowedStatuses = ['pending', 'playing', 'tested', 'completed', 'abandoned'];

router.get('/', authenticate, myGamesController.listMyGames);

router.get(
  '/:gameId',
  authenticate,
  [param('gameId').isInt({ min: 1 }).withMessage('gameId debe ser entero >= 1')],
  validateRequest,
  myGamesController.getMyGame
);

router.post(
  '/:gameId',
  authenticate,
  [param('gameId').isInt({ min: 1 }).withMessage('gameId debe ser entero >= 1')],
  validateRequest,
  myGamesController.addMyGame
);

router.patch(
  '/:gameId/status',
  authenticate,
  [
    param('gameId').isInt({ min: 1 }).withMessage('gameId debe ser entero >= 1'),
    body('owned').optional().isBoolean().withMessage('owned debe ser boolean'),
    body('status').isIn(allowedStatuses).withMessage(`status debe ser uno de: ${allowedStatuses.join(', ')}`),
    body('hours_played')
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage('hours_played entero >= 0'),
    body('notes').optional({ nullable: true }).isString().isLength({ max: 5000 }).withMessage('notes máximo 5000 caracteres'),
  ],
  validateRequest,
  myGamesController.patchMyGameStatus
);

router.delete(
  '/:gameId',
  authenticate,
  [param('gameId').isInt({ min: 1 }).withMessage('gameId debe ser entero >= 1')],
  validateRequest,
  myGamesController.removeMyGame
);

module.exports = { myGamesRouter: router };

