# Contrato: API

## ERP — autenticação (`/api/auth`)

### `POST /api/auth/token` e `GET /api/auth/me`
Campo novo na resposta: `"acesso_proposal": boolean` (usuário do banco; fallback `USUARIOS_DEV` → `false`).

Nova recusa no `POST /token`: usuário com `senha_pendente = true` → 401 `Usuário ou senha incorretos`.

### `POST /api/auth/proposal-sso`
Token do ERP. Sem corpo.

| Situação | Status | Resposta |
|---|---|---|
| Usuário ativo com acesso ao Proposal | 200 | `{ "codigo": "<token>", "expira_em": "<ISO UTC>" }` |
| Sem acesso ao Proposal / inativo / não cadastrado no banco | 403 | `Usuário sem acesso ao Proposal` |

## Proposal — autenticação (`/api/proposal/auth`)

### `POST /api/proposal/auth/token` (existente)
- Usuário com `@` é normalizado para minúsculas antes da busca.
- `senha_pendente = true` → 401 `Usuário ou senha incorretos`.

### `POST /api/proposal/auth/sso`
Corpo: `{ "codigo": "<token>" }`

| Situação | Status | Resposta |
|---|---|---|
| Código válido, usuário ativo com acesso | 200 | igual ao login: `{ access_token, token_type, usuario, papel }` |
| Código usado, expirado ou inexistente | 401 | `Link de acesso inválido ou expirado` |
| Usuário sem acesso / inativo | 403 | `Usuário sem acesso ao Proposal` |

### `POST /api/proposal/auth/convite/consultar`
Corpo: `{ "token": "<token>" }` → 200 `{ "usuario": "<login>" }` | 404 `Convite inválido ou expirado. Peça um novo ao administrador.` (mesma resposta para usado, expirado, invalidado, inexistente ou usuário sem acesso).

### `POST /api/proposal/auth/convite/aceitar`
Corpo: `{ "token": "<token>", "senha": "<senha>" }`

| Situação | Status | Resposta |
|---|---|---|
| Convite válido e senha com ≥ 8 caracteres | 200 | igual ao login |
| Senha curta | 400 | `A senha deve ter pelo menos 8 caracteres` |
| Convite inválido | 404 | mesma mensagem do `consultar` |

A confirmação de senha é validada no front.

## ERP — acessos de fornecedores (`/api/proposal-acessos`, `require_admin`)

### `GET /api/proposal-acessos/`
```json
[{ "fornecedor_id": 12, "usuario_id": 40, "usuario": "ana@x.com",
   "status": "sem_acesso|convite_pendente|convite_expirado|ativo",
   "convite_expira_em": "2026-10-16T17:00:00" }]
```
Só fornecedores com usuário vinculado aparecem; os demais são `sem_acesso` no front.

### `POST /api/proposal-acessos/liberar`
Corpo: `{ "fornecedor_ids": [12, 13] }` (1 a 200 ids)

```json
{ "resultados": [
  { "fornecedor_id": 12, "nome": "Ana", "usuario": "ana@x.com",
    "resultado": "convite", "token": "<token>", "expira_em": "<ISO>" },
  { "fornecedor_id": 13, "nome": "Bruno", "usuario": "bruno@x.com", "resultado": "religado" },
  { "fornecedor_id": 14, "nome": "Carla", "resultado": "ignorado",
    "motivo": "Fornecedor sem e-mail válido" }
]}
```
`resultado`: `convite` | `religado` (acesso religado, senha atual) | `vinculado` (usuário existente com o mesmo e-mail) | `ignorado`.
Motivos de `ignorado`: `Fornecedor não encontrado`, `Fornecedor inativo`, `Fornecedor sem e-mail válido`, `Acesso já está ativo`, `E-mail já vinculado a outro fornecedor`.

### `POST /api/proposal-acessos/{fornecedor_id}/convite`
Gera novo convite (invalida os anteriores). Exige usuário vinculado com acesso ao Proposal.
200 `{ "token": "<token>", "expira_em": "<ISO>", "usuario": "<login>" }` | 400 `Libere o acesso antes de gerar um convite` | 404 `Fornecedor não encontrado`.

### `POST /api/proposal-acessos/{fornecedor_id}/revogar`
200 `{ "status": "sem_acesso" }` | 404 `Fornecedor não encontrado`. Idempotente.

## ERP — fornecedores (existente)
`DELETE /api/fornecedores/{id}`, `PUT /api/fornecedores/{id}` com `ativo=false` e `DELETE /api/fornecedores/{id}/permanente` passam a revogar o acesso ao Proposal do usuário vinculado.
