# Contrato API: Contas a Pagar — Lógica do input manual

**Feature**: `020-contas-pagar-logica` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **Data model**: [data-model.md](../data-model.md)

## Superfície

| Item | Valor |
|------|-------|
| Base | `/api/contas` |
| Auth | JWT Bearer |
| Escopo 020 | Confirmar regras 014 + **403** para visualizador na escrita |

## Autorização

| Método | Caminho | Quem |
|--------|---------|------|
| GET | `/`, `/{id}`, `/{id}/comprovante`, export | autenticado (admin e visualizador) |
| POST | `/` | **admin** |
| PUT | `/{id}` | **admin** |
| DELETE | `/{id}` | **admin** |
| POST | `/{id}/comprovante` | **admin** |
| POST | `/importar-xlsx` | admin (já vigente) |
| DELETE | `/todas` | 403 (descontinuado) |

Visualizador em escrita: **403**.

## POST `/api/contas/`

Cria conta unitária. Sem checagem de duplicidade. Sem restrição da data de pagamento vs hoje/vencimento.

### Body

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `descricao` | string | sim | |
| `categoria` | string | sim | taxonomia 008 |
| `subcategoria` | string \| null | se RH | |
| `valor` | number | sim | **> 0** |
| `data_vencimento` | date ISO | sim (prática da página) | |
| `data_pagamento` | date \| null | não | preenchida → nasce **paga** (qualquer dia) |

`pago` no body: não exigir; derivado da data.

### Respostas

| Código | Quando |
|--------|--------|
| 201 | Criada; `pago` coerente com `data_pagamento`; duplicata também 201 |
| 401 | Sem token |
| 403 | Visualizador |
| 422 | Valor ≤ 0, categoria inválida, RH sem subcategoria |

## PUT `/api/contas/{id}`

### Body (parcial)

| Campo | Notas |
|-------|-------|
| `valor` | se enviado, > 0; permitido se já paga |
| `data_pagamento` | data → paga; **null** → pendente (desfazer) |
| `pago` | atalho lista: `true` sem data → preenche **hoje**; `false` → limpa data |

### Respostas

| Código | Quando |
|--------|--------|
| 200 | Atualizada |
| 403 | Visualizador |
| 404 | Inexistente |
| 422 | Valor ≤ 0 / classificação inválida |

## DELETE `/api/contas/{id}`

204 admin; 403 visualizador; 404 inexistente.

## Fora deste contrato

- Novos endpoints.
- Unique / 409 de duplicidade.
- Validação de data futura ou vs vencimento.
- Mudança de importação ou taxonomia.
