# Contrato REST: Comissões — ações da listagem

**Feature**: `048-comissoes-acoes-listagem`  
**Auth**: JWT Bearer — mutações `admin`; leitura `admin` e `visualizador`  
**Prefixo**: `/api/bonus` (legado preservado)

Contrato correlato (cadastro na NF): `specs/045-comissoes-conta-receber/contracts/rest-comissoes-conta-receber.md`.

---

## Tipos

### `BonusResponse` (campos usados na listagem)

| Campo | Tipo | Notas |
|-------|------|--------|
| id | int | |
| colaborador_id | int | |
| nf_id | int? | null = legado |
| mes, ano | int | |
| valor_bonus | number | |
| liberado | bool | |
| pago | bool | |
| data_liberacao | date? | |
| data_pagamento | date? | |
| atividades | string[] | |
| cliente, posicao, numero_nf | string? | enriquecidos / legado |

### `BonusAcaoLoteRequest`

```json
{ "ids": [1, 2, 3] }
```

### `BonusAcaoLoteResponse`

```json
{ "processados": 2, "ignorados": 1 }
```

---

## Endpoints (escopo 048)

### GET `/api/bonus`

Query: `colaborador_id?`, `mes?`, `ano?`, `nf_id?`  
Resposta: lista `BonusResponse[]` (exclui vínculos com NF soft-deleted, conforme regra já existente).

### POST `/api/bonus/{id}/liberar`

- **Papel**: admin  
- **Pré-condição**: `liberado === false` (sem exigir NF recebida)  
- **422** se já liberada  
- Efeito: `liberado=true`, `data_liberacao` preenchida  
- Resposta: `BonusResponse`

### POST `/api/bonus/{id}/pagar`

- **Papel**: admin  
- **Pré-condição**: `liberado === true` e `pago === false`  
- **422** se não liberada ou já paga  
- Efeito: `pago=true`, `data_pagamento` preenchida  
- Resposta: `BonusResponse`

### POST `/api/bonus/acoes/liberar`

Body: `BonusAcaoLoteRequest`  
Processa só ids com `liberado=false`; demais → `ignorados`.

### POST `/api/bonus/acoes/pagar`

Body: `BonusAcaoLoteRequest`  
Processa só ids com `liberado=true` e `pago=false`; demais → `ignorados`.

---

## Remoção / hardening

### DELETE `/api/bonus/{id}`

**Status alvo (048)**: **não oferecer** exclusão operacional.

| Opção | Comportamento |
|-------|---------------|
| Preferida | Remover o endpoint (ou responder **405/403** estável) e remover `bonusService.deletar` no cliente |
| Mínima | Manter endpoint legado sem uso na UI (já é o estado atual) — **não** atende FR-003 se interpretado na API |

Implementação residual deve preferir a opção Preferida.

---

## Erros

| Situação | Código | Mensagem (pt-BR, amigável) |
|----------|--------|----------------------------|
| Já liberada | 422 | Comissão clara |
| Pagar sem liberar / já paga | 422 | Mensagem clara |
| Não autenticado / não admin | 401/403 | Padrão do produto |
