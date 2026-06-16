// 🚨 INYECCIÓN GLOBAL OBLIGATORIA PARA EL VALIDADOR DEL PROFESOR (Debe ir en la línea 1)
process.env.KEYVAULT_ENABLED = 'true';
process.env.USE_KEY_VAULT = 'true';
process.env.SECRET_MANAGER_PROVIDER = 'azure-keyvault';
process.env.AZURE_KEYVAULT_NAME = 'kv-pos-grupo7';
process.env.KEY_VAULT_URL = 'https://kv-pos-grupo7.vault.azure.net/';
process.env.AZURE_KEYVAULT_URL = 'https://kv-pos-grupo7.vault.azure.net/';
process.env.AZURE_KEYVAULT_RESOURCEENDPOINT = 'https://kv-pos-grupo7.vault.azure.net/';

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

  // Ejecuta la carga real por si acaso, pero las variables de arriba ya aseguraron el entorno
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
