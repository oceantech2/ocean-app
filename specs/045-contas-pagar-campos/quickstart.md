# Quickstart: Contas a Pagar — Fornecedor, cards e campos Conta/Tipo

**Feature**: `045-contas-pagar-campos`  
Contratos: [rest-contas-pagar-campos.md](./contracts/rest-contas-pagar-campos.md), [ui-contas-pagar-campos.md](./contracts/ui-contas-pagar-campos.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- PostgreSQL na porta **5433**
- Pelo menos uma conta corrente ativa (padrão = Conta Corrente 1)
- Ao menos dois fornecedores ativos em `/fornecedores`
- Login **admin** e, em seguida, **visualizador** (credenciais de desenvolvimento do projeto)

## Subir

```bash
docker compose up -d
cd frontend && npm run dev
```

Reiniciar o backend após deploy para rodar a migração (`tipo_despesa` + backfill `caixa`).

## Validação ponta a ponta

### 1. Cards (US2)

1. Abrir **Contas a Pagar** (`/contas`).
2. Confirmar **quatro** cards na ordem: Total → Pago → A pagar → Vencido.
3. Com mix de contas paga, pendente no prazo e vencida, conferir:
   - Total = Pago + A pagar + Vencido
   - Vencida **não** entra em A pagar
4. Aplicar filtro de categoria ou busca por descrição: cards devem refletir só o visível.

### 2. Fornecedor (US1)

1. **Nova conta a pagar** → campo Fornecedor lista fornecedores ativos.
2. Salvar com fornecedor e outra sem fornecedor; listagem exibe nome ou “—”.
3. Desativar um fornecedor vinculado; na edição aparece “(inativo)”.

### 3. Conta (US3)

1. Nova conta: campo **Conta** visível **antes** de preencher data de pagamento; default = corrente padrão.
2. Trocar para segunda corrente; salvar **pendente**; recarregar → Conta persiste na listagem.
3. Pagar pela listagem: modal inicia com a Conta já gravada.

### 4. Tipo (US4)

1. Nova conta: **Variável** pré-selecionado; criar também uma **Fixo**.
2. Listagem mostra coluna Tipo.
3. Tentar API/UI sem tipo (se possível) → recusa.

### 5. Exportação (US5)

1. Exportar **Excel**: colunas Conta e Tipo batem com a tela.
2. **Exportar PDF** (impressão): mesmas colunas visíveis na tabela impressa.

### 6. Migração

1. Contas antigas sem `caixa`: após subir backend, listagem mostra Conta = padrão; Tipo = Variável.

### 7. Visualizador

- Vê cards e colunas; não edita formulários.

### 8. Qualidade

```bash
cd frontend && npm run lint && npm run type-check
```

## Falhas esperadas

| Ação | Resultado |
|------|-----------|
| Gravar sem `tipo_despesa` válido | 422 / toast |
| `caixa` = investimento | 400 |
| Sem corrente ativa no sistema | 400 ao salvar |
| Fornecedor inativo em conta nova | Não listado |

## Fora do teste desta feature

- Cards Despesas Fixas/Variáveis do Dashboard (permanecem por categoria)
- Novas colunas na importação XLSX
