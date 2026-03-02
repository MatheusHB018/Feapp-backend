const app = require('./nodejs-express-prisma-api/src/app');
const connectDB = require('./nodejs-express-prisma-api/src/config/db');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
const rootEnvPath = path.resolve(__dirname, '.env');
const nestedEnvPath = path.resolve(__dirname, 'nodejs-express-prisma-api', '.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: nestedEnvPath, override: false });

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        // Iniciar o servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error.message);
        process.exit(1);
    }
};

startServer();