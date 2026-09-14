# Research: Cabeçalho Fixo na Tabela de Contas a Pagar

**Feature**: `066-contas-pagar-cabecalho-fixo` | **Date**: 2026-09-14

## R1 — Contenedor de rolagem (página vs. área da tabela)

**Decision**: Área rolável **só da tabela** (`overflow` no wrapper da listagem), com cabeçalho sticky no topo desse wrapper. Título, cards e filtros permanecem fora.

**Rationale**: Decisão do clarify (opção B). Atende FR-001/FR-006 e SC-005 sem grudar o thead na viewport ao rolar a página.

**Alternatives considered**:
- Sticky no scroll da página (`thead`/`th` com `sticky` relativo à viewport/main) — rejeitado pelo clarify.
- Extrair componente genérico de tabela sticky para todo o app — fora do escopo (constitution V).

## R2 — Técnica CSS para cabeçalho fixo + scroll horizontal

**Decision**: Um wrapper com `overflow-auto` (vertical e horizontal) e altura máxima; células do `<thead>` com `sticky top-0`, `z-index` adequado e fundo opaco (claro/escuro) igual ao cabeçalho atual.

**Rationale**: Mantém alinhamento cabeçalho–colunas no scroll horizontal (mesmo contenedor). Padrão HTML/CSS estável; poucas linhas em `Contas.tsx`. Hoje o wrapper já usa `overflow-x-auto`.

**Alternatives considered**:
- Padrão NFs (`.nfs-grade-head` / `.nfs-grade-body` com scroll sincronizado) — funciona, mas é mais código e CSS dedicado; desnecessário para uma tabela única em Contas.
- Duas tabelas (header fixo + body) — risco de desalinhamento de colunas; rejeitado.

## R3 — Altura da área rolável

**Decision**: `max-height` via `calc(100vh - …)` (Tailwind) estimando chrome da página (header do Layout + título + cards + filtros + paddings). Ajustar na implementação até a tabela ocupar o **espaço útil restante** sem forçar scroll da página para ler linhas, na resolução desktop típica.

**Rationale**: Spec assume “preencher o espaço útil”; o valor exato de offset é detalhe de layout (Assumption). Preferir uma constante Tailwind clara e comentário mínimo no código se o offset não for óbvio.

**Alternatives considered**:
- Flex column `flex-1 min-h-0` exigindo refatorar Layout/`main` — mais invasivo; só se o calc falhar em validação.
- Altura fixa em px — frágil com sidebar/header sticky; evitar.

## R4 — Fundo do cabeçalho sticky e legibilidade

**Decision**: Manter classes de fundo atuais do thead (`bg-gray-50` / `dark:bg-gray-700`) **nas `th` sticky** (ou garantir fundo opaco equivalente), com `z-10` (ou similar) para as linhas não “vazar” por cima.

**Rationale**: FR-003 / SC-002 — sem sobreposição ilegível nem cabeçalho transparente.

**Alternatives considered**:
- Backdrop blur / fundo semitransparente — piora legibilidade; rejeitado.

## R5 — Impressão / Exportar PDF

**Decision**: Em `@media print`, resetar `max-height` e `overflow` do wrapper da tabela para que `.print-area` imprima todas as linhas (comportamento atual de `window.print()`).

**Rationale**: Contas usa `print-area` na tabela; clipar o corpo quebraria Exportar PDF.

**Alternatives considered**:
- Ignorar impressão — risco de regressão; rejeitado.

## R6 — Escopo e regressões

**Decision**: Alterar apenas a listagem de Contas a Pagar; não mudar API, filtros, ordenação, ações, cards nem outras páginas.

**Rationale**: Spec Assumptions + constitution V.

**Alternatives considered**:
- Aplicar o mesmo padrão em NFs/outras listagens — adiado; fora desta feature.
