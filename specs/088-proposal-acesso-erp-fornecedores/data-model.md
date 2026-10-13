# Data Model: Acesso ao Proposal pelo ERP e liberação para fornecedores

## `usuarios_app` (existente) — colunas novas

| Coluna | Tipo | Regra |
|---|---|---|
| `fornecedor_id` | `INTEGER NULL` FK `colaboradores(id)` `ON DELETE SET NULL` | Índice único parcial `WHERE fornecedor_id IS NOT NULL` (1 usuário por fornecedor) |
| `senha_pendente` | `BOOLEAN NOT NULL DEFAULT FALSE` | `true` enquanto o usuário criado pela liberação não definir a senha; login recusado |

Usuário criado pela liberação: `usuario` = e-mail normalizado (minúsculo, sem espaços), `papel = 'visualizador'`, `permissoes = NULL`, `acesso_erp = false`, `acesso_proposal = true`, `senha_pendente = true`, `fornecedor_id` = fornecedor.

## `tokens_acesso` (nova)

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | `SERIAL PK` | |
| `usuario_id` | `INTEGER NOT NULL` FK `usuarios_app(id)` `ON DELETE CASCADE` | |
| `tipo` | `VARCHAR(10) NOT NULL` | `CHECK (tipo IN ('convite','sso'))` |
| `token_hash` | `VARCHAR(64) NOT NULL UNIQUE` | SHA-256 hex do token; o token em claro nunca é gravado |
| `criado_em` | `TIMESTAMP NOT NULL DEFAULT NOW()` | UTC |
| `expira_em` | `TIMESTAMP NOT NULL` | convite: +7 dias; sso: +120 s |
| `usado_em` | `TIMESTAMP NULL` | preenchido no consumo |
| `invalidado_em` | `TIMESTAMP NULL` | novo convite, revogação |

Índice: `(usuario_id, tipo)`.

**Token válido** = `usado_em IS NULL AND invalidado_em IS NULL AND expira_em > now()`.

## Status de acesso do fornecedor (derivado)

```text
sem_acesso ──liberar (novo usuário)──▶ convite_pendente ──definir senha──▶ ativo
     ▲                                     │ 7 dias                        │
     │                                     ▼                               │
     │                              convite_expirado ──novo convite──▶ convite_pendente
     │                                                                     │
     └───────────── revogar / desativar fornecedor ◀───────────────────────┘
sem_acesso (com senha já definida) ──liberar──▶ ativo (sem convite)
```

## Transições e efeitos

| Ação | Efeito |
|---|---|
| Liberar (sem usuário vinculado, e-mail livre) | cria usuário + perfil de consultor (se não existir) + convite |
| Liberar (e-mail = login de usuário existente sem fornecedor) | vincula, `acesso_proposal = true`; convite só se `senha_pendente` |
| Liberar (usuário vinculado, senha definida, sem acesso) | `acesso_proposal = true` |
| Liberar (usuário vinculado, `senha_pendente`) | `acesso_proposal = true` + novo convite (invalida anteriores) |
| Novo convite | invalida convites válidos do usuário e cria outro; se o usuário já tinha senha, ela continua valendo até o convite ser usado |
| Aceitar convite | `senha_hash` = nova senha, `senha_pendente = false`, convite `usado_em` |
| Revogar / desativar / excluir fornecedor | `acesso_proposal = false`, convites válidos `invalidado_em = now()`; usuário e propostas mantidos |
| Entrada automática (emitir) | token `sso` 120 s para usuário ativo com `acesso_proposal` |
| Entrada automática (consumir) | reconfere `ativo` e `acesso_proposal`; devolve token `app=proposal` |
