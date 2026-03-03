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

        // Auth
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
        '/api/auth/register-admin': {
            post: {
                tags: ['Auth'],
                summary: 'Registrar usuário admin (protegido)',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Admin criado' },
                    401: { description: 'Not authorized' },
                    403: { description: 'Forbidden - insufficient role' },
                },
            },
        },
        '/api/auth/forgot-password': {
            post: {
                tags: ['Auth'],
                summary: 'Solicitar recuperação de senha (público)',
                responses: {
                    200: { description: 'Email enviado se usuário existir' },
                    400: { description: 'Dados inválidos' },
                },
            },
        },
        '/api/auth/reset-password/{token}': {
            put: {
                tags: ['Auth'],
                summary: 'Resetar senha por token (público)',
                parameters: [
                    { name: 'token', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Senha resetada' },
                    400: { description: 'Token inválido ou expirado' },
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
        '/api/auth/admin': {
            get: {
                tags: ['Auth'],
                summary: 'Admin test route (protegido)',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Admin content' },
                    401: { description: 'Not authorized' },
                    403: { description: 'Forbidden - insufficient role' },
                },
            },
        },

        // Users
        '/api/users': {
            post: {
                tags: ['Users'],
                summary: 'Criar usuário (protegido)',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Usuário criado' },
                    401: { description: 'Not authorized' },
                    403: { description: 'Forbidden - insufficient role' },
                },
            },
            get: {
                tags: ['Users'],
                summary: 'Listar usuários (protegido)',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Lista de usuários' },
                    401: { description: 'Not authorized' },
                    403: { description: 'Forbidden - insufficient role' },
                },
            },
        },
        '/api/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Obter usuário por id (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Usuário' },
                    401: { description: 'Not authorized' },
                    403: { description: 'Forbidden - insufficient role' },
                    404: { description: 'Not found' },
                },
            },
            put: {
                tags: ['Users'],
                summary: 'Atualizar usuário (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Usuário atualizado' },
                    401: { description: 'Not authorized' },
                    403: { description: 'Forbidden - insufficient role' },
                    404: { description: 'Not found' },
                },
            },
            delete: {
                tags: ['Users'],
                summary: 'Deletar usuário (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Usuário deletado' },
                    401: { description: 'Not authorized' },
                    403: { description: 'Forbidden - insufficient role' },
                    404: { description: 'Not found' },
                },
            },
        },

        // Associations
        '/api/associations/public': {
            get: {
                tags: ['Associations'],
                summary: 'Listar associações públicas',
                responses: { 200: { description: 'Lista pública' } },
            },
        },
        '/api/associations/{id}': {
            get: {
                tags: ['Associations'],
                summary: 'Obter associação por id (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Associação' }, 401: { description: 'Not authorized' } },
            },
            put: {
                tags: ['Associations'],
                summary: 'Atualizar associação (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Atualizado' }, 401: { description: 'Not authorized' } },
            },
            delete: {
                tags: ['Associations'],
                summary: 'Inativar associação (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Inativado' }, 401: { description: 'Not authorized' } },
            },
        },
        '/api/associations/{associationId}/link-user/{userId}': {
            patch: {
                tags: ['Associations'],
                summary: 'Linkar usuário a associação (protegido, role)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'associationId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { 200: { description: 'Vinculado' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },

        // Volunteers
        '/api/volunteers/apply': {
            post: {
                tags: ['Volunteers'],
                summary: 'Inscrição pública de voluntário',
                responses: { 201: { description: 'Inscrição registrada' }, 400: { description: 'Dados inválidos' } },
            },
        },
        '/api/volunteers': {
            get: {
                tags: ['Volunteers'],
                summary: 'Listar voluntários (protegido, role=admin)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Lista' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },
        '/api/volunteers/match': {
            get: {
                tags: ['Volunteers'],
                summary: 'Buscar voluntários por skills (protegido, role)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Matches' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },
        '/api/volunteers/{id}': {
            get: {
                tags: ['Volunteers'],
                summary: 'Obter voluntário (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Volunteer' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
            patch: {
                tags: ['Volunteers'],
                summary: 'Atualizar status do voluntário (protegido, role)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Status atualizado' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },

        // Events
        '/api/events/public': {
            get: { tags: ['Events'], summary: 'Listar eventos públicos', responses: { 200: { description: 'Lista pública' } } },
        },
        '/api/events/{id}': {
            get: {
                tags: ['Events'],
                summary: 'Obter evento (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Evento' }, 401: { description: 'Not authorized' } },
            },
            put: {
                tags: ['Events'],
                summary: 'Atualizar evento (protegido, role)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Atualizado' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
            delete: {
                tags: ['Events'],
                summary: 'Deletar evento (protegido, role)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Deletado' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },
        '/api/events/{id}/register': {
            post: {
                tags: ['Events'],
                summary: 'Registrar voluntário em evento (protegido, role)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 201: { description: 'Registrado' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },
        '/api/events/{eventId}/check-in/{volunteerId}': {
            patch: {
                tags: ['Events'],
                summary: 'Check-in de voluntário (protegido, role)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'eventId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'volunteerId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: { 200: { description: 'Check-in realizado' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },

        // Support requests
        '/api/support-requests': {
            post: {
                tags: ['SupportRequests'],
                summary: 'Criar support request (público)',
                responses: { 201: { description: 'Criado' }, 400: { description: 'Dados inválidos' } },
            },
            get: {
                tags: ['SupportRequests'],
                summary: 'Listar support requests (protegido, role)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Lista' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },
        '/api/support-requests/donate': {
            post: {
                tags: ['SupportRequests'],
                summary: 'Criar support request - doação (público, com captcha)',
                responses: { 201: { description: 'Criado' }, 400: { description: 'Dados inválidos' } },
            },
        },
        '/api/support-requests/partner': {
            post: {
                tags: ['SupportRequests'],
                summary: 'Criar support request - parceiro (público, com captcha)',
                responses: { 201: { description: 'Criado' }, 400: { description: 'Dados inválidos' } },
            },
        },
        '/api/support-requests/{id}/status': {
            patch: {
                tags: ['SupportRequests'],
                summary: 'Atualizar status (protegido, role)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Atualizado' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },

        // Partners
        '/api/partners/public': {
            get: { tags: ['Partners'], summary: 'Lista pública de parceiros', responses: { 200: { description: 'Lista pública' } } },
        },
        '/api/partners': {
            get: {
                tags: ['Partners'],
                summary: 'Listar parceiros (protegido)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Lista' }, 401: { description: 'Not authorized' } },
            },
            post: {
                tags: ['Partners'],
                summary: 'Criar parceiro (protegido, role)',
                security: [{ bearerAuth: [] }],
                responses: { 201: { description: 'Criado' }, 401: { description: 'Not authorized' }, 403: { description: 'Forbidden - insufficient role' } },
            },
        },
        '/api/partners/{id}': {
            get: {
                tags: ['Partners'],
                summary: 'Obter parceiro (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Parceiro' }, 401: { description: 'Not authorized' } },
            },
            put: {
                tags: ['Partners'],
                summary: 'Atualizar parceiro (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Atualizado' }, 401: { description: 'Not authorized' } },
            },
            delete: {
                tags: ['Partners'],
                summary: 'Inativar parceiro (protegido)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Inativado' }, 401: { description: 'Not authorized' } },
            },
        },

        // Captcha
        '/api/captcha/generate': {
            get: { tags: ['Captcha'], summary: 'Gerar desafio CAPTCHA (público)', responses: { 200: { description: 'Pergunta + hash' } } },
        },
    },
};

module.exports = swaggerDocument;
