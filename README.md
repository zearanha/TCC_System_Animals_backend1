# Sistema Municipal de Monitoramento de Animais - Backend

API REST em Node.js + Express + Prisma + PostgreSQL para cadastro e monitoramento de animais, ocorrencias e notificacoes, com autenticacao por sessao e controle de acesso por perfil.

## Stack

- Node.js 20+
- Express 4
- Prisma 5
- PostgreSQL 16
- Zod (validacao)
- Docker + Docker Compose

## Funcionalidades

- Modulos de `usuarios`, `proprietarios`, `agentes`, `animais`, `ocorrencias` e `notificacoes`
- Autenticacao por token Bearer com sessoes persistidas
- Perfis de acesso: `ADMIN`, `AGENTE`, `PROPRIETARIO`
- Geracao automatica de codigo de identificacao de animal no formato `LLNNNN`
- Criacao automatica de notificacoes de ocorrencia (`WHATSAPP` e `EMAIL`) quando aplicavel
- Envio real de notificacoes:
  - Email via SMTP
  - WhatsApp via webhook HTTP
- Upload de foto de perfil para proprietario
- Upload de imagens de identificacao para animais
- Seed automatico do usuario admin padrao no boot da API

## Estrutura

```text
TCC_System_Animals_backend1/
  prisma/
    schema.prisma
    migrations/
  src/
    config/
    constants/
    controllers/
    database/
    middlewares/
    routes/
    services/
    utils/
    validations/
    app.js
    server.js
  docker-compose.yml
  Dockerfile
  .env.example
  package.json
```

## Variaveis de Ambiente

Arquivo de referencia: `.env.example`.

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@db:5432/municipal_animais?schema=public"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
AUTH_SESSION_TTL_HOURS=24
DEFAULT_ADMIN_EMAIL="admin@municipio.local"
DEFAULT_ADMIN_PASSWORD="admin123456"
DEFAULT_ADMIN_NAME="Administrador do Sistema"
NOTIFICATION_SIMULATION=false
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_WHATSAPP_ENABLED=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Sistema Municipal <nao-responder@municipio.local>"
WHATSAPP_WEBHOOK_URL=""
WHATSAPP_WEBHOOK_TOKEN=""
```

## Como Rodar com Docker

```bash
docker compose up -d --build
```

Endpoints principais:

- API (host): `http://localhost:3002`
- Healthcheck: `GET http://localhost:3002/health`
- PostgreSQL: `localhost:5432`
- Uploads estaticos: `http://localhost:3002/uploads/...`

## Como Rodar Local

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

API local padrao:

- `http://localhost:3000`

## Usuario Admin Padrao

No boot da API, se nao existir usuario com o e-mail configurado em `DEFAULT_ADMIN_EMAIL`, um usuario `ADMIN` e criado automaticamente.

Credenciais padrao de desenvolvimento:

- Email: `admin@municipio.local`
- Senha: `admin123456`

## Fluxo de Autenticacao

1. `POST /auth/login` retorna `token`, `expiresAt` e `user`
2. Enviar `Authorization: Bearer <token>` nas rotas protegidas
3. `GET /auth/me` retorna usuario atual
4. `POST /auth/logout` revoga a sessao

Cadastro publico de proprietario:

- `POST /auth/registrar-proprietario`
- Cria `proprietario` + `usuario` com perfil `PROPRIETARIO`
- Ja retorna sessao autenticada

## Perfis e Permissoes

| Recurso | ADMIN | AGENTE | PROPRIETARIO |
| --- | --- | --- | --- |
| Gestao de usuarios/proprietarios/agentes | Sim | Nao | Nao |
| Animais - listar | Sim | Nao | Apenas os proprios |
| Animais - criar/editar/excluir | Sim | Nao | Nao |
| Buscar animal por codigo | Sim | Sim | Nao |
| Ocorrencias - criar/listar | Sim | Sim (restrito ao vinculo) | Nao |
| Ocorrencias - alterar status | Sim | Apenas para `RESOLVIDA` | Nao |
| Ocorrencias - excluir | Sim | Nao | Nao |
| Notificacoes - listar | Sim | Nao | Apenas as proprias |

## Endpoints Principais

### Sistema

- `GET /health`

### Auth

