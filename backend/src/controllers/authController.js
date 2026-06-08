const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * POST /api/auth/login
 * TODO: Completar implementación de autenticación.
 * Actualmente devuelve un token de prueba sin verificar roles ni expiración real.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // TODO: Validar que email y password no estén vacíos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    const result = await pool.query(
      `SELECT u.*, r.nombre as rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.email = $1 AND u.activo = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado en el archivo .env');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    const parseCookieMaxAge = (value) => {
      const match = /^([0-9]+)([smhd])$/.exec(value || '8h');
      if (!match) return 1000 * 60 * 60 * 8;
      const amount = Number(match[1]);
      const units = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
      return amount * (units[match[2]] || units.h);
    };

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: parseCookieMaxAge(expiresIn),
    };

    res.cookie('pos_token', token, cookieOptions);
    res.json({ user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/auth/me
 * TODO: Requiere que authMiddleware esté implementado correctamente.
 */
const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, r.nombre as rol
       FROM usuarios u JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logout = async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };
  res.clearCookie('pos_token', cookieOptions);
  res.json({ message: 'Sesión cerrada correctamente.' });
};

module.exports = { login, me, logout };
