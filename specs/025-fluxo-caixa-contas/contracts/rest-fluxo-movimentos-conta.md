# Contrato REST: Movimentos manuais com conta

**Feature**: `025-fluxo-caixa-contas` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md)

Prefixo existente: `/api/fluxo-movimentos`. JWT. POST/DELETE: **admin**. GET: autenticado.

## GET `/api/fluxo-movimentos`

Query:

| Param | Obrigatório | Uso |
|-------|-------------|-----|
| `mes` | não | Igual hoje |
| `ano` | não | Igual hoje |
| `conta` | **sim no Fluxo de Caixa** | `corrente` \| `investimento`. Sem o param: comportamento legado (todos) — a **página** sempre envia `conta`. |

Resposta: lista com os campos atuais **mais** `conta`.

A página chama `listar(mes, ano, fluxoAtivo)`.

## POST `/api/fluxo-movimentos`

Body:

```json
{
  "tipo": "receita",
  "descricao": "Aporte",
  "valor": 1000,
  "data_movimento": "2026-08-13",
  "conta": "corrente"
}
```

`conta` obrigatória: `corrente` \| `investimento`. Ausente: tratar como `corrente` (legado/compat). Inválida: **400** com mensagem pt-BR.

A UI **sempre** envia o fluxo ativo. Sem PUT nesta feature.

## DELETE `/api/fluxo-movimentos/{id}`

Inalterado (204 / 404).

## GET `/api/saldos`

Já aceita `conta`. A página **deve** passar `conta=fluxoAtivo` junto de `mes`/`ano`.

POST/PUT de saldo: `conta` = fluxo ativo (a UI não oferece outra).

## GET `/api/nfs` e GET `/api/contas`

Inalterados (contratos da 024). Sem `mes`/`ano` em `/nfs` no caixa. Sem campo Caixa em pagar.

## Fora

- Endpoint unificado de movimentos do caixa
- PATCH de `conta` no manual
- Query `caixa` em Contas a Pagar
