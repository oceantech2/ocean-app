# Implementation Plan: Página Contratos

**Branch**: `052-pagina-contratos` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/052-pagina-contratos/spec.md`

**Note**: Clarify 2026-09-06 (1/1): rótulos **Contratos ativos** e **Contratos arquivados**.

## Summary

Adicionar a página navegável **Contratos**, cuja única função é exibir **dois atalhos** para pastas do Google Drive (**Contratos ativos** e **Contratos arquivados**), abrindo em nova aba. Integrar ao catálogo de páginas (menu, rota, visibilidade global e permissões de visualizador), sem CRUD, sem API de contratos e sem sincronização com o Drive.

Abordagem: entrada em `paginasCatalogo.ts` + página React mínima + ícone de menu; atualizar defaults de `paginas_visibilidade` no backend para a nova chave `contratos`. Rotas e `PaginaVisivelGuard` já derivam do catálogo.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend — só seed/defaults de visibilidade)

**Primary Dependencies**: React Router, Tailwind, Zustand (`useAuthStore`), catálogo `paginasCatalogo`, `PaginaVisivelGuard`

**Storage**: Sem tabela nova. Chave `contratos: true` no JSON de `configuracao_app.paginas_visibilidade` (defaults em `paginas_visibilidade.py`). URLs dos atalhos são constantes no frontend.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend.

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend mínimo)

**Performance Goals**: Página estática — carregamento imediato após lazy import; sem round-trips além da sessão já autenticada.

**Constraints**: JWT e papéis vigentes; portas fixas; links externos com `target="_blank"` e `rel="noopener noreferrer"`; sem persistência de arquivos no Ocean App; conteúdo das pastas governado pelo Google Drive.

**Scale/Scope**: 1 página; 2 atalhos fixos; ~5 arquivos frontend + 1 ajuste backend de defaults. Sem novos endpoints REST de domínio.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — página não `adminOnly`; visualizador com permissão; Drive controla conteúdo |
| III. Clareza antes de implementar | PASS — clarify 1/1 (rótulos) |
| IV. Consistência com produto existente | PASS — Layout, catálogo, guarda, Configurações |
| V. Simplicidade e escopo fechado | PASS — só atalhos; sem CRUD/API de contratos |
| Portas / segredos | PASS — sem credenciais Drive na app |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não criar backend de contratos “por antecipação”. Não duplicar lista de menu fora do catálogo.

## Project Structure

### Documentation (this feature)

```text
specs/052-pagina-contratos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contratos.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/services/
└── paginas_visibilidade.py   # incluir chave contratos: True nos defaults

frontend/src/
├── utils/paginasCatalogo.ts  # entrada contratos (key, label, path, desc, ocultavel)
├── pages/Contratos.tsx       # página com dois atalhos (NOVO)
├── components/navIcons.tsx   # ícone /contratos
└── App.tsx                   # PAGE_COMPONENTS.contratos → Contratos
```

**Structure Decision**: Frontend-first. `App.tsx` já monta rotas a partir de `PAGINAS_CATALOGO` (exceto dashboard); basta registrar a página no catálogo e em `PAGE_COMPONENTS`. Backend só alinha a chave de visibilidade para Configurações/login/`/me` não omitirem `contratos`.

## Complexity Tracking

> Nenhuma violação à constitution que exija justificativa.
