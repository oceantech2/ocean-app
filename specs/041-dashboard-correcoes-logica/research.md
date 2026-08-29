# Research: Dashboard — Correções de Lógica, DRL e Ajustes Visuais

**Feature**: `041-dashboard-correcoes-logica` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

## 1. Meta de Receita Anual — percentual na barra

**Decision**: Calcular `realizadoAnual = Σ faturamentoLiquidoMes(ano).valor` (meses 1..limite YTD ou 12); `pct = min(realizadoAnual / metaAnual.valor_meta × 100, 100)`; exibir `{pct}%` **dentro** da barra quando `pct >= 18` (mesmo limiar da meta mensal). Valor monetário à esquerda = `realizadoAnual` formatado.

**Rationale**: Clarify Q5 — base Receita Líquida. Código atual já soma `faturamento` (líquido) mas usa `pctAnualDisplay` só na barra; meta mensal usa `meta.percentual` da API — alinhar UX anual ao padrão mensal (texto branco na barra).

**Alternatives considered**:
- Usar `metaAnual.percentual` da API — pode divergir se backend usar bruto; spec exige líquida.
- Sempre mostrar % mesmo com barra estreita — rejeitado; manter limiar 18% da mensal.

## 2. Saldo Conta Corrente por conta (FR-002)

**Decision**: Novo helper `saldoCorrenteDashboard(conta, saldos, nfs, contasPagas, manuais, padrao, recorte)`:

```text
saldoBase     = saldo do ultimoSaldoHistorico até fim do recorte (mês limite), ou 0
receitaBruta  = Σ NF.valor_bruto  (pagas, caixa=conta, data_pagamento ∈ recorte)
impostos      = Σ (NF.valor_bruto − NF.valor_liquido) no mesmo conjunto de NFs
despesas      = Σ ContaPagar.valor (pagas, caixa=conta, categoria≠impostos,
                natureza fixa|variavel, data_pagamento ∈ recorte)
saldo         = saldoBase + receitaBruta − impostos − despesas
```

Manuais: receita manual soma em receitaBruta; despesa manual soma em despesas (se não impostos). Pendentes **excluídas** (clarify Q2).

**Rationale**: Clarify Q1/Q2 — alocação por conta via movimentos, sem repetir KPIs globais. Impostos derivados de NF (bruto−líquido) refletem carga tributária da receita daquela conta. Despesas usam `naturezaDespesa` de `dashboardDespesas.ts` para excluir impostos e pendentes.

**Alternatives considered**:
- Manter `saldoVisivel` (usa valor_liquido nas entradas) — não atende FR-002 (bruto − impostos − despesas explícitos).
- Aplicar totais globais de Receita/Despesa em cada slot — rejeitado no clarify.
- Impostos via contas categoria `impostos` no caixa — possível divergência vs NF; preferir bruto−líquido por NF alocada (coerente com receita bruta da mesma fonte).

## 3. Despesas sem impostos (reforço)

**Decision**: Auditar e garantir que `totaisDespesa` e `filtrarCustoSemImpostos` cobrem FR-004/FR-005. Se vazamento persistir, verificar aliases (`IMPOSTOS`, `impostos`, centro_custo) no filtro e no mapa `EXCLUIDAS`. Sem alteração de backend.

**Rationale**: Feature 040 já implementou exclusão; pedido 041 é correção de bugs residuais. Checklist de quickstart inclui caso impostos pagos/pendentes.

**Alternatives considered**:
- Filtro `excluir_impostos` no backend — fora do escopo; 040 já filtra no client.

## 4. DRL histórico (FR-006/FR-007)

**Decision**:

1. Remover estado `mostrarAnterior`, `anoComparar` e request duplicado.
2. Em `carregarDados`, buscar `faturamentoLiquidoMes(y)` para `y = 2024 .. ANO_ATUAL` em paralelo.
3. Montar array flat: `{ mesLabel: 'Jan/24', valor, ano, mes }` apenas onde `valor > 0` (clarify Q4 — omitir meses sem lançamento).
4. Ordenar cronologicamente; `LineChart` com uma `<Line dataKey="valor" name="Receita Líquida" />`.
5. Eixo X: `dataKey="mesLabel"`; sem segunda série.

**Rationale**: Endpoint existente é por ano; 2–3 requests cobrem 2024–2026. Omitir zeros evita pontos artificiais. Intervalo fixo independe do filtro Head (FR-007).

**Alternatives considered**:
- Endpoint multi-ano novo — rejeitado (escopo fechado).
- Meses vazios como R$ 0 — rejeitado no clarify (C).
- Lacuna na linha — rejeitado no clarify.

## 5. Cabeçalho — remover comparação

**Decision**: Remover checkbox "Comparar", `<select anoComparar>` e dependências no `useEffect`. Manter filtros Mês e Ano.

**Rationale**: FR-008; DRL histórico substitui comparação ano a ano.

## 6. Cores seção Saldo

**Decision**: Inverter classes Tailwind dos cards: slots CC 1–3 → esquema `green-*` (atualmente investimento); Conta Investimento → esquema `blue-*` (atualmente correntes).

**Rationale**: FR-009/FR-010; troca mecânica de classes, sem tokens novos.

## 7. Recorte temporal (FR-011)

**Decision**: Saldo por conta, KPIs Despesa/Receita e meta anual continuam usando `ano`, `mes`, `mesAteAno(ano)` como na 040. Apenas DRL ignora filtro de ano.

**Rationale**: Spec FR-011 explícita.

## 8. Dependências 039/040

**Decision**: Implementar sobre Dashboard já estruturado pela 040 (`dashboardDespesas.ts`, seções, cards). Se 039/040 não mergeados na branch, aplicar em conjunto.

**Rationale**: Baseline da spec 041.
