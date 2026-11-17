# Implementation Plan: Propostas v2 — serviços, setor Outros e PDF A4

**Branch**: `105-proposta-servicos-v2` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/105-proposta-servicos-v2/spec.md`

## Summary

Portar o protótipo `ocean-propostas-v2.zip` para o Proposal: formulário sem Divisão/Modelo, seleção de um ou mais **serviços**, setor **Outros**, observações editáveis com `{imposto}`, página pública e PDF A4 conforme `render.js` (moldura `@page` margin 0). Rótulo de impostos **sem** “até”: `Impostos ({imposto})` / `Taxes ({imposto})`. Backend ganha `servicos` + observações JSONB; modelo unificado `ocean`; propostas legadas mapeiam modelo→serviço na leitura.

## Technical Context

**Language/Version**: Python 3.11 (backend) · TypeScript 5 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy 2, Pydantic v2 · Vite, Tailwind, Axios, react-hot-toast, React Router 6

**Storage**: PostgreSQL — colunas novas em `propostas` e `propostas_modelos` (`servicos`, `observacoes_investimento`, `observacoes_garantias` JSONB); setor `outros`; registro `MODELOS["ocean"]`

**Testing**: `npx tsc --noEmit`, `python -m py_compile`, roteiro [quickstart.md](./quickstart.md); PDF manual no Chrome

**Target Platform**: Web (Proposal + página pública `/p/:codigo`)

**Project Type**: Aplicação web (backend + frontend)

**Performance Goals**: Página pública carrega conteúdo estático dos serviços sem round-trip extra; PDF via `window.print`

**Constraints**: Portas 8001/5433/6380/5193; sanitização de escopo no servidor; JWT Proposal inalterado

**Scale/Scope**: 5 serviços, 7 setores, 1 layout de página unificado, formulário Nova/Editar/Modelos, MCP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos e UI em pt-BR; conteúdo en-US só na proposta bilingue | ✅ |
| II. Domínio Financeiro Interno | Proposal + imposto da Config; papéis admin/consultor preservados | ✅ |
| III. Clareza Antes de Implementar | Spec fechada a partir do zip + regra explícita do rótulo de impostos | ✅ |
| IV. Consistência com o Produto | Mesmo ProposalLayout, toasts, confirmações; página pública alinhada ao protótipo Ocean | ✅ |
| V. Simplicidade e Escopo Fechado | Sem Puppeteer; sem reescrever aceite/e-mail além do necessário ao schema | ✅ |

**Re-check pós-design**: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/105-proposta-servicos-v2/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-proposal-servicos.md
│   └── ui-proposta-v2.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py              # colunas servicos + observações; SETOR outros via validação
├── main.py                         # ALTER TABLE IF NOT EXISTS
├── schemas.py                      # campos novos no payload
├── services/proposta_modelos.py    # SERVICOS, SETORES+outros, MODELOS.ocean, validação
├── services/propostas.py           # serialização / migração de leitura
├── api/routes/proposal_propostas.py
├── api/routes/proposal_modelos.py
└── services/mcp_ferramentas.py     # servicos + setor outros

frontend/src/proposal/
├── modelos/ocean/v1/               # conteúdo + PaginaOceanV2 + CSS print do zip
├── modelos/setores.ts              # +outros, fotos do zip (industria-servicos)
├── modelos/index.ts                # registro ocean; legado mantido
├── components/ModeloForm.tsx       # card Serviços; sem Divisão; obs editáveis
├── pages/Nova.tsx / Editar.tsx
├── pages/PropostaPublica.tsx       # roteia ocean vs legado
└── services/proposalApi.ts

frontend/public/propostas/setores/  # imagens do zip
_tmp_propostas_v2/                  # referência (não commitar)
```

**Structure Decision**: Um modelo de página unificado `ocean` (v1) no frontend, espelhando `content.js`/`render.js`/`brand.js`; divisões antigas permanecem só para renderizar propostas já emitidas.

## Complexity Tracking

Nenhuma violação a justificar.
