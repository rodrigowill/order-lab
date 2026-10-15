# ADR-001: Transição de estado por comando, com o worker como único escritor

**Status:** Proposta
**Data:** 2026-10-15
**Domínio:** engineering
**Impacto:** ALTO — define os 2 processos (API e worker), os 3 comandos HTTP e a fila que liga um ao outro.
**Autores:** Rodrigo Soares
**Contribuidores:** N/A
**Supersedes:** N/A
**Superseded-by:** N/A

## Contexto
- **Introdução**: O pedido de balcão nasce colocado e avança, um passo por vez, para recebido, preparado e entregue. Cada avanço precisa ser observável da chamada HTTP até o processo que grava o novo estado.
- **AS IS**: A spec exige que o Cliente, ou uma chamada manual, dispare aceitar, preparar e entregar. O estado só muda se o passo for legal. Uma confirmação repetida não cria outro pedido. O alvo local é p95 abaixo de 2 s entre o comando aceito e a lista mostrar o novo estado.
- **Desafios identificados**:
  - Dois escritores no mesmo status geram condição de corrida entre a API e o worker.
  - Um worker que avança sozinho os quatro estados esconde quem disparou o passo e reduz o que o trace ensina.
  - Gravar o estado na API e também publicar o evento abre falha entre os dois efeitos.

## Alternativas Consideradas
- **Worker avança sozinho os quatro estados**: Depois de gravar o pedido, um processo percorre colocado, recebido, preparado e entregue sem comando externo.
  - *Vantagens*: a tela só cria e lista; menos endpoints; o fluxo completo aparece sem ação extra.
  - *Desvantagens*: some o ator do passo; o trace não distingue quem pediu cada transição; a spec deixa de ter um comando por etapa.
- **Só o primeiro passo usa fila; preparado e entregue são HTTP síncronos**: A API publica o aceite e grava preparado e entregue na própria requisição.
  - *Vantagens*: os dois últimos passos respondem com o estado já gravado; menos mensagens.
  - *Desvantagens*: dois estilos de transição no mesmo pedido; o trace cruza a fila só no primeiro passo; a API volta a escrever status.
- **Comando HTTP publica o evento e o worker grava o próximo estado**: Aceitar, preparar e entregar publicam uma mensagem. O worker é o único que persiste a transição.
  - *Vantagens*: um escritor de status; cada comando vira um trace da API até o worker; passo ilegal é recusado antes da publicação e de novo no consumo.
  - *Desvantagens*: sucesso do HTTP significa anúncio, não estado já gravado; a lista espera o worker, dentro do alvo de 2 s; operar fila e dois processos no laboratório local.

## Decisão
- **Alternativa escolhida**: Comando HTTP publica o evento e o worker grava o próximo estado.
- **Detalhes da implementação**:
  - `POST /orders` grava o pedido como colocado. Esse é o único status escrito pela API.
  - `POST /orders/{id}/accept`, `POST /orders/{id}/prepare` e `POST /orders/{id}/deliver` publicam o comando do passo quando o estado atual permite.
  - A API responde erro se o passo for ilegal ou se a publicação falhar. O pedido permanece no estado anterior.
  - O worker aplica o passo só quando o estado atual permite. Mensagem repetida no estado alvo é confirmada e não cria outro pedido.
  - Sucesso do comando significa que o evento foi anunciado. A lista mostra o estado novo depois da gravação do worker, com p95 abaixo de 2 s.
  - Não há outbox nesta versão: na transição, a API não grava o estado novo.

## Razões para a Decisão
1. A spec pede um disparo explícito para aceitar, preparar e entregar, e a lista deve preservar o estado quando o passo não cabe.
2. Um único escritor elimina a disputa pelo mesmo status entre a API e o worker.
3. Cada comando atravessa HTTP, fila e worker, que é o trace que o laboratório precisa ver no SigNoz.
4. Falha na publicação deixa o estado como está, sem um segundo efeito gravado pela API.

## Consequências
- **Positivas**: A sequência de estados tem uma regra só, repetida na API e no worker. O Cliente vê a recusa na hora. O mesmo desenho vale para a tela e para a chamada manual.
- **Negativas e Mitigações**: O comando pode retornar sucesso antes de a lista mudar. Mitigação: o contrato trata sucesso como anúncio, e a consulta é a confirmação do estado, no alvo de p95 abaixo de 2 s. A fila fica no caminho de todo passo. Mitigação: uma fila e três mensagens, uma por passo, com o identificador do pedido. Sem outbox, uma mensagem publicada com o worker parado espera na fila. Mitigação: o estado não muda até o consumo, e a republicação da mesma mensagem é idempotente.

## Riscos
- Publicação aceita e worker indisponível: Probabilidade Média · Impacto Médio · Mitigação: a mensagem permanece na fila; o estado anterior segue visível na lista até o consumo.
- Passo fora de ordem publicado por um cliente antigo: Probabilidade Baixa · Impacto Médio · Mitigação: a API recusa antes de publicar e o worker ignora a transição ilegal.
- Leitura da lista no meio dos 2 s e interpretação de atraso como falha: Probabilidade Média · Impacto Baixo · Mitigação: o alvo de p95 abaixo de 2 s está no design doc, e a tela consulta de novo o mesmo pedido.

## Referências
- [Design doc — Pedidos de balcão](../design-docs/dd-pedidos-de-balcao-20261015-095517.md)
- [Spec funcional — Pedidos](../features/pedidos.md)
