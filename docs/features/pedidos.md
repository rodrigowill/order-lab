# Feature: Pedidos

| Campo | Valor |
|---|---|
| Funcionalidades (origem) | Registrar pedido de balcão, consultar a lista e acompanhar colocado, recebido, preparado e entregue |
| Item de board | N/A — laboratório de estudo, sem item de board |
| Personas | Cliente |
| Jornada | Anotar no balcão um item e acompanhar até a entrega a quem pediu |
| Onda | 1 (MVP) |
| Dependências | Cada avanço de estado ocorre depois do anterior, de forma assíncrona. N/A para sistemas de negócio externos |
| Status | Draft — para refinamento funcional |

## Objetivo

Permitir que o Cliente anote um pedido de balcão e acompanhe o mesmo item até a entrega. Cada pedido é um item só: o nome de quem pediu, o que foi pedido em texto livre e o valor daquele item. Um segundo item é outro pedido, com os próprios dados e o próprio estado.

Os estados andam nesta ordem. Colocado significa que o balcão anotou o pedido. Recebido significa que ele foi aceito para preparo. Preparado significa que a cozinha terminou e o pedido está pronto para ser entregue ao cliente. Entregue significa que o pedido foi entregue ao cliente que o solicitou. A jornada vale porque o Cliente vê esse mesmo pedido avançar de um estado ao seguinte.

O Cliente é a pessoa no balcão. Informa os dados e observa a lista, sem se identificar.

## Descrição de Cenários

### Cenário 1 — Anotar um item e vê-lo aceito para preparo (happy path)

A Cliente Ana pede um sanduíche natural por R$ 18,00. O pedido entra na lista como colocado, com o nome Ana, a descrição do sanduíche e o valor informado. Em seguida o preparo aceita esse pedido. A lista mostra o mesmo pedido como recebido.

### Cenário 2 — Acompanhar pedido ainda colocado

Ana já anotou o sanduíche e o preparo ainda não aceitou. Na lista, o pedido aparece como colocado. Quando o aceite ocorre, a lista mostra esse mesmo pedido como recebido.

### Cenário 3 — Anotar dois itens

Ana quer o sanduíche e também um suco de laranja por R$ 8,50. Ela registra dois pedidos. A lista mostra os dois, cada um com a própria descrição, o próprio valor e o próprio estado. O sanduíche pode seguir até preparado ou entregue enquanto o suco permanece no estado em que estava.

### Cenário 4 — Recusar dados inválidos

O Cliente tenta anotar sem nome, sem o que foi pedido, sem valor, com valor igual a zero ou com valor negativo. Também tenta usar nome ou descrição formados só por espaços. Nenhum pedido novo aparece na lista. O Cliente entende que o registro não foi aceito e pode corrigir os dados.

### Cenário 5 — Falha ao anunciar o pedido depois do registro

Ana informa o sanduíche com dados válidos. O pedido fica anotado como colocado, mas o anúncio para o preparo não acontece. Ela percebe que a conclusão falhou. O pedido permanece colocado e não passa a recebido por causa dessa tentativa.

### Cenário 6 — Aceite de preparo repetido

O aceite do sanduíche chega mais de uma vez. Ana continua vendo um único pedido, no estado recebido. O estado permanece recebido.

### Cenário 7 — Cozinha deixa o pedido pronto

O sanduíche de Ana está recebido. A cozinha termina o preparo e o pedido fica pronto para entrega. A lista mostra esse mesmo pedido como preparado, ainda com o nome Ana, a descrição do sanduíche e o valor de R$ 18,00. Uma nova confirmação de preparo mantém um único pedido preparado.

### Cenário 8 — Entregar o pedido a quem solicitou

O sanduíche está preparado. Ele é entregue a Ana, a cliente que o solicitou. A lista mostra esse mesmo pedido como entregue, com os mesmos dados. Uma nova confirmação de entrega mantém um único pedido entregue.

### Cenário 9 — Avançar na ordem dos estados

