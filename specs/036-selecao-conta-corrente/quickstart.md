# Quickstart: Seleção de conta corrente

**Feature**: `036-selecao-conta-corrente`  
Contratos: [rest-selecao-conta-corrente.md](./contracts/rest-selecao-conta-corrente.md), [ui-selecao-conta-corrente.md](./contracts/ui-selecao-conta-corrente.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- PostgreSQL na porta **5433** (não alterar)
- Pelo menos **duas** contas correntes ativas (031 — Gerenciar contas no Fluxo de Caixa)
- Login administrador (credencial de desenvolvimento do projeto)

## Subir

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação ponta a ponta

1. **Contas a Receber (`/nfs`)**: coluna Conta corrente visível. Abrir Recebido / formulário recebido: select só com nomes das correntes, **sem** investimento; valor inicial = padrão.
2. Marcar uma NF/conta a receber como recebida na **segunda** corrente. No Fluxo de Caixa, a entrada aparece só nessa conta, não na padrão.
3. Exportar a listagem: coluna Conta corrente com o mesmo nome da tela. Item pendente mostra “—”.
4. **Contas a Pagar**: coluna e campo no pagar. Pagar um item na segunda corrente; saída só nesse fluxo.
5. Tentar gravar recebido/pago com investimento (se a UI não oferecer, conferir que a API recusa).
6. **Transferência**: dois selects, **sem** Inverter. Com fluxo de uma corrente ativo, origem = essa conta e destino = Conta investimento. Com investimento ativo, destino = corrente padrão. Transferir corrente A → B: dois lados, mesmo valor. Origem = destino recusado.
7. Visualizador: vê colunas; não altera conta; não vê Transferência.
8. `npm run lint` e `npm run type-check` no `frontend` passam.

## Falhas esperadas

| Ação | Resultado |
|------|-----------|
| Receber/pagar sem conta válida | Mensagem; nada grava |
| `caixa=investimento` em NF ou Conta a Pagar | 400 |
| Transferência origem = destino | Recusa |
| Transferência acima do saldo visível da origem | Recusa (já vigente) |
| Conta corrente inativa no select de nova escolha | Não listada |
