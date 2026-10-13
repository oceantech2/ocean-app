# Contrato de UI: Contas a Receber — visão e cards

## Cabeçalho

- Segmentado **Líquido | Bruto** (ativo: `bg-blue-600 text-white`), à esquerda dos botões de exportação; visível para todos os papéis.

## Cards (grid 2 colunas no mobile, 4 no desktop)

| Ordem | Rótulo | Cor | Valor | Rodapé |
|---|---|---|---|---|
| 1 | Receita Total · {líquido\|bruto} | azul | recebido + pendente + vencido | N registro(s) |
| 2 | Recebido · {visão} | verde | pagas | N registro(s) |
| 3 | Pendente · {visão} | amarelo | pendentes | N registro(s) |
| 4 | Vencido · {visão} | vermelho | vencidas | N registro(s) |

## Tabela

- Visão Líquido: colunas `… Tipo | Imposto | Líquido | …`
- Visão Bruto: colunas `… Tipo | Bruto | Imposto | …`
- Exportações e modal inalterados.
