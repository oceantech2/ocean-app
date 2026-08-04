# Contracts: Metas na Dashboard

**Feature**: `002-dashboard-metas-cards` | **Date**: 2026-07-26  
**Delta REST**: nenhum — endpoints iguais ao baseline.

## 1. REST (reuso — sem mudança)

Referência completa: [../001-ocean-app-baseline/contracts/rest-api.md](../001-ocean-app-baseline/contracts/rest-api.md)

| Método | Path | Uso na feature |
|--------|------|----------------|
| `GET` | `/api/metas/progresso?mes={mes}&ano={ano}` | Card mensal (`mes=MES_ATUAL`) e card anual (`mes=0`) |
| `PUT` | `/api/metas` body `{ mes, ano, valor_meta }` | Salvar meta (admin, via UI) |
| `GET` | `/api/metas?ano=` | Não obrigatório na faixa de cards |

### Resposta de progresso (contrato estável)

```json
{
  "mes": 0,
  "ano": 2026,
  "valor_meta": 1200000.0,
  "realizado": 450000.0,
  "percentual": 37.5,
  "tem_meta": true
}
```

- `mes=0`: meta anual; `realizado` no servidor = soma NFs pagas do ano (o card anual da Dashboard pode continuar usando a soma da série de faturamento no client — comportamento atual / FR-008).
- `tem_meta=false` quando não existe registro `MetaFinanceira` para o par.

### Cliente (`metasService`)

```text
progresso(mes, ano) → GET /metas/progresso
definir(mes, ano, valor_meta) → PUT /metas
```

## 2. UI contract — faixa de metas

Superfície: página Dashboard (rota padrão autenticada), faixa imediatamente após o cabeçalho/controles de ano e **antes** dos KPI cards (bruto/líquido/pendentes).

| Regra | Contrato |
|-------|----------|
| Ordem DOM/visual | [0] Anual, [1] Mensal |
| Layout ≥768px | 2 colunas iguais; altura alinhada |
| Layout &lt;768px | 1 coluna; Anual acima, Mensal abaixo |
| Títulos | `Meta de Faturamento Anual — {ano}` / `Meta de Faturamento — {mês}/{ano}` |
| Edição | Inline no card; visível só se papel admin |
| Conteúdo mínimo | título, realizado, meta ou ausência, barra se meta válida |
| Independência | Estados de edição dos dois cards não se sobrescrevem |

### Papéis

| Papel | Ver cards | Editar |
|-------|-----------|--------|
| admin | sim | sim |
| visualizador / sem escrita | sim | não |
