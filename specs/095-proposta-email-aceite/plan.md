# Implementation Plan: E-mail com link e PDF no aceite da proposta

**Branch**: `095-proposta-email-aceite` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/095-proposta-email-aceite/spec.md`

## Summary

Depois do `commit` do aceite em `POST /api/public/propostas/{codigo}/assinar`, agendar um `BackgroundTasks` que abre uma sessão própria e envia, pelo `enviar_email` existente:

- ao cliente (`assinatura.email`), um e-mail no idioma da proposta;
- aos destinatários internos, um aviso em português. Eles são o login do criador, se for e-mail (senão `consultor_email`), mais os admins ativos com `acesso_proposal` e login de e-mail, sem duplicados e sem o endereço do cliente.

Os links usam a nova configuração `PROPOSAL_PUBLIC_URL`:

- `/p/{codigo}` para ver a proposta;
- `/p/{codigo}?pdf=1` para baixar o PDF;
- `/propostas/{id}` para abrir no Proposal.

No frontend, `PaginaModelo` dispara `baixarPdf()` uma vez quando a URL tem `pdf=1` e remove o parâmetro da URL.

## Technical Context

**Language/Version**: Python 3.11 · TypeScript 5 + React 18

**Primary Dependencies**: FastAPI (`BackgroundTasks`), `smtplib` via `app/services/email.py`, `html.escape`, `zoneinfo` · React Router

**Storage**: Sem mudança de schema

**Testing**: Sem suíte; `py_compile`, smoke da montagem de destinatários e HTML com SQLite e `enviar_email` simulado, `npm run type-check`/`build`, roteiro do [quickstart.md](./quickstart.md)

**Target Platform**: API no Render; Proposal na Vercel (`proposal.oceantalentsolutions.com`)

**Project Type**: Aplicação web

**Performance Goals**: A resposta do aceite não espera o SMTP (envio em segundo plano)

**Constraints**: Sem credenciais em código; sem SMTP configurado, o envio vira dry-run e só gera log (comportamento existente); `enviar_email` usa `ALERT_EMAILS` quando `para` vem vazio, então só deve ser chamado com uma lista não vazia

**Scale/Scope**: 1 aceite gera até ~5 e-mails

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos e e-mails internos em pt-BR; e-mail do cliente em en-US só quando a proposta é em inglês (decisão do usuário) | ✅ |
| II. Domínio / papéis | Aviso interno limitado a admins ativos com acesso ao Proposal e ao criador | ✅ |
| III. Clareza | 4 esclarecimentos registrados | ✅ |
| IV. Consistência | Reusa `enviar_email` e o botão "Baixar PDF" existente | ✅ |
| V. Simplicidade | Sem anexo, sem fila, sem histórico de envios; 1 serviço novo e 1 setting | ✅ |
| Credenciais fora de artefatos | SMTP via variáveis do Render (já existentes) | ✅ |

**Re-check pós-design**: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/095-proposta-email-aceite/
├── plan.md
├── research.md
├── quickstart.md
├── contracts/email-aceite.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/config.py                         # PROPOSAL_PUBLIC_URL
backend/app/services/email_aceite.py          # NOVO: destinatários, HTML pt-BR/en-US, enviar_emails_aceite(proposta_id)
backend/app/api/routes/public_propostas.py    # BackgroundTasks após o commit do aceite
.env.deploy.example                           # PROPOSAL_PUBLIC_URL + checklist SMTP
frontend/src/proposal/modelos/pagina/PaginaModelo.tsx  # ?pdf=1 dispara baixarPdf uma vez
```

**Structure Decision**: Aplicação web existente; o serviço novo fica separado de `email.py` (alertas financeiros) para não misturar domínios.

## Complexity Tracking

Sem violações da constitution.
