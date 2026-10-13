# Quickstart: Visão Líquido/Bruto e novos cards em Contas a Receber

Pré-requisitos: `docker compose up -d`, `cd frontend && npm run dev` (porta 5193), login `admin` / `123456`.

1. **Cards**: abra Contas a Receber num mês com contas recebidas, pendentes e vencidas. Confira 4 cards (Receita Total, Recebido, Pendente, Vencido) e que Receita Total = soma dos outros três, com as quantidades.
2. **Padrão**: o botão mostra **Líquido** ativo; a tabela mostra a coluna Líquido e não a Bruto.
3. **Troca**: clique em **Bruto**; os cards mudam para valores brutos com o rótulo "· bruto" e a tabela troca a coluna para Bruto. Imposto continua visível.
4. **Persistência**: troque o mês, vá ao Dashboard e volte; a visão Bruto continua ativa.
5. **Ordenação**: ordene por Líquido, troque para Bruto; a lista fica ordenada por Bruto.
6. **Exportação**: com a visão Bruto, exporte CSV; o arquivo traz Bruto, Imposto e Líquido.
7. **Visualizador**: entre como `visualizador` e confirme que o botão e os cards aparecem.
8. `cd frontend && npm run type-check && npm run build` sem erros.
