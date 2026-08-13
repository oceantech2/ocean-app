# Data Model: Contas a Pagar — Confirmar lógica do input manual

**Feature**: `020-contas-pagar-logica` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Admin formulário ] --máscara BRL--> number > 0
        │
        ├─ POST /api/contas  (admin) → pago derivado de data_pagamento
        └─ PUT  /api/contas/{id} (admin)
              ├─ data preenchida → paga
              ├─ data null → pendente
              └─ atalho pago=true sem data → paga com hoje
                              ↓
                    UI Contas a Pagar
[ Pagar na lista ] → PUT pago=true + data=hoje
[ Import CSV/XLSX ] → mesmo modelo (inalterado)
[ Visualizador ] → só GET
```

**Sem migration.** Reusa `contas_pagar`. Sem unique de conteúdo.

## Entidades

### Conta a Pagar (`contas_pagar`)

| Campo | Tipo | Create | Edit | Notas |
|-------|------|--------|------|-------|
| `id` | int | gerado | — | PK; identidade do registro (não há unicidade de conteúdo) |
| `descricao` | string | obrigatório | sim | duplicata permitida |
| `categoria` | string | obrigatório | sim | taxonomia 008 |
| `subcategoria` | string? | se RH | sim | obrigatória se RH |
| `valor` | number | obrigatório | sim | **> 0**; UI máscara BRL; editável se paga |
| `data_vencimento` | date | obrigatório (prática da página) | sim | sem relação obrigatória com data de pagamento |
| `data_pagamento` | date? | opcional | sim (pode null) | qualquer data válida; null ⇒ pendente |
| `pago` | bool | **derivado** | **derivado** | true se data preenchida (ou atalho Pagar) |
| `categoria_pendente` | bool | false no create | legado | operações normais permitidas |
| `comprovante_*` | — | — | fluxo existente | upload = escrita admin |

### Valor (conceitual)

| Aspecto | Regra |
|---------|--------|
| UI formulário | Máscara BRL (ex.: R$ 1.234,56) |
| Persistência | Decimal > 0 |
| Listagem | `toLocaleString` pt-BR (já existente) |

### Status

| Condição | `pago` | `data_pagamento` | Rótulo UI |
|----------|--------|------------------|-----------|
| Sem data | `false` | `null` | Pendente; **Vencida** se vencimento < hoje |
| Com data (qualquer dia) | `true` | data informada | Pago |
| Pagar na lista | `true` | hoje | Pago |
| Edição limpa data | `false` | `null` | Pendente |

Não há seletor Pendente\|Pago. Não há estado “desfeito” além de data vazia.

## Persistência

Sem `ALTER`. Sem unique `(descricao, valor, data_vencimento)`.

## Regras de validação

1. Create/Update: `valor` > 0 senão 422.
2. Create: `data_pagamento` opcional; presente → paga; ausente → pendente. **Sem** checagem vs hoje ou vencimento.
3. Update: `data_pagamento=null` → pendente; data → paga. Valor permitido com conta paga.
4. Duplicata de conteúdo: **não** é erro.
5. Categorias: regras 008 inalteradas.
6. Escrita (create/update/delete/upload comprovante/import): **admin**. Leitura: qualquer autenticado.

## Transições

| Evento | Efeito |
|--------|--------|
| Create sem data | pendente |
| Create com data (incl. futura / antes do vencimento) | paga |
| Create duplicando outra conta | segundo registro criado |
| Pagar (lista) | paga com hoje; sem pedir data |
| Edit valor (paga) | valor novo; permanece paga |
| Edit limpa data | pendente (único desfazer) |
| Ação Desfazer na lista | **não existe** |
