# Research: Dashboard — Cards de Metas Lado a Lado

**Feature**: `002-dashboard-metas-cards` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

## 1. Escopo técnico: só frontend

**Decision**: Implementar apenas reorganização de layout/ordem em `Dashboard.tsx`; não alterar `metas.py`, modelo `MetaFinanceira` nem assinatura de `metasService`.

**Rationale**: Spec e clarificações pedem ordem, grid lado a lado, títulos e edição inline iguais aos atuais. Dados e progresso já existem (`progresso(MES_ATUAL, ano)` e `progresso(0, ano)`).

**Alternatives considered**:
- Extrair componente `MetaCard` reutilizável — útil, mas fora do mínimo; pode ser feito se reduzir duplicação sem expandir escopo.
- Mudar API para retornar as duas metas num único endpoint — desnecessário; `Promise.all` atual já atende.

## 2. Grid responsivo e breakpoint ~768px

**Decision**: Usar `grid grid-cols-1 md:grid-cols-2 gap-4` (Tailwind `md` = 768px) envolvendo os dois cards na ordem anual → mensal.

**Rationale**: Alinha à decisão de clarificação (lado a lado a partir de tablet médio) e ao padrão já usado nos KPIs (`md:grid-cols-3`) na mesma página.

**Alternatives considered**:
- `lg:` (1024px) — rejeitado pela clarificação B.
- Flex com `flex-col md:flex-row` — equivalente; grid é mais direto para 50/50 e stretch de altura.

## 3. Largura 50/50 e altura alinhada

**Decision**: Duas colunas iguais no grid; cards com `h-full` (e, se útil, container interno em coluna flex) para esticar à altura da linha. CSS Grid já faz `align-items: stretch` por padrão.

**Rationale**: Clarificação Q1 exige 50/50 e altura alinhada, inclusive com um card em modo edição inline.

**Alternatives considered**:
- Altura livre por conteúdo — rejeitado na clarificação.
- Altura mínima fixa em px — frágil com dark mode / tipografia; preferir stretch natural.

## 4. Ordem visual e títulos

**Decision**: Renderizar primeiro o bloco anual, depois o mensal. Manter strings atuais: `Meta de Faturamento Anual — {ano}` e `Meta de Faturamento — {mês}/{ano}`.

**Rationale**: Clarificações Q2 e FR-002/FR-005. Hoje a ordem no JSX é mensal → anual; basta inverter dentro do novo grid.

**Alternatives considered**: Rótulos curtos (“Meta Anual” / “Meta de Faturamento”) — rejeitados na clarificação.

## 5. Edição inline e papéis

**Decision**: Preservar estados `editandoMeta` / `editandoMetaAnual` e formulários inline; botões de editar só se `papel === 'admin'`.

**Rationale**: Clarificação Q3 e FR-006/FR-007; evita modal e regressão de UX.

**Alternatives considered**: Modal; card em edição em full-width — rejeitados.

## 6. Cálculo de realizado / progresso (sem mudança)

**Decision**: Manter regras atuais:
- Mensal: `realizado` e `percentual` de `GET /api/metas/progresso?mes=&ano=`
- Anual: `valor_meta` / `tem_meta` do progresso com `mes=0`; realizado = soma dos pontos de `faturamento` no client; `%` = min(100, realizado/meta) para a barra, display conforme código atual

**Rationale**: FR-008 e SC-005 — nenhuma regressão de negócio.

**Alternatives considered**: Unificar realizado anual só via API — melhorias futuras; fora de escopo.

## 7. Loading e demais seções

**Decision**: Manter o spinner de página inteira atual; não introduzir skeleton só para metas. Não mover/alterar KPIs, gráficos, retiradas ou saldos além do espaçamento necessário sob a nova faixa.

**Rationale**: Edge case de loading + FR-009.

## Research resolution

Nenhum item `NEEDS CLARIFICATION` permanece no Technical Context do [plan.md](./plan.md).
