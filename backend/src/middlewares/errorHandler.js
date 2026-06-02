const { AppError } = require('../errors/AppError');
const { fail } = require('../utils/http');

function mapPgError(err) {
  if (!err || !err.code) return null;

  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (err.code === '23505') return new AppError('Conflicto: valor duplicado', 409, { code: err.code });
  if (err.code === '23503') return new AppError('Dato inválido: referencia no existe', 400, { code: err.code });
  return null;
}

function mapMulterError(err) {
  if (!err || err.name !== 'MulterError') return null;
  if (err.code === 'LIMIT_FILE_SIZE') return new AppError('Archivo demasiado grande (máx 5MB)', 400);
  return new AppError('Error subiendo archivo', 400, { code: err.code });
}

function errorHandler(err, _req, res, _next) {
  const mappedPg = mapPgError(err);
  const mappedMulter = mapMulterError(err);
  const safeErr = mappedPg || mappedMulter || err;

  const statusCode = Number(safeErr.statusCode) || 500;
  const message = safeErr.message || 'Error interno';

  const isProd = process.env.NODE_ENV === 'production';
  const details = !isProd
    ? {
        name: safeErr.name,
        code: safeErr.code,
        stack: safeErr.stack,
        details: safeErr.details,
      }
    : undefined;

  return fail(res, statusCode, message, details ? [details] : undefined);
}

module.exports = { errorHandler };

