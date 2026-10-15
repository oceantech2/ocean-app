# Implementation Plan: Mostrar/ocultar senha nos campos de senha

**Branch**: `096-mostrar-senha` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/096-mostrar-senha/spec.md`

## Summary

Novo componente `CampoSenha` em `frontend/src/components/CampoSenha.tsx`:

- repassa todos os atributos de `<input>` e alterna `type` entre `password` e `text`;
- tem um botão `type="button"` com ícone de olho ou olho riscado (SVG inline no padrão de `actionIcons.tsx`), com `aria-label` "Mostrar senha"/"Ocultar senha" e `aria-pressed`;
- usa `pr-10` no input para o texto não ficar sob o ícone.

Ele substitui os 5 inputs de senha:

- login do ERP;
- login do Proposal;
- convite (2 campos);
- modal de usuário em Configurações.

## Technical Context

**Language/Version**: TypeScript 5 + React 18

**Primary Dependencies**: Tailwind; sem biblioteca de ícones (SVG inline)

**Storage**: N/A

**Testing**: `npm run type-check`, `npm run build` e o roteiro do [quickstart.md](./quickstart.md)

**Target Platform**: ERP e Proposal (mesmo projeto Vite, entradas separadas)

**Project Type**: Aplicação web (só frontend)

**Constraints**: Manter `autoComplete`, `autoFocus`, `minLength`, `required` e as classes de cada tela (o ERP tem dark mode no modal)

**Scale/Scope**: 1 componente novo e 4 arquivos editados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Rótulos acessíveis em pt-BR | ✅ |
| IV. Consistência | Um componente para todos os campos; ícones no padrão `IconBase` | ✅ |
| V. Simplicidade | Sem dependência nova | ✅ |

**Re-check pós-design**: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/096-mostrar-senha/
├── plan.md
├── research.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

Sem `contracts/` nem `data-model.md`: não há API nem dados novos.

### Source Code (repository root)

```text
frontend/src/components/CampoSenha.tsx        # NOVO
frontend/src/components/Login.tsx             # login ERP
frontend/src/proposal/pages/Login.tsx         # login Proposal
frontend/src/proposal/pages/Convite.tsx       # senha + confirmação
frontend/src/pages/Configuracoes.tsx          # modal de usuário
```

**Structure Decision**: Componente em `src/components` (o Proposal importa por caminho relativo; mesmo bundle Vite).

## Complexity Tracking

Sem violações.
