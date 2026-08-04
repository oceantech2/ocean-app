# Contrato API: Contas a Pagar (Categorias)

**Feature**: `008-contas-pagar-categorias` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/contas`. Campo `centro_custo` **substituído** por `categoria` / `subcategoria` / `categoria_pendente`.

## Listagem

```http
GET /api/contas?skip=0&limit=500&categoria=&subcategoria=&pago=
Authorization: Bearer <token>
```

| Param | Tipo | Comportamento |
|-------|------|---------------|
| `categoria` | string? | Filtra por código superior |
| `subcategoria` | string? | Com RH: restringe sub; ignorar/422 se categoria ≠ RH |
| `pago` | bool? | Mantém comportamento atual |

- `categoria=recursos_humanos` sem `subcategoria` → todas as sub de RH (não pendentes com essa categoria).
- Contas pendentes: incluídas quando **não** há filtro de categoria; com filtro de categoria oficial, **excluídas** (salvo implementação documentada em contrário no quickstart — padrão: só em “todas”).

**Resposta** (item):

```json
{
  "id": 1,
  "descricao": "Folha março",
  "categoria": "recursos_humanos",
  "subcategoria": "salario",
  "categoria_pendente": false,
  "valor": 10000,
  "data_vencimento": "2026-03-05",
  "data_pagamento": null,
  "pago": false
}
```

Pendente exemplo:

```json
{
  "id": 2,
  "descricao": "Reembolso viagem",
  "categoria": "reembolsos",
  "subcategoria": null,
  "categoria_pendente": true,
  "valor": 350.5,
  "pago": false
}
```

## Criar

```http
POST /api/contas
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "descricao": "Campanha Q1",
  "categoria": "marketing",
  "subcategoria": null,
  "valor": 2000,
  "data_vencimento": "2026-04-01"
}
```

- RH: `subcategoria` obrigatória ∈ catálogo.
- Não RH: `subcategoria` null/ausente.
- `categoria_pendente` no create: sempre `false` (não criar já pendente via API normal).
- **422** se combinação inválida.

## Atualizar

```http
PUT /api/contas/{id}
Authorization: Bearer <token>
```

Body parcial permitido (inclui pagamento/descrição sem forçar categoria). Se enviar `categoria` (e `subcategoria` se RH) válidos → grava e seta `categoria_pendente=false`.

**422** se enviar categoria inválida ou RH sem sub.

## Exclusão individual

```http
DELETE /api/contas/{id}
```

Permanece (admin). Visualizador → 403.

## Exclusão em massa (bloqueada)

```http
DELETE /api/contas/todas
```

| Código | Comportamento |
|--------|----------------|
| **403** | Sempre (mesmo admin) — exclusão em massa descontinuada |

## Import XLSX / CSV

```http
POST /api/contas/importar-xlsx
```

- Colunas esperadas: `descricao`, `categoria`, `subcategoria` (obrigatória se RH), `valor`, `data_vencimento`, …
- Aceitar códigos canônicos; opcionalmente labels pt-BR da taxonomia **nova** apenas.
- Linha com valor legado/inválido → erro reportado para a linha; **sem** mapear alias antigo.

## Consumidores

| Endpoint / uso | Filtro |
|----------------|--------|
| Impostos (derivado de contas) | `categoria=impostos`, `categoria_pendente=false` |
| `GET /api/relatorios/custo-por-categoria` | Agrega por `categoria`; resposta pode usar chave `categoria` (alias legado `centro_custo` na payload só se necessário para o Dashboard atual — preferir migrar frontend junto) |

## Autorização

Padrão do produto: leitura autenticada com permissão do módulo; escrita admin.
