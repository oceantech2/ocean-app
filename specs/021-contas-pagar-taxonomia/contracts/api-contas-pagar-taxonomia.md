# Contrato API: Contas a Pagar — Taxonomia

**Feature**: `021-contas-pagar-taxonomia` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/contas`. Sem endpoint novo.

## Listagem

```http
GET /api/contas?skip=0&limit=500&categoria=&subcategoria=&pago=
Authorization: Bearer <token>
```

| Param | Comportamento |
|-------|----------------|
| `categoria=recursos_humanos` sem `subcategoria` | Todas as contas RH, **incluindo** legado `subcategoria=beneficios` |
| `categoria=recursos_humanos` + `subcategoria=salario` (etc.) | Só a sub oficial; **exclui** legado Benefícios |
| `categoria=beneficios` | Só `categoria=beneficios` (não inclui o par RH) |
| sem `categoria` | Lista completa (legado e oficiais) |

Item legado:

```json
{
  "id": 10,
  "descricao": "VR março",
  "categoria": "recursos_humanos",
  "subcategoria": "beneficios",
  "categoria_pendente": false,
  "valor": 800
}
```

Item novo Benefícios:

```json
{
  "id": 11,
  "descricao": "Plano de saúde",
  "categoria": "beneficios",
  "subcategoria": null,
  "categoria_pendente": false,
  "valor": 1200
}
```

## Criar

```http
POST /api/contas
```

- Categorias oficiais: `adm_financeiro`, `operacoes`, `marketing`, `comercial`, `recursos_humanos`, `beneficios`, `tecnologia`, `impostos`.
- RH: `subcategoria` ∈ `salario` \| `bonus` \| `comissao` \| `retirada_socios`.
- `categoria=beneficios`: `subcategoria` null.
- **422** se RH + `beneficios`, RH sem sub, não-RH com sub, ou código fora do catálogo.

## Atualizar

```http
PUT /api/contas/{id}
```

- Body parcial: valor / pagamento **sem** `categoria` → não revalida catálogo (legado intacto).
- Body com `categoria`+`subcategoria` **iguais** ao persistido (incluindo legado) → **200**, sem converter.
- Body com classificação **nova** inválida (RH + beneficios, etc.) → **422**.
- Reclassificar para Benefícios: `{ "categoria": "beneficios", "subcategoria": null }`.

## Import

```http
POST /api/contas/importar-xlsx
```

(e CSV na UI)

- Aceitar códigos/labels da taxonomia **oficial** desta feature.
- Linha RH + Benefícios (código ou label na sub) → **erro da linha**; não grava; não converte.
- Linha categoria Benefícios / `beneficios` sem sub → aceita.

## Custo por categoria

```http
GET /api/relatorios/custo-por-categoria?ano=&mes_de=&mes_ate=
```

Contrato de agregação inalterado. Resposta passa a poder incluir item `categoria: "beneficios"` com label **Benefícios** quando houver valor. Legado continua na chave `recursos_humanos`.

## Autorização

Padrão do produto: leitura autenticada; escrita `admin` (403 visualizador, alinhado à 020 se já aplicada).
