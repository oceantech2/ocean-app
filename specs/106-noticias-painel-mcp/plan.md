# Implementation Plan: Notícias pelo painel do consultor, MCP e página no site

**Branch**: `106-noticias-painel-mcp` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/106-noticias-painel-mcp/spec.md`

## Summary

Uma tabela nova `noticias` no backend, com campos bilíngues (título/resumo/conteúdo em pt e en), segmento, data de publicação e status publicada/não publicada. O Consultant Panel ganha o menu "Notícias" (lista, nova, detalhe, edição, publicar/despublicar, excluir) sobre `/api/proposal/noticias`. O site deixa os cards placeholder e busca notícias elegíveis em `/api/public/noticias` (publicada e `data_publicacao` ≤ hoje em America/Sao_Paulo); cada notícia tem página própria (`/noticias/<slug>-<id>` e `/en/news/<slug>-<id>`). O MCP ganha `listar_noticias`, `ver_noticia`, `criar_noticia` e `editar_noticia` (sem despublicar/excluir), reutilizando as mesmas funções das rotas do painel.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI 0.104, SQLAlchemy 2.0, Pydantic 2) + TypeScript 5 / React 18

**Primary Dependencies**: nenhuma nova — espelha o padrão da feature 102 (vagas)

**Storage**: PostgreSQL (tabela `noticias` via `create_all` + RLS em `_migrar`); sem arquivos/anexos nesta feature

**Testing**: Sem suíte automatizada no repositório; validação por `python -m compileall`, `npx tsc --noEmit`, `npx vite build` e roteiro em [quickstart.md](./quickstart.md); smoke MCP estendido se houver script existente

**Target Platform**: API no Render; painel (`consultantpanel.*`) e site (`oceantalentsolutions.com`) na Vercel

**Project Type**: Aplicação web (backend + frontend: Proposal/painel + site)

**Performance Goals**: notícia elegível visível no site em < 1 min (sem cache — SC-001); detalhe em ≤ 2 cliques (SC-002)

**Constraints**: Portas 8001/5433/6380/5193; classes Tailwind novas do site exigem `npm run site:css`; elegibilidade usa data civil em America/Sao_Paulo; MCP sem ações destrutivas

**Scale/Scope**: dezenas de notícias; 1 modelo, 2 roteadores, 1 serviço; 3–4 páginas no painel; lista + detalhe no site; 4 ferramentas MCP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos e UI do painel em pt-BR; site pt/en com conteúdo bilíngue | ✅ |
| II. Domínio Financeiro Interno | Estende Consultant Panel e site (como 102/103), fora do ERP financeiro | ⚠️ justificado |
| III. Clareza Antes de Implementar | 3 decisões esclarecidas (idioma, agendamento, escopo MCP) | ✅ |
| IV. Consistência com o Produto | Espelha vagas: lista/editor/`window.confirm`/toast/auditoria; MCP wrapping rotas | ✅ |
| V. Simplicidade e Escopo Fechado | Sem newsletter real, sem imagem de capa, sem exclusão via MCP | ✅ |

**Re-check pós-design**: sem novas violações.

## Project Structure

### Documentation (this feature)

```text
specs/106-noticias-painel-mcp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-noticias.md
│   ├── enderecos-site.md
│   └── mcp-noticias.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py                 # + Noticia
├── schemas.py                         # + NoticiaIn
├── main.py                            # RLS + include_router
├── services/
│   ├── noticias.py                    # NOVO: enums, validação, slug, elegibilidade, serialização
│   └── mcp_ferramentas.py             # + listar/ver/criar/editar_noticia
└── api/routes/
    ├── proposal_noticias.py           # NOVO: /api/proposal/noticias
    ├── public_noticias.py             # NOVO: /api/public/noticias
    └── mcp_servidor.py                # INSTRUCOES atualizadas se necessário

frontend/src/
├── proposal/
│   ├── App.tsx                        # rotas /noticias…
│   ├── components/ProposalLayout.tsx  # menu Notícias
│   ├── components/NoticiaForm.tsx     # NOVO
│   ├── pages/Noticias.tsx             # NOVO: lista
│   ├── pages/NoticiaEditor.tsx        # NOVO
│   ├── pages/NoticiaDetalhe.tsx       # NOVO
│   └── services/proposalApi.ts        # + tipos e CRUD
└── site/
    ├── api.ts                         # + listar/obter notícias
    ├── dados/noticias.ts              # NOVO: Segmento, tipos públicos
    ├── rotas.ts                       # caminhoNoticia / noticiaDoCaminho
    ├── App.tsx                        # rota detalhe
    ├── pages/Noticias.tsx             # lista via API + Link
    └── pages/NoticiaDetalhe.tsx       # NOVO
```

**Structure Decision**: Par `proposal_*` / `public_*` como vagas; painel em `src/proposal/`, site em `src/site/`, sem import cruzado.

## Complexity Tracking

Sem violações novas.
