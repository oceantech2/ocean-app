# Implementation Plan: Correção do Login e Sessão

**Branch**: `054-fix-login-sessao` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/054-fix-login-sessao/spec.md`

**Note**: Plano preenchido por `/speckit-plan`. Artefatos de design em research / data-model / contracts / quickstart.

## Summary

Corrigir o fluxo de autenticação do Ocean App para que credenciais válidas iniciem sessão estável no ciclo completo (submit → token → redirecionamento → navegação/F5), sem loop de erro. Hipótese principal: o cliente envia o corpo do login de forma incompatível com o contrato OAuth2 do backend (`FormData` + header `application/x-www-form-urlencoded`). Complementar com limpeza automática de sessão residual inválida na tela de login / em 401 de sessão, mensagem genérica única para credenciais inválidas, e preservação do fluxo 2FA como não-regressão. Escopo fechado: sem SSO, recuperação de senha ou novos papéis.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18 (frontend); Python 3.10+ + FastAPI (backend)

**Primary Dependencies**: React, Vite, Axios, Zustand, react-hot-toast, react-router-dom; FastAPI, OAuth2PasswordRequestForm, JWT, pyotp (2FA)

**Storage**: PostgreSQL — usuários (`UsuarioApp`) e 2FA (`UsuarioAuth`); sessão no cliente via `localStorage` (`access_token`, `usuario`, `papel`, `permissoes`, `paginas_visibilidade`). Sem migração de schema esperada.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` / type-check no frontend; smoke login admin e visualizador

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Login completo até dashboard &lt; 10 s em rede local (SC-002)

**Constraints**: Portas fixas; papéis `admin` / `visualizador`; credenciais/segredos fora de artefatos; mensagem de falha de credencial genérica (sem enumeração); 2FA só não-regressão

**Scale/Scope**: Tela `Login.tsx`, `authService` + interceptors em `api.ts`, store Zustand de auth, eventual alinhamento de mensagens no endpoint `/auth/token`; sem telas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — autenticação existente; papéis inalterados |
| III. Clareza antes de implementar | PASS — clarify 4/4 na spec |
| IV. Consistência com produto existente | PASS — JWT + toast + redirect dashboard; padrão OAuth2 form já usado no backend |
| V. Simplicidade e escopo fechado | PASS — correção pontual do cliente/limpeza de sessão; sem novo método de auth |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais nos artefatos (quickstart usa referência aos usuários de desenvolvimento já documentados no projeto, sem reinventar segredos) |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Contratos REST/UI e data-model alinhados à research (URL-encoded + limpeza de sessão residual).

## Project Structure

### Documentation (this feature)

```text
specs/054-fix-login-sessao/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-auth-login.md
│   └── ui-login-sessao.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    └── api/routes/
        └── auth.py                 # POST /auth/token (já OAuth2); revisar detalhe 401 genérico se necessário

frontend/
└── src/
    ├── components/Login.tsx        # submit, 2FA UI, limpeza ao montar, mensagens
    ├── services/api.ts             # authService.login (encoding), logout completo, interceptor 401
    ├── store/index.ts              # setAuth / logout / chaves localStorage
    ├── App.tsx                     # ProtectedRoute (comportamento de sessão)
    └── types/index.ts              # LoginResponse (se precisar ajuste)
```

**Structure Decision**: Aplicação web existente (frontend + backend). Correção concentrada no cliente de auth; backend só se for preciso alinhar mensagem/detalhe já quase conforme a spec.

## Complexity Tracking

> Preenchido somente se houver violações justificadas do Constitution Check — não aplicável.
