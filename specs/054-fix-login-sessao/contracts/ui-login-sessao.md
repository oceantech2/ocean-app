# Contract: UI — Login e Sessão

**Feature**: `054-fix-login-sessao` | **Date**: 2026-09-06  
**Tela**: `/login` (`Login.tsx`) · rotas protegidas via `ProtectedRoute`

## Tela de login

### Ao montar

1. Limpar sessão residual completa (token, usuário, papel, permissões, páginas).
2. Exibir formulário: Usuário, Senha, botão **Entrar**.
3. Campo de 2FA oculto até `2FA_REQUIRED`.

### Submit — credenciais válidas (sem 2FA)

1. Loading no botão (ex.: “Entrando...”).
2. Toast de sucesso **somente** após 200 + persistência da sessão.
3. Navegar para `/dashboard`.
4. Sem toast/erro de falha de login.

### Submit — credenciais inválidas

1. Permanecer em `/login`.
2. Toast/erro: **“Usuário ou senha incorretos”** (genérico).
3. Nenhuma chave de sessão criada.

### Submit — 2FA necessário

1. Exibir campo “Código de verificação (2FA)”.
2. Toast/informativo pedindo o código (não erro definitivo).
3. Botão pode passar a “Verificar e entrar”.
4. Código válido → mesmo fluxo de sucesso do login sem 2FA.
5. Código inválido → mensagem clara; permanece no passo 2FA.

### Falha técnica (API fora / rede)

1. Mensagem amigável em português.
2. Sem sessão parcial.
3. Usuário pode tentar de novo.

## Área autenticada

| Ação | Esperado |
|------|----------|
| Navegar entre páginas protegidas | Mantém sessão; sem redirect indevido ao login |
| F5 com token válido | Continua autenticado |
| 401 real de sessão | Limpa estado + redirect `/login` |
| Logout explícito | Limpa estado completo + `/login` |

## Fora de escopo de UI

- Recuperação de senha, “lembrar-me” dedicado, SSO, cadastro de usuário.
- Alteração visual ampla da tela (manter layout atual).
