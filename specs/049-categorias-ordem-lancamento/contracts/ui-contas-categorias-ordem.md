# Contrato UI: Categorias/Subcategorias no formulário e ordenação por lançamento

**Feature**: `049-categorias-ordem-lancamento`  
**Páginas**: Contas a Pagar (`/contas`), Contas a Receber (`/nfs`), Fluxo de Caixa (`/fluxo-caixa`)

---

## Contas a Pagar — formulário (modal nova/editar)

### Seletor de categoria

| Papel | Comportamento |
|-------|----------------|
| admin | Pode escolher “nova categoria” (já existe); para itens **cadastrados**, ações **Editar nome** e **Excluir** |
| admin | Itens **oficiais**: sem editar/excluir |
| visualizador | Só leitura do seletor (sem mutações no formulário, conforme página) |

Exclusão: confirmação; se API recusar por vínculos → toast de erro; catálogo recarrega após sucesso.

### Seletor de subcategoria RH

Visível quando categoria = Recursos Humanos.

| Ação | Quem | Escopo |
|------|------|--------|
| Adicionar | admin | Nova subcategoria |
| Editar nome | admin | Qualquer item (sistema ou custom) |
| Excluir | admin | Só `sistema === false` |

Rótulos: **Bônus & Comissão** (codigo `bonus`); **Comissão** permanece.

### Listagem Contas a Pagar

- Cabeçalho ordenável **Ordem de lançamento** (ou reutilizar coluna implícita via `criado_em`) — asc/desc.
- Demais sorts/filtros inalterados; sort aplica-se ao conjunto filtrado.
- Coluna Categoria/export mostra **Bônus & Comissão** quando aplicável.

---

## Contas a Receber

- Incluir ordenação por **ordem de lançamento** (`criado_em`) no padrão de cabeçalhos clicáveis existente.
- Filtros atuais preservados.

---

## Fluxo de Caixa

- Tabela de movimentos: ordenação por **ordem de lançamento** usando `criado_em` propagado de NF / conta a pagar / movimento manual.
- Empate: id estável.
- Demais colunas/sorts existentes preservados.

---

## Feedback

- Sucesso: toast curto (padrão produto).  
- Erro de validação/vínculo: toast com mensagem da API.  
- Loading: botões desabilitados durante save (padrão Contas).

## Fora de escopo UI

- Tela/modal separado “Gerenciar categorias”  
- Filtro que remove linhas por data de inclusão  
- Alterar página Comissões da equipe
