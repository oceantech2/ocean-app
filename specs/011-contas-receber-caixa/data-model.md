# Data Model: Contas a Receber — Identificação de Caixa

**Feature**: `011-contas-receber-caixa` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
UI Contas a Receber ──PUT allowlist──► nfs.caixa (+ data_pagamento)
         ▲                                    │
         │         merge Maggo (preserva)     │
         └──────── stub Maggo ←───────────────┘
```

Nenhuma entidade nova. Evolui regras sobre o enriquecimento Ocean já modelado na 007.

## Entidades

### Conta a Receber (visão mesclada)

Campos relevantes para esta feature (demais inalterados — ver 007):

| Campo | Origem | Editável | Tipo / valores | Notas |
|-------|--------|----------|----------------|-------|
| `id` | Ocean | não | int | |
| `numero` | Maggo | não | string | Chave de merge / reassociação de `caixa` |
| `data_pagamento` | Ocean | sim | date \| null | Preenchido ⇒ recebida |
| `status` | Ocean (derivado) | indireto | `paga` \| … | Derivado de `data_pagamento` |
| `caixa` | Ocean | sim | `corrente` \| `investimento` \| null | Enriquecimento; null = não definido |

### Identificação de Caixa

| Valor persistido | Rótulo UI / export | Significado |
|------------------|--------------------|-------------|
| `corrente` | Corrente | Alinhado a conta corrente do Fluxo de Caixa |
| `investimento` | Investimento | Alinhado a conta investimento |
| `null` | — (ausência) | Não definido; sem terceiro literal “Não definido” |

## Persistência

- Tabela: `nfs`
- Coluna: `caixa VARCHAR(20) NULL` (já existente; **sem** migration nesta feature)
- Constraint de aplicação: apenas `corrente`, `investimento` ou `NULL`
- Sync Maggo: atualiza campos Maggo; **preserva** `caixa` (e demais enriquecimentos) pelo `numero`

## Regras de validação (novas / reforçadas)

1. Valor de `caixa` inválido (string fora do conjunto) → **422**.
2. Estado resultante do PUT com `data_pagamento != null` e `caixa` null/ausente → **422** (mensagem: exigir Corrente ou Investimento).
3. Estado resultante com `data_pagamento == null` → `caixa` pode ser null.
4. Visualizador: escrita bloqueada (padrão existente).
5. Sem migração automática de legados (já recebidos com `caixa` null).
6. Listagem: legados sem Caixa continuam visíveis.

## Transições relevantes

| De | Evento | Para | Caixa |
|----|--------|------|-------|
| Não recebida (`data_pagamento` null) | Define caixa | Não recebida | corrente \| investimento |
| Não recebida | Limpa caixa | Não recebida | null |
| Não recebida | Informa pagamento **com** caixa | Recebida | corrente \| investimento |
| Não recebida | Informa pagamento **sem** caixa | *(bloqueado)* | — |
| Recebida sem caixa (legado) | Consulta listagem | *(inalterado)* | null visível como — |
| Recebida sem caixa (legado) | Edita/salva sem caixa | *(bloqueado)* | — |
| Recebida com caixa | Altera corrente ↔ investimento | Recebida | novo valor |
| Recebida com caixa | Tenta limpar caixa mantendo pagamento | *(bloqueado)* | — |

## Relacionamentos

- `caixa` não cria FK nem lançamento em Fluxo de Caixa (fora de escopo).
- Associação estável: `nfs.numero` ↔ item Maggo; `caixa` vive só no Ocean.
