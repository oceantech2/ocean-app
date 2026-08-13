# Contrato REST: Transferências do Fluxo de Caixa

**Feature**: `026-fluxo-caixa-transferencia` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md)

JWT. POST/DELETE de transferência: **admin**. GET de movimentos: autenticado (já existe).

Prefixos: `/api/fluxo-transferencias` (novo) e `/api/fluxo-movimentos` (estendido).

## POST `/api/fluxo-transferencias`

Cria o par em **uma** transação. 201.

Body:

```json
{
  "origem": "corrente",
  "destino": "investimento",
  "valor": 1500.5,
  "data_movimento": "2026-08-13",
  "observacao": "opcional"
}
```

| Campo | Regra |
|-------|--------|
| origem, destino | obrigatórios; `corrente` \| `investimento`; **diferentes** |
| valor | número &gt; 0 |
| data_movimento | ISO `YYYY-MM-DD` |
| observacao | opcional, string |

Erros **400** (mensagem pt-BR): contas inválidas ou iguais; valor ≤ 0; data inválida.

Resposta 201: as duas pernas serializadas (mesmos campos do GET de movimentos, **incluindo** `par_id`, `conta`).

Descrição gravada (se `observacao` vazia):

- despesa origem: `Transferência para Conta investimento` (ou corrente, conforme destino)
- receita destino: `Transferência de Conta corrente` (conforme origem)

Se `observacao` preenchida: `Descrição canônica — observacao`.

A API **não** precisa calcular saldo visível nesta versão (teto na UI).

## DELETE `/api/fluxo-transferencias/{par_id}`

Admin. Remove **as duas** pernas com aquele `par_id`. **204**. Se nenhuma linha: **404**. Nunca apagar só um lado.

## GET `/api/fluxo-movimentos`

Inalterado na query (`mes`, `ano`, `conta`). Cada item **inclui** `par_id` (`null` se legado).

A página, para o **card/teto**, também chama listar **sem** `mes`/`ano` com `conta` da origem (e da conta ativa).

## DELETE `/api/fluxo-movimentos/{id}`

Se o registro tem `par_id`: **400** (“Desfaça a transferência completa”). Se `par_id` nulo: 204 como hoje (manual legado).

## POST `/api/fluxo-movimentos`

Permanece no backend (legado/compat). **A tela Fluxo de Caixa não usa** para incluir receita/despesa.

## GET `/api/saldos`

Leitura com `conta` (e período se a UI ainda filtrar a **tabela**). Sem POST/PUT/DELETE disparados por esta página.

## GET `/api/nfs` e GET `/api/contas`

Inalterados (024/025).

## Fora

- Endpoint que devolve saldo visível já calculado
- PATCH de uma perna
- Transferência para conta que não seja corrente/investimento
