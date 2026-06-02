const { AppError } = require('../errors/AppError');

function notFound(_req, _res, next) {
  next(new AppError('Ruta no encontrada', 404));
}

module.exports = { notFound };

