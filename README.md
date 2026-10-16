# order-lab

API de pedidos em [NestJS](https://nestjs.com/) com [Prisma](https://www.prisma.io/) e PostgreSQL. O objetivo é estudar o fluxo de uma API REST: módulos, Prisma Client e banco local. O desenho alvo — comandos de estado, worker e domínio sem framework — está documentado em `docs/` e ainda não está na API.

## Documentação

| Documento | Caminho |
| --- | --- |
| Spec funcional de pedidos | [docs/features/pedidos.md](docs/features/pedidos.md) |
| Design doc do laboratório | [docs/design-docs/dd-pedidos-de-balcao-20261015-095517.md](docs/design-docs/dd-pedidos-de-balcao-20261015-095517.md) |
| ADR-001 — transição de estado por comando | [docs/adrs/ADR-001-transicao-de-estado-por-comando.md](docs/adrs/ADR-001-transicao-de-estado-por-comando.md) |
| ADR-002 — domínio de pedido sem framework | [docs/adrs/ADR-002-dominio-de-pedido-sem-framework.md](docs/adrs/ADR-002-dominio-de-pedido-sem-framework.md) |

A spec descreve o pedido de balcão (colocado, recebido, preparado, entregue). O design doc descreve a stack alvo e as fases. Os ADRs registram as duas decisões de engenharia: só o worker grava a transição de estado, e a regra do pedido fica em TypeScript puro, fora de NestJS e Prisma.

## Requisitos

- Node.js 22
- npm
- Docker, para subir o Postgres


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

O modelo `Order` está em `prisma/schema.prisma`, com status `INCLUDED`, `RECEIVED`, `PREPARED` e `DELIVERED` (colocado, recebido, preparado e entregue). `POST /orders` grava o pedido como `INCLUDED`. Listar, buscar, atualizar e apagar passam pelo Prisma.

`PATCH` e `DELETE` são o CRUD atual. O desenho em `docs/` troca essa edição livre pelos comandos `POST /orders/{id}/accept`, `prepare` e `deliver`, com o worker como único escritor do estado seguinte. Essa parte ainda não existe no código.

Exemplos de chamada estão em `api.http` (a extensão REST Client também executa esse arquivo).
