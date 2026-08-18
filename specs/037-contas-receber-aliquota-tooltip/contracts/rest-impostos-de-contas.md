# Contrato REST: Impostos derivados de contas (leitura)

**Feature**: `037-contas-receber-aliquota-tooltip` | **Date**: 2026-08-18  
**Spec**: [spec.md](../spec.md)

Nenhum endpoint novo. A feature **consome** o GET já existente.

## `GET /api/impostos/de-contas`

**Auth**: Bearer JWT (admin ou visualizador com acesso ao módulo).

**Query**

| Parâmetro | Tipo | Obrigatório |
|-----------|------|-------------|
| `ano` | int | sim |

**Resposta**: `200` — array de 12 objetos (meses 1–12):

```json
{
  "mes": 3,
  "ano": 2026,
  "faturamento": 100000.0,
  "valor_imposto": 6000.0,
  "percentual_imposto": 6.0
}
```

**Uso nesta feature**: apenas `mes`, `ano`, `percentual_imposto`. Percentual **disponível** para o tooltip se `percentual_imposto > 0`.

**Erros**: 401 sem token. Falha de rede/5xx no cliente → tratar como alíquota indisponível (não inventar %).

**Fora deste contrato**: `GET/POST/PUT/DELETE /api/impostos` (cadastro), `GET /api/nfs` (sem campo novo de percentual).
