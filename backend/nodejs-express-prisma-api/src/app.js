const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const associationRoutes = require('./routes/associationRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const supportRequestRoutes = require('./routes/supportRequestRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const swaggerDocument = require('./config/swagger');
const logger = require('./utils/logger');
//const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Configuração do CORS
const allowedOrigins = (process.env.CORS_ORIGIN || '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		return callback(new Error('CORS origin not allowed'));
	},
}));

app.use(morgan('combined', {
	stream: {
		write: (message) => logger.info(message.trim()),
	},
}));

// Middleware para parsear JSON
app.use(express.json());

app.get('/api/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/support-requests', supportRequestRoutes);
app.use('/api/support', supportRequestRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/partners', partnerRoutes);

app.use((err, req, res, next) => {
	logger.error('Unhandled error', {
		message: err.message,
		stack: err.stack,
		path: req.originalUrl,
		method: req.method,
	});

	res.status(err.status || 500).json({
		message: 'Internal Server Error',
	});
});

// Middleware de tratamento de erros
//app.use(errorHandler);

module.exports = app;