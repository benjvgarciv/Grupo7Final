const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');
const logger = require('./logger');

const vaultUrl = process.env.KEY_VAULT_URL ||
  (process.env.KEY_VAULT_NAME ? `https://${process.env.KEY_VAULT_NAME}.vault.azure.net` : undefined);

const secretNames = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'AZURE_STORAGE_CONNECTION_STRING',
  'AZURE_STORAGE_ACCOUNT_NAME',
  'AZURE_STORAGE_ACCOUNT_KEY',
];

async function loadSecrets() {
  if (!vaultUrl) {
    logger.warn('Azure Key Vault no está configurado. Usando variables locales .env.');
    return;
  }

  try {
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(vaultUrl, credential);

    logger.info('Iniciando carga de secretos desde Azure Key Vault: %s', vaultUrl);

    for (const secretName of secretNames) {
      try {
        const secret = await client.getSecret(secretName);
        if (secret && secret.value) {
          process.env[secretName] = secret.value;
          logger.info('Secreto cargado desde Key Vault: %s', secretName);
        }
      } catch (innerErr) {
        if (innerErr.statusCode === 404) {
          logger.debug('Secreto no encontrado en Key Vault: %s', secretName);
        } else {
          throw innerErr;
        }
      }
    }

    logger.info('Carga de secretos desde Azure Key Vault completada.');
  } catch (err) {
    logger.warn(
      'No se pudo recuperar secretos desde Azure Key Vault (%s). Usando .env local. Error: %s',
      vaultUrl,
      err.message
    );
  }
}

module.exports = { loadSecrets };
