# Implementation Plan: Correção da liberação em massa e filtro por status de liberação em Bônus e Comissão

**Branch**: `086-comissoes-liberacao-massa-filtro` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/086-comissoes-liberacao-massa-filtro/spec.md`

**Note**: Clarify 2026-10-08 — sintoma "nada acontece" (sem confirmação, sem requisição nos logs do Render); filtro com Todos / Liberados / Não liberados.

## Summary

O endpoint `POST /api/bonus/acoes/liberar` funciona (testado: 200 com `processados`/`ignorados`), e o bundle publicado é idêntico ao código local. O defeito está na tela `Bonus.tsx`: (1) a confirmação usa `window.confirm`, que o navegador passa a recusar em silêncio depois que o usuário marca "impedir caixas de diálogo adicionais", algo provável após dezenas de liberações individuais seguidas; (2) a barra de ações fica no fluxo do topo da página, acima do gráfico, fora de vista ou sob o cabeçalho sticky; (3) a seleção envia itens não elegíveis. A correção, 100% frontend, troca a confirmação nativa por um modal do sistema (`components/Modal.tsx`) com quantidade e valor, deixa a barra fixa no rodapé da viewport, envia só os IDs elegíveis e mostra contagens por ação. Também adiciona o filtro **Status** (Todos / Liberados / Não liberados) aplicado em memória sobre `bonusFiltrado`, mais o controle "Selecionar todos exibidos". Backend intocado.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind CSS, `react-hot-toast`, `components/Modal.tsx` (existente), `bonusService.liberarLote/pagarLote` (existentes)

**Storage**: N/A — sem mudança de schema; endpoints existentes

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run type-check` e `npm run build` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (somente frontend; backend intocado)

**Performance Goals**: Filtro e elegibilidade calculados em memória (≤ 500 itens/ano) sem atraso perceptível; 1 requisição por ação em massa (inalterado)

**Constraints**: Não alterar regras do servidor (`liberar_lote`/`pagar_lote`) nem a auditoria; não alterar ações individuais por linha; gráfico anual ignora o filtro de status; tema claro/escuro; responsivo; `visualizador` sem seleção

**Scale/Scope**: 2 arquivos (`pages/Bonus.tsx`, novo `utils/bonusSelecao.ts`); 0 endpoints novos; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — ações em massa só para `admin` (UI + `require_admin` no servidor); filtro para ambos |
| III. Clareza antes de implementar | PASS — diagnóstico com evidência (auditoria, logs Render, bundle de produção); clarify registrado |
| IV. Consistência com produto existente | PASS com desvio documentado — confirmação em massa via `Modal` do sistema em vez de `window.confirm` (justificativa: a caixa nativa pode ser bloqueada em silêncio, que é a causa do bug); toasts e spinner mantidos |
| V. Simplicidade e escopo fechado | PASS — reuso de `Modal` e dos endpoints; helpers puros; ações individuais intocadas |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexity Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/086-comissoes-liberacao-massa-filtro/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-comissoes-liberacao-massa-filtro.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/utils/bonusSelecao.ts   # helpers puros: filtro por status, elegíveis para liberar/pagar, soma
frontend/src/pages/Bonus.tsx         # filtro Status, barra fixa, modal de confirmação, selecionar todos exibidos
```

**Structure Decision**: Regras puras (filtro e elegibilidade) ficam em `utils/bonusSelecao.ts`, no mesmo padrão de `utils/comissoesPeriodo.ts`; estado, modal e barra ficam em `Bonus.tsx`. O modal de confirmação usa o shell `components/Modal.tsx`, sem criar novo componente genérico (escopo fechado).

## Complexity Tracking

> Sem violações a justificar.