- `POST /auth/login`
- `POST /auth/registrar-proprietario`
- `GET /auth/me`
- `POST /auth/logout`

### Usuarios (admin)

- `GET /usuarios`
- `POST /usuarios`
- `PUT /usuarios/:id`
- `DELETE /usuarios/:id`

### Proprietarios (admin)

- `POST /proprietarios`
- `GET /proprietarios`
- `GET /proprietarios/:id`
- `PUT /proprietarios/:id` (tambem aceita upload de foto via multipart com campo `foto`)
- `POST /proprietarios/:id/foto` (upload de foto de perfil, multipart com campo `foto`)
- `PUT /proprietarios/:id/foto` (alias de compatibilidade)
- `PATCH /proprietarios/:id/foto` (alias de compatibilidade)
- `DELETE /proprietarios/:id`

### Agentes (admin)

- `POST /agentes`
- `GET /agentes`
- `PUT /agentes/:id`
- `DELETE /agentes/:id`

### Animais

- `POST /animais` (admin)
- `GET /animais` (admin/proprietario)
- `GET /animais/:id` (admin/proprietario)
- `GET /animais/codigo/:codigo` (admin/agente)
- `PUT /animais/:id` (admin)
- `POST /animais/:id/imagens-identificacao` (admin, multipart com campo `imagens`, ate 5 arquivos por request)
- `PUT /animais/:id/imagens-identificacao` (alias de compatibilidade)
- `PATCH /animais/:id/imagens-identificacao` (alias de compatibilidade)
- `DELETE /animais/:id/imagens-identificacao/:imagemId` (admin)
- `DELETE /animais/:id` (admin)

### Ocorrencias

- `POST /ocorrencias` (admin/agente)
- `GET /ocorrencias` (admin/agente)
- `GET /ocorrencias/:id` (admin/agente)
- `PUT /ocorrencias/:id/status` (admin/agente com restricao)
- `DELETE /ocorrencias/:id` (admin)

### Notificacoes

- `POST /notificacoes` (admin)
- `GET /notificacoes` (admin/proprietario)

## Regras de Negocio Importantes

- Codigo de identificacao:
  - Gerado automaticamente no cadastro do animal
  - Formato `LLNNNN`
- Ocorrencias:
  - Sao registradas por `codigoIdentificacao`
  - Disparam notificacoes automaticas para canais disponiveis do proprietario
- Notificacoes:
  - `ENVIADA` apenas quando o provider externo confirma sucesso
  - `FALHA` quando houver erro de configuracao (SMTP/WEBHOOK) ou erro no provider
- Restricoes:
  - Agente so pode concluir ocorrencia (`RESOLVIDA`)
  - Exclusoes sao bloqueadas quando ha vinculos ativos
  - Usuario nao pode excluir a propria conta logada

## Troubleshooting de Notificacoes

Se as notificacoes aparecem no sistema, mas voce nao recebe no email/WhatsApp, verifique:

- `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` configurados com credenciais validas
- `WHATSAPP_WEBHOOK_URL` configurada para um provider real
- `NOTIFICATION_SIMULATION=false` para envio real
- Se estiver usando Docker, configure essas variaveis no `.env` e reinicie a stack (`docker compose up -d --build`)

Erros comuns de envio:

- `SMTP nao configurado...` -> faltam credenciais SMTP
- `WHATSAPP_WEBHOOK_URL nao configurada.` -> faltou integrar o webhook do provedor WhatsApp

## Upload de Midia

- Diretorio local de arquivos: `uploads/`
- Arquivos sao servidos via rota publica: `/uploads/...`
- Formatos aceitos: `JPG`, `PNG`, `WEBP`
- Limites:
  - Foto de proprietario: 1 arquivo, ate 5 MB
  - Imagens de identificacao: ate 5 arquivos por request, 8 MB por arquivo

## Integracao com o Frontend

Frontend (Vite) espera a API em:

- `VITE_API_BASE_URL=http://localhost:3002`

Se voce rodar o backend local fora do Docker (`http://localhost:3000`), ajuste o `.env` do frontend.

## Scripts

- `npm run dev` - desenvolvimento com nodemon
- `npm start` - execucao de producao
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:deploy`
- `npm run prisma:studio`
