# Data Model: Correção do Login e Sessão

**Feature**: `054-fix-login-sessao` | **Date**: 2026-09-06

Nenhuma alteração de schema PostgreSQL é esperada. Este documento descreve as entidades lógicas de autenticação/sessão já existentes e as regras de estado no cliente.

## Entidades (persistidas — inalteradas)

### UsuarioApp (usuário da aplicação)

| Campo (conceitual) | Descrição |
|--------------------|-----------|
| usuario | Identificador de login |
| senha_hash | Credencial armazenada |
| papel | `admin` \| `visualizador` |
| permissoes | Opcional |
| ativo | Soft-flag de acesso |

### UsuarioAuth (fatores adicionais)

| Campo (conceitual) | Descrição |
|--------------------|-----------|
| usuario | Vínculo com o login |
| twofa_ativo | Se 2FA está exigido no login |
| totp_secret | Segredo TOTP (quando ativo) |

## Sessão autenticada (cliente)

Estado efetivo após login bem-sucedido. **Não** é tabela; vive em memória (Zustand) + `localStorage`.

| Chave | Obrigatório | Descrição |
|-------|-------------|-----------|
| `access_token` | Sim | JWT Bearer |
| `usuario` | Sim | Nome do usuário autenticado |
| `papel` | Sim | `admin` \| `visualizador` |
| `permissoes` | Não | String/serializado de permissões |
| `paginas_visibilidade` | Não | Mapa JSON de páginas visíveis |

### Regras

1. **Criação**: somente após resposta de sucesso do login (200) com `access_token` e `usuario`.
2. **Limpeza completa**: remover **todas** as chaves acima juntas (login mount, logout, 401 de sessão inválida).
3. **Sessão parcial proibida**: falha de login ou erro técnico **não** deve deixar `access_token` sem identidade coerente (nem o inverso).
4. **Reidratação**: presença de `access_token` ⇒ `isAuthenticated = true` até logout ou 401 de sessão.

## Credenciais de acesso (entrada)

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| username | Sim | |
| password | Sim | |
| totp_code | Condicional | Obrigatório só se backend responder `2FA_REQUIRED` |

## Transições de estado

```text
[Anônimo / limpo]
    │ submit credenciais válidas
    ▼
[Autenticado] ── F5 / navegação ──► [Autenticado] (mesmo token)
    │
    │ logout | 401 sessão | abrir /login (limpa residual)
    ▼
[Anônimo / limpo]

[Anônimo] -- credenciais inválidas --> [Anônimo] + mensagem genérica
[Anônimo] -- senha ok, 2FA on, sem código --> [Aguardando 2FA] (ainda sem token)
[Aguardando 2FA] -- código válido --> [Autenticado]
[Aguardando 2FA] -- código inválido --> [Aguardando 2FA] + mensagem
```

## Validação

- Credenciais vazias: bloqueio no formulário (HTML required / equivalente).
- Credenciais inválidas: sem transição para Autenticado; mensagem genérica.
- Token expirado em rota protegida: transição para Anônimo + redirecionamento login.
