# Backend FEAPP - Node.js + Express + MongoDB

API responsável pela autenticação, gestão de associações, voluntários, eventos e solicitações de doação/parceria da FEAPP.

## Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT (autenticação)
- Joi (validação)
- Morgan + Winston (logs)
- Swagger UI (documentação)
- Nodemailer (e-mail SMTP)

## Estrutura da API

```text
src/
├─ app.js
├─ config/
│  ├─ db.js
│  └─ swagger.js
├─ controllers/
├─ middlewares/
├─ models/
├─ routes/
├─ services/
├─ utils/
├─ validations/
└─ seed.js
```

## Como Executar

No diretório `backend/` (raiz do backend):

```bash
npm install
npm run dev
```

Servidor padrão: `http://localhost:3000`

## Scripts

No `backend/package.json`:

- `npm run start` -> inicia servidor
- `npm run dev` -> inicia com nodemon
- `npm run seed` -> popula banco com dados iniciais/oficiais

## Variáveis de Ambiente

Arquivo: `backend/nodejs-express-prisma-api/.env`

Obrigatórias:

- `PORT=3000`
- `MONGO_URI=mongodb://localhost:27017/feapp_db`
- `JWT_SECRET=...`

SMTP (opcional para desenvolvimento, obrigatório para envio real):

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=...`
- `SMTP_PASS=...`
- `SMTP_FROM=...`
- `NOTIFICATION_EMAIL_TO=...`

## Fluxos Implementados

### 1) Autenticação e Segurança

- Registro com senha forte validada (Joi)
- Login com JWT
- Middleware `authMiddleware`
- Middleware `roleMiddleware` (RBAC)

### 2) Associações

- CRUD de associações
- Inativação lógica (`status`)
- Filtros avançados + paginação + ordenação
- Endpoint público para listagem ativa
- Vínculo `User -> Association`

### 3) Voluntários

- Inscrição pública (`apply`)
- Listagem/administração por admin
- Aprovação/reprovação
- Match por skills

### 4) Eventos

- CRUD de eventos
- Inscrição de voluntário no evento
- Check-in de presença
- Endpoint público de eventos ativos

### 5) Solicitações (Doação/Parceria)

- Cadastro público com escolha de associação
- Listagem protegida para admin/federação
- Atualização de status
- Tentativa de envio de e-mail SMTP

## Seed

Executar:

```bash
cd backend
npm run seed
```

Popula:

- Super Admin
- Categorias padrão
- 33 associações oficiais
- 3 grandes eventos FEAPP

## Principais Rotas

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Associations

- `GET /api/associations/public`
- `GET /api/associations`
- `POST /api/associations`
- `PUT /api/associations/:id`
- `DELETE /api/associations/:id`

### Volunteers

- `POST /api/volunteers/apply`
- `GET /api/volunteers`
- `GET /api/volunteers/:id`
- `PATCH /api/volunteers/:id/status`
- `GET /api/volunteers/match`

### Events

- `GET /api/events/public`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/events/:id/register`
- `PATCH /api/events/:eventId/check-in/:volunteerId`

### Support Requests

- `POST /api/support-requests`
- `GET /api/support-requests`
- `PATCH /api/support-requests/:id/status`

### Docs

- `GET /api-docs`

## Troubleshooting

### Erro `EADDRINUSE: 3000`

Já existe processo usando a porta 3000. Finalize o processo atual antes de subir novo servidor.

### E-mail não chega

- Verifique `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- No Gmail use senha de app (2FA obrigatório)
- Se SMTP falhar, a solicitação ainda é salva e a API retorna aviso em `email.warning`

### Login com email `.local` falhando

Validação já ajustada para aceitar domínios não públicos.

## Observações

- O backend está organizado para evolução por módulos.
- Rotas públicas e privadas já estão separadas.
- Swagger cobre os principais fluxos para consumo pelo frontend.
