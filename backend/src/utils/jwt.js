const jwt = require('jsonwebtoken');
const { AppError } = require('../errors/AppError');

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET no está configurado', 500);

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET no está configurado', 500);
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };

