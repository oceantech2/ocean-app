# Quickstart: 062-pagar-categorias-bonus

Validação ponta a ponta após implementação. Portas: API **8001**, frontend **5193**, PostgreSQL **5433**.

## Pré-requisitos

- `docker compose up -d`
- `cd frontend && npm run dev`
- Login: `admin` / `123456` e, em segundo momento, `visualizador` / `123456`
- Contratos: [rest-categorias-bonus.md](./contracts/rest-categorias-bonus.md), [ui-contas-pagar-catalogo.md](./contracts/ui-contas-pagar-catalogo.md)
- Modelo: [data-model.md](./data-model.md)

## 1. Rótulo Bônus na página Contas a Pagar

1. Admin → Contas a Pagar → Nova conta → **Recursos Humanos**.
2. Confirmar subcategoria **Bônus** (não “Comissões” nem “Bônus & Comissão”).
3. Confirmar **Comissão** (singular) ainda na lista, distinta.
4. Salvar uma conta em RH / Bônus; listagem, filtro de subcategoria RH e exportação mostram **Bônus**.
5. Dashboard: **não** é necessário que o rótulo mude nesta entrega.

## 2. Categorias cadastradas (editar / excluir)

1. No formulário, criar categoria “Teste Cat”.
2. Editar nome para “Teste Cat 2” → aparece no seletor e na listagem.
3. Criar conta usando “Teste Cat 2”; tentar excluir a categoria → bloqueado com mensagem.
4. Reclassificar/excluir a conta; excluir a categoria → some do catálogo; o seletor do formulário aberto vai para **Adm/Financeiro**.
5. Tentar editar/excluir “Marketing” (oficial) → indisponível ou rejeitado.
6. Visualizador: sem ações de mutação.

## 3. Subcategorias RH

1. Com RH selecionado, adicionar “Teste Sub RH” → fica selecionada.
2. Editar nome de **Salário** (sistema) → novo rótulo nas contas/filtros da página.
3. Tentar excluir **Salário** ou **Bônus** (sistema) → bloqueado.
4. Excluir “Teste Sub RH” sem vínculos → some; campo de subcategoria fica vazio.
5. Com vínculos → exclusão bloqueada.

## 4. Importação

1. Importar CSV/XLSX com RH e subcategoria `Bônus`, outra linha `Comissões`, outra `Bônus & Comissão`.
2. As três entram na mesma classificação; a página mostra **Bônus**.
3. Linha com `Comissão` (singular) entra na subcategoria **Comissão**, não em Bônus.

## 5. Checagem rápida de API (opcional)

```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/contas/categorias
```

Esperado: em `subcategorias_rh`, item `bonus` com `"nome": "Bônus"` e `"sistema": true` (se o admin não tiver renomeado).

## Critério de aceite rápido

| # | Critério | OK? |
|---|----------|-----|
| 1 | Página Contas a Pagar mostra Bônus (não Comissões / Bônus & Comissão); Comissão intacta | |
| 2 | CRUD categorias só cadastradas; oficiais imutáveis; reset para Adm/Financeiro | |
| 3 | RH: add; edit qualquer; delete só custom; sub fica vazia após excluir | |
| 4 | Import Bônus / Comissões / Bônus & Comissão → mesma classificação | |
| 5 | Visualizador só lê; Dashboard/Comissões intocados | |
