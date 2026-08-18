# Data Model: Dashboard — Cards com Todos os Meses

**Feature**: `035-dashboard-cards-todos-meses` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

Sem novas tabelas ou migrations. Evolui o **uso** do período da Dashboard (mês opcional da feature 015) nos cards de indicador e na visibilidade/largura das metas.

## Entidades conceituais

### Período da Dashboard

Inalterado em relação a 015:

| Campo | Tipo | Regras |
|-------|------|--------|
| `ano` | int | Obrigatório. Abertura = ano civil corrente. |
| `mes` | int 1–12 \| `null` | `null` = **Todos os meses**. Abertura = mês civil corrente. |

`mes` **nunca** é `0` neste estado.

### Recorte anual dos cards de indicador

Mesmo recorte do donut anual (`mesAteAno`):

| `ano` | `mes_ate` efetivo | Request |
|-------|-------------------|---------|
| corrente | mês civil corrente | `resumo-financeiro?ano=&mes_ate=` |
| anterior | 12 | idem |
| futuro | — | sem request; DTO zerado |

Com `mes` concreto: `resumo-financeiro?ano=&mes=` (mês isolado; `mes_ate` não se aplica).

### DTO `ResumoFinanceiro` (existente)

| Campo | Uso no card |
|-------|-------------|
| `faturamento_bruto_pago` | Faturamento Bruto |
| `faturamento_liquido_pago` | Faturamento Líquido (valor) |
| `quantidade_pagas` | subtítulo do líquido |
| `faturamento_bruto_pendente` | NFs pendentes (R$) |
| `quantidade_pendentes` | subtítulo das pendentes |

Fonte temporal: `NF.data_emissao` (ano + mês ou intervalo 1…`mes_ate`). Status: `paga` vs `pendente` como hoje.

### Cards de meta (layout, não dado novo)

| Condição | Meta anual | Meta mensal |
|----------|------------|-------------|
| `mes === null` | visível, largura total; `progresso(0, ano)` | **não renderizada**; sem `progresso(mes)` |
| `mes` concreto | visível, metade da fileira (desktop) | visível, metade; `progresso(mes, ano)` |

## Validação

| Regra | Onde |
|-------|------|
| `mes` 1–12 ou omitido; `mes_ate` 1–12 se informado | API (422 se fora da faixa) |
| Com `mes` informado, `mes_ate` não altera o filtro | API |
| Não chamar resumo se ano futuro (`mesAteAno === null`) | Client |
| Não chamar `progresso(mes)` se `mes === null` | Client |
| Não usar `mes=0` como “todos os meses” | Client |

## Ciclo de vida

1. Mount → `ano` e `mes` correntes (não abrir em **Todos os meses**).
2. Usuário altera mês (`null` ou 1–12) e/ou ano → clamp se necessário → `carregarDados()`.
3. Sem mês e ano permitido: 1 request de resumo (`ano` + `mes_ate`); meta só anual; KPIs com números; meta mensal fora do DOM.
4. Com mês: resumo com `ano`+`mes`; meta mensal no DOM.
5. Unmount → estado descartado.

## Relacionamentos

```text
Período(ano, mes?)
  ├── MetaAnual(ano)                         # sempre; largura total se mes nulo
  ├── ResumoNF(ano, mes)                     # mês concreto
  ├── ResumoNF(ano, mes_ate=YTD|12)          # mes nulo e ano ≤ corrente
  ├── MetaMensal(mes, ano)                   # só se mes concreto
  ├── DRE / FaturamentoSerie / CustoAno      # inalterados (015)
  └── Saldo*                                 # inalterado (015)
```
