# Contrato REST (leitura): Alertas de contas

**Feature**: `027-alertas-contas`

Esta feature **não** cria endpoints nem altera o corpo de `GET /api/alertas` nem `POST /api/alertas/enviar`.

Contagens e listas usam os GETs já autenticados (JWT):

## `GET /api/contas`

Query já existente: `skip`, `limit`, `categoria`, `pago`, `subcategoria`.

Para o painel e a tela: `pago=false`, `limit` no patamar atual (200 no hook, 500 na página). Recorte **hoje** vs **vencida** é no cliente (dia civil).

## `GET /api/nfs`

Query já existente: `skip`, `limit`, `mes`, `ano`, `status`, `incluir_arquivadas`.

Para NF pendente: **sem** `status` de pagamento, `incluir_arquivadas=false`, **sem** `mes` (e sem filtrar ano, se o contrato atual permitir omitir). Cliente exclui `status=cancelada` e `numero` vazio/branco.

Para o alerta existente de NFs vencidas: `status=vencida` (inalterado).

## `GET /api/ferias`

Inalterado (alerta de aprovação).

## `GET /api/alertas`

Fora de escopo. Continua servindo preview/e-mail com a regra de antecedência de N dias. O painel in-app **não** passa a depender deste recurso nesta feature.

## Erros

401 sem token. Demais falhas: o hook de notificações ignora (UI não quebra).
