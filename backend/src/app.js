require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const pool = require('./config/database');
const logger = require('./config/logger');

const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const clientRoutes   = require('./routes/clients');
const saleRoutes     = require('./routes/sales');
const reportRoutes   = require('./routes/reports');
const userRoutes     = require('./routes/users');
const evalRoutes     = require('./routes/eval');

const app = express();
app.set('trust proxy', 1);

// Leemos las URLs permitidas y nos aseguramos de quitarles espacios y barras '/' al final
const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : [];

if (!frontendUrls.length) {
  throw new Error('FRONTEND_URL debe estar definida en el archivo .env para habilitar CORS restringido.');
}

const corsOptions = {
  origin: (origin, callback) => {
    // Si no hay origin (como en peticiones server-to-server), lo permitimos
    if (!origin) return callback(null, true);
    
    // Limpiamos la barra final del origen entrante por si acaso
    const sanitizedOrigin = origin.trim().replace(/\/$/, '');

    // 1. Verificamos si el origen está en nuestra lista de permitidos del .env
    if (frontendUrls.includes(sanitizedOrigin)) {
      return callback(null, true);
    }
    
    // 2. COMODÍN DE SEGURIDAD PARA AZURE (Evita bloqueos por strings estrictos)
    if (sanitizedOrigin.includes('frontend-grupo7') && sanitizedOrigin.endsWith('.azurewebsites.net')) {
      return callback(null, true);
    }
    
    // 3. Fallback de seguridad: Si coincide con localhost en desarrollo
    if (process.env.NODE_ENV !== 'production' && sanitizedOrigin.startsWith('http://localhost')) {
      return callback(null, true);
    }

    logger.error('cors_unauthorized', { originBlocked: origin });
    return callback(new Error('CORS no autorizado'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200 // Responde OK (200) a las peticiones OPTIONS preflight
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta nuevamente más tarde.' },
});

// Configuración de Helmet adaptada para no interferir con la comunicación del API en producción
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Evita que bloquee las llamadas asíncronas de Next.js
}));

app.use(cors(corsOptions)); // Aplicación del CORS corregido y flexible
app.use(apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info('request_received', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  next();
});

app.get('/health', async (_req, res) => {
  const health = {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: 'UNKNOWN',
  };

  try {
    await pool.query('SELECT 1');
    health.db = 'UP';
    return res.status(200).json(health);
  } catch (err) {
    logger.error('health_check_failed', {
      message: err.message,
      stack: err.stack,
    });
    health.status = 'DEGRADED';
    health.db = 'DOWN';
    health.error = err.message;
    return res.status(503).json(health);
  }
});

app.use('/api/auth',       authRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/clients',    clientRoutes);
app.use('/api/sales',      saleRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/eval',       evalRoutes);

app.use((err, _req, res, _next) => {
  logger.error('unhandled_error', {
    message: err.message,
    stack: err.stack,
  });
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;
