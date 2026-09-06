# Contrato REST: Contas a Receber — Maggo editável

**Feature**: `051-contas-receber-maggo-editavel`  
Base: `http://localhost:8001/api`  
Auth: Bearer JWT

## `PUT /nfs/{id}`

Admin. Atualiza conta visível (`excluida_em` nulo).

### Campos Maggo aceitos

| Campo body | Comportamento |
|------------|----------------|
| `posicao` | Atualiza |
| `razao_social` | Atualiza (obrigatório se enviado vazio → 422) |
| `candidato` | Atualiza |
| `tipo` | `retainer` \| `sucesso` \| `parcelamento` (alias `parcela`) |
| `valor_bruto` | Atualiza; dispara recálculo fiscal |
| `aliquota_imposto` | Atualiza (0–100); dispara recálculo fiscal |
| `data_ent_pgto` | Atualiza |

### Campos derivados

| Campo body | Comportamento |
|------------|----------------|
| `valor_imposto` | **Ignorado** como fonte de verdade; servidor grava o calculado |
| `valor_liquido` | **Ignorado** como fonte de verdade; servidor grava o calculado |

Após aplicar bruto e/ou alíquota, servidor MUST setar imposto e líquido pelo cálculo fiscal vigente (045).

### Imutáveis no PUT

| Campo | Comportamento |
|-------|----------------|
| `origem` | Ignorado se enviado |
| `maggo_id` | Ignorado se enviado |

### Side-effects proibidos

- MUST NOT escrever na Maggo.
- MUST NOT criar/atualizar/excluir movimentos de Fluxo de Caixa só por mudança de valor Maggo.
- MUST NOT alterar `valor_bonus` / status de comissões existentes **apenas** porque o líquido da NF mudou (ver sync abaixo).

### Respostas

| Código | Significado |
|--------|-------------|
| **200** | Conta atualizada; `origem` inalterada |
| **403** | Visualizador |
| **404** | Id inexistente ou excluída |
| **422** / **400** | Validação (empresa, tipo, alíquota, emissão se NF, etc.) |

## Sync de comissões no mesmo PUT

Se o body incluir `comissoes`:

- Linhas **novas**: `valor_bonus` = percentual × líquido **atual** da NF.
- Linhas existentes com mesmo percentual/atividades: **preservar** `valor_bonus` gravado.
- Linhas existentes com percentual/atividades alterados: recalcular `valor_bonus` com líquido atual; respeitar bloqueio de liberadas (regra vigente).
- MUST NOT existir loop que recalcule todas as não liberadas só porque o líquido da NF mudou.

Se `comissoes` omitido (`null`/ausente): não tocar em `bonus`.

## `GET /nfs` (merge Maggo)

Efeito colateral `_sync_maggo_stub` (inalterado em intenção):

| Situação | Comportamento |
|----------|----------------|
| `maggo_id` inédito | Cria registro Maggo |
| `maggo_id` já existe (visível) | **Não** atualiza campos Maggo |
| `maggo_id` já existe (excluída) | Não recria |
| Colisão manual | Comportamento vigente |

## Fora deste contrato

- `DELETE /nfs/{id}` e tipografia Tipo/Parcela (já 044).
- Endpoints de Fluxo de Caixa e Comissões além do vínculo no PUT da NF.
