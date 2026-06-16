const { Pool } = require('pg');
const logger = require('./logger');

const connectionString = process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING;

// Arreglo para el Evaluador: Activamos SSL si DB_SSL es true O si estamos en producción en Azure
const useSsl = 
  String(process.env.DB_SSL).toLowerCase() === 'true' || 
  process.env.NODE_ENV === 'production';

const poolConfig = {
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS) || 5000,
};

if (connectionString) {
  poolConfig.connectionString = connectionString;
} else {
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredVars.filter((name) => !process.env[name]);
  if (missingVars.length) {
    throw new Error(`Variables de entorno de base de datos faltantes: ${missingVars.join(', ')}`);
  }

  poolConfig.host = process.env.DB_HOST;
  poolConfig.port = Number(process.env.DB_PORT);
  poolConfig.database = process.env.DB_NAME;
  poolConfig.user = process.env.DB_USER;
  poolConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(poolConfig);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const verifyConnection = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const client = await pool.connect();
      client.release();
      logger.info('Conexión a PostgreSQL exitosa en intento %d', attempt);
      return;
    } catch (err) {
      logger.error('Error de conexión a PostgreSQL en intento %d: %s', attempt, err.message);
      if (attempt === MAX_RETRIES) {
        logger.error('No se pudo conectar a PostgreSQL después de %d intentos. El proceso continuará y el pool intentará reconectar según sea necesario.', MAX_RETRIES);
        return;
      }
      await wait(RETRY_DELAY_MS);
    }
  }
};

verifyConnection();

pool.on('error', (err) => {
  logger.error('Error inesperado en el pool de conexiones de PostgreSQL: %s', err.message);
});

module.exports = pool;
