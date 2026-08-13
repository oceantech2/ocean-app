# Contrato API: Contas a Receber — Subtítulo, Recebido e Caixa oculta

**Feature**: `019-contas-receber-formulario` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **UI**: [ui-contas-receber-formulario.md](./ui-contas-receber-formulario.md)

Endpoints existentes. Sem rota nova. Campos JSON **não** são renomeados (`posicao`, `razao_social` permanecem no contrato HTTP).

## POST `/api/nfs`

Create manual. Se `data_pagamento` vier preenchido, o servidor **grava `caixa: "corrente"`** (ignora `investimento` ou ausência). Não retorna 422 por falta de Caixa.

```json
{
  "razao_social": "Cliente Manual 019",
  "posicao": "Analista de RH",
  "valor_bruto": 1000,
  "valor_liquido": 900,
  "tipo": "sucesso",
  "data_pagamento": "2026-08-12"
}
```

Resposta 201: `caixa` = `"corrente"`, `status` = `paga`, `origem` = `manual`.

Create **sem** `data_pagamento`: `caixa` permanece `null` (pendente). `razao_social` continua obrigatório.

## PUT `/api/nfs/{id}`

### Recebimento (transição)

Body mínimo quando a conta **ainda não** tem `data_pagamento`:

```json
{
  "data_pagamento": "2026-08-12",
  "caixa": "corrente"
}
```

Servidor: se `data_pagamento` anterior era `NULL` e o novo valor está preenchido → `caixa = "corrente"` mesmo que o cliente omita `caixa` ou envie `investimento`.

### Edição sem transicionar

Não enviar `caixa` nem `colaborador_lead_id` / `colaborador_conducao_id` / `colaborador_placement_id`.

```json
{
  "numero": "019-NF-1",
  "data_emissao": "2026-08-10",
  "data_vencimento": "2026-08-31"
}
```

`caixa` e colaboradores **permanecem** os gravados. Maggo: grupo Maggo (`posicao`, `razao_social`, …) continua 422 se enviado.

### Manual — título/subtítulo

PUT manual pode incluir `posicao` (título) e `razao_social` (subtítulo). `razao_social` vazio → 422 (obrigatório).

## GET `/api/nfs` e GET `/api/nfs/{id}`

Inalterados na forma. `caixa` e `colaborador_*` **continuam no JSON** (a UI é que não apresenta). Clientes internos (Relatórios, Fluxo de Caixa) não quebram.

## GET `/api/nfs/exportar-xlsx`

A coluna **Caixa** deixa de ser acrescentada na planilha gerada para esta página. Demais colunas do template (incl. lead/condução/placement) permanecem.

## Erros

| Caso | Status |
|------|--------|
| Create/PUT recebimento sem data (cliente tenta Recebido vazio) | 422 — data obrigatória (validação UI; API já trata pagamento nulo como pendente) |
| PUT Maggo com `posicao`/`razao_social` | 422 campos Maggo RO (018) |
| Visualizador POST/PUT | 403 |
