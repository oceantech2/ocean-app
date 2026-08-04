# Research: Dashboard — Gráfico DRE Empilhado

**Feature**: `003-dashboard-dre-chart` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

## 1. Endpoint dedicado vs. montar DRE no client

**Decision**: Criar `GET /api/relatorios/dre-mensal?ano=` que devolve os 12 meses com `receita_bruta`, `despesa`, `impostos`, `lucro` já calculados.

**Rationale**: Regras de competência e exclusão de centros ficam num único lugar (testável/amostrável contra Impostos); dashboard não precisa listar centenas de contas. Alinha ao padrão de `faturamento-liquido-mes` e `impostos/de-contas`.

**Alternatives considered**:
- Client chama NFs + contas e agrega — rejeitado (duplica lógica, payload maior, risco de divergir de Impostos).
- Três endpoints separados — rejeitado (mais round-trips no `Promise.all` da dashboard).

## 2. Regras de agregação (espelho do spec)

**Decision**:
- **Receita bruta**: soma de `NF.valor_bruto` onde `status == PAGA`, `extract(year/month, data_emissao)` = mês/ano (mesmo critério de emissão/pagas usado em faturamento e `impostos/faturamento-nfs`).
- **Impostos**: soma de `ContaPagar.valor` com `centro_custo == IMPOSTOS`, mês/ano de `data_vencimento`; inclui pagas e pendentes; ignora `data_vencimento` nula (igual espírito de `/impostos/de-contas`).
- **Despesa**: mesma regra de data/status, centros **≠** `IMPOSTOS` (inclui `RETIRADA_LUCRO` e demais).
- **Lucro**: `receita_bruta - despesa - impostos` (pode ser negativo).

**Rationale**: Clarificações + alinhamento à visão de Impostos (FR-013–015); Despesa = todas as despesas exceto impostos.

**Alternatives considered**: Filtrar só `pago=true` / `data_pagamento` — rejeitado na clarificação.

## 3. Recharts: duas barras por mês (receita | pilha)

**Decision**: `BarChart` com séries:
- `receita_bruta` com `stackId="receita"` (barra única azul);
- `despesa`, `impostos`, `lucro_empilhado` com `stackId="composicao"` (pilha vermelho/cinza/verde).

Cores sugeridas (Tailwind-aligned): receita `#3B82F6`, despesa `#EF4444`, impostos `#9CA3AF`, lucro `#22C55E`.

`lucro_empilhado = max(0, lucro)`; campo `lucro` completo permanece nos dados para tooltip (prejuízo sem segmento).

**Rationale**: Dois `stackId` distintos geram barras lado a lado por categoria (mês); atende FR-002/012/014.

**Alternatives considered**:
- Waterfall custom — fora do padrão Recharts do projeto.
- Quatro barras agrupadas — rejeitado (usuário pediu pilha Despesa+Impostos+Lucro).
- Uma única pilha com receita — rejeitado na clarificação.

## 4. Labels / legenda

**Decision**: Usar `Legend` do Recharts com `hide` por série via estado React local (`mostrarReceita`, `mostrarDespesa`, …), todos `true` no mount; sem `localStorage`.

**Rationale**: FR-003/005; preferência não persiste (spec).

**Alternatives considered**: Checkboxes fora do chart — desnecessário se a Legend for clicável/controlada.

## 5. Eixo de meses (ano corrente vs. anterior)

**Decision**: API sempre retorna array de 12 meses (`mes: 1..12`). O client corta:
- `ano === ANO_ATUAL` → `dados.slice(0, MES_ATUAL)`;
- `ano < ANO_ATUAL` → 12 meses;
- `ano > ANO_ATUAL` → estado vazio / mensagem (sem inventar valores).

**Rationale**: Clarificação do eixo; API simples e reutilizável; UI aplica FR-007.

**Alternatives considered**: Filtrar no backend — possível, mas client já conhece `ANO_ATUAL`/`MES_ATUAL` e o seletor de ano.

## 6. Posição e estados vazios/erro

**Decision**: Inserir bloco DRE logo após o grid de saldos em `Dashboard.tsx`. Carregar DRE no mesmo `Promise.all` com `.catch` dedicado: falha → mensagem no bloco DRE + toast opcional; saldos/KPIs seguem. Ano sem valores → bloco presente com texto de ausência.

**Rationale**: FR-001, FR-009, US3; não quebrar página inteira se DRE falhar.

## 7. Ordem dos segmentos na pilha

**Decision**: Empilhar de baixo para cima: Despesa → Impostos → Lucro (ordem listada no spec).

**Rationale**: Deferred na clarify como baixo impacto; ordem do enunciado é default razoável.

## Research resolution

Nenhum item `NEEDS CLARIFICATION` permanece no Technical Context do [plan.md](./plan.md).
