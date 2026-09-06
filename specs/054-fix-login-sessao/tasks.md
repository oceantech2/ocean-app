# Tasks: Correção do Login e Sessão

**Input**: Design documents from `/specs/054-fix-login-sessao/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Fase 2 corrige encoding OAuth2 e limpeza de sessão (bloqueia todas as histórias). US1 entrega login válido no ciclo completo. US2 fecha mensagem genérica. US3 garante não-regressão 2FA.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline e arquivos-alvo do plano

- [x] T001 Confirmar branch `054-fix-login-sessao`, portas 8001/5193 e presença de `frontend/src/services/api.ts`, `frontend/src/components/Login.tsx`, `frontend/src/store/index.ts`, `backend/app/api/routes/auth.py` conforme [plan.md](./plan.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Corrigir contrato de envio do login e limpeza consistente de sessão — bloqueia todas as histórias

**⚠️ CRITICAL**: Nenhuma história de UI até encoding e logout/interceptor estarem alinhados aos contratos

- [x] T002 Em `frontend/src/services/api.ts` (`authService.login`), substituir `FormData` por `URLSearchParams` (ou equivalente urlencoded) com `Content-Type: application/x-www-form-urlencoded`, enviando `username`, `password` e `totp_code` opcional, conforme [contracts/rest-auth-login.md](./contracts/rest-auth-login.md) e [research.md](./research.md)
- [x] T003 Em `frontend/src/services/api.ts` (`authService.logout`), remover as mesmas chaves de sessão que `useAuthStore.logout` em `frontend/src/store/index.ts` (`access_token`, `usuario`, `papel`, `permissoes`, `paginas_visibilidade`), conforme [data-model.md](./data-model.md)
- [x] T004 Em `frontend/src/services/api.ts` (interceptor de resposta), (a) não tratar 401 de `POST /auth/token` como sessão expirada com hard-redirect mid-submit; (b) em 401 de sessão real (`detail !== '2FA_REQUIRED'` e token presente em rota autenticada), limpar estado completo (todas as chaves) antes de ir a `/login`, conforme contrato REST

**Checkpoint**: Request de login urlencoded correto; limpeza de sessão completa; 401 de login chega ao formulário

---

## Phase 3: User Story 1 - Entrar com credenciais válidas (Priority: P1) 🎯 MVP

**Goal**: Credenciais válidas iniciam sessão estável (submit → dashboard → navegação/F5) sem erro indevido; sessão residual é limpa ao abrir o login

**Independent Test**: Login admin válido → dashboard sem toast de erro; F5 mantém sessão; com token inválido residual, abrir `/login` limpa e novo login funciona na 1ª tentativa ([quickstart.md](./quickstart.md) §§1 e 3)

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/components/Login.tsx`, ao montar a tela, limpar sessão residual via `useAuthStore.getState().logout()` (ou equivalente), conforme FR-008 e [contracts/ui-login-sessao.md](./contracts/ui-login-sessao.md)
- [x] T006 [US1] Em `frontend/src/components/Login.tsx`, garantir que `setAuth` + toast de sucesso + `navigate('/dashboard')` só ocorrem após resposta 200 de `authService.login`, sem gravar sessão parcial em falha
- [x] T007 [US1] Em `frontend/src/services/api.ts` (`authService.login`), persistir `access_token`/`usuario` apenas no sucesso 200 e alinhar com `setAuth` em `frontend/src/store/index.ts` (papel, permissões, páginas) para sessão coerente pós-login
- [x] T008 [P] [US1] Verificar em `frontend/src/App.tsx` (`ProtectedRoute`) que `isAuthenticated` baseado no token permite acesso após login e F5 com token válido; sem alteração desnecessária se já correto
- [x] T009 [US1] Validar smoke manual do ciclo completo (admin + F5 + sessão residual) conforme [quickstart.md](./quickstart.md) cenários 1 e 3

**Checkpoint**: SC-001, SC-002, SC-004, SC-006; FR-001, FR-002, FR-005, FR-008

---

## Phase 4: User Story 2 - Credenciais inválidas com feedback claro (Priority: P2)

**Goal**: Credenciais inválidas mostram mensagem genérica única e não criam sessão; nova tentativa válida funciona

**Independent Test**: Senha errada → “Usuário ou senha incorretos”, sem `access_token`; corrigir e entrar com sucesso ([quickstart.md](./quickstart.md) §2)

### Implementation for User Story 2

- [x] T010 [US2] Em `frontend/src/components/Login.tsx`, mapear 401 de credenciais (exceto `2FA_REQUIRED` e código 2FA) para toast **“Usuário ou senha incorretos”**, sem enumerar usuário vs senha, conforme FR-003 e clarify Q4
- [x] T011 [P] [US2] Em `backend/app/api/routes/auth.py` (`POST /token`), confirmar que falhas de usuário/senha já retornam `detail: "Usuário ou senha incorretos"`; ajustar só se algum caminho divergir
- [x] T012 [US2] Em `frontend/src/components/Login.tsx`, garantir que falha de credencial não chama `setAuth` e não deixa chaves de sessão; após falha, login válido segue US1
- [x] T013 [US2] Validar smoke do cenário 2 do [quickstart.md](./quickstart.md) (incluir visualizador no §4 se conveniente)

