# Quickstart: Filtros padronizados

Pré-requisitos: `docker compose up -d` (backend recarregado), `cd frontend && npm run dev`, login `admin` / `123456`.

## Contas a Pagar

1. A ordem é título → cards → filtros → tabela; a linha principal mostra Período, Status, Tipo, Fornecedor e Descrição.
2. Tipo "Fixo": só contas fixas; os cards somam só elas; aparece "X de Y".
3. Fornecedor "Sem fornecedor" e depois um fornecedor específico: a lista e os cards acompanham.
4. "Mais filtros": aparecem Categoria e Vencimento de/até; escolha Recursos Humanos → aparece Subcategoria RH. Feche o painel: o botão mostra "Mais filtros (n)".
5. Status "Vencida": o período vai para "Todos os períodos" (regra atual).
6. "Limpar filtros": período vai para "Todos os períodos", demais filtros zeram e o botão some.
7. Marque contas, troque o Tipo: a seleção é limpa.

## Contas a Receber

8. A ordem é título → cards → filtros → tabela; legenda e "Exibir N" ficam no topo da tabela.
9. Tipo "Sucesso": só contas de sucesso.
10. Fornecedor com comissão em uma conta: só as contas com comissão/bônus dele aparecem.
11. "Mais filtros" → Mostrar arquivadas; o botão mostra "(1)" com o painel fechado.
12. Status "Sem NF": mês e ano desabilitados (regra atual).
13. "Limpar filtros" vai para "Todos os meses" do ano atual e remove os demais.
14. Como `visualizador`, os filtros funcionam igual.
15. `npm run type-check && npm run build` sem erros.
