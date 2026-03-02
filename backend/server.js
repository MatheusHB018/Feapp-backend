const app = require('./nodejs-express-prisma-api/src/app');
const connectDB = require('./nodejs-express-prisma-api/src/config/db');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
const rootEnvPath = path.resolve(__dirname, '.env');
const nestedEnvPath = path.resolve(__dirname, 'nodejs-express-prisma-api', '.env');

dotenv.config({ path: rootEnvPath });

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    dotenv.config({ path: nestedEnvPath });
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        // Iniciar o servidor
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error.message);
        process.exit(1);
    }
};

startServer();