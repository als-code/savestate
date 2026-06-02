const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { query } = require('../config/db');
const { AppError } = require('../errors/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/http');
const { signToken } = require('../utils/jwt');
const { validateRequest } = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Registro cerrado en este proyecto: no exponemos /register en v1

router.post(
  '/auth/login',
  [
    body('email').isEmail().withMessage('email debe ser válido'),
    body('password').isLength({ min: 6 }).withMessage('password mínimo 6 caracteres'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, email, password_hash, display_name, role, is_active FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) throw new AppError('Credenciales inválidas', 401);
    if (!user.is_active) throw new AppError('Usuario desactivado', 403);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new AppError('Credenciales inválidas', 401);

    const token = signToken({ sub: user.id, role: user.role, email: user.email });

    return ok(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
    });
  })
);

router.get(
  '/auth/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const result = await query(
      'SELECT id, email, display_name, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    const user = result.rows[0];
    if (!user) throw new AppError('Usuario no encontrado', 404);
    if (!user.is_active) throw new AppError('Usuario desactivado', 403);
    return ok(res, { user });
  })
);

module.exports = { authRouter: router };

