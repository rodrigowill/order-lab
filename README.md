# order-lab

Laboratório local de um pedido de balcão. A API em [NestJS](https://nestjs.com/) grava o pedido como colocado e publica os comandos de aceite, preparo e entrega. Um worker, também NestJS, consome o [RabbitMQ](https://www.rabbitmq.com/) e é quem persiste o estado seguinte no [PostgreSQL](https://www.postgresql.org/) via [Prisma](https://www.prisma.io/). A tela em React lista os pedidos e dispara esses comandos.

A regra de sequência fica em `src/domain`. Prisma e RabbitMQ ficam em `src/adapters`. A API (`src/api`) e o worker (`src/worker`) ligam essas peças na inicialização.

## Documentação

| Documento | Caminho |
| --- | --- |
| Spec funcional de pedidos | [docs/features/pedidos.md](docs/features/pedidos.md) |
| Design doc do laboratório | [docs/design-docs/dd-pedidos-de-balcao-20261015-095517.md](docs/design-docs/dd-pedidos-de-balcao-20261015-095517.md) |
| ADR-001 — transição de estado por comando | [docs/adrs/ADR-001-transicao-de-estado-por-comando.md](docs/adrs/ADR-001-transicao-de-estado-por-comando.md) |
| ADR-002 — domínio de pedido sem framework | [docs/adrs/ADR-002-dominio-de-pedido-sem-framework.md](docs/adrs/ADR-002-dominio-de-pedido-sem-framework.md) |

## Requisitos

- Docker, nas duas formas de subir o projeto
- Node.js 22 e npm, só para rodar API, worker e a tela fora do Docker

As portas `5432`, `5672`, `15672`, `3000`, `4317`, `4318`, `16686` e `80` são usadas pelos dois modos. Use um modo de cada vez para evitar conflitos.

## Subir o projeto

### Tudo no Docker

O `docker-compose.yaml` sobe Postgres, a migration, RabbitMQ, API, worker e a tela. O serviço `migrate` aplica as migrations (`prisma migrate deploy`) depois que o Postgres fica saudável. API e worker esperam essa etapa terminar.

```bash
docker compose up --build -d
```

| Serviço | Endereço | Credenciais |
| --- | --- | --- |
| Postgres | `localhost:5432`, banco `order` | `postgres` / `postgres` |
| RabbitMQ | `localhost:5672` | `orderlab` / `orderlab` |
| Painel do RabbitMQ | http://localhost:15672 | `orderlab` / `orderlab` |
| API | http://localhost:3000 | — |
| Tela | http://localhost | — |
| Jaeger | http://localhost:16686 | — |

O build da tela recebe `VITE_API_URL=http://localhost:3000`. A API libera CORS para `http://localhost` (tela no nginx, porta 80) e para `http://localhost:5173` (Vite).

API e worker enviam traces para `http://jaeger:4318/v1/traces` usando OTLP/HTTP. Esse é o endereço interno entre containers; a interface web do Jaeger fica em `http://localhost:16686`. A porta `4317` fica disponível para OTLP/gRPC.

Para acompanhar um trace, crie um pedido e avance seus estados. Na interface do Jaeger, procure pelos serviços `order-lab-api` e `order-lab-worker` e ajuste o intervalo de tempo. O contexto é propagado junto às mensagens do RabbitMQ. O Jaeger all-in-one usa armazenamento em memória por padrão, então os traces desaparecem quando o container reinicia.

O Compose usa `jaegertracing/all-in-one:latest`; a imagem em execução atualmente informa Jaeger v1.76 e exibe o aviso de fim de suporte da versão 1. Esse aviso não impede o serviço de iniciar, mas a imagem não deve ser tratada como uma instalação atualizada. Para usar Jaeger v2, será necessário trocar a imagem e revisar sua configuração.

Para acompanhar logs e parar os serviços:

```bash
docker compose logs -f api worker jaeger
docker compose down
```

Para remover também os volumes, incluindo o banco de pedidos:

```bash
docker compose down -v
```

`docker compose down -v` apaga os dados persistidos do PostgreSQL.

`--build` recompila as imagens quando o código muda. Sem o worker, o comando HTTP é aceito e a lista continua no estado anterior até a mensagem ser consumida.

### Serviço a serviço

Postgres, RabbitMQ e Jaeger ficam no Docker. API, worker e a tela rodam no Node, com reload.

1. Instalar as dependências da API e criar o `.env`:

```bash
npm install
cp .env.example .env
```

O `.env.example` traz placeholders. Para os containers abaixo, o `.env` precisa disto:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/order"
RABBITMQ_URL="amqp://orderlab:orderlab@localhost:5672"
```

2. Subir só a infraestrutura. Se a stack inteira já estiver no ar, pare antes com `docker compose down`, senão as portas da API e da tela ficam ocupadas.

```bash
docker compose up -d postgres rabbitmq jaeger
```

3. Gerar o client e aplicar as migrations no banco local:

```bash
npx prisma generate --config prisma7.config.ts
npx prisma migrate dev --config prisma7.config.ts
```

`prisma generate` cria o client em `src/generated/prisma`. O CLI lê a URL do banco em `prisma7.config.ts`, por isso os comandos passam `--config`.

4. Três processos, cada um no seu terminal:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
export OTEL_SERVICE_NAME=order-lab-api
npm run start:dev
```

Em outro terminal:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
export OTEL_SERVICE_NAME=order-lab-worker
npm run start:worker:dev
```

Em um terceiro terminal:

```bash
cd web && npm install && npm run dev
```

A API escuta em http://localhost:3000. A tela do Vite abre em http://localhost:5173 e chama a API em `http://localhost:3000` por padrão (`web/src/api.ts`).
As variáveis `OTEL_*` precisam estar definidas antes de iniciar cada processo Node, pois o SDK OpenTelemetry é inicializado no carregamento da aplicação.

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

`web/` é um app Vite + React. No Docker ela é servida pelo nginx em http://localhost. No modo serviço a serviço, `npm run dev` sobe o Vite em http://localhost:5173.

O formulário chama `POST /orders`. A lista mostra nome, descrição, valor e o rótulo do status (Colocado, Recebido, Preparado, Entregue) e oferece o próximo comando enquanto o pedido não está entregue.
