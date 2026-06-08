const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { login, me, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.' },
});

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Email inválido.'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    validate,
  ],
  login
);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

module.exports = router;
