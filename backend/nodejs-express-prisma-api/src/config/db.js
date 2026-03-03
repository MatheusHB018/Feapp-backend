const mongoose = require('mongoose');

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseNumber = (value, defaultValue) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI;
  const maxRetries = parseNumber(process.env.MONGO_CONNECT_RETRIES, 5);
  const baseDelayMs = parseNumber(process.env.MONGO_CONNECT_RETRY_DELAY_MS, 2000);

  const connectionOptions = {
    serverSelectionTimeoutMS: parseNumber(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 10000),
    socketTimeoutMS: parseNumber(process.env.MONGO_SOCKET_TIMEOUT_MS, 45000),
    tls: parseBoolean(process.env.MONGO_TLS, isProduction),
    tlsAllowInvalidCertificates: parseBoolean(process.env.MONGO_TLS_ALLOW_INVALID_CERTIFICATES, false),
  };

  const ipFamily = parseNumber(process.env.MONGO_IP_FAMILY, isProduction ? 4 : NaN);
  if (ipFamily === 4 || ipFamily === 6) {
    connectionOptions.family = ipFamily;
  }

  if (process.env.MONGO_TLS_CA_FILE) {
    connectionOptions.tlsCAFile = process.env.MONGO_TLS_CA_FILE;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, connectionOptions);
      console.log('MongoDB Conectado');
      return;
    } catch (error) {
      console.error(`Erro ao conectar ao MongoDB (tentativa ${attempt}/${maxRetries}):`, error.message);
      if (error?.cause?.message) {
        console.error('Detalhe da causa:', error.cause.message);
      }

      if (attempt < maxRetries) {
        const waitTime = baseDelayMs * attempt;
        console.warn(`Nova tentativa de conexão com MongoDB em ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }

      throw error;
    }
  }
};

module.exports = connectDB;
