# Data Model: Dashboard — Filtro de Ano Independente e Donut Anual

**Feature**: `015-dashboard-filtro-ano` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

Sem novas tabelas ou migrations. Evolui o **período de visualização** da feature 009: o mês passa a ser opcional. Agregações de custo reutilizam `ContaPagar` via o DTO já existente de `/custo-por-categoria`.

## Entidades conceituais

### Período da Dashboard

| Campo | Tipo | Regras |
|-------|------|--------|
| `ano` | int | Obrigatório. Abertura = ano civil corrente. Opções = `ANOS` existente. |
| `mes` | int 1–12 \| `null` | `null` = “Todos os meses” (visão do ano). Abertura = mês civil corrente (**não** `null`). |

**Invariantes**:
1. Se `mes !== null` e `ano === anoCivilCorrente` ⇒ `mes ≤ mêsCivilCorrente`.
2. Se `mes !== null` e `ano < anoCivilCorrente` ⇒ `mes ∈ [1, 12]`.
3. Ao mudar `ano`: se `mes === null`, permanece `null`; senão, se violar (1), `mes ← maxMesPermitido(ano)`.
4. `mes` **nunca** é `0` neste estado (reservado à meta anual na API de metas).

### Recorte de custo (duas visões)

Ambas usam o mesmo DTO `RespostaCustoPorCategoria` (`ano`, `mes_de`, `mes_ate`, `total`, `categorias[]`).

| Visão | `mes_de` | `mes_ate` | Quando existe |
|-------|----------|-----------|----------------|
| Donut do mês | `mes` | `mes` | Só se `mes !== null` |
| Donut do ano | `1` | `mêsCivilCorrente` se ano corrente; `12` se ano anterior | Sempre (ano futuro → vazio, sem request) |

**Invariantes do donut anual**:
- Independente de `mes` do filtro (mesmos `mes_de`/`mes_ate` para um dado `ano` civil).
- Categorias com `valor > 0`; `sum(valor) == total`; impostos e retirada entram no total (inalterado).

### Indicador mensal vs anual

| Bloco | `mes === null` | `mes` concreto |
|-------|----------------|----------------|
| Meta anual, DRE, faturamento/mês, donut do ano | Carrega o ano | Idem (donut do ano **não** muda ao trocar só o mês) |
| Meta mensal, KPIs de resumo (bruto/líquido/NFs) | Layout visível, estado vazio / “Selecione um mês” | Mês exato |
| Donut do mês | **Não renderizado**; donut do ano em largura total | Mês isolado, metade da largura no desktop |
| Saldos CC / investimento | Mais recente do ano (`max mes` com `ano` igual) | Mais recente com `registro.mes ≤ mes` no ano |

## Validação

| Regra | Onde |
|-------|------|
| `mes_de ≤ mes_ate`; ambos 1–12 | API existente (422) |
| Opções do select = “Todos os meses” + `mesesPermitidos(ano)` | UI |
| Não chamar `progresso(mes)` / `resumoFinanceiro(ano, mes)` se `mes === null` | Client |
| Fallback de saldo sem mês: nunca usa outro ano | Client |

## Ciclo de vida

1. Mount → `ano` corrente, `mes` corrente (`null` é opt-in).
2. Usuário altera mês (incl. `null`) e/ou ano → clamp se necessário → `carregarDados()`.
3. Sem mês: 1 request de custo (ano) + séries anuais + saldos do ano; meta/KPIs mensais sem fetch.
4. Com mês: 2 requests de custo + meta mensal + resumo com `mes` + saldos ≤ mês.
5. Unmount → estado descartado (sem persistência).

## Relacionamentos

```text
Período(ano, mes?)
  ├── MetaAnual(ano)
  ├── DRE(ano)
  ├── FaturamentoSerie(ano [, anoComparar])
  ├── CustoAno[mes_de=1, mes_ate=YTD|12, ano]
  ├── MetaMensal(mes, ano)          # só se mes concreto
  ├── CustoMes[mes_de=mes, mes_ate=mes, ano]  # só se mes concreto
  ├── ResumoNF(ano, mes)            # só se mes concreto
  └── Saldo*(ano, mes ≤ (mes ?? 12))
```