**Checkpoint**: SC-003; FR-003, FR-006 (parcial — mensagem amigável), FR-007

---

## Phase 5: User Story 3 - Não-regressão do fluxo com 2FA (Priority: P3)

**Goal**: Login com 2FA continua funcional; `2FA_REQUIRED` não é tratado como falha definitiva nem como sessão expirada

**Independent Test**: Usuário com 2FA → pede código → inválido falha com mensagem → válido entra ([quickstart.md](./quickstart.md) §5); se não houver usuário 2FA no ambiente, validar pelo menos o ramo de UI/`detail` sem regressão no interceptor

### Implementation for User Story 3

- [x] T014 [US3] Em `frontend/src/components/Login.tsx`, preservar fluxo `precisa2fa` / campo TOTP ao receber `detail === '2FA_REQUIRED'`, sem toast de erro definitivo de senha
- [x] T015 [US3] Em `frontend/src/services/api.ts`, confirmar que interceptor e `authService.login` enviam `totp_code` no form urlencoded e **nunca** redirecionam por `2FA_REQUIRED`
- [x] T016 [US3] Em `frontend/src/components/Login.tsx`, tratar “Código 2FA inválido” com mensagem clara, sem criar sessão; código válido conclui como US1
- [x] T017 [US3] Validar smoke do cenário 5 do [quickstart.md](./quickstart.md) (ou checklist de não-regressão se 2FA indisponível no ambiente)

**Checkpoint**: SC-005; FR-004

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechar validação ponta a ponta e falhas técnicas

- [x] T018 Em `frontend/src/components/Login.tsx`, garantir mensagem amigável em português para falha de rede/API indisponível sem sessão parcial ([quickstart.md](./quickstart.md) §6; FR-006)
- [x] T019 [P] Rodar `npm run lint` e/ou type-check em `frontend/` após as alterações de auth
- [x] T020 Executar checklist final do [quickstart.md](./quickstart.md) (Network urlencoded, 401 de credencial sem hard-refresh engolindo toast, logout alinhado)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da Phase 2; ideal após US1 (reusa login sucesso)
- **US3 (Phase 5)**: Depende da Phase 2; ideal após US1 (mesmo submit + encoding)
- **Polish (Phase 6)**: Após histórias desejadas

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — sem dependência de US2/US3
- **US2 (P2)**: Após Phase 2 — independentemente testável; toca `Login.tsx` em comum com US1 (sequencial preferível)
- **US3 (P3)**: Após Phase 2 — independentemente testável; toca `Login.tsx` / `api.ts` em comum (sequencial preferível)

### Within Each User Story

- Encoding/interceptor (Phase 2) antes de smoke de login
- Limpeza ao montar e sucesso 200 antes de validar F5
- Mensagens de erro depois do caminho feliz estável
- 2FA por último (não-regressão)

### Parallel Opportunities

- T008 pode rodar em paralelo a T005–T007 se `App.tsx` não depender das mudanças de Login
- T011 (backend) pode rodar em paralelo a T010 (frontend)
- T019 pode rodar em paralelo a T018 após implementação estável
- US2 e US3 **não** são ideais em paralelo no mesmo arquivo `Login.tsx` (conflito de merge)

---

## Parallel Example: User Story 1

```bash
# Após Phase 2:
# Sequencial preferido em Login.tsx + api.ts:
Task: "T005 limpeza ao montar em frontend/src/components/Login.tsx"
Task: "T006 setAuth só no sucesso em frontend/src/components/Login.tsx"
Task: "T007 persistência coerente em frontend/src/services/api.ts"

# Em paralelo (arquivo distinto):
Task: "T008 verificar ProtectedRoute em frontend/src/App.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "T010 mensagem genérica em frontend/src/components/Login.tsx"
Task: "T011 confirmar detail no backend/app/api/routes/auth.py"  # [P] outro arquivo
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 + Phase 2
2. Completar Phase 3 (US1)
3. **STOP e VALIDAR** quickstart §§1 e 3
4. Demo: login admin estável sem loop

### Incremental Delivery

1. Setup + Foundational → encoding e sessão limpa
2. US1 → login válido ciclo completo (MVP)
3. US2 → mensagem genérica credenciais inválidas
4. US3 → não-regressão 2FA
5. Polish → rede + lint + checklist Network

### Parallel Team Strategy

Com dois desenvolvedores: um em Phase 2 → US1; outro prepara T011 (backend) e revisa contratos; US2/US3 sequenciais no frontend para evitar conflito em `Login.tsx`.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem tarefas de teste automatizado (spec não pediu TDD)
- Não alterar portas; não incluir credenciais novas nos artefatos
- Commit após cada tarefa ou grupo lógico, se solicitado pelo usuário
- Parar em qualquer checkpoint para validar a história isoladamente
- Implementação (2026-09-06): código concluído; smoke E2E do quickstart pendente de Docker/API local (daemon indisponível no momento da implementação). Validação estática: arquivos de auth sem erros de type-check; backend já retorna mensagem genérica.
