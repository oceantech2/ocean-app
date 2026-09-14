# Implementation Plan: Ajuste de Modais no Viewport

**Branch**: `072-ajuste-modais-viewport` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/072-ajuste-modais-viewport/spec.md`

**Note**: Clarify 2026-09-14 — todas as modais do padrão; cabeçalho/ações fixos + miolo rolável; margem ~24px (~1,5rem).

## Summary

Corrigir o enquadramento visual das modais do Ocean App para que o painel **não encoste nem seja cortado** nas bordas superior/inferior da janela. Abordagem: introduzir um shell reutilizável de modal no frontend (backdrop com padding vertical de 1,5rem, painel com altura máxima `calc(100vh - 3rem)`, coluna flex com cabeçalho/rodapé fixos e corpo com `overflow-y-auto`) e migrar todos os overlays do padrão `fixed inset-0` + painel central. Sem mudanças de backend, APIs ou regras de negócio.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python/FastAPI **inalterado**

**Primary Dependencies**: React, Tailwind CSS; páginas e componentes que já montam overlay `fixed inset-0 bg-black/50` (ou variante próxima)

**Storage**: N/A — apenas layout de UI

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend; backend intocado)

**Performance Goals**: Abrir/rolar modal sem jank perceptível em notebook; sem impacto em tempo de resposta de API

**Constraints**: Portas fixas; papéis inalterados; margem mínima ~24px; não alterar handlers/validações; overlays menores (dropdowns/notificações) fora do escopo

**Scale/Scope**: ~1 componente shell novo + migração em ~10 arquivos (páginas Contas, NFs, Ferias, DH, Patrimonio, FluxoCaixa, Fornecedores, Configuracoes + componentes DocumentosModal, ImportCSV, GerenciadorArquivos; opcionalmente busca do Layout se mantida no padrão)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — sem mudança de permissões ou dados |
| III. Clareza antes de implementar | PASS — clarify fechou escopo, rolagem e margem |
| IV. Consistência com produto existente | PASS — mesmo visual (rounded-xl, fundo escurecido); só enquadramento/rolagem |
| V. Simplicidade e escopo fechado | PASS — shell mínimo + migração; sem lib externa de dialog |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Preferir um componente `Modal` (ou equivalente) a copiar classes em dezenas de lugares — isso **reduz** complexidade operacional (FR-003). Não extrair design system completo; props enxutas (`titulo`/`header`, `children`, `footer`, `maxWidth`, `onFechar` opcional no backdrop).

## Project Structure

### Documentation (this feature)

```text
specs/072-ajuste-modais-viewport/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-modais-viewport.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/components/Modal.tsx          # NOVO — shell padrão (backdrop + painel + regiões)
frontend/src/components/DocumentosModal.tsx
frontend/src/components/ImportCSV.tsx
frontend/src/components/GerenciadorArquivos.tsx
frontend/src/pages/Contas.tsx
frontend/src/pages/NFs.tsx
frontend/src/pages/Ferias.tsx
frontend/src/pages/DH.tsx
frontend/src/pages/Patrimonio.tsx
frontend/src/pages/FluxoCaixa.tsx
frontend/src/pages/Fornecedores.tsx
frontend/src/pages/Configuracoes.tsx
# Layout.tsx — apenas se a busca global for tratada como modal do padrão (ver research)
```

**Structure Decision**: Feature 100% frontend. Um shell compartilhado garante margem, altura máxima e regiões sticky; cada página/componente passa o conteúdo atual como `header`/`children`/`footer` sem mudar lógica de formulário. Backend e `api.ts` intocados.

## Complexity Tracking

> Sem violações a justificar.
