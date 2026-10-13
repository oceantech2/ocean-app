# Quickstart: Recorrência de contas a pagar

Pré-requisitos: `docker compose up -d` (backend recarregado), `cd frontend && npm run dev`, login `admin` / `123456`.

1. **Opção visível**: Contas a Pagar → Nova conta a pagar; a opção "Repetir nos próximos meses" aparece desmarcada. Em Editar, ela não aparece.
2. **Resumo**: marque a opção, vencimento 10/11/2026, 3 meses; o resumo diz "Serão criadas mais 3 contas, com vencimentos de 12/2026 a 02/2027".
3. **Criação**: salve "Aluguel" R$ 5.000; toast "Conta criada + 3 recorrência(s)"; marque "Todos" no período e confira 4 contas (10/11, 10/12, 10/01, 10/02), todas pendentes.
4. **Fim de mês**: vencimento 31/01/2027, 2 meses → 28/02/2027 e 31/03/2027.
5. **Original paga**: informe data de pagamento na original; só ela fica paga.
6. **Validação**: 0, 25 ou vazio com a opção marcada → mensagem de erro, nada criado.
7. **Independência**: edite o valor de uma cópia e exclua outra; as demais não mudam.
8. **+1**: salve com "+1"; a opção volta desmarcada.
9. **Auditoria**: a tela Auditoria mostra um registro por conta criada.
