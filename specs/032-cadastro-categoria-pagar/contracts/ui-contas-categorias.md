# Contrato UI: Cadastro de categoria em Contas a Pagar

**Feature**: `032-cadastro-categoria-pagar`  
**Página**: `Contas.tsx` (`/contas`)  
**REST**: [rest-contas-categorias.md](./rest-contas-categorias.md)  
**Dashboard**: só consome `label` já devolvido pelo relatório (ajuste mínimo se o donut ainda ignorar `c.label`)

## Catálogo na tela

- Ao abrir a página (e após POST bem-sucedido), carregar `GET /api/contas/categorias`.
- **Filtro** da listagem: `<option>` oficiais (ordem da API) + cadastradas (já ordenadas) + “Todas”. **Sem** “Nova categoria…”.
- **Formulário criar/editar** (admin): mesmo conjunto + sentinela `value` interno `__nova__` com rótulo **Nova categoria…** no **final** da lista (depois das cadastradas).
- Visualizador: formulário somente leitura / sem sentinela; filtro igual.

Não há botão de cadastro na barra da listagem.

## Fluxo “Nova categoria…”

1. Admin no modal/formulário de conta escolhe **Nova categoria…**.
2. Aparece campo Nome (obrigatório) + Confirmar + Cancelar **no próprio formulário**.
3. Cancelar: esconde o extra; restaura a categoria que estava selecionada antes da sentinela.
4. Confirmar: `POST /api/contas/categorias` `{ nome }`.
   - Sucesso: toast; atualiza catálogo; `form.categoria = codigo` retornado; `subcategoria` vazia; esconde o extra.
   - Erro: toast/`mensagemErro`; **mantém** a categoria anterior (não deixa `__nova__` como valor persistido).
5. Validação local espelha a API (trim, 20, charset) para feedback rápido; 422 do servidor prevalece.

## Classificação

- Conta com `categoria` cadastrada: listagem mostra `nome` do catálogo (não o código `cat_1`).
- RH continua mostrando subcategoria só para código oficial `recursos_humanos`.
- Import CSV da página: resolver nomes/códigos cadastrados via catálogo carregado (não só lista hardcoded).

## Papéis

| Ação | admin | visualizador |
|------|-------|--------------|
| Ver oficiais e cadastradas | sim | sim |
| Nova categoria… | sim | não |
| CRUD da conta | como hoje | só leitura |

## Fora desta UI

- Gerenciador de categorias, excluir/renomear, subcategorias novas, item de menu extra.
- Impostos e Retiradas: sem mudança de recorte.
