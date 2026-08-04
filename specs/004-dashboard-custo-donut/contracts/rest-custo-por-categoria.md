# Contract: GET /api/relatorios/custo-por-categoria

**Feature**: `004-dashboard-custo-donut`  
**Auth**: Bearer JWT (mesmo padrão dos demais `/api/relatorios/*`)

## Request

```
GET /api/relatorios/custo-por-categoria?ano={ano}&mes_ate={mes_ate}
```

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | sim | Ano civil a agregar |
| `mes_ate` | int 1–12 | sim | Incluir meses de 1 até este valor (inclusive) |

## Response 200

```json
{
  "ano": 2026,
  "mes_ate": 7,
  "total": 150000.0,
  "categorias": [
    {
      "centro_custo": "salario",
      "valor": 60000.0,
      "percentual": 40.0
    },
    {
      "centro_custo": "impostos",
      "valor": 45000.0,
      "percentual": 30.0
    },
    {
      "centro_custo": "administrativo",
      "valor": 45000.0,
      "percentual": 30.0
    }
  ]
}
```

- `categorias` só com `valor > 0`, ordenadas por `valor` decrescente.
- `total` = soma dos valores; se não houver contas no período → `total: 0` e `categorias: []`.
- `percentual` = `valor / total * 100` (float); UI formata (ex.: 1 casa decimal).
- `centro_custo`: valor do enum (ex.: `salario`, `retirada_lucro`); client aplica label legível.

## Regras de cálculo (normativas)

Ver [data-model.md](../data-model.md) e [research.md](../research.md):

1. Σ `ContaPagar.valor` por `centro_custo` onde `data_vencimento` não é nula, ano = `ano`, mês ≤ `mes_ate`.
2. Inclui **todos** os centros (impostos e retirada de lucro inclusive).
3. Não filtra por `pago`.
4. Categorias com soma zero são omitidas.

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token / token inválido |
| 422 | `ano` / `mes_ate` ausente ou inválido (`mes_ate` fora de 1–12) |

## Client

```ts
relatoriosService.custoPorCategoria(ano: number, mesAte: number) =>
  api.get('/relatorios/custo-por-categoria', { params: { ano, mes_ate: mesAte } })
```

UI define `mesAte`: ano corrente → mês atual; ano passado → 12; ano futuro → estado vazio sem depender de inventar dados.
