# Contract: REST — Pipeline de Receita

**Feature**: `056-status-conta-receber`  
**Endpoint**: `GET /api/relatorios/pipeline-receita`  
**Auth**: JWT Bearer (papéis `admin` e `visualizador`)

## Request

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | sim | Ano do fechamento (`data_ent_pgto`) |
| `mes` | int 1–12 | não | Se omitido, agrega o ano inteiro |

Exemplo: `GET /api/relatorios/pipeline-receita?ano=2026&mes=9`

## Response 200

```json
{
  "ano": 2026,
  "mes": 9,
  "fechado": { "valor": 100000.0, "contagem": 10, "percentual": 100.0 },
  "a_faturar": { "valor": 20000.0, "contagem": 2, "percentual": 20.0 },
  "faturado_ag_pagamento": { "valor": 30000.0, "contagem": 3, "percentual": 30.0 },
  "recebido": { "valor": 50000.0, "contagem": 5, "percentual": 50.0 }
}
```

Quando `mes` omitido: `"mes": null` e totais do ano.

Quando `fechado.valor = 0`: estágios com `valor: 0`, `contagem: 0`, `percentual: null` (ou `0` — UI trata como “—”).

## Regras normativas (MUST)

1. Universo: `nfs` com `excluida_em IS NULL`, `status != 'cancelada'`, `data_ent_pgto` no período.
2. **Incluir** registros com `arquivada = true` (mesmo comportamento dos KPIs de receita).
3. `valor` = `SUM(valor_liquido)`.
4. Estágios mutuamente exclusivos pela regra de [data-model.md](../data-model.md).
5. Invariante: soma dos três estágios = `fechado` (valor e contagem).
6. **MUST NOT** filtrar por `StatusNF` paga/pendente/vencida para montar os estágios (só excluir cancelada).
7. **MUST NOT** exigir ou gravar campo de status de ciclo.

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token / inválido |
| 422 | `ano` inválido ou `mes` fora de 1–12 |

## Cliente (frontend)

```ts
// relatoriosService.pipelineReceita(ano: number, mes?: number | null)
// chamado em Dashboard.tsx carregarDados junto aos demais relatórios
```

## Fora de escopo deste contrato

- Toggle bruto/líquido
- Meta bar / Por Caixa / Por Competência
- Detalhamento linha a linha (drill-down) — opcional futuro
