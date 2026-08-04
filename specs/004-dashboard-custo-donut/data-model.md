# Data Model: Dashboard — Gráfico Donut de Custo por Categoria

**Feature**: `004-dashboard-custo-donut` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

Sem novas tabelas. Agregação sobre entidades existentes.

## Entidades de origem (existentes)

### ContaPagar (`contas_pagar`)

| Campo relevante | Uso no donut |
|-----------------|--------------|
| `valor` | Soma por categoria |
| `centro_custo` | Chave da fatia / categoria |
| `data_vencimento` | Competência mês/ano; `NULL` → fora da agregação |
| `pago` | **Não filtra** (pagas + pendentes) |

### CentroCusto (enum)

| Valor | Papel no donut |
|-------|----------------|
| `administrativo` | Categoria (se valor &gt; 0) |
| `retirada_lucro` | Categoria (incluída no total) |
| `salario` | Categoria |
| `impostos` | Categoria (incluída no total — distinto do DRE “Despesa”) |
| `reembolsos` | Categoria |
| `bonus` | Categoria |
| `evento` | Categoria |
| (futuros) | Entram no total se existirem no enum/banco |

## Entidades de visualização (DTO / resposta API)

### CategoriaCusto

| Campo | Tipo | Regra |
|-------|------|--------|
| `centro_custo` | string (enum value) | Identificador estável |
| `valor` | number &gt; 0 | Σ contas do centro no período |
| `percentual` | number | `valor / total * 100` |

### RespostaCustoPorCategoria

| Campo | Tipo | Regra |
|-------|------|--------|
| `ano` | int | Ano solicitado |
| `mes_ate` | int 1–12 | Último mês incluído (YTD ou 12) |
| `total` | number ≥ 0 | Soma dos `valor` das categorias retornadas |
| `categorias` | CategoriaCusto[] | Só valor &gt; 0; ordenadas por `valor` DESC |

## Validação / invariantes

- `sum(categorias.valor) == total` (tolerância float).
- Se `total == 0`, `categorias` é lista vazia; UI não mostra total positivo enganoso.
- Para cada item: `percentual ≈ valor / total * 100` quando `total > 0`.
- Impostos e retirada de lucro, quando &gt; 0, aparecem como fatias (não são excluídos).
- Relação: um `RespostaCustoPorCategoria` → 0..N `CategoriaCusto`.

## Estado / ciclo de vida (UI)

Não há CRUD. Ciclo: request autenticado com `ano` + `mes_ate` → agregação → render donut + legenda → descartado no unload. Sem persistência de preferências.
