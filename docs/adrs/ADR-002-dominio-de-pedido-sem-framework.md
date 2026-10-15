# ADR-002: Domínio de pedido sem framework

**Status:** Proposta
**Data:** 2026-10-15
**Domínio:** engineering
**Impacto:** ALTO — separa a regra do pedido dos 2 processos (API e worker) e dos testes de unidade da máquina de estados.
**Autores:** Rodrigo Soares
**Contribuidores:** N/A
**Supersedes:** N/A
**Superseded-by:** N/A

## Contexto
- **Introdução**: O order-lab estuda Clean Architecture com um pedido de balcão de um item. A regra é a ordem dos status, a recusa do passo ilegal e a confirmação repetida. NestJS, Prisma e RabbitMQ são a borda que entrega essa regra.
- **AS IS**: A API e o worker precisam da mesma decisão de estado. O desenho alvo coloca HTTP, persistência e fila em adaptadores, e o caso de uso no centro. Sem essa fronteira, a regra tende a morar no serviço Nest que chama o Prisma.
- **Desafios identificados**:
  - A regra duplicada na API e no worker diverge no primeiro passo ilegal.
  - Teste da máquina de estados sobe framework, banco ou fila quando o caso de uso importa Prisma ou NestJS.
  - Um import de framework no domínio quebra a regra de dependência que o laboratório existe para estudar.

## Alternativas Consideradas
- **Regra dentro do serviço Nest**: O `OrdersService` valida o status, grava com o Prisma e publica na fila.
  - *Vantagens*: menos pastas; o caminho HTTP fica curto; cabe no módulo que a API já tem.
  - *Desvantagens*: o worker repete a regra ou depende do módulo HTTP; o teste do status sobe Nest; a Clean Architecture fica só no nome das pastas.
- **Espelhar o template de produto da Allos**: Módulos no estilo dos repositórios de produto, com contrato, domínio e infra já no formato da plataforma.
  - *Vantagens*: vocabulário alinhado ao trabalho do dia a dia; menos decisão de pasta.
  - *Desvantagens*: o laboratório passa a estudar o template, não a regra de dependência; carrega estrutura além de um pedido e dois processos.
- **Domínio em TypeScript puro, framework só na borda**: Entidade e casos de uso não importam NestJS, Prisma nem o cliente da fila. A API e o worker ligam as portas na inicialização.
  - *Vantagens*: a mesma regra serve aos dois processos; o teste de status usa repositório em memória; o compilador segura a fronteira do pacote.
  - *Desvantagens*: mapper entre o modelo Prisma e a entidade; um módulo Nest que só faz ligação; mais arquivos para um fluxo pequeno.

## Decisão
- **Alternativa escolhida**: Domínio em TypeScript puro, framework só na borda.
- **Detalhes da implementação**:
  - A entidade do pedido conhece nome, descrição, valor em reais e os status colocado, recebido, preparado e entregue.
  - Os casos de uso de criar e de avançar o passo dependem de portas, como repositório e publicador de evento.
  - O repositório Prisma, o publisher RabbitMQ, o controller HTTP e o consumer do worker ficam fora do domínio.
  - API e worker são composition roots: na inicialização, cada um escolhe a classe concreta de cada porta.
  - Os testes de unidade da máquina de estados rodam sem NestJS, Postgres ou RabbitMQ.
  - O ADR-001 continua valendo: só o worker grava a transição, por meio do caso de uso, não por um update solto no Prisma.

## Razões para a Decisão
1. O objetivo do laboratório é praticar a regra de dependência, com o domínio no centro.
2. API e worker executam a mesma sequência de status; uma cópia da regra em cada processo é o defeito que essa fronteira evita.
3. O teste do passo ilegal e da confirmação repetida precisa existir antes de Docker, fila e SigNoz.
4. O template de produto da Allos resolve outro contexto. Este repositório é um estudo de uma pessoa e de um pedido.

## Consequências
- **Positivas**: A fase da máquina de estados entrega valor com teste de unidade. Trocar o adaptador de fila ou de banco não reescreve o pedido. Os dois processos compartilham os casos de uso.
- **Negativas e Mitigações**: Há mapper e módulo de composição a mais. Mitigação: um pedido, uma tabela e três comandos, sem segundo agregado. A ligação errada na inicialização só aparece com a stack no ar. Mitigação: o caso de uso continua coberto por teste em memória, e o adaptador Prisma tem teste no contrato da porta.

## Riscos
- A regra volta para o serviço Nest no primeiro comando: Probabilidade Média · Impacto Alto · Mitigação: o domínio não importa framework, e o teste de unidade não sobe o NestJS.
- Mapper divergente do status gravado: Probabilidade Média · Impacto Médio · Mitigação: os quatro status do código (`INCLUDED`, `RECEIVED`, `PREPARED`, `DELIVERED`) têm um único mapeamento para colocado, recebido, preparado e entregue.
- Pastas demais para o tamanho do fluxo: Probabilidade Média · Impacto Baixo · Mitigação: o escopo permanece um item e dois processos, como no design doc.

## Referências
- [Design doc — Pedidos de balcão](../design-docs/dd-pedidos-de-balcao-20261015-095517.md)
- [Spec funcional — Pedidos](../features/pedidos.md)
- [ADR-001 — Transição de estado por comando](ADR-001-transicao-de-estado-por-comando.md)
