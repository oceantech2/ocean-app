# Contrato REST (ERP): Imposto das propostas

Base: `/api/configuracoes` (router do ERP, `require_erp`). Token do ERP obrigatório.

## 1. Listar meses cadastrados

`GET /api/configuracoes/imposto-proposta` — papel `admin` (403 para visualizador)

**200**

```json
[
  { "ano": 2026, "mes": 10, "percentual": 18.75, "atualizado_em": "2026-10-14T20:00:00", "atualizado_por": "admin" }
]
```

Ordenado por `ano desc, mes desc`.

## 2. Salvar (upsert) o imposto de um mês

`PUT /api/configuracoes/imposto-proposta` — papel `admin`

**Body**

```json
{ "ano": 2026, "mes": 10, "percentual": 18.75 }
```

| Campo | Regra | Erro |
|-------|-------|------|
| `ano` | inteiro 2000–2100 | 422 |
| `mes` | inteiro 1–12 | 422 |
| `percentual` | número > 0 e < 100, até 2 casas | 422 "Percentual deve ser maior que 0 e menor que 100" |

**200**: o registro salvo (mesmo formato do item da listagem).

**Efeitos**: cria ou atualiza o registro do mês; registra em Auditoria (`criar`/`editar`, entidade `ImpostoProposta`, descrição `"10/2026 — 18.75%"`). Não altera propostas existentes.

**403**: visualizador.
