# Research: Correção do Login e Sessão

**Feature**: `054-fix-login-sessao` | **Date**: 2026-09-06

## 1. Causa raiz provável do erro no submit

**Decision**: Corrigir `authService.login` para enviar o corpo como `application/x-www-form-urlencoded` real (ex.: `URLSearchParams`), alinhado a `OAuth2PasswordRequestForm` do FastAPI — **não** usar `FormData` (multipart) com header `x-www-form-urlencoded`.

**Rationale**: Hoje o cliente cria `FormData` e força `Content-Type: application/x-www-form-urlencoded`. O corpo multipart não casa com o header; o backend frequentemente não recebe `username`/`password` corretamente → 401/422. Isso explica “sempre dá erro” ao tentar entrar, inclusive com credenciais válidas.

**Alternatives considered**:
- Enviar `FormData` sem override de Content-Type (multipart) — FastAPI pode aceitar, mas diverge do contrato OAuth2 usual e do `tokenUrl` documentado; menos previsível.
- Trocar login para JSON — exigiria mudar o backend e quebrar o padrão OAuth2PasswordRequestForm; fora do escopo mínimo.

## 2. Ciclo completo da sessão (pós-login / F5)

**Decision**: Manter JWT em `localStorage` + Zustand `setAuth` após resposta 200; interceptor de request continua injetando `Authorization: Bearer`. Após sucesso, redirecionar ao dashboard; F5 deve reidratar `isAuthenticated` a partir do token persistido (já feito no store). Garantir que falhas **durante** o login não gravem token parcial.

**Rationale**: Spec exige estabilidade após redirecionamento e F5 (clarify Q1). O padrão atual do produto já usa localStorage; não introduzir cookie/session server-side nesta feature.

**Alternatives considered**:
- Migrar para httpOnly cookie — mais seguro a longo prazo, mas escopo e risco maiores; rejeitado (simplicidade).
- Só memória (sem persistir) — quebraria F5; rejeitado pela spec.

## 3. Limpeza de sessão residual inválida (FR-008)

**Decision**:
1. Ao montar a tela de login, limpar estado de auth residual via logout completo do store (todas as chaves: token, usuário, papel, permissões, páginas).
2. No interceptor de resposta 401 (exceto `2FA_REQUIRED` e falhas de login sem sessão válida): limpar estado completo e enviar ao login, evitando deixar chaves órfãs (`papel`, etc.).
3. Alinhar `authService.logout` às mesmas chaves que `useAuthStore.logout`.

**Rationale**: Clarify Q2 — login limpo. Hoje o interceptor remove só parte das chaves; `authService.logout` também é incompleto vs. o store → estado inconsistente e loops.

**Alternatives considered**:
- Limpar só após 401 — rejeitado (usuário pode ficar preso se abrir `/login` com token morto e `isAuthenticated` true em outra aba/estado).
- Manter token até tentativa falha — rejeitado na clarify.

## 4. Interceptor 401 vs. tentativa de login

**Decision**: Não tratar 401 do `POST /auth/token` como “sessão expirada” que dispara hard redirect mid-flow de forma a engolir o toast de credenciais. Critérios: se a URL é a de login/token **ou** não há token ainda, rejeitar a promise para o `Login.tsx` exibir a mensagem; se há token e 401 em rota autenticada (detail ≠ `2FA_REQUIRED`), aí sim limpar e ir para `/login`.

**Rationale**: Com token residual, um 401 no próprio login pode limpar e recarregar a página, mascarando o erro ou gerando “loop”. Spec exige mensagem genérica clara (P2).

**Alternatives considered**: Remover interceptor 401 por completo — pioraria sessão expirada em páginas internas.

## 5. Mensagem de credenciais inválidas

**Decision**: UI e API usam texto genérico único em pt-BR: **“Usuário ou senha incorretos”** (já retornado pelo backend em vários caminhos). Mapear detalhes técnicos/vazios para essa mensagem no cliente quando for falha de autenticação de credencial; não distinguir usuário vs senha.

**Rationale**: Clarify Q4 + FR-003. Backend já está alinhado na maior parte; cliente não deve exibir `detail` bruto genérico de outros erros como se fosse credencial, nem inventar textos distintos.

**Alternatives considered**: Mensagens distintas — rejeitado na clarify (enumeração).

## 6. 2FA (não-regressão)

**Decision**: Manter envio opcional de `totp_code` no mesmo form urlencoded; UI continua reagindo a `detail === "2FA_REQUIRED"` sem tratar como falha definitiva; interceptor **não** desloga nesse detail. Não alterar setup/ativação 2FA nesta feature.

**Rationale**: Clarify Q3 — defeito principal sem 2FA; 2FA só não-regressão.

**Alternatives considered**: Endpoint separado para 2FA no login — desnecessário e fora de escopo.

## 7. Escopo de backend

**Decision**: Preferir correção 100% no frontend se o endpoint já aceita urlencoded e já devolve mensagem genérica. Só tocar `auth.py` se, na validação, algum caminho ainda devolver detalhe não genérico para credencial inválida ou se `totp_code` + form exigir ajuste documentado.

**Rationale**: Constituição V — menor solução. Backend do `/token` já valida senha e mensagem genérica.

**Alternatives considered**: Refatorar JWT/refresh tokens — fora de escopo.
