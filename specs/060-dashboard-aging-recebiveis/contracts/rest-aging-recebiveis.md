# Contract: REST — Aging de Recebíveis

**Feature**: `060-dashboard-aging-recebiveis`  
**Endpoint**: `GET /api/relatorios/aging-recebiveis`  
**Auth**: JWT Bearer (`admin`, `visualizador`)

Agregação do card **Aging de Recebíveis** do Dashboard. Estoque global (sem período). Dual-base bruto/líquido.

## Request

Sem query params obrigatórios. **Não** aceitar `ano`/`mes` como filtro (se enviados por engano, MUST ser ignorados ou rejeitados com 422 — preferência: **não documentar** esses params; endpoint sem filtro).

## Response 200

```json
{
  "referencia": "2026-09-10",
  "total_aberto": {
    "valor_liquido": 120000.0,
    "valor_bruto": 147239.26,
    "percentual_liquido": 100.0,
    "percentual_bruto": 100.0
  },
  "a_vencer_lt_30": {
    "valor_liquido": 20000.0,
    "valor_bruto": 24539.88,
    "percentual_liquido": 16.67,
    "percentual_bruto": 16.67
  },
  "d1_60": {
    "valor_liquido": 40000.0,
    "valor_bruto": 49079.75,
    "percentual_liquido": 33.33,
    "percentual_bruto": 33.33
  },
  "d60_90": {
    "valor_liquido": 25000.0,
    "valor_bruto": 30674.85,
    "percentual_liquido": 20.83,
    "percentual_bruto": 20.83
  },
  "d_mais_90": {
    "valor_liquido": 15000.0,
    "valor_bruto": 18404.91,
    "percentual_liquido": 12.5,
    "percentual_bruto": 12.5
  }
}
```

| Campo | Descrição |
|-------|-----------|
| `referencia` | Data civil `hoje` usada na classificação (`YYYY-MM-DD`) |
| `total_aberto` | Soma do **universo** (inclui residual) |
| `a_vencer_lt_30` … `d_mais_90` | Quatro buckets; soma dos valores ≤ total (residual implícito) |

Shape de bloco dual-base:

```ts
type AgingTotais = {
  valor_liquido: number;
  valor_bruto: number;
  percentual_liquido: number | null;
  percentual_bruto: number | null;
};
```

- `percentual_*` de `total_aberto`: `100` se total &gt; 0; `null` se total = 0.
- `percentual_*` de bucket: `SUM(bucket)/SUM(total)×100` na mesma base; `null` se total = 0.
- **Sem** `contagem` nesta resposta.

## Regras normativas (MUST)

1. Universo: `excluida_em IS NULL` ∧ `status != cancelada` ∧ `data_emissao IS NOT NULL` ∧ `data_pagamento IS NULL` (incluir arquivadas).
2. Classificação por `data_vencimento` vs `referencia` (= `date.today()`), conforme [data-model.md](../data-model.md).
3. Residual (sem vencimento ou `vencimento > hoje+30`) entra só em `total_aberto`.
4. Dual-base: `valor_liquido` / `valor_bruto` = SUM dos campos correspondentes.
5. Sem filtro por período do Dashboard.
6. Mesma resposta para `admin` e `visualizador`.

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token |

## Cliente

```ts
// relatoriosService.agingRecebiveis()
// → GET /api/relatorios/aging-recebiveis
```

Toggle Bruto/Líquido é só no client (`valorPorVisao` / `pctPorVisao`).
