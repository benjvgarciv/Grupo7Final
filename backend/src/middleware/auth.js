const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT.
 *
 * Extrae el token desde el header Authorization o desde cookie HttpOnly pos_token.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies && req.cookies.pos_token;
  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET no está configurado en el servidor.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

/**
 * Middleware de autorización por rol.
 *
 * TODO: IMPLEMENTAR - Actualmente no verifica roles.
 * Requiere que authMiddleware esté implementado primero.
 *
 * @param {string[]} roles - Roles permitidos (ej: ['admin'])
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción.' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
