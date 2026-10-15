# Quickstart: Segurança de acesso ao ERP

## Pré-requisitos

- `docker compose up -d` (API em 8001, Postgres em 5433) e `cd frontend && npm run dev` (5193).
- Um administrador existente no banco local. Em banco vazio:
  `docker exec -it ocean_backend python scripts/criar_admin.py <login>` (a senha é pedida no terminal).

## Cenários

1. **Login sem credenciais visíveis (US1)**: abrir `http://localhost:5193/login` → não há usuário/senha de exemplo nem o rodapé "Ambiente de desenvolvimento".
2. **Sem recriação/fallback (US1)**: em Configurações, criar `teste-padrao` e excluí-lo; tentar login com ele → 401; listar usuários → ele não volta. Desativar um usuário e tentar logar com a senha dele → 401.
3. **Liberação do ERP (US2)**:
   1. Em Fornecedores, liberar o Proposal de um fornecedor com e-mail (fica "Convite pendente").
   2. Em Configurações, o usuário aparece com o selo "Convite pendente".
   3. Editar, ligar "Acesso ao ERP" sem senha → erro pedindo senha.
   4. Definir senha e salvar → login no ERP com o e-mail (testar com maiúsculas e espaço no fim) funciona na primeira tentativa.
   5. Abrir o link do convite antigo → "Convite inválido ou expirado".
4. **Revogação imediata (US3)**: logar com o usuário de teste em outra janela anônima; excluí-lo (ou desativá-lo, ou tirar o ERP) como admin → na janela do usuário, a próxima ação volta ao login. Rebaixar um admin de teste para visualizador → a próxima ação de admin dele dá 403.
5. **Exclusão de usuário de fornecedor (US3)**: excluir o usuário do passo 3 → em Fornecedores, o fornecedor volta a "sem acesso" e pode ser liberado de novo.
6. **Auditoria**: a página Auditoria lista criar/editar/excluir de `UsuarioApp`, sem senhas.

## Após a implantação em produção

- Trocar imediatamente as senhas de `admin` e `visualizador` em Configurações (ou excluí-los, se não forem usados). Elas não são mais recriadas, mas a senha atual continua valendo até ser trocada.
