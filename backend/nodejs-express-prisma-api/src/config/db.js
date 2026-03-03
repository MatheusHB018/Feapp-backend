const mongoose = require('mongoose');

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI;

  const connectionOptions = {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
    tls: parseBoolean(process.env.MONGO_TLS, isProduction),
    tlsAllowInvalidCertificates: parseBoolean(process.env.MONGO_TLS_ALLOW_INVALID_CERTIFICATES, false),
  };

  if (process.env.MONGO_TLS_CA_FILE) {
    connectionOptions.tlsCAFile = process.env.MONGO_TLS_CA_FILE;
  }

  try {
    await mongoose.connect(mongoUri, connectionOptions);
    console.log('MongoDB Conectado');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    if (error?.cause?.message) {
      console.error('Detalhe da causa:', error.cause.message);
    }
    process.exit(1); // Encerra a aplicação em caso de erro
  }
};

module.exports = connectDB;
