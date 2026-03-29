# Sistema Municipal de Identificacao e Monitoramento de Animais

API REST em Node.js + Express + PostgreSQL + Prisma, com foco em seguranca viaria.

## 1) Estrutura de Pastas

```text
backend/
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
│     ├─ migration_lock.toml
│     └─ 20260328000000_init/
│        └─ migration.sql
├─ src/
│  ├─ config/
│  │  ├─ env.js
│  │  └─ logger.js
│  ├─ controllers/
│  │  ├─ agente.controller.js
│  │  ├─ animal.controller.js
│  │  ├─ identificacao.controller.js
│  │  ├─ notificacao.controller.js
│  │  ├─ ocorrencia.controller.js
│  │  └─ proprietario.controller.js
│  ├─ database/
│  │  └─ prismaClient.js
│  ├─ middlewares/
│  │  ├─ error.middleware.js
│  │  ├─ notFound.middleware.js
│  │  └─ validate.middleware.js
│  ├─ routes/
│  │  ├─ agentes.routes.js
│  │  ├─ animais.routes.js
│  │  ├─ identificacoes.routes.js
│  │  ├─ index.js
│  │  ├─ notificacoes.routes.js
│  │  ├─ ocorrencias.routes.js
│  │  └─ proprietarios.routes.js
│  ├─ services/
│  │  ├─ agente.service.js
│  │  ├─ animal.service.js
│  │  ├─ identificacao.service.js
│  │  ├─ notificacao.service.js
│  │  ├─ ocorrencia.service.js
│  │  └─ proprietario.service.js
│  ├─ utils/
│  │  ├─ AppError.js
│  │  ├─ asyncHandler.js
│  │  ├─ codeGenerator.js
│  │  └─ cpf.js
│  ├─ validations/
│  │  ├─ agente.schema.js
│  │  ├─ animal.schema.js
│  │  ├─ common.schema.js
│  │  ├─ identificacao.schema.js
│  │  ├─ notificacao.schema.js
│  │  ├─ ocorrencia.schema.js
│  │  └─ proprietario.schema.js
│  ├─ app.js
│  └─ server.js
├─ .dockerignore
├─ .env.example
├─ docker-compose.yml
├─ Dockerfile
├─ package.json
└─ README.md
```

## 2) Regras de Negocio Implementadas

- Um proprietario possui varios animais.
- Cada animal possui uma identificacao unica.
- O codigo da identificacao segue `GBXXXX` e e gerado automaticamente.
- Ao cadastrar animal (`POST /animais`), a identificacao e criada automaticamente.
- Ocorrencia e registrada buscando o animal por codigo (`codigoIdentificacao`).
- CPF de proprietario e unico e validado com algoritmo de CPF.
- Matricula de agente e unica.
- Notificacao e vinculada ao proprietario do animal envolvido na ocorrencia.

## 3) Configuracao do Banco

- ORM: **Prisma**
- Banco: **PostgreSQL**
- Arquivo de schema: `prisma/schema.prisma`
- Migracao inicial: `prisma/migrations/20260328000000_init/migration.sql`
- Tabelas:
  - `proprietarios`
  - `animais`
  - `identificacoes`
  - `agentes`
  - `ocorrencias`
  - `notificacoes`

## 4) Docker Configurado

### Subir API + Postgres

```bash
docker compose up --build
```

### Servicos

- API: `http://localhost:3000`
- Healthcheck: `GET http://localhost:3000/health`
- PostgreSQL: `localhost:5432`

Credenciais padrao no `docker-compose.yml`:
- user: `postgres`
- password: `postgres`
- database: `municipal_animais`

## 5) Endpoints

### Proprietarios
- `POST /proprietarios`
- `GET /proprietarios`
- `GET /proprietarios/:id`
- `PUT /proprietarios/:id`
- `DELETE /proprietarios/:id`

### Animais
- `POST /animais`
- `GET /animais`
- `GET /animais/:id`

### Identificacoes
- `POST /identificacoes`

### Agentes
- `POST /agentes`
- `GET /agentes`

### Ocorrencias
- `POST /ocorrencias`
- `GET /ocorrencias`
- `GET /ocorrencias/:id`

### Notificacoes
- `POST /notificacoes`
- `GET /notificacoes`

## 6) Exemplos de Requisicao (JSON)

### POST /proprietarios

```json
{
  "nome": "Maria Oliveira",
  "cpf": "39053344705",
  "telefone": "11999999999",
  "email": "maria@exemplo.com",
  "endereco": "Rua das Acacias, 123"
}
```

### PUT /proprietarios/:id

```json
{
  "telefone": "11988887777",
  "endereco": "Avenida Central, 450"
}
```

### POST /animais

```json
{
  "nome": "Trovão",
  "especie": "Cavalo",
  "raca": "Mangalarga",
  "porte": "GRANDE",
  "sexo": "MACHO",
  "cor": "Castanho",
  "dataNascimento": "2021-02-10T00:00:00.000Z",
  "proprietarioId": "UUID_DO_PROPRIETARIO"
}
```

### POST /identificacoes

```json
{
  "animalId": "UUID_DO_ANIMAL"
}
```

### POST /agentes

```json
{
  "nome": "Carlos Andrade",
  "matricula": "AGT-001",
  "telefone": "11977776666",
  "email": "carlos.agente@prefeitura.gov.br"
}
```

### POST /ocorrencias

```json
{
  "codigoIdentificacao": "GB3247",
  "agenteId": "UUID_DO_AGENTE",
  "local": "Rodovia Municipal KM 12",
  "descricao": "Animal solto proximo a curva de alto risco",
  "status": "ABERTA"
}
```

### POST /notificacoes

```json
{
  "ocorrenciaId": "UUID_DA_OCORRENCIA",
  "mensagem": "Seu animal foi encontrado solto e representa risco viario.",
  "canal": "WHATSAPP",
  "status": "PENDENTE"
}
```

## 7) Observacoes Tecnicas

- Middleware global de erro implementado.
- Logs simples de requisicao/resposta implementados.
- Validacao de payloads com Zod.
- Organizacao em camadas: `controllers`, `services`, `routes`, `database`.
