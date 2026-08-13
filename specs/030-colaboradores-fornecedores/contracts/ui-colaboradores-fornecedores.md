# Contrato de UI: Colaboradores, Fornecedores e vínculo em contas

**Feature**: `030-colaboradores-fornecedores`

## Menu

Um item **Colaboradores** (rótulo e rota atuais). Sem item Fornecedores.

## Tela `Colaboradores.tsx`

Duas visões na mesma página (abas ou equivalente já usado no produto), rótulos **Colaboradores** e **Fornecedores**.

| Visão | Lista | Novo / editar | Extra |
|-------|--------|----------------|-------|
| Colaboradores | `tipo=colaborador` | Campos de equipe atuais + Documento + Telefone + Email | Import/export, histórico, documentos, desligar — como hoje |
| Fornecedores | `tipo=fornecedor` | Nome, Documento, Telefone, Email, observação. Sem cargo, salário, datas de RH, benefício, histórico, documentos de colaborador | Desativar com `confirm`. Filtro inativos como a outra visão |

### Campo Documento

- Controle **CPF** | **CNPJ**.
- CPF: máscara `000.000.000-00`; sem Razão Social.
- CNPJ: máscara `00.000.000/0000-00` + Razão Social obrigatória.
- Trocar a opção limpa o número do tipo anterior na UI antes de salvar.

### Telefone e e-mail

Nos dois formulários. Opcionais. E-mail inválido: toast e não grava. Na listagem: colunas ou texto na linha (telefone e e-mail visíveis sem abrir outro módulo).

### Papéis

Visualizador: vê visões, listas e contatos; sem novo/editar/desativar/importar.

### Total da folha

Soma de salário **somente** da visão Colaboradores (ativos). Fornecedor não entra.

## Contas a Pagar (`Contas.tsx`)

- No criar/editar: select **Fornecedor** com opção vazia (“Sem fornecedor”) + fornecedores ativos (`GET ...?tipo=fornecedor&ativo=true`).
- Listagem: coluna ou texto com `fornecedor_nome` (vazio se null).
- Visualizador não altera o select.

## Calendário (`Calendario.tsx`)

Evento de conta: se `fornecedor_nome`, título inclui o fornecedor (ex.: `{fornecedor_nome} — {descricao}`); senão permanece só a descrição.

## Fora desta UI

Férias, DH, bônus, patrimônio, NFs, retiradas: sem select de fornecedor. `colaboradoresService.listar` nessas páginas **não** envia `tipo=fornecedor` (default da API = colaborador).
