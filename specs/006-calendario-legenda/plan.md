# Implementation Plan: Calendário com Legenda de Status

**Branch**: `006-calendario-legenda` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-calendario-legenda/spec.md`

**Note**: Feature **somente frontend** — ajustar legenda e mapeamento visual em `Calendario.tsx`; filtrar NFs `cancelada`. Sem mudanças de API/backend.

## Summary

Manter o Calendário de vencimentos (grade mensal, NFs + contas, detalhe do dia, exportações) e alinhar a **legenda** e as cores dos marcadores aos quatro status de negócio: **A receber** (azul), **Recebido** (verde), **A pagar** (laranja), **Pago** (verde). Excluir NFs canceladas da grade e do detalhe; `pendente` e `vencida` compartilham azul; quitados (NF `paga` / conta `pago`) compartilham verde, distinguíveis só pelo tipo.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); backend inalterado

**Primary Dependencies**: React, Tailwind CSS (`blue-500` / `green-500` / `orange-500` e variantes `*-100` / dark); serviços existentes `nfsService` / `contasService`; `react-hot-toast` (erros)

**Storage**: N/A para esta feature — lê NFs e contas já persistidas via API; sem migrations nem preferências novas

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna (browser); frontend dev **5193**; API **8001** (sem alteração)

**Project Type**: Web application (frontend + backend) — escopo desta feature = frontend

**Performance Goals**: Carregamento e navegação de mês como hoje; filtro de canceladas em memória (lista já limitada a 500) sem impacto perceptível

**Constraints**: Portas fixas; papéis/permissões existentes intactos (FR-010); sem CRUD no Calendário; sem novos tipos de evento; sem tons de verde distintos (FR-008); rótulos da legenda com inicial maiúscula

**Scale/Scope**: 1 página (`Calendario.tsx`); 0 endpoints; 0 migrations; ajuste de legenda + filtro + mapeamento de cor/status

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — calendário só consulta; permissão `calendario` inalterada |
| III. Clareza antes de implementar | PASS — clarify com 4 decisões na spec |
| IV. Consistência com produto existente | PASS — mesma página, paleta Tailwind já usada, Layout/rotas intactos |
| V. Simplicidade e escopo fechado | PASS — só `Calendario.tsx`; sem API/lib nova |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais nos artefatos |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/006-calendario-legenda/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/
└── src/
    └── pages/
        └── Calendario.tsx   # Legenda 4 status; filtro cancelada; cores grade/detalhe
```

**Structure Decision**: Toda a mudança fica em `Calendario.tsx`. Helpers locais (status visual → classes Tailwind) podem ficar no mesmo arquivo para evitar abstração prematura. Backend, `api.ts`, tipos e Layout permanecem intactos.

## Complexity Tracking

> Sem violações a justificar.
