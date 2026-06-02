const express = require('express');
const { body } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { validateRequest } = require('../middlewares/validateRequest');
const { ok } = require('../utils/http');
const { query } = require('../config/db');

const router = express.Router();

// Ruta de prueba para validar request + ver errores PG de UNIQUE (23505)
router.post(
  '/dev/users',
  [
    body('email').isEmail().withMessage('email debe ser válido'),
    body('display_name').isLength({ min: 2, max: 40 }).withMessage('display_name 2–40 chars'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, display_name } = req.body;

    const result = await query(
      'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, display_name, role',
      [email, 'dev_hash', display_name, 'usuario']
    );

    return ok(res, result.rows[0], 201);
  })
);

module.exports = { devRouter: router };

