# Data Model: Calendário com Legenda de Status

**Feature**: `006-calendario-legenda` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

> Modelo de **projeção no client** a partir de NFs e Contas a Pagar já existentes. Sem entidades novas de banco nem migrations.

## Entidades de origem (inalteradas)

### NF (existente)

| Campo relevante | Uso no Calendário |
|-----------------|-------------------|
| `data_vencimento` | Chave do dia (YYYY-MM-DD) |
| `numero`, `razao_social` | Título do evento |
| `valor_liquido` | Valor exibido |
| `status` | `pendente` \| `vencida` \| `paga` \| `cancelada` |

**Regra**: `cancelada` → **excluída** do Calendário. `pendente` e `vencida` → A receber. `paga` → Recebido.

### Conta a pagar (existente)

| Campo relevante | Uso no Calendário |
|-----------------|-------------------|
| `data_vencimento` | Chave do dia; ausente → não entra |
| `descricao` | Título |
| `valor` | Valor |
| `pago` | boolean → A pagar (`false`) ou Pago (`true`) |

## Entidade de projeção

### Evento de calendário

Ocorrência renderizada na grade / detalhe / export.

| Campo | Tipo | Regras |
|-------|------|--------|
| `tipo` | `'nf'` \| `'conta'` | Origem |
| `titulo` | string | Texto do chip / linha |
| `valor` | number | Moeda BRL na UI |
| `pago` | boolean | Quitado: NF `paga` ou conta `pago === true` |
| `data` | string (YYYY-MM-DD) | Derivada de `data_vencimento` (chave do mapa) |

**Status visual derivado** (não precisa persistir):

| Condição | Status visual | Cor |
|----------|---------------|-----|
| `tipo === 'nf'` ∧ ¬`pago` | A receber | azul |
| `tipo === 'nf'` ∧ `pago` | Recebido | verde |
| `tipo === 'conta'` ∧ ¬`pago` | A pagar | laranja |
| `tipo === 'conta'` ∧ `pago` | Pago | verde |

### Legenda (constante de UI)

Lista fixa de 4 entradas, ordem canônica:

1. A receber → azul  
2. Recebido → verde  
3. A pagar → laranja  
4. Pago → verde  

Sem persistência; sem preferência do usuário.

## Relacionamentos

```text
NF (filtrada) ──1:1──► Evento (tipo=nf)
ContaPagar ────1:1──► Evento (tipo=conta)   [se data_vencimento]
Evento* ──────N:1──► Dia (chave YYYY-MM-DD)
Legenda ───────1────► interpreta cores dos Eventos
```

## Validação / invariantes

- Nenhum evento com origem NF `cancelada`.
- Todo evento NF em aberto usa azul; todo evento quitado (NF ou conta) usa o **mesmo** verde.
- Distinção Recebido vs Pago só via `tipo` / rótulo textual.
- Grade pode truncar lista por dia; detalhe lista todos os eventos daquele dia.

## Transições

Não há máquina de estados no Calendário. Transições de quitação ocorrem nas páginas NFs / Contas; o Calendário apenas relê e reprojeta (incl. via `calendarioTick` já existente).
