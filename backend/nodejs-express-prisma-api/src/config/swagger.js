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
        '/api/associations': {
            get: {
                tags: ['Associations'],
                summary: 'Listar associações',
                responses: {
                    200: { description: 'Lista de associações' },
                },
            },
            post: {
                tags: ['Associations'],
                summary: 'Criar associação',
                responses: {
                    201: { description: 'Associação criada' },
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
                summary: 'Listar eventos',
                responses: {
                    200: { description: 'Lista de eventos' },
                },
            },
            post: {
                tags: ['Events'],
                summary: 'Criar evento',
                responses: {
                    201: { description: 'Evento criado' },
                },
            },
        },
    },
};

module.exports = swaggerDocument;
