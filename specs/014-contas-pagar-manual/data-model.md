# Data Model: Contas a Pagar — Input Manual de Valores

**Feature**: `014-contas-pagar-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Admin formulário ] --máscara BRL--> parse number
        │
        ├─ POST /api/contas  → ContaPagar (pago derivado de data_pagamento)
        └─ PUT  /api/contas/{id} → atualiza valor/campos; null data → pendente
                              ↓
                    UI Contas a Pagar (lista fmt BRL)
[ Import CSV/XLSX ] --------------→ mesmo modelo (inalterado nesta feature)
```

## Entidades

### Conta a Pagar (`contas_pagar`)

| Campo | Tipo | Create | Edit | Notas |
|-------|------|--------|------|-------|
| `id` | int | gerado | — | PK |
| `descricao` | string | obrigatório | sim | |
| `categoria` | string | obrigatório | sim | taxonomia 008 |
| `subcategoria` | string? | se RH | sim | obrigatória se RH |
| `valor` | number | obrigatório | sim | **> 0**; UI com máscara BRL |
| `data_vencimento` | date | obrigatório (prática atual) | sim | |
| `data_pagamento` | date? | opcional | sim (pode null) | null ⇒ pendente |
| `pago` | bool | **derivado** | **derivado** | true se data_pagamento preenchida |
| `categoria_pendente` | bool | false no create | pode existir em legados | fora do foco 014 |
| `comprovante_*` | — | — | via fluxo existente | fora de escopo de mudança |

### Valor (conceitual)

| Aspecto | Regra |
|---------|--------|
| UI formulário | Máscara monetária brasileira (ex.: R$ 1.234,56) |
| Persistência | Número decimal > 0 (centavos) |
| Listagem | Formato BRL via `toLocaleString` (já existente) |

### Status pago/pendente

| Condição | `pago` | `data_pagamento` |
|----------|--------|------------------|
| Criação/edição **sem** data | `false` | `null` |
| Criação/edição **com** data | `true` | data informada |
| Edição: limpar data | `false` | `null` |
| Atalho “Pagar” na lista | `true` | data do dia (comportamento atual) |

Não há seletor Pendente|Pago no formulário.

## Persistência

Sem `ALTER` novo. Modelo SQLAlchemy `ContaPagar` permanece; mudanças são de **contrato** (schemas) e **regras** na rota.

## Regras de validação

1. **Create/Update**: `valor` MUST ser numérico e **> 0**; caso contrário 422.
2. **Create**: `data_pagamento` opcional; se presente → `pago=True`; se ausente → `pago=False`.
3. **Update**: se payload inclui `data_pagamento=null` → `pago=False`; se inclui data → `pago=True`.
4. **Categorias**: validação 008 inalterada (RH exige subcategoria).
5. **Visualizador**: sem POST/PUT/DELETE.
6. Valor editável com conta paga (sem exigir limpar pagamento).

## Transições

| Evento | Efeito |
|--------|--------|
| Create sem data_pagamento | pendente |
| Create com data_pagamento | paga |
| Edit valor (conta paga) | valor novo; permanece paga |
| Edit limpa data_pagamento | pendente |
| Botão Pagar (lista) | paga com data de hoje |
