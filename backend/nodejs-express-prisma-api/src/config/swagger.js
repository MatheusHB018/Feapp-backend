const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'FEAPP API',
        version: '1.0.0',
        description: 'Documentação da API do backend FEAPP',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor local',
        },
    ],
    tags: [
        { name: 'Health' },
        { name: 'Auth' },
        { name: 'Users' },
        { name: 'Associations' },
        { name: 'Volunteers' },
        { name: 'Events' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    paths: {
        '/api/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check da API',
                responses: {
                    200: { description: 'API online' },
                },
            },
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Registrar novo usuário',
                responses: {
                    201: { description: 'Usuário criado' },
                    400: { description: 'Dados inválidos' },
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login do usuário',
                responses: {
                    200: { description: 'Token JWT retornado' },
                    401: { description: 'Credenciais inválidas' },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Authenticated user' },
                    401: { description: 'Not authorized' },
                },
            },
        },
        '/api/associations': {
            get: {
                tags: ['Associations'],
                summary: 'Listar associações (protegido)',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Lista de associações' },
                    401: { description: 'Not authorized' },
                },
            },
            post: {
                tags: ['Associations'],
                summary: 'Criar associação (protegido)',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Associação criada' },
                    401: { description: 'Not authorized' },
                },
            },
        },
        '/api/volunteers/apply': {
            post: {
                tags: ['Volunteers'],
                summary: 'Inscrição pública de voluntário',
                responses: {
                    201: { description: 'Inscrição registrada' },
                    400: { description: 'Dados inválidos' },
                },
            },
        },
        '/api/events': {
            get: {
                tags: ['Events'],
                summary: 'Listar eventos (protegido)',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Lista de eventos' },
                    401: { description: 'Not authorized' },
                },
            },
            post: {
                tags: ['Events'],
                summary: 'Criar evento (protegido)',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Evento criado' },
                    401: { description: 'Not authorized' },
                },
            },
        },
    },
};

module.exports = swaggerDocument;
