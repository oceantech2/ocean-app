# Implementation Plan: Plataforma de Propostas (Proposal)

**Branch**: `077-plataforma-propostas` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/077-plataforma-propostas/spec.md`

**Note**: Clarify 2026-09-29: campos da v1 = cliente, CNPJ, valor e imposto (o HTML definitivo virá depois); imposto = alíquota % somada ao valor; assinatura = nome + e-mail + aceite; visibilidade = próprias propostas, `admin` vê todas; validade padrão de 30 dias, editável, com status **Expirada**; login próprio em outro domínio, liberado no ERP por um campo de permissão separado.

## Summary

Criar o **Proposal**, uma segunda ferramenta no mesmo repositório, deploy e backend do ERP, servida em `proposal.oceantalentsolutions.com`. Usuários do Proposal são os do cadastro do ERP, liberados por um campo novo `acesso_proposal` (independente das permissões de página). O usuário cria uma proposta (cliente, CNPJ, valor, imposto opcional, validade), recebe um link público impossível de adivinhar e o envia ao cliente, que abre sem login e assina com nome, e-mail e aceite. O status volta para a lista do Proposal.

A abordagem técnica tem três partes:
1. **Frontend multi-page** no Vite (`index.html` do ERP + `proposal.html` do Proposal), com reescrita por host no Vercel (`frontend/vercel.json`) e em dev (`proposal.localhost:5193`).
2. **Isolamento no servidor**: claim `app` no JWT (`erp`/`proposal`); as dependências do ERP e uma dependência no nível dos routers do ERP recusam tokens do Proposal; o Proposal tem login e dependências próprios, com checagem no banco a cada requisição.
3. **Domínio de propostas** no FastAPI: tabelas `propostas` e `propostas_assinaturas`, valores em `NUMERIC`, status "expirada" derivado na leitura (sem job), assinatura única por `UPDATE` condicional + constraint única, e evidências (IP, user-agent, hash SHA-256 do conteúdo).

## Technical Context

**Language/Version**: Python 3.11 (backend) · TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI 0.104, SQLAlchemy 2.0, python-jose (JWT), passlib, pyotp (2FA existente) · Vite 5, React Router 6, Axios, Zustand, Tailwind 3, react-hot-toast. **Nova**: `tzdata` (pip), para `zoneinfo` na imagem `python:3.11-slim`.

**Storage**: PostgreSQL 16 (Supabase em produção). Alteração em `usuarios_app` + tabelas novas `propostas` e `propostas_assinaturas`, via migração inline em `_migrar()` (padrão do projeto). RLS reaplicado com `backend/scripts/enable_rls_supabase.sql`.

**Testing**: Sem suíte automatizada no repositório (padrão das features anteriores). Validação pelo [quickstart.md](./quickstart.md), incluindo a checagem de isolamento com `curl` (SC-001); `npm run lint` + `npm run type-check` + `npm run build` no `frontend/`.

**Target Platform**: Vercel (frontend, dois domínios num projeto) + Render (API) + Supabase (Postgres). Dev: API **8001**, PostgreSQL **5433**, Redis **6380**, frontend **5193** (inalteradas).

**Project Type**: Web application (backend FastAPI + frontend React, dois apps no mesmo build).

**Performance Goals**: Criar proposta e copiar o link em menos de 2 min (SC-002); assinar em menos de 1 min no celular (SC-003). Bundle do Proposal sem o código do ERP. Página pública com indicador de carregamento para o cold start do Render.

**Constraints**: Portas fixas; nenhum dado do ERP acessível com sessão do Proposal (FR-006); link não sequencial (≥ 128 bits de entropia); valores exatos em centavos (SC-004); expiração às 23h59 de São Paulo; sem segredos nos artefatos; sessões do ERP abertas antes do deploy não podem cair.

**Scale/Scope**: Uso interno (dezenas de usuários, centenas de propostas por mês). ~6 endpoints novos autenticados + 2 públicos; 3 endpoints do ERP alterados; 1 tabela alterada + 2 novas; 5 telas novas no Proposal + ajuste em Configurações do ERP.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS: todos os artefatos em pt-BR; inglês só em nomes técnicos e títulos de template |
| II. Domínio financeiro / papéis admin·visualizador | PASS com decisão documentada: a feature cria uma ferramenta separada, pedida explicitamente na spec. Os papéis existentes são reaproveitados (`admin` gerencia acessos e vê todas as propostas); nenhum dado do domínio financeiro do ERP é exposto |
| III. Clareza antes de implementar | PASS: clarify fechou campos, imposto, assinatura, visibilidade, validade e login; o único ponto adiado (HTML definitivo) está registrado na spec |
| IV. Consistência com o produto existente | PASS: páginas seguem o padrão (toast, spinner, `window.confirm` no cancelamento); login OAuth2 form + 2FA como no ERP; migração inline em `_migrar()` |
| V. Simplicidade e escopo fechado | PASS: sem e-mail automático, sem recusa, sem provedor de assinatura, sem job de expiração, sem integração com contas a receber. Multi-page e duas camadas de autorização estão justificadas abaixo |
| Portas / segredos | PASS: portas inalteradas; só nomes de variáveis (sem valores secretos) |

**Post-design re-check**: Sem violações. As duas decisões com algum custo extra estão registradas em Complexity Tracking. Riscos pré-existentes encontrados (fallback `USUARIOS_DEV` no login do ERP; `SECRET_KEY` com cara de valor real em `.env.deploy.example`) ficam **fora do escopo** e estão documentados em [research.md](./research.md) R4 para uma feature própria.

## Project Structure

### Documentation (this feature)

```text
specs/077-plataforma-propostas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-proposal.md          # login + CRUD autenticado do Proposal
│   ├── api-public.md            # página pública: consultar e assinar
│   ├── api-erp-alteracoes.md    # claim app, bloqueio, cadastro de usuários, CORS
│   └── ui-proposal.md           # roteamento por domínio, telas, ajustes no ERP
├── checklists/
│   └── requirements.md
└── tasks.md                     # Phase 2 (/speckit-tasks; não criado aqui)
```

### Source Code (repository root)

```text
backend/
├── requirements.txt                         # + tzdata
└── app/
    ├── config.py                            # + proposal.localhost:5193 no CORS de dev
    ├── main.py                              # _migrar(): colunas de acesso + tabelas novas;
    │                                        # routers do ERP com Depends(require_erp);
    │                                        # inclui routers do Proposal e público
    ├── models/__init__.py                   # UsuarioApp (+acesso_erp, +acesso_proposal);
    │                                        # Proposta, PropostaAssinatura
    ├── schemas.py                           # UsuarioApp* (+acessos); Proposta*, Assinatura*
    ├── services/
    │   ├── documento.py                     # reaproveitado (validar/formatar CNPJ, e-mail)
    │   └── propostas.py                     # NOVO: cálculo, status efetivo, validade SP,
    │                                        # código, hash canônico, IP de origem
    └── api/routes/
        ├── auth.py                          # claim app=erp; require_erp; ERP deps exigem app=erp;
        │                                    # helper de 2FA reutilizável; recusa sem acesso_erp
        ├── configuracoes.py                 # acessos no create/update; guarda do próprio acesso
        ├── proposal_auth.py                 # NOVO: /api/proposal/auth (token, me) + get_proposal_user
        ├── proposal_propostas.py            # NOVO: /api/proposal/propostas (listar, criar, detalhe, cancelar)
        └── public_propostas.py              # NOVO: /api/public/propostas (consultar, assinar)

