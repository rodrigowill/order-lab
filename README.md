# order-lab

Laboratório local de um pedido de balcão. A API em [NestJS](https://nestjs.com/) grava o pedido como colocado e publica os comandos de aceite, preparo e entrega. Um worker, também NestJS, consome o [RabbitMQ](https://www.rabbitmq.com/) e é quem persiste o estado seguinte no [PostgreSQL](https://www.postgresql.org/) via [Prisma](https://www.prisma.io/). A tela em React lista os pedidos e dispara esses comandos.

A regra de sequência fica em `src/domain`. Prisma e RabbitMQ ficam em `src/adapters`. A API (`src/orders`) e o worker (`src/worker`) ligam essas peças na inicialização.

## Documentação

| Documento | Caminho |
| --- | --- |
| Spec funcional de pedidos | [docs/features/pedidos.md](docs/features/pedidos.md) |
| Design doc do laboratório | [docs/design-docs/dd-pedidos-de-balcao-20261015-095517.md](docs/design-docs/dd-pedidos-de-balcao-20261015-095517.md) |
| ADR-001 — transição de estado por comando | [docs/adrs/ADR-001-transicao-de-estado-por-comando.md](docs/adrs/ADR-001-transicao-de-estado-por-comando.md) |
| ADR-002 — domínio de pedido sem framework | [docs/adrs/ADR-002-dominio-de-pedido-sem-framework.md](docs/adrs/ADR-002-dominio-de-pedido-sem-framework.md) |

## Requisitos

- Node.js 22
- npm
- Docker, para Postgres e RabbitMQ

## Subir o projeto

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma generate --config prisma7.config.ts
npx prisma migrate dev --config prisma7.config.ts
```

O `docker-compose.yaml` sobe o Postgres em `localhost:5432` (`postgres` / `postgres`, banco `order`) e o RabbitMQ em `localhost:5672` (`guest` / `guest`). O painel do RabbitMQ fica em `http://localhost:15672`.

O `.env.example` traz placeholders. Para esses containers, o `.env` precisa disto:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/order"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
```

`prisma generate` cria o client em `src/generated/prisma`. O CLI lê a URL do banco em `prisma7.config.ts`, por isso os comandos acima passam `--config`.

São três processos. Cada um no seu terminal:

```bash
npm run start:dev
npm run start:worker:dev
cd web && npm install && npm run dev
```

A API escuta em `http://localhost:3000` e libera CORS para `http://localhost:5173`, que é a porta do Vite. Sem o worker, o comando HTTP é aceito e a lista continua no estado anterior até a mensagem ser consumida.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run start` | Compila e sobe a API |
| `npm run start:dev` | Sobe a API em modo watch |
| `npm run start:prod` | Roda o build da API em `dist/` |
| `npm run start:worker` | Sobe o worker (`src/worker/worker.main.ts`) |
| `npm run start:worker:dev` | Sobe o worker em modo watch |
| `npm run test` | Testes unitários do domínio |
| `npm run test:e2e` | Testes de ponta a ponta |
| `npm run lint` | Lint com oxlint |

Na pasta `web/`: `npm run dev` sobe a tela, `npm run build` gera o bundle e `npm run lint` roda o ESLint.

## Fluxo do pedido

Cada pedido é um item: nome de quem pediu, descrição e valor. O status anda nesta ordem:

`INCLUDED` (colocado) → `RECEIVED` (recebido) → `PREPARED` (preparado) → `DELIVERED` (entregue)

`POST /orders` é a única gravação de status feita pela API: o pedido nasce `INCLUDED`. Aceitar, preparar e entregar conferem o estado atual, publicam `{ "orderId": "<id>" }` na fila correspondente e respondem `202`. O corpo é um aviso de que o comando foi anunciado, não o pedido já atualizado.

| Comando | Estado exigido | Fila |
| --- | --- | --- |
| `POST /orders/:id/accept` | `INCLUDED` | `order.accept` |
| `POST /orders/:id/prepare` | `RECEIVED` | `order.prepare` |
| `POST /orders/:id/deliver` | `PREPARED` | `order.deliver` |

O worker consome as três filas e grava o próximo estado da sequência. A lista passa a mostrar esse estado na consulta seguinte. A tela espera 1,5 s depois do clique e busca `GET /orders` de novo.

Pedido inexistente responde `404`. Comando repetido ou fora de ordem responde `422` e não publica. Corpo inválido na criação também responde `422`: nome obrigatório com até 100 caracteres, descrição obrigatória com até 255, valor numérico maior que zero.

## Rotas

| Método | Caminho | Papel |
| --- | --- | --- |
| `GET` | `/` | Resposta fixa da API |
| `POST` | `/orders` | Cria o pedido como colocado |
| `GET` | `/orders` | Lista os pedidos |
| `GET` | `/orders/:id` | Busca um pedido |
| `POST` | `/orders/:id/accept` | Publica o aceite |
| `POST` | `/orders/:id/prepare` | Publica o preparo |
| `POST` | `/orders/:id/deliver` | Publica a entrega |

Exemplos de chamada estão em `api.http`.

## Tela

`web/` é um app Vite + React. O formulário chama `POST /orders`. A lista mostra nome, descrição, valor e o rótulo do status (Colocado, Recebido, Preparado, Entregue) e oferece o próximo comando enquanto o pedido não está entregue.
