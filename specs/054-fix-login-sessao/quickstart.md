# Quickstart: Correção do Login e Sessão

**Feature**: `054-fix-login-sessao` | **Date**: 2026-09-06  
**Contratos**: [REST](./contracts/rest-auth-login.md) · [UI](./contracts/ui-login-sessao.md)  
**Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Usuários de desenvolvimento já existentes no projeto (admin e visualizador) — usar as credenciais documentadas em `CLAUDE.md` / tela de login de desenvolvimento
- Navegador com DevTools → Application → Local Storage (para inspecionar chaves de sessão)

## Cenários de validação

### 1. Login válido (P1) — ciclo completo

1. Abrir `http://localhost:5193/login`.
2. Entrar com usuário admin de desenvolvimento e senha correta (sem 2FA).
3. **Esperado**: toast de sucesso; redirect `/dashboard`; sem erro de falha.
4. Navegar para outra página protegida (ex.: Contas).
5. Pressionar F5.
6. **Esperado**: permanece autenticado; localStorage com `access_token`, `usuario`, `papel`.

### 2. Credenciais inválidas (P2)

1. Em `/login`, informar senha errada.
2. **Esperado**: permanece no login; mensagem **“Usuário ou senha incorretos”**; localStorage **sem** `access_token` novo.
3. Corrigir a senha e entrar de novo.
4. **Esperado**: sucesso como no cenário 1.

### 3. Sessão residual inválida (FR-008 / SC-006)

1. Com a aplicação aberta, no DevTools definir `access_token` para um valor inválido (e opcionalmente outras chaves de auth).
2. Ir para uma rota protegida **ou** abrir `/login` diretamente.
3. Se redirecionado/aberto o login: **esperado** limpeza das chaves de sessão.
4. Fazer login válido.
5. **Esperado**: sucesso na **primeira** tentativa, sem loop de erro.

### 4. Visualizador

1. Login com usuário `visualizador` de desenvolvimento.
2. **Esperado**: autentica; acesso conforme papel (somente leitura onde já aplicável).

### 5. Não-regressão 2FA (P3) — se houver usuário com 2FA ativo

1. Login com senha correta → deve pedir código (não erro definitivo).
2. Código inválido → mensagem; sem token.
3. Código válido → dashboard e sessão estável.

### 6. API indisponível (opcional)

1. Parar o backend e tentar login.
2. **Esperado**: mensagem amigável; sem chaves de sessão parciais.

## Checagens rápidas pós-correção

- [ ] Request de login no Network: `Content-Type: application/x-www-form-urlencoded` e body com `username`/`password` (não multipart inconsistente)
- [ ] 401 de credencial **não** dispara hard-refresh que apaga o toast antes de ser lido
- [ ] `authService.logout` / logout da UI removem as mesmas chaves que o store

## Fora deste quickstart

- Alterar portas, criar SSO, reset de senha, migração de banco.
