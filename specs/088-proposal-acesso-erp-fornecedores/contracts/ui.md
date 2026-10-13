# Contrato: Interface

## ERP — menu lateral (`Layout`)
- Item **Proposal** (ícone de documento com seta "abrir externo") no fim da lista de páginas, separado por uma linha, visível só com `acessoProposal = true`.
- Menu recolhido: só o ícone, com `title`/`aria-label` "Proposal".
- Clique: abre nova aba; em caso de erro, fecha a aba e mostra toast com a mensagem do servidor.

## ERP — Fornecedores (somente `admin`)
- **Coluna "Proposal"** com selo de status: `Sem acesso` (cinza), `Convite pendente` (âmbar), `Convite expirado` (vermelho), `Ativo` (verde).
- **Ações por linha** (fornecedor ativo):
  - `Sem acesso` → **Liberar Proposal** (desabilitado com dica "Cadastre um e-mail válido" quando não houver e-mail válido)
  - `Convite pendente` / `Convite expirado` → **Novo convite** e **Revogar Proposal**
  - `Ativo` → **Novo convite** (redefinir senha) e **Revogar Proposal**
- **Seleção**: caixa de seleção por linha (fornecedores ativos) + "selecionar todos da página"; com seleção, botão **Liberar Proposal (N)** no cabeçalho.
- **Modal "Acesso ao Proposal"** após liberar/gerar convite: por fornecedor, nome, login, resultado e — quando houver convite — o link com botão **Copiar** e a validade; ignorados listados com o motivo; texto de orientação "Envie o link ao fornecedor; ele criará a própria senha. O link vale até DD/MM às HH:MM e funciona uma vez."
- Revogar usa `window.confirm`.

## Proposal — `/entrar#c=<código>` (pública)
- Spinner "Entrando…"; sucesso → `/`; falha → `/login` com toast "Não foi possível entrar automaticamente. Entre com seu usuário e senha." (ou a mensagem de falta de acesso).

## Proposal — `/convite#t=<token>` (pública)
- Identidade do Proposal (mesmo visual do login), título "Criar senha", login exibido (somente leitura), campos **Senha** e **Confirmar senha**, dica "mínimo de 8 caracteres", botão **Criar senha e entrar**.
- Convite inválido: mensagem "Este convite não é mais válido. Peça um novo ao administrador." e link para a tela de login.
