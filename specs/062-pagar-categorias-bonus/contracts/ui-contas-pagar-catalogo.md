# Contrato UI: Contas a Pagar — Bônus e catálogo no formulário

**Feature**: `062-pagar-categorias-bonus`  
**Página**: Contas a Pagar (`/contas`) apenas

---

## Rótulo Bônus

Em formulário (nova/edição), listagem, filtro de subcategoria RH e exportação da página:

| Situação | Texto visível |
|----------|----------------|
| RH + código `bonus` | **Bônus** (ex.: “Recursos Humanos / Bônus”) |
| RH + código `comissao` | **Comissão** |
| Pendência legado `bonus` | **Comissões (legado)** (inalterado) |

Não exibir **Comissões** nem **Bônus & Comissão** como opção vigente dessa subcategoria.

---

## Seletor de categoria (formulário)

| Papel | Comportamento |
|-------|----------------|
| admin | “Nova categoria…” (já existe); para itens **cadastrados**, **Editar nome** e **Excluir** |
| admin | Oficiais: sem editar/excluir |
| visualizador | Sem mutações |

Exclusão: `window.confirm`; toast de erro se a API recusar por vínculos.

Após exclusão **bem-sucedida** da categoria selecionada: seletor vai para **Adm/Financeiro**; subcategoria limpa; modal **permanece aberto**.

---

## Seletor de subcategoria RH

Visível quando categoria = Recursos Humanos.

| Ação | Quem | Escopo |
|------|------|--------|
| Adicionar | admin | Nova subcategoria; fica selecionada |
| Editar nome | admin | Qualquer item (sistema ou custom) |
| Excluir | admin | Só `sistema === false` |

Após exclusão **bem-sucedida** da sub selecionada: campo **vazio**; Recursos Humanos permanece; salvar sem sub continua bloqueado.

---

## Importação CSV da página

Coluna `subcategoria` aceita os nomes/códigos do [contrato REST](./rest-categorias-bonus.md). Linha válida com Bônus / Comissões / Bônus & Comissão grava a mesma classificação; a listagem mostra **Bônus**.

---

## Feedback

- Sucesso: toast curto (padrão da página).
- Erro de validação/vínculo: toast com mensagem da API.
- Loading: botões desabilitados durante save.

## Fora de escopo UI

- Tela “Gerenciar categorias”
- Dashboard, Impostos, Retiradas, página Comissões
- Ordenação por lançamento (já entregue em 049)
