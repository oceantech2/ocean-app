# Contrato REST: leitura para o Fluxo de Caixa

**Feature**: `024-fluxo-caixa-importar` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md)

Nenhum endpoint novo. Contratos **existentes** e como o caixa deve chamá-los.

## GET `/api/nfs`

| Param | Valor no Fluxo de Caixa |
|-------|-------------------------|
| `skip` / `limit` | Paginar: `limit=1000`, `skip` 0, 1000, … até lista vazia |
| `status_filtro` | `paga` |
| `incluir_arquivadas` | `false` (omitir ou explícito) |
| `mes` / `ano` | **Não enviar** (filtram emissão, não pagamento) |

Auth: usuário autenticado com permissão de Fluxo de Caixa (mesmo JWT das demais páginas).

Resposta: lista de Contas a Receber. O cliente filtra `data_pagamento` pelo período da tela e `valor_liquido > 0`.

## GET `/api/contas`

| Param | Valor no Fluxo de Caixa |
|-------|-------------------------|
| `skip` / `limit` | Paginar até esgotar (`limit=1000`) |
| `pago` | `true` |
| `categoria` / `subcategoria` | Não enviar |

O cliente filtra `data_pagamento` pelo período e `valor > 0`.

## GET `/api/fluxo-movimentos`

| Param | Valor |
|-------|--------|
| `mes` | Mês da tela, ou omitir se “Todos” |
| `ano` | Ano da tela |

Manuais do período; não misturar com automáticos no servidor.

## GET `/api/saldos`

Inalterado (cards e tabela de saldo).

## POST/DELETE manuais e saldos

Inalterados. DELETE de movimento **somente** id de `fluxo_movimentos`. Não há DELETE de movimento automático.

## Fora deste contrato

- POST de importação de Contas a Receber/Pagar no Fluxo de Caixa
- Query nova `data_pagamento` na API (adiada)
- Recalcular saldos a partir dos movimentos
