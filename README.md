# Sistema Municipal de Monitoramento de Animais - Backend

API REST em Node.js + Express + Prisma + PostgreSQL para cadastro e monitoramento de animais, ocorrencias e notificacoes, com autenticacao por sessao e controle de acesso por perfil.

## Visao Geral

- API com modulos de `usuarios`, `proprietarios`, `agentes`, `animais`, `ocorrencias` e `notificacoes`
- Autenticacao por token Bearer em tabela de sessoes
- Perfis de acesso: `ADMIN`, `AGENTE`, `PROPRIETARIO`
- Geracao automatica de codigo de identificacao do animal no formato `LLNNNN`
- Criacao automatica de notificacoes de ocorrencia via `WHATSAPP` e `EMAIL` (registro em banco e log de envio)

## Stack

- Node.js 20+
- Express 4
- Prisma 5
- PostgreSQL 16
- Zod (validacao)
- Docker + Docker Compose

## Estrutura Principal

```text
backend/
  prisma/
    schema.prisma
    migrations/
      20260328000000_init/
      20260329090000_auth_users/
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
```

## Executando com Docker (recomendado)

No diretorio `backend`:

```bash
docker compose up -d --build
```

Servicos:

- API interna: `http://localhost:3000` (dentro do container)
- API exposta no host: `http://localhost:3002`
- Healthcheck: `GET http://localhost:3002/health`
- PostgreSQL: `localhost:5432`

Observacao:
- O container da API executa `prisma migrate deploy` antes de iniciar o servidor.

## Executando Local (sem Docker)

No diretorio `backend`:

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

API local padrao: `http://localhost:3000`

## Usuario Admin Padrao

No boot da API, se nao existir usuario com o e-mail configurado em `DEFAULT_ADMIN_EMAIL`, ele e criado automaticamente com perfil `ADMIN`.

Credenciais padrao de desenvolvimento:

- Email: `admin@municipio.local`
- Senha: `admin123456`

Troque a senha apos o primeiro acesso.

## Autenticacao

Fluxo:

1. `POST /auth/login` retorna `token`, `expiresAt` e `user`
2. Enviar header `Authorization: Bearer <token>` nas rotas protegidas
3. `GET /auth/me` retorna usuario atual
4. `POST /auth/logout` revoga a sessao

Cadastro publico de proprietario:

- `POST /auth/registrar-proprietario`
- Cria `proprietario` + `usuario` com perfil `PROPRIETARIO`
- Ja retorna sessao autenticada

## Perfis e Permissoes

| Recurso | ADMIN | AGENTE | PROPRIETARIO |
| --- | --- | --- | --- |
| Dashboard e gestao completa | Sim | Nao | Nao |
| Modulo de usuarios | Sim | Nao | Nao |
| Modulo de proprietarios | Sim | Nao | Nao |
| Modulo de agentes | Sim | Nao | Nao |
| Listar animais | Sim | Nao | Apenas os proprios |
| Criar/editar/excluir animais | Sim | Nao | Nao |
| Buscar animal por codigo | Sim | Sim | Nao |
| Criar ocorrencia | Sim | Sim (somente para si) | Nao |
| Listar ocorrencias | Sim | Apenas as proprias | Nao |
| Alterar status de ocorrencia | Sim | Apenas para `RESOLVIDA` | Nao |
| Excluir (retirar) ocorrencia | Sim | Nao | Nao |
| Listar notificacoes | Sim | Nao | Apenas as proprias |

## Endpoints Principais

### Health

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
- `PUT /proprietarios/:id`
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

- Codigo de identificacao do animal:
  - Gerado automaticamente no cadastro do animal
  - Formato `LLNNNN`
  - `LL` = iniciais do primeiro e ultimo nome do proprietario
  - `NNNN` = numero aleatorio com 4 digitos
- Criacao de ocorrencia:
  - Localiza animal por `codigoIdentificacao`
  - Cria notificacoes automaticamente para o proprietario em todos os canais disponiveis (`WHATSAPP` e/ou `EMAIL`)
- Status de ocorrencia:
  - Agente pode apenas concluir (`RESOLVIDA`)
  - Admin pode atualizar para qualquer status
- Exclusoes bloqueadas por vinculos:
  - Nao remove proprietario com animais/usuario vinculado
  - Nao remove agente com ocorrencias/usuario vinculado
  - Nao remove animal com ocorrencias vinculadas
  - Usuario nao pode excluir a propria conta logada

## Exemplos de Requisicao

Login:

```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@municipio.local\",\"senha\":\"admin123456\"}"
```

Criar ocorrencia:

```bash
curl -X POST http://localhost:3002/ocorrencias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d "{\"codigoIdentificacao\":\"MO3247\",\"agenteId\":\"UUID_DO_AGENTE\",\"local\":\"Rodovia KM 12\",\"descricao\":\"Animal solto em area de risco\",\"status\":\"ABERTA\"}"
```

## Scripts NPM

- `npm run dev` - desenvolvimento com nodemon
- `npm start` - execucao de producao
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:deploy`
- `npm run prisma:studio`
