# Contract: GET /api/relatorios/custo-por-categoria (uso duplo na Dashboard)

**Feature**: `015-dashboard-filtro-ano`  
**Base**: `specs/009-dashboard-filtro-mes/contracts/rest-custo-por-categoria.md`  
**Auth**: Bearer JWT

**Sem mudança de schema, params ou status codes.** Este contrato documenta **como** a Dashboard 015 consome o endpoint já existente.

## Request (inalterado)

```
GET /api/relatorios/custo-por-categoria?ano={ano}&mes_ate={mes_ate}&mes_de={mes_de}
```

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | sim | Ano civil |
| `mes_ate` | int 1–12 | sim | Último mês incluído |
| `mes_de` | int 1–12 | não (default `1`) | Primeiro mês incluído |

`mes_de > mes_ate` → `422`. Sem JWT → `401`.

## Uso Dashboard 015

### Donut do mês (somente se `mes` concreto)

```
GET /api/relatorios/custo-por-categoria?ano=2026&mes_de=3&mes_ate=3
```

Client: `relatoriosService.custoPorCategoria(ano, mes, mes)`.

### Donut do ano (sempre, se `ano ≤ anoCivilCorrente`)

```
GET /api/relatorios/custo-por-categoria?ano=2026&mes_de=1&mes_ate={mesAteAno}
```

- Ano corrente: `mesAteAno = mês civil de hoje` (não o mês do filtro).
- Ano anterior: `mesAteAno = 12`.
- Ano futuro: **não disparar**; UI em estado vazio.

Client: `relatoriosService.custoPorCategoria(ano, mesAteAno, 1)`.

### Independência

Trocar só o mês **não** altera a URL do donut do ano. As duas respostas são estados distintos no client (`custoMes*` vs `custoAno*`); falha de uma não zera a outra.

## Response 200 (inalterado)

Ver contrato 009: `ano`, `mes_de`, `mes_ate`, `total`, `categorias[]` (`categoria`/`centro_custo`, `label`, `valor`, `percentual`).

## Client (`api.ts`)

Assinatura **já existente** — não alterar:

```ts
custoPorCategoria: (ano: number, mesAte: number, mesDe: number = 1) =>
  api.get('/relatorios/custo-por-categoria', {
    params: { ano, mes_ate: mesAte, mes_de: mesDe },
  })
```
