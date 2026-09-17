# Research: Headers Fixos em Tabelas com Scroll

**Feature**: `073-tabelas-header-fixo` | **Date**: 2026-09-16

## 1. Padrão de referência (Contas a Pagar)

**Decision**: Replicar o padrão já existente em `Contas.tsx`:
- Wrapper da grade: `overflow-auto max-h-[calc(100vh-22rem)]` (mantém `bg-white` / shadow / `print-area` quando já existirem)
- Cada `<th>`: `sticky top-0 z-10` + fundo opaco `bg-gray-50 dark:bg-gray-700` + sombra inferior `shadow-[0_1px_0_0_rgb(229_231_235)] dark:shadow-[0_1px_0_0_rgb(75_85_99)]`
- Controles do cabeçalho (ordenação, checkbox) permanecem nos `<th>` sticky

**Rationale**: Spec e clarify A pedem equivalência explícita com Contas a Pagar; o padrão já funciona em produção no produto.

**Alternatives considered**:
- Sticky do `thead` via `position: sticky` no `tr`/`thead` apenas — rejeitado (suporte inconsistente; Contas já usa sticky por `th`)
- `position: fixed` relativo à viewport — rejeitado (clarify rejeitou opção C; desalinha do padrão Contas)
- Biblioteca de virtualização (react-window etc.) — rejeitado (over-engineering; Constituição V)

## 2. Superfície: constante compartilhada vs. copy-paste

**Decision**: Extrair constantes Tailwind em `frontend/src/utils/tableScroll.ts` (ex.: `TABLE_SCROLL_CONTAINER_CLASS`, `TH_STICKY_CLASS`) e usá-las nas páginas de listagem. Contas pode migrar para as mesmas constantes sem mudança visual.

**Rationale**: ~10 páginas; constante única reduz drift de sombra/cores/z-index e atende FR-002 (consistência).

**Alternatives considered**:
- Componente React `<DataTable>` wrapper — rejeitado nesta entrega (refator grande; risco de regressão em layouts especiais)
- Só classes duplicadas página a página — aceitável, mas pior para manutenção; constante é o meio-termo

## 3. Inventário de páginas e tratamento

**Decision**:

| Página | Tratamento |
|--------|------------|
| Contas | Referência; alinhar a constantes se criadas |
| NFs (Contas a receber) | **Preservar** grade dual (`nfs-grade-head` / `nfs-grade-body` + sync) — já congela o header |
| Fornecedores, Férias, DH, Patrimônio, Impostos, Retiradas, Auditoria, Configurações | Padrão Contas completo |
| Bonus | Por tabela (cards por colaborador): wrapper `overflow-auto` + `max-h` + `th` sticky |
| FluxoCaixa | Duas tabelas de listagem: padrão Contas em cada wrapper |
| Dashboard | Sem `max-h` forçado; hoje sem `<table>` HTML — nada a fazer salvo surgir grade com scroll próprio |
| Contratos, Seguranca, Calendario | Sem `<table>` — fora |
| Modais / DocumentosModal etc. | Sticky nos `th` **somente** se o container do modal/tabela já rolar; **não** aplicar `max-h-[calc(100vh-22rem)]` |

**Rationale**: Clarify A/B/C; inventário real do frontend; NFs já cumpre SC-001 de outra forma (FR-003 analogamente: não piorar).

**Alternatives considered**:
- Converter NFs para sticky Contas — rejeitado (quebra sync horizontal e `sticky left-0` da 1ª coluna)
- Forçar max-h no Dashboard — rejeitado (clarify C)
- Forçar max-h em modais — rejeitado (clarify B)

## 4. Altura máxima (`max-h`)

**Decision**: Usar o mesmo cálculo de Contas: `max-h-[calc(100vh-22rem)]` como padrão das listagens de página. Ajustes pontuais só se uma página tiver chrome (filtros/abas) que deixe a área inutilizável — documentar no PR, mantendo o espírito Contas.

**Rationale**: Equivalência visual (SC-002); um único número evita “cada tela um max-h”.

**Alternatives considered**:
- `max-h` por página ad hoc — rejeitado (inconsistência)
- Altura flex (`flex-1 min-h-0`) no layout — possível futuro; NFs já usa altura fixa (`h-[36rem]`); não migrar todas agora

## 5. Fundo opaco e dark mode

**Decision**: Fundo do `th` sticky **sempre opaco** (não semi-transparente). Em Bonus, trocar `bg-gray-50/50` / `dark:bg-gray-700/50` do thead por fundos opacos no sticky (ou classes da constante).

**Rationale**: FR-004 / SC-005 — linhas passando sob o header não podem misturar texto.

**Alternatives considered**:
- `backdrop-blur` — desnecessário; Contas já usa sólido

## 6. Modais

**Decision**: Se um modal já tem `max-h` + `overflow` (ex.: `Modal.tsx` com `max-h-[calc(100vh-3rem)]`), e houver `<table>` dentro da área rolável, aplicar apenas classes sticky nos `th` (fundo opaco). Não adicionar segundo `max-h` estilo Contas.

**Rationale**: Clarify B; Modal já limita altura.

**Alternatives considered**:
- Modais fora total — rejeitado (sticky oportunista ainda melhora UX quando rola)
- Mesmo `max-h` Contas dentro do modal — rejeitado (área útil mínima)

## 7. Backend / dados

**Decision**: Nenhuma alteração em API, schemas, permissões ou sync.

**Rationale**: FR-007; feature 100% apresentação.

**Alternatives considered**: N/A.
