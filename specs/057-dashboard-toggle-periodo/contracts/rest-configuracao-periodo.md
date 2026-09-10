# Contract: REST — Configuração do Período

**Feature**: `057-dashboard-toggle-periodo`  
**Auth**: JWT Bearer  
**Base**: `/api/metas` (ou subpath dedicado sob o mesmo router)

## 1. Obter configuração + preview

`GET /api/metas/periodo?mes={1-12}&ano={YYYY}`

**Papéis**: `admin`, `visualizador`

### Response 200

```json
{
  "mes": 9,
  "ano": 2026,
  "meta_liquida": 300000.0,
  "aliquota_periodo": 18.5,
  "meta_bruta": 368098.16,
  "configurada": true,
  "registros_afetaveis": 12
}
```

| Campo | Descrição |
|-------|-----------|
| `meta_liquida` / `aliquota_periodo` | null se ainda não configurada |
| `meta_bruta` | null se não configurada ou alíquota inválida para conversão |
| `configurada` | true só se meta **e** alíquota persistidas |
| `registros_afetaveis` | COUNT de `nfs` elegíveis ao trigger **com a alíquota atual ainda não aplicada como simulação** — na prática: NFs com `data_emissao` no período, não excluídas, não canceladas (contagem usada no diálogo quando a alíquota **mudar**) |

Quando sem registro mensal: `configurada: false`, valores null, `registros_afetaveis` ainda pode ser &gt; 0 (útil se for o primeiro save com alíquota).

## 2. Salvar configuração

`PUT /api/metas/periodo`

**Papéis**: só `admin` (403 para `visualizador`)

### Body

```json
{
  "mes": 9,
  "ano": 2026,
  "meta_liquida": 300000.0,
  "aliquota_periodo": 18.5,
  "confirmar_atualizacao_massa": false
}
```

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| `mes`, `ano` | sim | mês 1–12 |
| `meta_liquida` | sim | número finito; não null |
| `aliquota_periodo` | sim | `0 ≤ x < 100` |
| `confirmar_atualizacao_massa` | condicional | obrigatório `true` se a alíquota informada **difere** da persistida (ou se não havia alíquota e agora há) |

### Comportamento

1. Validar campos → 422 se inválidos / faltando.
2. Se alíquota **igual** à salva (comparação numérica estável): upsert só `valor_meta` (+ alíquota idêntica); **não** atualizar NFs; 200.
3. Se alíquota **diferente** e `confirmar_atualizacao_massa !== true`: **não persistir**; responder **409** com corpo:

```json
{
  "detail": "confirmacao_necessaria",
  "registros_afetaveis": 12,
  "aliquota_atual": 17.0,
  "aliquota_nova": 18.5
}
```

4. Se alíquota diferente e confirmado: em **uma transação** — upsert meta/alíquota; para cada NF elegível setar `aliquota_imposto` e recalcular imposto/líquido; 200 com resumo:

```json
{
  "mes": 9,
  "ano": 2026,
  "meta_liquida": 300000.0,
  "aliquota_periodo": 18.5,
  "meta_bruta": 368098.16,
  "configurada": true,
  "registros_atualizados": 12
}
```

### Erros

| Código | Quando |
|--------|--------|
| 401 | Sem token |
| 403 | `visualizador` tentando PUT |
| 409 | Alíquota mudou sem confirmação |
| 422 | Validação (campos, alíquota ≥ 100, etc.) |

## 3. Meta anual (fora deste contrato de período)

`PUT /api/metas` com `mes: 0` permanece para meta anual; **não** exige nem grava `aliquota_periodo` neste fluxo.

## 4. Progresso mensal (ajuste)

`GET /api/metas/progresso?mes=&ano=` (mês 1–12) MUST passar a incluir (ou manter compatível e estender):

```json
{
  "valor_meta": 300000.0,
  "aliquota_periodo": 18.5,
  "meta_bruta": 368098.16,
  "realizado_liquido": 150000.0,
  "realizado_bruto": 184049.08,
  "tem_meta": true
}
```

Cliente escolhe `realizado_*` e meta conforme toggle. Campos legados (`realizado`, `percentual`) podem permanecer mapeados à visão líquida por compatibilidade, desde que o Dashboard 057 use os campos dual-base.