frontend/
├── index.html                               # ERP (inalterado)
├── proposal.html                            # NOVO: entrada do Proposal
├── vercel.json                              # NOVO: rewrites por host + catch-all do ERP
├── vite.config.ts                           # rollupOptions.input (main + proposal); plugin de dev por host
├── tailwind.config.js                       # content + ./proposal.html
└── src/
    ├── utils/documento.ts                   # NOVO: validarCNPJ/formatarCNPJ extraídos de Fornecedores.tsx
    ├── pages/Fornecedores.tsx               # passa a importar de utils/documento.ts (sem mudar comportamento)
    ├── pages/Configuracoes.tsx              # toggles "Acesso ao ERP" / "Acesso ao Proposal" + coluna Ferramentas
    ├── services/api.ts                      # tipos de configuracoesService com os acessos
    ├── types/index.ts                       # UsuarioApp com acesso_erp / acesso_proposal
    └── proposal/                            # NOVO: app do Proposal (não importa nada de pages/ do ERP)
        ├── main.tsx
        ├── App.tsx                          # rotas: /login, /, /nova, /propostas/:id, /p/:codigo
        ├── store.ts                         # useProposalAuthStore (chave proposal_access_token)
        ├── services/proposalApi.ts          # Axios próprio + interceptor 401 → /login
        ├── utils/propostaCalculo.ts         # prévia em centavos (half-up), igual ao backend
        ├── components/ProposalLayout.tsx    # cabeçalho sem nada do ERP
        └── pages/
            ├── Login.tsx
            ├── Lista.tsx
            ├── Nova.tsx
            ├── Detalhe.tsx
            └── PropostaPublica.tsx          # página do cliente (pública, responsiva)

.env.deploy.example                          # + CORS com o domínio do Proposal, VITE_PROPOSAL_PUBLIC_URL
```

**Structure Decision**: Mantém a estrutura web existente (`backend/` + `frontend/`). O Proposal vive em `frontend/src/proposal/` como segundo ponto de entrada do Vite, compartilhando só utilitários neutros (`utils/`, estilos, Tailwind), nunca páginas, `Layout`, `store` ou `services/api.ts` do ERP. No backend, o Proposal ganha três routers próprios (`proposal_auth`, `proposal_propostas`, `public_propostas`) e um serviço (`services/propostas.py`); o ERP recebe mudanças pontuais em `auth.py`, `configuracoes.py`, `main.py`, `models` e `schemas`.

### Ordem sugerida de implementação

1. **Fundação de acesso** (bloqueia o resto): colunas `acesso_*`, claim `app`, `require_erp` nos routers do ERP, recusa sem `acesso_erp`, cadastro no ERP (backend + Configurações). Validar a seção 3 do quickstart com um endpoint mínimo do Proposal.
2. **Login do Proposal** + app multi-page (HTML, Vite, Vercel, plugin de dev, layout, store, Axios).
3. **Propostas**: modelo, serviço, criar/listar/detalhe (US2 + US4 básico).
4. **Página pública e assinatura** (US3).
5. **Cancelamento, expiração, filtros e visibilidade `admin`** (US4 completo).
6. **Deploy**: `.env.deploy.example`, domínio no Vercel, CORS no Render, RLS no Supabase.

## Complexity Tracking

| Decisão | Por que é necessária | Alternativa mais simples rejeitada porque |
|---|---|---|
| Dois pontos de entrada no Vite (multi-page) + `vercel.json` por host | Garante que o Proposal não carregue código do ERP e mantém as rotas das duas ferramentas separadas, com um só deploy | Decidir pelo hostname no `App.tsx` atual misturaria as duas ferramentas no mesmo bundle e no mesmo arquivo de rotas |
| Bloqueio em duas camadas no ERP (dependências + router-level) | O FR-006 exige que nenhuma rota do ERP aceite sessão do Proposal, inclusive rotas futuras que esqueçam a dependência | Só alterar as dependências protege as rotas de hoje, mas deixa as futuras dependentes de disciplina manual |
