# Research: Visão Líquido/Bruto e novos cards em Contas a Receber

## R1 — Fonte dos valores dos cards

- **Decision**: Usar o resumo existente (`GET /api/nfs/resumo/total`), que já devolve bruto e líquido por status.
- **Rationale**: Mantém a regra atual de período (data de fechamento) e de status; zero mudança no servidor; Receita Total = soma dos três status (canceladas já ficam de fora, pois o resumo só consulta PAGA/PENDENTE/VENCIDA).
- **Alternatives considered**: Calcular no cliente a partir da lista — rejeitado: a lista exclui arquivadas por padrão e mudaria os totais atuais.

## R2 — Onde guardar a visão

- **Decision**: `nfsVisao` em `usePageFilters` (Zustand), padrão `'liquido'`.
- **Rationale**: FR-007 exige manter a visão ao navegar; é o mesmo mecanismo dos demais filtros de `NFs.tsx`. Não persiste entre logins (store em memória).
- **Alternatives considered**: `localStorage` — rejeitado (não pedido; Dashboard também não persiste).

## R3 — Colunas da tabela por visão

- **Decision**: Derivar `COLUNAS` da visão: remover "Bruto" na visão Líquido e "Líquido" na visão Bruto; "Imposto" fica. Largura mínima da tabela reduzida em 6,5rem.
- **Rationale**: Clarify (cards e tabela). A grade usa `table-fixed` com `colgroup` compartilhado entre cabeçalho e corpo, então ambas as tabelas devem usar a mesma lista derivada.
- **Ordenação**: se `sortField` for a coluna oculta, trocar para a coluna visível equivalente.

## R4 — Botão

- **Decision**: Reproduzir o segmentado do Dashboard (`Líquido` | `Bruto`, ativo em azul) no cabeçalho, antes dos botões de exportação.
