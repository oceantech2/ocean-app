# Contract: REST — Pipeline de Receita (extensão toggle)

**Feature**: `057-dashboard-toggle-periodo`  
**Endpoint**: `GET /api/relatorios/pipeline-receita`  
**Auth**: JWT Bearer (`admin`, `visualizador`)

Estende o contrato de `056-status-conta-receber` sem quebrar a identidade do funil.

## Request

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | sim | Ano de `data_ent_pgto` |
| `mes` | int 1–12 | não | Omitido = ano inteiro |

Sem param de toggle — a resposta traz **as duas bases**.

## Response 200

```json
{
  "ano": 2026,
  "mes": 9,
  "fechado": {
    "valor_liquido": 100000.0,
    "valor_bruto": 122699.39,
    "contagem": 10,
    "percentual_liquido": 100.0,
    "percentual_bruto": 100.0
  },
  "a_faturar": {
    "valor_liquido": 20000.0,
    "valor_bruto": 24539.88,
    "contagem": 2,
    "percentual_liquido": 20.0,
    "percentual_bruto": 20.0
  },
  "faturado_ag_pagamento": {
    "valor_liquido": 30000.0,
    "valor_bruto": 36809.82,
    "contagem": 3,
    "percentual_liquido": 30.0,
    "percentual_bruto": 30.0
  },
  "recebido": {
    "valor_liquido": 50000.0,
    "valor_bruto": 61349.69,
    "contagem": 5,
    "percentual_liquido": 50.0,
    "percentual_bruto": 50.0
  }
}
```

Compatibilidade: se clientes antigos ainda leem `valor` / `percentual`, o backend PODE espelhar temporariamente os campos líquidos (`valor` = `valor_liquido`, `percentual` = `percentual_liquido`) até o Dashboard 057 consumir só o shape dual.

## Regras normativas (MUST)

1. Mesmas regras de universo e estágio da feature 056 (`data_ent_pgto`, excluir cancelada/excluída, incluir arquivadas).
2. `valor_liquido` = SUM(`valor_liquido`); `valor_bruto` = SUM(`valor_bruto`).
3. `contagem` idêntica para as duas bases.
4. Invariante por base: soma dos três estágios = fechado (valor); soma das contagens = fechado.contagem.
5. Percentuais sobre fechado na **mesma** base; se fechado na base = 0 → percentual null (UI “—”).

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token |
| 422 | `ano`/`mes` inválidos |

## Cliente

```ts
// relatoriosService.pipelineReceita(ano, mes?)
// Dashboard escolhe valor_liquido vs valor_bruto conforme toggle local
```
