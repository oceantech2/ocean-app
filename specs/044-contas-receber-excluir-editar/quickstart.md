# Quickstart: Contas a Receber — excluir, Tipo e Maggo editável

**Feature**: `044-contas-receber-excluir-editar`  
Contratos: [rest-contas-receber-edicao.md](./contracts/rest-contas-receber-edicao.md), [ui-contas-receber-edicao.md](./contracts/ui-contas-receber-edicao.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API `http://localhost:8001`, frontend `http://localhost:5193`
- PostgreSQL **5433**
- Login `admin` / `123456` e `visualizador` / `123456` (dev)

## Subir ambiente

```bash
docker compose up -d
cd frontend && npm run dev
```

Aguardar migração `excluida_em` no boot (`docker logs ocean_backend`).

## Validação ponta a ponta

### 1. Tipo e rótulo

1. Abrir Contas a Receber — cabeçalho **Tipo** (não “Método de pagamento”).
2. Ver contas `parcelamento` como **Parcela**.
3. Nova conta / edição: opções Retainer, Sucesso, Parcela.
4. DH: card e select **Parcela**; assunto de DH novo usa Parcela.

### 2. Excluir linha (admin)

1. Excluir uma conta **manual** pendente — confirm → some da lista; recarregar: continua ausente.
2. Excluir uma conta **Maggo** — some; recarregar (sync Maggo): **não** volta.
3. Excluir uma conta **Recebida** — some em Contas a Receber; Fluxo de Caixa **não** perde o lançamento já feito.
4. Visualizador: sem botão Excluir; DELETE HTTP 403.

### 3. Campos Maggo editáveis

1. Editar conta origem Maggo — projeto, tipo, empresa, valores e data de fechamento habilitados.
2. Alterar valor bruto, salvar, recarregar — valor novo permanece; origem continua Maggo.
3. Recarregar a listagem (sync Maggo) — campos Maggo **não** voltam ao valor da fonte.

### 4. Fora de escopo (não regressar)

- Sem “Deletar Todas”.
- Arquivar/desarquivar continua funcionando.
- Número de NF de conta excluída não fica livre para duplicar.
