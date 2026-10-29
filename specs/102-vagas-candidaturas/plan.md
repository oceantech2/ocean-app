# Implementation Plan: Vagas cadastradas no painel do consultor e candidatura pelo site

**Branch**: `102-vagas-candidaturas` | **Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/102-vagas-candidaturas/spec.md`

## Summary

Duas tabelas novas no backend: `vagas` (cadastradas no Consultant Panel) e `candidaturas` (recebidas pelo site). O painel ganha o menu "Vagas" (lista, nova, detalhe com candidaturas, edição, encerrar/reabrir, excluir) sobre rotas `/api/proposal/vagas` autenticadas com o token do Proposal; autor ou admin alteram, todos veem. O site deixa a lista fixa e busca as vagas abertas em `/api/public/vagas` no navegador; cada vaga ganha página própria (`/vagas/<slug>-<id>` e `/en/jobs/<slug>-<id>`) com todos os pré-requisitos e o formulário de candidatura completo (multipart com currículo). A candidatura é gravada (currículo no Supabase Storage, reaproveitando o serviço de anexos), e uma tarefa em segundo plano a envia ao Web App do Apps Script da planilha com `externalId` = id da candidatura e `linkCv` apontando para uma rota do painel que exige login. Falhas ficam como "pendente" e podem ser reenviadas pelo painel. As 5 vagas fixas viram registros uma única vez (marcador em `configuracao_app`).

## Technical Context

**Language/Version**: Python 3.11 (FastAPI 0.104, SQLAlchemy 2.0, Pydantic 2) + TypeScript 5 / React 18

**Primary Dependencies**: nenhuma nova — `httpx` (já usado no Storage) para o Web App da planilha; `python-multipart` (já instalado) para o upload

**Storage**: PostgreSQL (tabelas `vagas` e `candidaturas` via `create_all`, RLS habilitada em `_migrar`); currículos no Supabase Storage (prefixo `curriculos/`), com o mesmo fallback de disco local do serviço `anexo_nf`

**Testing**: Sem suíte automatizada no repositório; validação por `python -m compileall`, `npx tsc --noEmit`, `npx vite build` e roteiro manual em [quickstart.md](./quickstart.md) (API local + painel + site em `site.localhost:5193`)

**Target Platform**: API no Render; painel (`consultantpanel.oceantalentsolutions.com`) e site (`oceantalentsolutions.com`) na Vercel

**Project Type**: Aplicação web (backend + frontend com três entradas: ERP, Proposal/painel, site)

**Performance Goals**: vaga nova visível no site em < 1 min (sem cache: o site consulta a API a cada carregamento — SC-001); candidatura respondida ao candidato sem esperar a planilha (envio em segundo plano — SC-003/SC-004)

**Constraints**: Classes Tailwind novas do site exigem `npm run site:css` (CSS do site compilado à parte); cliente da vaga nunca serializado nas rotas públicas (FR-006); segredo da planilha só em variável de ambiente (constitution); site pré-renderizado continua gerando só as páginas fixas — a página da vaga é renderizada no navegador

**Scale/Scope**: dezenas de vagas e centenas de candidaturas por mês; 2 modelos, 2 roteadores, 2 serviços no backend; 4 páginas + 1 componente no painel; 1 página + 1 componente no site

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos, telas do painel e mensagens em pt-BR; site com textos pt/en como já é | ✅ |
| II. Domínio Financeiro Interno | Estende o Consultant Panel e o site institucional (fora do ERP financeiro), como as features 083–101; papéis `admin`/demais preservados (autor ou admin altera) | ⚠️ justificado (painel e site já fora do domínio financeiro desde 083/100) |
| III. Clareza Antes de Implementar | 8 decisões esclarecidas com o usuário (destino, currículo, permissões, migração, código da planilha, idioma, listas, cliente) | ✅ |
| IV. Consistência com o Produto | Painel segue Modelos/Propostas (lista, editor, `window.confirm`, toast, auditoria); site segue `Vagas.tsx`/`FormularioContato.tsx` | ✅ |
| V. Simplicidade e Escopo Fechado | Sem fila/worker: `BackgroundTasks` + reenvio manual; sem e-mails; conteúdo em um idioma; sem dependências novas | ✅ |

**Re-check pós-design**: sem novas violações. Credenciais da planilha documentadas só como nomes de variáveis (`SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET`).

## Project Structure

### Documentation (this feature)

```text
specs/102-vagas-candidaturas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-vagas.md            # rotas do painel e públicas
│   ├── planilha-webhook.md     # payload/resposta do Web App da planilha
│   └── enderecos-site.md       # URLs do site e do painel
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/
├── models/__init__.py                    # + Vaga, Candidatura
├── schemas.py                            # + VagaIn
├── config.py                             # + SHEETS_WEBHOOK_URL/SECRET; CORS dev do site
├── main.py                               # RLS + seed único das 5 vagas; include_router dos 2 roteadores
├── services/
│   ├── anexo_nf.py                       # gravar/validar com extensões e limite por chamada (+ doc/docx)
│   ├── vagas.py                          # NOVO: enums, validação, slug, serialização interna/pública
│   └── planilha_candidaturas.py          # NOVO: payload, envio ao Web App, tarefa em segundo plano
└── api/routes/
    ├── proposal_vagas.py                 # NOVO: /api/proposal/vagas (+ candidaturas, currículo, reenvio)
    └── public_vagas.py                   # NOVO: /api/public/vagas (lista, detalhe, candidatura)

frontend/src/
├── proposal/
│   ├── App.tsx                           # rotas /vagas, /vagas/nova, /vagas/:id, /vagas/:id/editar, /candidaturas/:id/curriculo; volta ao destino após login
│   ├── components/ProposalLayout.tsx     # menu "Vagas"
│   ├── components/VagaForm.tsx           # NOVO
│   ├── pages/Vagas.tsx                   # NOVO: lista
│   ├── pages/VagaEditor.tsx              # NOVO: nova/editar
│   ├── pages/VagaDetalhe.tsx             # NOVO: dados + candidaturas + reenvio
│   ├── pages/CurriculoAbrir.tsx          # NOVO: abre o currículo (link da planilha)
│   ├── pages/Login.tsx                   # volta ao destino pedido
│   └── services/proposalApi.ts           # + tipos e chamadas de vagas/candidaturas
└── site/
    ├── api.ts                            # NOVO: fetch das rotas públicas
    ├── dados/vagas.ts                    # mantém áreas/níveis/listas; sai a lista fixa
    ├── rotas.ts                          # caminho da vaga (pt/en) e reconhecimento de /vagas/<slug>
    ├── App.tsx                           # rota da página da vaga
    ├── navegacao.ts                      # troca de idioma na página da vaga
    ├── pages/Vagas.tsx                   # lista via API, cards com link para a página da vaga
    ├── pages/VagaDetalhe.tsx             # NOVO
    ├── components/FormularioCandidatura.tsx  # NOVO (substitui ModalInteresse)
    └── components/ModalInteresse.tsx     # REMOVIDO
frontend/public/site/site.css             # recompilado (npm run site:css)
```

**Structure Decision**: Backend segue o par `proposal_*`/`public_*` já usado nas propostas; frontend do painel em `src/proposal/`, do site em `src/site/`, sem import cruzado entre os dois.

## Complexity Tracking

Sem violações novas.
