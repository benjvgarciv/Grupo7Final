const { createLogger, format, transports } = require('winston');

const env = process.env.NODE_ENV || 'development';
const level = process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug');

const logger = createLogger({
  level,
  defaultMeta: {
    service: 'pos-backend',
    environment: env,
  },
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console(),
  ],
  exitOnError: false,
});

module.exports = logger;
