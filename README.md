# order-lab

API de pedidos em [NestJS](https://nestjs.com/) com [Prisma](https://www.prisma.io/) e PostgreSQL. O objetivo é estudar o fluxo de uma API REST: módulos, Prisma Client e banco local.

## Requisitos

- Node.js 22
- npm
- Docker, para subir o Postgres

O Nest deste projeto não sobe no Node 20. Confira com `node -v`. Se usar nvm, o padrão da máquina pode ser outro:

```bash
nvm alias default 22
```

## Subir o projeto

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma generate
npx prisma migrate dev
npm run start
```

A API escuta em `http://localhost:3000`.

O `.env` precisa apontar para o Postgres do `docker-compose.yaml`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/order"
```

`prisma generate` cria o client em `src/generated/prisma`. Sem isso, a aplicação não inicia.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run start` | Compila e sobe a API |
| `npm run start:dev` | Sobe em modo watch |
| `npm run start:prod` | Roda o build em `dist/` |
| `npm run test` | Testes unitários |
| `npm run test:e2e` | Testes de ponta a ponta |
| `npm run lint` | Lint com oxlint |

## Rotas

| Método | Caminho |
| --- | --- |
| `GET` | `/` |
| `POST` | `/orders` |
| `GET` | `/orders` |
| `GET` | `/orders/:id` |
| `PATCH` | `/orders/:id` |
| `DELETE` | `/orders/:id` |

O modelo `Order` está em `prisma/schema.prisma`, com status `INCLUDED`, `RECEIVED`, `PREPARED` e `DELIVERED`. Os métodos de `OrdersService` ainda devolvem o texto gerado pelo scaffold do Nest; a persistência no banco é o próximo passo.

Exemplos de chamada estão em `api.http` (que também pode ser usado como executor das chamadas Rest por meio da extensão Rest Client).
