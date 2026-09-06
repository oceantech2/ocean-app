# Contract: GET /api/relatorios/dre-mensal (atualização 047)

**Feature**: `047-dashboard-metricas-dre`  
**Baseline**: Substitui a regra de Impostos de `003-dashboard-dre-chart` / `contracts/rest-dre-mensal.md`  
**Auth**: Bearer JWT

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
      "impostos": 12000.0,
      "lucro": 48000.0
    }
  ]
}
```

- `dados` SEMPRE com **12** itens, `mes` de 1 a 12, ordem crescente.
- Valores float; mês sem movimento → zeros.
- `lucro` pode ser negativo.

## Regras de cálculo (normativas — 047)

1. **Receita bruta** = Σ `NF.valor_bruto` com `status=paga`, `excluida_em IS NULL`, emissão no mês/ano. *(inalterado)*
2. **Impostos** = Σ `NF.valor_imposto` (tratar `NULL` como 0) com as **mesmas** NFs da regra 1. **MUST NOT** usar Contas a Pagar / vencimento.
3. **Despesa** = Σ Contas a Pagar com categoria ≠ impostos, `data_vencimento` no mês/ano. *(inalterado)*
4. **Lucro** = `receita_bruta − despesa − impostos` (com impostos da regra 2).

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token / token inválido |
| 422 | `ano` ausente ou inválido |

## Client

```ts
relatoriosService.dreMensal(ano: number) =>
  api.get('/relatorios/dre-mensal', { params: { ano } })
```

## UI (fora deste contrato HTTP)

- Frontend MUST exibir os **12** meses por padrão (não truncar no mês corrente).
- Ver [ui-dashboard-metricas-dre.md](./ui-dashboard-metricas-dre.md).
