const app = require('./nodejs-express-prisma-api/src/app');
const connectDB = require('./nodejs-express-prisma-api/src/config/db');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
const rootEnvPath = path.resolve(__dirname, '.env');
const nestedEnvPath = path.resolve(__dirname, 'nodejs-express-prisma-api', '.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: nestedEnvPath, override: false });

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET || process.env.JWT || process.env.JWT_TOKEN || process.env.AUTH_SECRET;

if (mongoUri) {
    process.env.MONGO_URI = mongoUri;
}

if (jwtSecret) {
    process.env.JWT_SECRET = jwtSecret;
}

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
    console.error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}. ` +
        'Accepted aliases: MONGO_URL/MONGODB_URI/DATABASE_URL for MONGO_URI and JWT/JWT_TOKEN/AUTH_SECRET for JWT_SECRET.'
    );
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

const parseNumber = (value, defaultValue) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
};

let reconnectTimeout = null;

const scheduleMongoReconnect = () => {
    if (reconnectTimeout) {
        return;
    }

    const reconnectDelayMs = parseNumber(process.env.MONGO_RECONNECT_DELAY_MS, 15000);

    reconnectTimeout = setTimeout(async () => {
        reconnectTimeout = null;

        try {
            await connectDB();
            console.log('MongoDB reconectado com sucesso');
        } catch (error) {
            console.error('Falha ao reconectar no MongoDB:', error.message);
            scheduleMongoReconnect();
        }
    }, reconnectDelayMs);
};

const initializeDatabaseConnection = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Banco indisponível no boot, API seguirá no ar e tentará reconectar:', error.message);
        scheduleMongoReconnect();
    }
};

const startServer = async () => {
    try {
        // Iniciar o servidor
        app.listen(PORT, '0.0.0.0', async () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            await initializeDatabaseConnection();
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error.message);
        process.exit(1);
    }
};

startServer();