# Implementation Plan: Ocultar Páginas — Configuração em Settings

**Branch**: `042-ocultar-paginas-config` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/042-ocultar-paginas-config/spec.md`

**Note**: Clarify 2026-08-27 (5/5): admin acessa ocultas por URL; alertas suprimidos; persistência no servidor; DH oculta no deploy; Dashboard não ocultável.

## Summary

Adicionar configuração **global** de visibilidade de páginas do menu, persistida no **PostgreSQL** e gerenciada por administradores em **Configurações**. Na implantação, **DH inicia oculta**; demais páginas elegíveis visíveis. Páginas ocultas somem do menu e da busca para **todos** (incluindo admin); **visualizadores** são redirecionados à Dashboard ao acessar URL direta; **administradores** acessam URL direta normalmente. Alertas cujo destino é página oculta são **suprimidos**. **Dashboard** e **Configurações** não são ocultáveis.

Abordagem: tabela `configuracao_app` (chave/valor JSON), endpoints REST em `/api/configuracoes/paginas-visibilidade`, payload incluído no login/`/auth/me`, catálogo único de páginas no frontend, guarda de rota e filtros em `Layout`, `App.tsx` e formulário de permissões em `Configuracoes.tsx`.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React Router, Tailwind, Axios, Zustand (`useAuthStore`), `react-hot-toast`, SQLAlchemy, Pydantic

**Storage**: PostgreSQL — nova tabela `configuracao_app` (chave única + valor JSON). Seed inline em `main.py` (`dh: false`, demais `true`).

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend.

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Configuração carregada no login/`/me` (sem round-trip extra por navegação); alteração refletida após salvar + atualização do store (recarregar ou re-fetch auth).

**Constraints**: JWT; portas fixas; admin-only para escrita; visualizador lê config para menu/guarda; sem apagar dados de módulos ocultos; precedência global > permissões por usuário

**Scale/Scope**: ~14 chaves de página; 1 registro de configuração; alterações raras (admin). Arquivos principais: backend `configuracoes.py`, `models`, `main.py`; frontend `Configuracoes.tsx`, `Layout.tsx`, `App.tsx`, `store/index.ts`, catálogo compartilhado.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — admin configura; visualizador obedece ocultação + permissões existentes |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — seção em Configurações, toast, toggles como permissões de usuário, redirect como Relatórios |
| V. Simplicidade e escopo fechado | PASS — key-value único; sem feature flags genéricos |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não duplicar listas de menu em três arquivos sem catálogo compartilhado. Não usar `localStorage` como fonte da verdade (spec exige servidor).

## Project Structure

### Documentation (this feature)

```text
specs/042-ocultar-paginas-config/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-paginas-visibilidade.md
│   └── ui-paginas-visibilidade.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py              # ConfiguracaoApp
├── schemas.py                      # PaginasVisibilidadeResponse/Update
├── main.py                         # CREATE TABLE + seed dh oculta
└── api/routes/configuracoes.py     # GET/PUT paginas-visibilidade
    auth.py                         # incluir paginas_visibilidade em login/me

frontend/src/
├── utils/paginasCatalogo.ts        # chaves, rótulos, paths, alertas (NOVO)
├── store/index.ts                  # paginasVisibilidade no auth store
├── services/api.ts                 # configuracoesService.paginasVisibilidade
├── components/
│   ├── Layout.tsx                  # filtrar menu, busca, alertas
│   └── PaginaVisivelGuard.tsx      # redirect visualizador (NOVO)
├── pages/Configuracoes.tsx         # seção visibilidade + MENUS alinhado
└── App.tsx                         # guarda nas rotas ocultáveis
```

**Structure Decision**: Backend estende router de Configurações (mesmo domínio admin). Frontend centraliza catálogo de páginas em um util (hoje duplicado entre `Layout.tsx` e `Configuracoes.tsx`; incluir **Patrimônio** que falta em Configurações).

## Complexity Tracking

> Nenhuma violação à constitution que exija justificativa.