O sanduíche de Ana só fica preparado depois de recebido, e só fica entregue depois de preparado. Se a conclusão do preparo chega com ele ainda colocado, a lista continua mostrando colocado. Se a entrega chega com ele ainda recebido, a lista continua mostrando recebido. Nome, descrição e valor permanecem os do sanduíche.

## Critérios de Aceite

- [ ] Dado que o Cliente informou o nome de quem pediu, o que foi pedido e um valor em reais maior que zero, Quando anota o pedido, Então a lista mostra um pedido colocado com esses três dados.
- [ ] Dado um pedido colocado, Quando o preparo aceita esse pedido, Então esse mesmo pedido passa a recebido e a lista mostra o novo estado.
- [ ] Dado um pedido colocado cujo preparo ainda não aceitou, Quando o Cliente consulta a lista, Então o pedido permanece colocado.
- [ ] Dado que o Cliente quer dois itens, Quando anota cada um, Então a lista mostra dois pedidos, cada qual com a própria descrição, o próprio valor e o próprio estado.
- [ ] Dado dois pedidos, Quando um deles avança para recebido, preparado ou entregue, Então só esse pedido muda de estado.
- [ ] Dado que o nome está vazio ou contém só espaços, Quando o Cliente tenta anotar, Então nenhum pedido novo é criado e o Cliente vê que o registro foi recusado.
- [ ] Dado que a descrição do item está vazia ou contém só espaços, Quando o Cliente tenta anotar, Então nenhum pedido novo é criado e o Cliente vê que o registro foi recusado.
- [ ] Dado que o valor está ausente, é zero ou é negativo, Quando o Cliente tenta anotar, Então nenhum pedido novo é criado e o Cliente vê que o registro foi recusado.
- [ ] Dado um valor em reais com centavos e maior que zero, Quando o Cliente anota o pedido, Então o valor aceito é exatamente o valor informado.
- [ ] Dado que o pedido foi anotado e o anúncio para o preparo falha, Quando a tentativa termina, Então o Cliente vê a falha, o pedido consta como colocado e não passa a recebido nessa tentativa.
- [ ] Dado um pedido já recebido, Quando o aceite de preparo se repete, Então continua existindo um único pedido e o estado permanece recebido.
- [ ] Dado um pedido recebido, Quando a cozinha termina o preparo, Então esse mesmo pedido passa a preparado, permanece com o mesmo nome, a mesma descrição e o mesmo valor, e a lista mostra que está pronto para entrega ao cliente.
- [ ] Dado um pedido já preparado, Quando a conclusão do preparo se repete, Então continua existindo um único pedido e o estado permanece preparado.
- [ ] Dado um pedido preparado, Quando ele é entregue ao cliente que o solicitou, Então esse mesmo pedido passa a entregue e a lista mostra esse estado, com o mesmo nome, a mesma descrição e o mesmo valor.
- [ ] Dado um pedido já entregue, Quando a entrega se repete, Então continua existindo um único pedido e o estado permanece entregue.
- [ ] Dado um pedido colocado, Quando a cozinha conclui o preparo, Então o estado permanece colocado, com o mesmo nome, a mesma descrição e o mesmo valor.
- [ ] Dado um pedido recebido, Quando a entrega é confirmada, Então o estado permanece recebido, com o mesmo nome, a mesma descrição e o mesmo valor.
- [ ] Dado que o Cliente abre a jornada, Quando vai anotar um pedido, Então consegue fazer isso sem se identificar.

## Perguntas em Aberto

- Qual é o tamanho máximo do nome e da descrição do item, e qual é o valor máximo aceito? — (Rodrigo, no refinamento funcional)
- Qual texto o Cliente vê quando o registro é recusado e quando o anúncio falha depois da anotação? — (Rodrigo, no refinamento funcional)
- Em quanto tempo, no máximo, cada avanço de colocado até entregue deve aparecer na lista para a jornada ser considerada correta? — (Rodrigo, no refinamento funcional)
- Cancelar ou editar um pedido entra neste laboratório? — (Rodrigo, no refinamento funcional)
