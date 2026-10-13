# Contrato de UI: Barra de filtros (Contas a Pagar e Receber)

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Período [Mês ▾][Ano ▾]  Status [▾]  Tipo [▾]  Fornecedor [▾]  Busca [____]           │
│ [⚙ Mais filtros (n)]  [✕ Limpar filtros]                                  X de Y     │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ (painel "Mais filtros", quando aberto)                                               │
│ Pagar: Categoria [▾]  Subcategoria RH [▾]  Vencimento de [data]  até [data]          │
│ Receber: [ ] Mostrar arquivadas                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

- Barra sticky (`PAGE_FILTERS_STICKY_CLASS`), abaixo dos cards
- Rótulos `text-xs` acima de cada controle; controles `text-sm`, altura uniforme
- "Mais filtros" em botão secundário; contagem entre parênteses quando há secundários ativos
- "Limpar filtros" só aparece com algum filtro fora do padrão
- Contas a Receber: faixa no topo da tabela com legenda (Recebida, Pendente, Vencida) à esquerda e "Exibir [15 ▾] por página" à direita
