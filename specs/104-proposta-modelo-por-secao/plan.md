# Implementation Plan: Modelo por seção na nova proposta

**Branch**: `104-proposta-modelo-por-secao` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/104-proposta-modelo-por-secao/spec.md`

## Summary

Na tela "Nova proposta" do Proposal, cada seção cujo conteúdo um modelo guarda (Apresentação, Cliente/setor, Escopo, Projetos, Garantias e condições, Validade) ganha um seletor de modelo no cabeçalho que substitui só aquela seção. A mudança é inteira no frontend, em `ModeloForm.tsx` (que já renderiza as seções) e `Nova.tsx` (que já carrega os modelos da divisão). A origem de cada seção é guardada como "modelo + assinatura do conteúdo aplicado"; o seletor só mostra o modelo enquanto o conteúdo atual tiver a mesma assinatura, o que resolve as falhas da primeira versão (não dava para restaurar o modelo depois de editar, e o seletor mentia sobre a origem).

## Technical Context

**Language/Version**: TypeScript 5 + React 18 (frontend)

**Primary Dependencies**: Vite, Tailwind, TipTap (editor do escopo), react-hot-toast, React Router 6

**Storage**: N/A — nada novo é gravado; a proposta continua com o mesmo payload de `POST /api/proposal/propostas/`

**Testing**: Sem suíte automatizada no frontend; validação por `npx tsc --noEmit` (em `frontend/`) e roteiro manual em [quickstart.md](./quickstart.md)

**Target Platform**: Web (Proposal em `frontend/src/proposal`)

**Project Type**: Aplicação web (só a parte frontend é tocada)

**Performance Goals**: Nenhuma consulta nova ao servidor; aplicar um modelo numa seção é instantâneo (só estado local)

**Constraints**: Não alterar backend, payload nem validações; manter o seletor geral da feature 098; editar proposta e cadastro de modelo sem seletores de seção

**Scale/Scope**: 2 arquivos de frontend; 6 seletores de seção; dezenas de modelos por divisão no máximo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Spec, plano e artefatos em pt-BR; textos de UI em pt-BR | ✅ |
| II. Domínio Financeiro Interno | Sem mudança de permissões: quem pode criar proposta continua igual; modelos seguem só leitura para não admins | ✅ |
| III. Clareza Antes de Implementar | Escopo das seções e filtro da seção Cliente registrados em Clarifications antes do plano | ✅ |
| IV. Consistência com o Produto | Mesma confirmação por `window.confirm` já usada no seletor geral; mesmo estilo de selects do Proposal | ✅ |
| V. Simplicidade e Escopo Fechado | Só frontend; sem gravar origem das seções; sem mudar o conector do Claude | ✅ |

**Re-check pós-design**: sem violações; nenhuma entrada em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/104-proposta-modelo-por-secao/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-seletor-secao.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/proposal/
├── components/ModeloForm.tsx   # seletor por seção, origem com assinatura, aplicação por seção
└── pages/Nova.tsx              # passa os modelos da divisão e o modelo geral ao formulário
```

**Structure Decision**: Aplicação web existente; a feature fica restrita a dois arquivos do Proposal. `ModeloForm` recebe os modelos por props opcionais, então `Editar.tsx` e `ModeloEditor.tsx`, que não passam essas props, continuam sem seletores de seção (FR-011).

## Complexity Tracking

Sem violações da constitution.
