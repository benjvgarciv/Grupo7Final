require('dotenv').config();
const appInsights = require('applicationinsights');
const { loadSecrets } = require('./config/keyvault');
const logger = require('./config/logger');

const start = async () => {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights
      .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
      .setAutoCollectConsole(false, false)
      .setAutoCollectDependencies(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectRequests(true)
      .setAutoDependencyCorrelation(true)
      .start();

    appInsights.defaultClient.commonProperties = {
      environment: process.env.NODE_ENV || 'development',
    };
    logger.info('Application Insights habilitado.');
  } else {
    logger.info('Application Insights no está configurado, se omite la inicialización.');
  }

  await loadSecrets();

  const app = require('./app');
  const PORT = process.env.PORT || 3001;

  const server = app.listen(PORT, () => {
    logger.info('Servidor POS corriendo en http://localhost:%d', PORT);
    logger.info('Ambiente: %s', process.env.NODE_ENV || 'development');
  });

  server.on('error', (err) => {
    logger.error('Error al iniciar el servidor: %s', err.message);
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error('Error iniciando la aplicación:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
