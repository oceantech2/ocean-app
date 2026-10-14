# Implementation Plan: Imposto mensal nas propostas

**Branch**: `092-proposta-imposto-mensal` | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/092-proposta-imposto-mensal/spec.md`

## Summary

Criar no ERP (Configurações, só admin) o cadastro do **imposto do mês para propostas** (mês, ano, percentual) e fazer as propostas dos modelos Executive Search e Development & Outplacement gravarem, a cada criação ou edição, o imposto vigente (mês corrente em São Paulo → último mês anterior cadastrado → padrão 18,75%). A página do cliente passa a montar a frase "Impostos (até X%)…" / "Taxes (up to X%)…" com o percentual gravado; propostas antigas sem o valor continuam exibindo 19,55%. O percentual entra no hash do conteúdo das propostas novas/editadas, sem invalidar hashes existentes. Outubro/2026 é semeado com 18,75%.

## Technical Context

**Language/Version**: Python 3.11 (backend) · TypeScript 5 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic v2 · Vite, Tailwind, Axios, react-hot-toast

**Storage**: PostgreSQL (Supabase em produção, Postgres 16 local na porta 5433). Tabela nova `impostos_proposta` (via `Base.metadata.create_all`) + coluna nova `propostas.imposto_percentual NUMERIC(5,2)` e seed via `_migrar()` em `backend/app/main.py`

**Testing**: Sem suíte automatizada no projeto; validação por `npm run type-check`, `npm run build`, `python -m py_compile` e roteiro manual em [quickstart.md](./quickstart.md)

**Target Platform**: Web (ERP em `frontend/src`, Proposal em `frontend/src/proposal`, API FastAPI)

**Project Type**: Aplicação web (backend + frontend)

**Performance Goals**: Resolução do imposto vigente em 1 consulta indexada por (ano, mês); sem impacto perceptível na criação/edição

**Constraints**: Hashes de propostas existentes (assinadas ou pendentes não editadas) não podem mudar; portas fixas (8001/5433/6380/5193); tabelas novas com RLS habilitado no Supabase

**Scale/Scope**: ~12 registros/ano; 2 modelos de proposta × 2 idiomas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Spec, plano e artefatos em pt-BR; textos de UI em pt-BR (en-US só no conteúdo da proposta em inglês, já existente) | ✅ |
| II. Domínio Financeiro Interno | Cadastro restrito a `admin`; visualizador não acessa Configurações e recebe 403 na escrita; auditoria registrada | ✅ |
| III. Clareza Antes de Implementar | 5 esclarecimentos registrados na spec (local, mês de referência, fallback, edição pelo consultor, pendentes) | ✅ |
| IV. Consistência com o Produto | Seção nova em `Configuracoes.tsx` no mesmo padrão das seções existentes; toast para feedback; histórico de edições existente reaproveitado | ✅ |
| V. Simplicidade e Escopo Fechado | 1 tabela, 1 coluna, 3 endpoints; sem exclusão de meses, sem edição do percentual pelo consultor, proposta simples fora do escopo | ✅ |

**Re-check pós-design**: sem violações; nenhuma entrada em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/092-proposta-imposto-mensal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-imposto-proposta-erp.md
│   └── rest-proposal-imposto.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py                 # ImpostoProposta + Proposta.imposto_percentual
├── schemas.py                         # ImpostoPropostaIn / ImpostoPropostaOut
├── main.py                            # _migrar: coluna, RLS e seed Out/2026 = 18,75
├── services/imposto_proposta.py       # NOVO: imposto_vigente(db, hoje) e constantes (padrão/legado)
├── services/propostas.py              # hash (chave opcional), diff, serialização
├── api/routes/configuracoes.py        # GET/PUT /api/configuracoes/imposto-proposta (ERP)
└── api/routes/proposal_propostas.py   # GET /imposto-vigente; aplica no criar/editar

frontend/src/
├── services/api.ts                    # configuracoesService: listar/salvar imposto das propostas
├── pages/Configuracoes.tsx            # seção "Imposto das propostas"
└── proposal/
    ├── services/proposalApi.ts        # tipo imposto_percentual + obterImpostoVigente()
    ├── modelos/formatacao.ts          # formatarPercentual(idioma)
    ├── modelos/pagina/i18n/tipos.ts   # ConteudoDivisao.observacaoImpostos(pct)
    ├── modelos/pagina/PaginaModelo.tsx# monta a frase com o percentual da proposta (fallback 19,55)
    ├── modelos/*/v1/conteudo/*.ts     # remove a frase fixa; adiciona observacaoImpostos
    ├── components/ModeloForm.tsx      # resumo mostra imposto aplicado + avisos
    ├── pages/Nova.tsx, Editar.tsx     # buscam o imposto vigente e passam ao formulário
    └── pages/Detalhe.tsx              # rótulo/format do campo no histórico de edições
```

**Structure Decision**: Aplicação web existente (`backend/` + `frontend/`); nenhum diretório novo além de `services/imposto_proposta.py`.

## Complexity Tracking

Sem violações da constitution.
