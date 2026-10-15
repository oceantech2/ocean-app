# Contrato REST: autenticação do ERP e usuários

## `POST /api/auth/token` (alterado)

Form `application/x-www-form-urlencoded`: `username`, `password`, `totp_code?`.

- `username` normalizado (`strip`; minúsculas se tiver `@`).
- Aceita só registro em `usuarios_app` ativo, sem `senha_pendente` e com a senha correta; caso contrário, **401** `"Usuário ou senha incorretos"`.
- 2FA como hoje (**401** `"2FA_REQUIRED"` / `"Código 2FA inválido"`).
- Sem `acesso_erp` → **403** `"Usuário sem acesso ao ERP"`.
- Não cria nenhum usuário. Sem fallback de credenciais fixas.
- Resposta inalterada; `usuario` e o `sub` do token passam a ser o login canônico do banco.

## Todas as rotas do ERP (`ERP_DEPS` e dependências `get_current_user` / `require_admin` / `get_current_papel`)

- Token sem `app = erp` → **403** (como hoje).
- Token válido, mas usuário inexistente, inativo, sem `acesso_erp` ou com `senha_pendente` → **401** `"Não foi possível validar as credenciais"` (o front limpa a sessão e volta ao login).
- `require_admin` usa o papel atual do banco → **403** `"Ação permitida apenas para administradores"` se não for admin.

## `GET /api/auth/me` (alterado)

- `papel` vem do banco.

## `POST /api/proposal/auth/token` (alterado)

- `username` normalizado pela mesma regra (agora também remove espaços de logins que não são e-mail).

## `GET /api/configuracoes/` (alterado)

Cada item ganha `senha_pendente: boolean`.

## `POST /api/configuracoes/` (alterado)

- `usuario` normalizado; duplicidade checada no valor normalizado → **400** `"Usuário já existe"`.
- Usuário criado com `senha_pendente = false`.
- Auditoria `criar`.

## `PUT /api/configuracoes/{uid}` (alterado)

- Com `senha`: grava o hash, `senha_pendente = false` e invalida convites pendentes.
- Se vier `acesso_erp: true`, o usuário tiver `senha_pendente` e não vier `senha` → **400** `"Defina uma senha para liberar o acesso ao ERP (o usuário ainda não aceitou o convite do Proposal)"`.
- O admin não pode remover o próprio acesso ao ERP nem desativar a si mesmo → **400**.
- Auditoria `editar` com os campos alterados (sem senha).

## `DELETE /api/configuracoes/{uid}` (alterado)

- Remove também `usuarios_auth` do mesmo login.
- Auditoria `excluir`.
- O usuário não é recriado por nenhuma ação automática.

## UI

- `Login.tsx`: sem texto de credenciais e sem rodapé "Ambiente de desenvolvimento".
- `Configuracoes.tsx`: selo "Convite pendente" na coluna Status; no modal de edição de usuário pendente, aviso explicando que é preciso definir uma senha para ligar o ERP; bloqueio no front espelhando o 400.
