# Contract: GET /api/relatorios/dre-mensal (atualização 075)

**Feature**: `075-dre-linha-impostos`  
**Baseline**: Substitui a regra de Impostos de `047-dashboard-metricas-dre` / `contracts/rest-dre-mensal.md` **somente** para este endpoint  
**Auth**: Bearer JWT (`admin` | `visualizador`)

## Request

```
GET /api/relatorios/dre-mensal?ano={ano}
```

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | sim | Ano civil a agregar |

## Response 200

Formato **inalterado**:

```json
{
  "ano": 2026,
  "dados": [
    {
      "mes": 1,
      "receita_bruta": 100000.0,
      "despesa": 40000.0,
      "impostos": 8500.0,
      "lucro": 51500.0
    }
  ]
}
```

- `dados` SEMPRE com **12** itens, `mes` de 1 a 12, ordem crescente.
- Valores float; mês sem movimento → zeros.
- `lucro` pode ser negativo.

## Regras de cálculo (normativas — 075)

1. **Receita bruta** = Σ `NF.valor_bruto` com `status=paga`, `excluida_em IS NULL`, emissão no mês/ano. *(inalterado)*
2. **Impostos** = Σ `ContaPagar.valor` com:
   - `tipo_despesa = "imposto_das"`
   - `data_vencimento IS NOT NULL`
   - ano/mês de `data_vencimento` = mês/ano do ponto
   - **MUST NOT** usar `NF.valor_imposto` nem `data_pagamento` / flag `pago`
3. **Despesa** = Σ `ContaPagar.valor` com `tipo_despesa != "imposto_das"`, `data_vencimento` no mês/ano. *(já vigente pós-074)*
4. **Lucro** = `receita_bruta − despesa − impostos` (com impostos da regra 2).

## Coerência com outros endpoints

| Endpoint | Relação |
|----------|---------|
| `GET /api/impostos/de-contas?ano=` | Campo mensal `valor_imposto` MUST coincidir com `impostos` do DRE no mesmo mês/ano (± 0,01) |
| Card Impostos (Dashboard) | **Não** precisa coincidir (NFs); fora deste contrato |

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem JWT válido |
| 422 | `ano` ausente / inválido (comportamento FastAPI vigente) |

## Fora de escopo neste contrato

- Alterar shape da resposta
- Novos query params
- Alterar `custo-por-categoria`, abas de receita ou página Impostos além da coerência numérica com `de-contas`
