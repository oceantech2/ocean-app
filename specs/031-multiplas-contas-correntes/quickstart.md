# Quickstart: Múltiplas contas correntes

**Feature**: `031-multiplas-contas-correntes`  
Contratos: [rest-contas-correntes.md](./contracts/rest-contas-correntes.md), [ui-multiplas-contas-correntes.md](./contracts/ui-multiplas-contas-correntes.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- PostgreSQL na porta **5433** (não alterar)
- Login administrador (credencial de desenvolvimento do projeto)

## Subir

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação ponta a ponta

1. Abrir **Fluxo de Caixa**. Confirmar seletor com a conta seed (nome “Conta corrente”) e **Conta investimento**. Fluxo inicial = padrão.
2. Admin: **Gerenciar contas** — editar banco da seed (deixar de “A definir”). Criar segunda corrente com nome e banco; agência opcional. As duas aparecem no seletor.
3. Tentar criar sem banco ou com o mesmo nome da primeira: recusa, nada grava.
4. Marcar uma NF como recebida (sem escolher caixa). No fluxo da **padrão**, a entrada aparece; na segunda corrente, não.
5. Editar a NF recebida: mudar Caixa para a segunda corrente. A linha some da padrão e aparece só na segunda; sem duplicar.
6. Pagar uma Conta a Pagar: saída só na padrão, não na segunda nem no investimento.
7. Transferir da padrão para a segunda (ou investimento): dois lados, mesmo valor; origem = destino recusado.
8. Dashboard: um card corrente = soma dos saldos visíveis das correntes ativas; um card investimento.
9. Login visualizador: consulta seletor, gerenciar (sem gravar), NFs sem editar caixa, sem transferência.
10. `npm run lint` e `npm run type-check` no `frontend` passam.

## Falhas esperadas

| Ação | Resultado |
|------|-----------|
| Desativar a padrão ou a última corrente | Mensagem; permanece ativa |
| Reclassificar NF não recebida | Sem efeito / recusa |
| Reclassificar para corrente inativa | Recusa |
| Transferência acima do saldo visível da origem | Recusa (regra já vigente) |
