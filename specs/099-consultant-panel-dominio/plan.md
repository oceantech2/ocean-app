# Implementation Plan: Painel do consultor em domínio próprio (consultantpanel)

**Branch**: `099-consultant-panel-dominio` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/099-consultant-panel-dominio/spec.md`

## Summary

O mesmo bundle do Proposal (`proposal.html`) passa a ser servido em dois hosts: `proposal.*` (só a página do cliente, `/p/<código>`) e `consultantpanel.*` (todo o painel). Um módulo de domínios no frontend decide, no carregamento, se o host atual é o do cliente e, nesse caso, redireciona qualquer rota que não seja `/p/` para o mesmo caminho no painel (preservando query e hash). Links do cliente usam a URL pública; o atalho do ERP, os convites e o botão do e-mail de aceite usam a URL do painel. "Abrir página do cliente" passa a abrir `/p/<código>` no próprio painel, onde a sessão do consultor existe e a abertura não conta como visualização. O nome exibido vira "Consultant Panel". A separação só é ativada em produção quando `VITE_CONSULTANT_PANEL_URL` está configurada (publicação segura antes do DNS); em desenvolvimento é automática (`consultantpanel.localhost:5193`).

## Technical Context

**Language/Version**: TypeScript 5 + React 18 (frontend) · Python 3.11 (backend)

**Primary Dependencies**: Vite (plugin de host em dev), React Router 6, Vercel rewrites por host · FastAPI (CORS), pydantic-settings

**Storage**: N/A (sem mudança de dados)

**Testing**: Sem suíte automatizada; `npx tsc --noEmit`, `npx vite build`, `python -m py_compile` e roteiro manual em [quickstart.md](./quickstart.md)

**Target Platform**: Web — Vercel (frontend, dois domínios no mesmo projeto) e Render (API)

**Project Type**: Aplicação web (backend + frontend)

**Performance Goals**: Redirecionamento antes de montar o React (sem piscar a tela do painel no domínio do cliente)

**Constraints**: Links de clientes já enviados não podem quebrar; sessão (localStorage) é por origem; publicar antes do DNS não pode derrubar o painel; portas fixas

**Scale/Scope**: 2 hosts, ~12 arquivos tocados, 2 variáveis de ambiente novas (`VITE_CONSULTANT_PANEL_URL`, `CONSULTANT_PANEL_URL`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos em pt-BR; "Consultant Panel" é nome de produto (como o domínio) | ✅ |
| II. Domínio Financeiro Interno | Permissões e sessão inalteradas (FR-009) | ✅ |
| III. Clareza Antes de Implementar | Domínio vs. nome esclarecido com o usuário | ✅ |
| IV. Consistência com o Produto | Mesmo app, mesmas telas; só endereço e nome mudam | ✅ |
| V. Simplicidade e Escopo Fechado | Sem segundo bundle nem migração de sessão; ativação por variável de ambiente | ✅ |

**Re-check pós-design**: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/099-consultant-panel-dominio/
├── plan.md
├── research.md
├── quickstart.md
├── contracts/
│   └── enderecos.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── vite.config.ts                     # dev: consultantpanel.* também serve proposal.html
├── vercel.json                        # rewrite do host consultantpanel.oceantalentsolutions.com
├── proposal.html                      # título padrão
└── src/
    ├── utils/proposalUrl.ts           # ERP: base do painel (/entrar, /convite)
    ├── components/Layout.tsx          # ERP: item de menu "Consultant Panel"
    ├── pages/Fornecedores.tsx, Configuracoes.tsx  # textos "Proposal" → "Consultant Panel"
    └── proposal/
        ├── dominios.ts                # NOVO: urlCliente, urlPainel, ehHostCliente, redirecionarParaPainel
        ├── main.tsx                   # redireciona antes de montar o app
        ├── App.tsx                    # título da aba do painel
        ├── utils/propostaCalculo.ts   # montarLinkPublico → urlCliente
        ├── components/ProposalLayout.tsx, pages/Login.tsx, pages/Convite.tsx  # nome "Consultant Panel"
        ├── pages/Detalhe.tsx          # "Abrir página do cliente" no próprio painel
        └── pages/PropostaPublica.tsx  # faixa de pré-visualização no painel

backend/app/
├── config.py                          # CONSULTANT_PANEL_URL + CORS padrão de dev
└── services/email_aceite.py           # botão do e-mail → painel
.env.deploy.example                    # variáveis e checklist de DNS/Vercel/Render
```

**Structure Decision**: Sem novos projetos; um módulo novo (`proposal/dominios.ts`).

## Complexity Tracking

Sem violações da constitution.
