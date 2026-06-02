const { AppError } = require('../errors/AppError');
const { verifyToken } = require('../utils/jwt');

function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new AppError('No autenticado', 401));
  }

  try {
    const payload = verifyToken(token);
    req.user = payload; // { sub, role, email, iat, exp }
    return next();
  } catch {
    return next(new AppError('Token inválido o expirado', 401));
  }
}

function authorizeRoles(...roles) {
  return function authorize(req, _res, next) {
    const role = req.user?.role;
    if (!role) return next(new AppError('No autenticado', 401));
    if (!roles.includes(role)) return next(new AppError('No autorizado', 403));
    return next();
  };
}

module.exports = { authenticate, authorizeRoles };

