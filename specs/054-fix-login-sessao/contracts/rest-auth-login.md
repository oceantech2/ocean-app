# Contract: REST — Auth Login / Sessão

**Feature**: `054-fix-login-sessao` | **Date**: 2026-09-06  
**Base**: `http://localhost:8001/api`

## POST `/auth/token`

Autentica usuário e devolve token + metadados de sessão.

### Request

- **Content-Type**: `application/x-www-form-urlencoded`
- **Body** (campos):

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `username` | string | Sim | Usuário |
| `password` | string | Sim | Senha |
| `totp_code` | string | Não* | Código TOTP de 6 dígitos (*obrigatório se 2FA ativo e já solicitado) |

**Não** enviar JSON nem multipart (`FormData`) com header urlencoded incorreto.

### Responses

#### 200 OK — autenticação concluída

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "usuario": "<username>",
  "papel": "admin",
  "twofa_ativo": false,
  "permissoes": null,
  "paginas_visibilidade": {}
}
```

Cliente MUST persistir sessão completa e redirecionar à área autenticada.

#### 401 Unauthorized — credenciais inválidas

```json
{ "detail": "Usuário ou senha incorretos" }
```

Cliente MUST NÃO criar sessão; MUST exibir mensagem genérica equivalente.

#### 401 Unauthorized — 2FA necessário

```json
{ "detail": "2FA_REQUIRED" }
```

Cliente MUST NÃO criar sessão; MUST solicitar código TOTP (não tratar como falha definitiva de senha). Interceptor MUST NÃO forçar logout/hard-redirect por este detail.

#### 401 Unauthorized — código 2FA inválido

```json
{ "detail": "Código 2FA inválido" }
```

Cliente permanece no passo 2FA; mensagem clara; sem sessão.

#### 4xx/5xx — falha técnica

Cliente MUST mensagem amigável; MUST NÃO deixar sessão parcial.

---

## GET `/auth/me`

### Headers

`Authorization: Bearer <access_token>`

### Responses

- **200**: dados do usuário autenticado (usuario, papel, 2FA, permissões, páginas).
- **401**: token ausente/inválido/expirado → cliente limpa sessão completa e vai ao login.

---

## Notas de contrato cliente ↔ interceptor

| Situação | Comportamento esperado |
|----------|------------------------|
| 401 em `POST /auth/token` | Entregar erro ao formulário de login; não hard-redirect mid-submit |
| 401 em rota autenticada com token, `detail ≠ 2FA_REQUIRED` | Limpar todas as chaves de sessão + ir a `/login` |
| 401 `2FA_REQUIRED` | Nunca tratar como sessão expirada |
