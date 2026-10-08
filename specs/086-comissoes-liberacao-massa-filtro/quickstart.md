# Quickstart: Validar liberação em massa e filtro por status

Pré-requisitos: `docker compose up -d`; `cd frontend && npm run dev` (porta 5193); login `admin` / `123456`; ter ao menos 3 comissões não liberadas de fornecedores diferentes (ex.: lançar contas a receber com comissão em Contas a Receber).

## Cenário 1 — Filtro de status (US2)

1. Abrir **Bônus e Comissão** → aba Comissão
2. Status = **Não liberados**: só itens com coluna "Liberado" = "—"; total do título = soma desses itens
3. Status = **Liberados**: só itens com valor na coluna "Liberado"
4. Trocar para a aba Bônus e de volta: o status continua aplicado
5. Exportar CSV com "Não liberados": todas as linhas com `Liberado = Não`
6. O gráfico anual não muda entre os status

## Cenário 2 — Liberação em massa (US1 + US3)

1. Status = **Não liberados** → marcar **Selecionar todos exibidos**
2. Rolar até o fim da lista: a barra continua visível no rodapé, com "N selecionada(s)" e "Liberar em massa (N)"
3. Clicar em **Liberar em massa**: abre o modal do sistema com quantidade e valor total
4. **Cancelar**: nada muda e a seleção permanece
5. Abrir de novo → **Confirmar**: toast "N liberado(s)"; os itens somem do filtro "Não liberados"; a seleção é limpa
6. Em **Auditoria**: N registros `liberar` / `Bonus`

## Cenário 3 — Seleção mista e elegibilidade

1. Status = Todos; marcar 1 item liberado e 1 não liberado
2. A barra mostra "Liberar em massa (1)" e "Pagar em massa (1)"
3. Marcar só itens liberados: "Liberar em massa (0)" desabilitado

## Cenário 4 — Diálogos nativos bloqueados (SC-001)

1. No console do navegador: `window.confirm = () => false`
2. Repetir o cenário 2: o modal do sistema abre e a liberação conclui normalmente

## Cenário 5 — Visualizador

1. Login `visualizador` / `123456`: filtro Status disponível; sem checkboxes, sem "Selecionar todos exibidos" e sem barra
