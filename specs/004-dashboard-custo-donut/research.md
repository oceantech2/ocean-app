# Research: Dashboard — Gráfico Donut de Custo por Categoria

**Feature**: `004-dashboard-custo-donut` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

## 1. Endpoint dedicado vs. agregar no client

**Decision**: Criar `GET /api/relatorios/custo-por-categoria?ano=&mes_ate=` que devolve `total`, lista de categorias com `valor` e `percentual`, já filtrada (valor &gt; 0) e ordenada por valor decrescente.

**Rationale**: Mesma regra de vencimento/centros num único lugar; dashboard não lista todas as contas; alinhado a `dre-mensal` e demais relatórios. Percentuais no servidor evitam divergência client/server (SC-003).

**Alternatives considered**:
- Client chama `/contas` e agrega — rejeitado (payload grande, duplica regra YTD).
- Reutilizar só `dre-mensal` — rejeitado (DRE não quebra por centro; Despesa exclui impostos).

## 2. Regras de agregação (espelho do spec)

**Decision**:
- Fonte: `ContaPagar.valor` com `data_vencimento` não nula.
- Filtro temporal: `extract(year, data_vencimento) == ano` e `extract(month, data_vencimento) <= mes_ate`.
- `mes_ate`: client envia — ano corrente → mês atual; ano anterior → `12`; ano futuro → não carrega / estado vazio (FR-006).
- Agrupar por `centro_custo`; **todos** os centros (inclui `impostos` e `retirada_lucro`).
- Inclui pagas e pendentes (`pago` não filtra).
- Omitir categorias com soma `0`.
- `total` = soma dos valores retornados; `percentual` = `valor / total * 100` (1 casa decimal na API ou na UI — preferir calcular float completo na API e formatar na UI).
- Ordenar categorias por `valor` DESC; empates: ordem estável (ex.: nome do enum).

**Rationale**: Clarificações + alinhamento temporal ao DRE; base distinta do aspecto “Despesa” do DRE (aqui impostos entram).

**Alternatives considered**: Filtrar só `pago=true` / `data_pagamento` — rejeitado (mesmo critério do DRE/Impostos).

## 3. Recharts: donut + total no centro

**Decision**: `PieChart` + `Pie` com `innerRadius` (~55–60% do `outerRadius`) para formar donut. Total no miolo via:
- texto absoluto posicionado no centro do `ResponsiveContainer` / `PieChart`, **ou**
- `Label` customizado no `Pie` (`content` renderizando total formatado).

Tooltip: nome (label legível), valor BRL (`pt-BR`), percentual. Legenda: nome + %; mesma ordem das fatias. Sem toggle de categorias (spec).

Cores: paleta fixa por `centro_custo` (mapa estável), para a mesma categoria não mudar de cor entre anos. Sugestão alinhada ao Tailwind:

| centro_custo | Cor |
|--------------|-----|
| salario | `#3B82F6` |
| bonus | `#8B5CF6` |
| impostos | `#9CA3AF` |
| administrativo | `#F59E0B` |
| retirada_lucro | `#EF4444` |
| reembolsos | `#14B8A6` |
| evento | `#EC4899` |
| (outros / fallback) | ciclo em paleta secundária |

**Rationale**: Relatorios.tsx já usa `PieChart`; donut = `innerRadius`; FR-015 (total no centro); ordem valor DESC (FR-002).

**Alternatives considered**:
- Barras horizontais — fora do pedido.
- Cores só por índice da lista ordenada — rejeitado (cor muda quando ranking muda).

## 4. Labels de categoria

**Decision**: Exibir labels iguais a Contas a Pagar (`Salário`, `Bônus`, `Impostos`, …). Preferir mapa compartilhado ou cópia do `CENTRO_LABEL` de `Contas.tsx` no Dashboard / util pequeno; API pode devolver só o valor do enum (`centro_custo`) e o client rotula — **ou** API devolve `label` pronto. Preferência: API devolve `centro_custo` + client usa mapa de labels (fonte única de verdade no front alinhada a Contas).

**Rationale**: FR-008 / Assumptions (“nomes oficiais … Contas a Pagar”).

## 5. Layout half-width

**Decision**: Envolver o donut em `grid grid-cols-1 md:grid-cols-2 gap-4` imediatamente **abaixo** do bloco DRE. Célula esquerda = donut; célula direita = vazia nesta versão (slot reservado). Mobile (&lt; md / ~768px): uma coluna → donut full width.

**Rationale**: Clarificação Q5 (Option B); FR-001.

**Alternatives considered**: Full width — rejeitado na clarify. Compact centered — rejeitado.

## 6. Posição e estados vazios/erro

**Decision**: Inserir após o bloco DRE em `Dashboard.tsx` (antes do próximo gráfico existente, tipicamente Faturamento Líquido). Carregar no mesmo `Promise.all` (ou efeito do ano) com `.catch` dedicado: falha → mensagem só no bloco donut; DRE/saldos seguem. `total === 0` ou lista vazia → mensagem de ausência; sem total positivo falso no miolo. Ano futuro → não chamar ou estado vazio.

**Rationale**: FR-001, FR-010, US3.

## 7. Percentual e arredondamento

**Decision**: Calcular `percentual = valor / total * 100` com float; exibir com 1 casa decimal na UI. Não inventar fatia “Outros” para forçar soma 100,0. Aceitar ±0,1 p.p. na soma percebida (spec).

**Rationale**: FR-007 / US1 cenário 7.

## Research resolution

Nenhum item `NEEDS CLARIFICATION` permanece no Technical Context do [plan.md](./plan.md).
