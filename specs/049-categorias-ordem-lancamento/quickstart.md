# Quickstart: 049-categorias-ordem-lancamento

Validação ponta a ponta da feature após implementação.

## Pré-requisitos

- Docker: PostgreSQL **5433**, API **8001** (`docker compose up -d`)
- Frontend: `cd frontend && npm run dev` → **5193**
- Login: `admin` / `123456` e, em segundo momento, `visualizador` / `123456`
- Contratos: [rest-categorias-subcategorias.md](./contracts/rest-categorias-subcategorias.md), [ui-contas-categorias-ordem.md](./contracts/ui-contas-categorias-ordem.md)
- Modelo: [data-model.md](./data-model.md)

## 1. Rótulo Bônus & Comissão

1. Admin → Contas a Pagar → Nova conta → categoria **Recursos Humanos**.
2. Confirmar subcategoria **Bônus & Comissão** (não “Comissões”).
3. Confirmar **Comissão** ainda na lista.
4. Conta antiga com `bonus`: listagem mostra **Recursos Humanos / Bônus & Comissão**.

## 2. Categorias cadastradas (editar / excluir)

1. No formulário, criar categoria “Teste Cat”.
2. Editar nome para “Teste Cat 2” → aparece no seletor/listagem.
3. Criar conta usando “Teste Cat 2”; tentar excluir → bloqueado com mensagem.
4. Remover/reclassificar a conta; excluir categoria → some do catálogo.
5. Tentar editar/excluir “Marketing” (oficial) → indisponível ou rejeitado.
6. Visualizador: sem ações de mutação.

## 3. Subcategorias RH

1. Com RH selecionado, adicionar “Teste Sub RH”.
2. Editar nome de **Salário** (sistema) → novo rótulo nas contas/filtros.
3. Tentar excluir **Salário** → bloqueado.
4. Excluir “Teste Sub RH” sem vínculos → some; com vínculos → bloqueado.

## 4. Ordem de lançamento

1. **Contas a Pagar**: ordenar por ordem de lançamento asc/desc; sequência = inclusão; filtros de mês/categoria ainda aplicam.
2. **Contas a Receber**: idem.
3. **Fluxo de Caixa**: ordenar movimentos por lançamento; conferir entradas de NF, pagar e manuais.
4. Visualizador: mesma ordenação de leitura.

## 5. Checagens rápidas de API (opcional)

```bash
# Catálogo (token admin)
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/contas/categorias | head
```

Esperado: em `subcategorias_rh`, item `bonus` com nome `Bônus & Comissão` e `"sistema": true`.

## Critério de aceite rápido

| # | Critério | OK? |
|---|----------|-----|
| 1 | Comissões → Bônus & Comissão; Comissão intacta | |
| 2 | CRUD categorias só cadastradas; oficiais imutáveis | |
| 3 | RH: add; edit qualquer; delete só custom | |
| 4 | Sort por lançamento nas 3 páginas | |
| 5 | Visualizador só lê | |
