# Contrato UI: Movimentos do Fluxo de Caixa

**Feature**: `024-fluxo-caixa-importar` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md) · **API**: [rest-leitura-fluxo.md](./rest-leitura-fluxo.md)

## Superfície

| Item | Valor |
|------|-------|
| Página | `frontend/src/pages/FluxoCaixa.tsx` |
| Rota | `/fluxo-caixa` (inalterada) |
| Papéis | visualizador: consulta; admin: manuais, saldos, CSV de saldos |

## Carga

Ao montar a página e ao mudar **Mês** ou **Ano**: recarregar origens + manuais + saldos. Sem botão “Importar” para Contas a Receber/Pagar.

O botão **↑ Importar CSV** (admin) permanece: modal **Saldos via CSV**, não CR/CP.

## Tabela Movimentos do Caixa

Colunas, nesta ordem:

| Coluna | Conteúdo |
|--------|----------|
| Data | Data de pagamento (automático) ou data do movimento (manual) |
| Tipo | **Entrada** / **Saída** (badges atuais) |
| Origem | **Contas a Receber** / **Contas a Pagar** / **Manual** |
| Descrição | Texto da origem; manuais sem obrigação de `✦` |
| Valor | Moeda pt-BR; entrada em verde; saída em vermelho |
| Ações | Só **Remover** em origem Manual + admin (confirm atual) |

Sem controle de ocultar/excluir linha automática.

Legenda “✦ = lançamento manual”: **remover** (a coluna Origem substitui).

## Totais

Entradas / saídas / resultado do período = soma dos movimentos **visíveis** (automáticos do recorte + manuais). Mesmo título não entra duas vezes.

## Vazio e erro

| Situação | UX |
|----------|-----|
| Nenhum automático e nenhum manual | Não inventar linhas; tabela de movimentos pode permanecer oculta (como hoje) |
| Só manuais | Tabela só com Origem Manual |
| Falha ao buscar NFs ou contas | toast de erro; sem totais automáticos inventados |
| Visualizador | Sem Remover, sem incluir receita/despesa, sem registrar saldo, sem Importar CSV de saldos; vê a mesma lista automática |

## Exportar CSV

Colunas: **Data**, **Tipo**, **Origem**, **Descrição**, **Valor** — mesmos rótulos de origem da tela. Ordenar por Data. Desabilitado se a lista visível estiver vazia.

Exportar PDF / imprimir: inalterado nesta feature.

## Fora deste contrato

- Coluna Caixa (corrente/investimento) na lista de movimentos
- Filtro extra além de mês/ano
- Redesign dos cards de saldo ou do gráfico
- Recadastrar CR/CP a partir desta tela
