# Contract: REST — Receita Por Caixa

**Feature**: `058-dashboard-caixa-competencia`  
**Endpoint**: `GET /api/relatorios/receita-caixa`  
**Auth**: JWT Bearer (`admin`, `visualizador`)

Agregação da aba **Por Caixa** do Dashboard. Dual-base para métricas de receita; impostos absolutos.

## Request

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | sim | Ano do período |
| `mes` | int 1–12 | não | Omitido = ano inteiro |

Sem param de toggle — a resposta traz as duas bases onde aplicável.

## Response 200

```json
{
  "ano": 2026,
  "mes": 9,
  "recebido": {
    "valor_liquido": 80000.0,
    "valor_bruto": 98159.51,
    "contagem": 8
  },
  "impostos_recolhidos": 18159.51,
  "a_receber": {
    "valor_liquido": 15000.0,
    "valor_bruto": 18404.91,
    "contagem": 2
  },
  "a_faturar": {
    "valor_liquido": 5000.0,
    "valor_bruto": 6134.97,
    "contagem": 1
  }
}
```

| Campo | Descrição |
|-------|-----------|
| `mes` | `null` se request sem mês |
| `recebido` | NFs com `data_pagamento` no período |
| `impostos_recolhidos` | `SUM(COALESCE(valor_imposto,0))` das NFs com `data_emissao` no período — **não** dual-base |
| `a_receber` | `data_ent_pgto` no período ∧ `data_emissao` NOT NULL ∧ `data_pagamento` NULL |
| `a_faturar` | `data_ent_pgto` no período ∧ `data_emissao` NULL ∧ `data_pagamento` NULL |

Shape de estágio dual-base (igual Pipeline 057, sem percentuais obrigatórios nesta resposta):

```ts
type TotaisDual = {
  valor_liquido: number;
  valor_bruto: number;
  contagem: number;
};
```

## Regras normativas (MUST)

1. Exclusões: `excluida_em IS NULL` e `status != cancelada`; **incluir** `arquivada`.
2. Período em `recebido`: filtro por **`data_pagamento`** (`mes`+`ano` ou só `ano`).
3. Período em `impostos_recolhidos`: filtro por **`data_emissao`** (`mes`+`ano` ou só `ano`); não exige pagamento.
4. Período em `a_receber` / `a_faturar`: filtro por **`data_ent_pgto`** (não estoque global).
5. `valor_liquido` / `valor_bruto` = SUM dos campos correspondentes; `contagem` única por bloco.
6. `impostos_recolhidos` MUST NOT variar com interpretação bruto/líquido no client.
7. Registro sem `valor_imposto` contribui 0 aos impostos.

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token |
| 422 | `ano`/`mes` inválidos |

## Cliente

```ts
// relatoriosService.receitaCaixa(ano: number, mes?: number | null)
```

## Relação com Pipeline

Não substitui `GET /pipeline-receita`. A aba Por Competência consome o Pipeline; este endpoint alimenta só Por Caixa.
