# Quickstart: Mostrar/ocultar senha

`cd frontend && npm run dev` (porta 5193). ERP em `http://localhost:5193`, Proposal em `http://proposal.localhost:5193`.

1. **Login ERP**: digitar uma senha → clicar no olho → texto visível, ícone riscado → clicar de novo → oculto. Enter no campo ainda faz login.
2. **Login Proposal**: mesmo roteiro.
3. **Convite** (`/convite/<token>` com convite válido): olho de "Senha" não altera "Confirmar senha" e vice-versa; autofoco continua na senha.
4. **Configurações → Novo/Editar usuário**: olho no campo de senha; fechar e reabrir o modal → senha oculta.
5. **Teclado**: Tab até o olho, Espaço/Enter alterna sem enviar o formulário.
6. **Senha longa**: o final do texto não fica sob o ícone.
