# Research: Segurança de acesso ao ERP

## R1. Causa do "usuário ou senha incorretos" após liberar o ERP

- **Decisão**: Ao definir senha em Configurações (`POST /api/configuracoes/` ou `PUT /api/configuracoes/{uid}` com `senha`), gravar `senha_pendente = False` e chamar `invalidar_convites(db, uid)`.
- **Evidência**: `auth.login` recusa quando `usuario_db.senha_pendente` é verdadeiro, com a mesma mensagem de senha errada. `configuracoes.atualizar_usuario` troca o hash mas nunca limpa `senha_pendente`. Só `proposal_auth.aceitar_convite` limpa. No banco: `leandro@…` cadastrado em 13/10 15:53 (convite), convite usado em 14/10 16:53:49 e registro atualizado em 16:56; o relato "após logar no proposal deu certo" bate com o aceite do convite.
- **Alternativas consideradas**: deixar o convite válido depois que o admin define a senha (descartada: o aceite trocaria em silêncio a senha definida pelo admin); enviar um convite novo automaticamente (descartada pelo usuário no clarify: bloquear e avisar).

## R2. Remoção das credenciais padrão

- **Decisão**: Apagar `USUARIOS_DEV`, `seed_usuarios_default` e `PERMISSOES_ADMIN` de `auth.py`. O login passa a exigir um registro em `usuarios_app`. Remover a dica e o rodapé "Ambiente de desenvolvimento" de `Login.tsx`.
- **Evidência**: `seed_usuarios_default` roda a cada `POST /api/auth/token` e recria as contas excluídas (`admin` id 7 em 13/10; `visualizador` id 16 em 14/10, ambos com `atualizado_em = criado_em`). Quando o usuário está inativo, a busca filtra `ativo == True` e cai no fallback `USUARIOS_DEV`, aceitando a senha padrão com papel admin.
- **Alternativas consideradas**: manter o seed só com `DEBUG=True` (descartada: `DEBUG` vale `True` por padrão e o usuário escolheu remover); forçar troca de senha das contas existentes (descartada pelo usuário; a troca é manual, logo após a implantação).

## R3. Primeiro administrador em banco vazio

- **Decisão**: Script `backend/scripts/criar_admin.py <usuario>`, no padrão dos scripts sob demanda (`seed_estrutura.py`). A senha é lida de `OCEAN_ADMIN_SENHA` ou digitada via `getpass` (com confirmação, mínimo de 8 caracteres). O script cria a conta admin com acesso ao ERP; se o login já existir, só redefine a senha com `--redefinir-senha`.
- **Rationale**: Atende FR-004 sem senha embutida e também serve para recuperar o acesso caso o admin perca a senha.
- **Alternativas consideradas**: variáveis de ambiente lidas no startup (descartada: a senha ficaria persistida na configuração do Render e o bootstrap rodaria em todo deploy).

## R4. Revogação imediata da sessão do ERP

- **Decisão**: Criar em `auth.py` a função `_usuario_erp(token, db)`, que decodifica o token, exige `app == erp` e busca `UsuarioApp` por `sub`. Se o usuário não existir, estiver inativo, sem `acesso_erp` ou com `senha_pendente`, responde **401**. `require_erp`, `get_current_user`, `get_current_papel` e `require_admin` passam a depender de `get_db` e usar o registro: o papel vem do banco e não do token. `/auth/me` também usa o papel do banco.
- **Rationale**: O 401 aciona o interceptor do ERP (`api.ts`), que limpa a sessão e leva ao login (cenários 1 e 2 da US3). O FastAPI reaproveita a mesma sessão de `get_db` entre as dependências da requisição, então são no máximo 2 consultas por requisição (a do router e a da rota). É a mesma regra do Proposal (`get_proposal_user`).
- **Alternativas consideradas**: lista de tokens revogados ou "versão de sessão" por usuário (descartada: mais estado, mais código, e ainda exigiria consulta ao banco); diminuir a validade do token (descartada: não resolve e piora a experiência).

## R5. Normalização do login

- **Decisão**: Criar `normalizar_login(valor)` em `app/services/acesso_proposal.py`: `strip()` e, se houver `@`, `lower()`. Usar no login do ERP, no login do Proposal, no cadastro e na checagem de duplicidade de Configurações. O `sub` do JWT passa a ser o login canônico do banco.
- **Evidência**: Todos os logins atuais já estão normalizados (consulta de 15/10: nenhum difere de `lower(trim(usuario))`), então não há migração.

## R6. Exclusão de usuário

- **Decisão**: Manter a exclusão física. As FKs no banco já estão corretas (`tokens_acesso` e `proposal_perfis_consultor` com CASCADE; `propostas.criado_por_id` e `propostas_edicoes.editado_por_id` com SET NULL; `criado_por_usuario` é texto e se mantém). Acrescentar a exclusão de `usuarios_auth` pelo login e o registro na auditoria.
- **Rationale**: Com o seed removido (R2) e a reconferência por requisição (R4), a exclusão passa a ser efetiva. O vínculo com o fornecedor fica na própria linha de `usuarios_app`, então o fornecedor volta a "sem acesso" (o `status_acessos` só lista usuários existentes).

## R7. Auditoria de Configurações

- **Decisão**: `registrar_auditoria(db, admin, acao, "UsuarioApp", id, descricao)` em criar ("criar"), editar/desativar/reativar ("editar") e excluir ("excluir"). A descrição traz o login e os campos alterados (papel, acessos, ativo, "senha redefinida"), nunca a senha.
