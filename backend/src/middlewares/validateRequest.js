const { validationResult } = require('express-validator');
const { AppError } = require('../errors/AppError');

function validateRequest(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  return next(new AppError('Datos inválidos', 400, { details: errors }));
}

module.exports = { validateRequest };

