# Quickstart: validação da feature 088

## Pré-requisitos
- `docker compose up -d` (API em `http://localhost:8001`, Postgres em 5433)
- `cd frontend && npm run dev` (ERP em `http://localhost:5193`, Proposal em `http://proposal.localhost:5193`)
- Usuário `admin` / `123456` com "Acesso ao Proposal" marcado em Configurações > Usuários

## 1. Item Proposal no menu (US1)
1. Entrar no ERP como `admin` → o item **Proposal** aparece no fim do menu (também com o menu recolhido).
2. Clicar → nova aba em `proposal.localhost:5193`, já na lista de propostas, usuário `admin`.
3. Recarregar a aba do Proposal com o mesmo endereço `/entrar#c=…` → cai no login com a mensagem de entrada manual (uso único).
4. Desmarcar "Acesso ao Proposal" do `admin` → recarregar o ERP → o item some.
5. Entrar como `visualizador` (sem acesso) → o item não aparece; `POST /api/auth/proposal-sso` com o token dele → 403.

## 2. Liberação individual (US2)
1. Em Fornecedores, escolher um fornecedor ativo com e-mail → **Liberar Proposal** → modal com link `…/convite#t=…` e **Copiar**.
2. Abrir o link em janela anônima → "Criar senha" com o e-mail como login → senha de 8+ caracteres → entra na lista de propostas.
3. Abrir **Perfil** no Proposal → nome/telefone/e-mail do fornecedor preenchidos.
4. Abrir o mesmo link de convite de novo → mensagem de convite inválido.
5. Tentar entrar no ERP com o e-mail e a senha → "Usuário sem acesso ao ERP".
6. Fornecedor sem e-mail → ação desabilitada.

## 3. Status, novo convite e revogação (US3)
1. Status na coluna Proposal: `Ativo` para o do passo 2; liberar outro sem concluir → `Convite pendente`.
2. **Novo convite** no pendente → o link antigo deixa de funcionar, o novo funciona.
3. **Revogar Proposal** no ativo (confirmar) → status `Sem acesso`; a sessão aberta no Proposal é recusada na próxima ação.
4. Desativar o fornecedor pendente → convite deixa de funcionar; reativar → `Sem acesso`.
5. Liberar de novo o revogado → resultado "acesso religado", sem convite; login com a senha antiga funciona.

## 4. Liberação em massa (US4)
Selecionar 3+ fornecedores (um sem e-mail, um já ativo) → **Liberar Proposal (N)** → modal com convites dos elegíveis e ignorados com motivo.

## 5. Checagens de segurança
- Token do Proposal obtido pela entrada automática em qualquer rota do ERP (ex.: `GET /api/nfs/`) → 403.
- `POST /api/proposal-acessos/liberar` com token de `visualizador` → 403.
- Nenhum token aparece em query string: conferir no DevTools que as chamadas são `POST` com corpo JSON.
