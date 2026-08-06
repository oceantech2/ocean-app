# Contract: GET /api/relatorios/custo-por-categoria (extensão mes_de)

**Feature**: `009-dashboard-filtro-mes`  
**Base**: `specs/004-dashboard-custo-donut/contracts/rest-custo-por-categoria.md`  
**Auth**: Bearer JWT

## Request

```
GET /api/relatorios/custo-por-categoria?ano={ano}&mes_ate={mes_ate}&mes_de={mes_de}
```

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | sim | Ano civil |
| `mes_ate` | int 1–12 | sim | Último mês incluído (inclusive) |
| `mes_de` | int 1–12 | não (default `1`) | Primeiro mês incluído (inclusive) |

**Invariante**: `mes_de ≤ mes_ate`. Caso contrário → `422`.

### Uso Dashboard (mês isolado)

```
?ano=2026&mes_de=3&mes_ate=3
```

### Uso legado (YTD desde janeiro)

```
?ano=2026&mes_ate=3
```
(equivale a `mes_de=1`)

## Response 200

```json
{
  "ano": 2026,
  "mes_de": 3,
  "mes_ate": 3,
  "total": 50000.0,
  "categorias": [
    {
      "categoria": "salario",
      "centro_custo": "salario",
      "label": "Salário",
      "valor": 30000.0,
      "percentual": 60.0
    }
  ]
}
```

- Mesmas regras de agregação da feature 004/008 (por `categoria`, bucket `pendente`, etc.), **exceto** o filtro temporal:
  - `year(data_vencimento) == ano`
  - `mes_de <= month(data_vencimento) <= mes_ate`

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token / inválido |
| 422 | Params inválidos ou `mes_de > mes_ate` |

## Client

```ts
relatoriosService.custoPorCategoria(ano: number, mesAte: number, mesDe: number = 1) =>
  api.get('/relatorios/custo-por-categoria', {
    params: { ano, mes_ate: mesAte, mes_de: mesDe },
  })
```

Dashboard: `custoPorCategoria(ano, mes, mes)`.
