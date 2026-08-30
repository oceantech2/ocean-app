# Data Model: Contas a Receber — Conta, Alíquota e cards líquidos

**Feature**: `045-receber-conta-aliquota` | **Date**: 2026-08-29  
**Spec**: [spec.md](./spec.md)

## Entidade persistida: NF (`nfs`)

Colunas relevantes (existentes + nova):

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `valor_bruto` | FLOAT | sim | Base do cálculo fiscal |
| `aliquota_imposto` | FLOAT | não* | Percentual 0–100 informado pelo admin (*NULL em legado) |
| `valor_imposto` | FLOAT | não | `round(bruto × alíquota/100, 2)`; 0 se alíquota NULL/0 |
| `valor_liquido` | FLOAT | sim | `round(bruto − valor_imposto, 2)` |
| `caixa` | VARCHAR(64) | não | Codigo de conta corrente **ativa**; pode existir com pagamento pendente |

\* Novos cadastros e edições com bruto/alíquota MUST gravar alíquota; legado permanece NULL até edição.

### Regras de cálculo (servidor)

```text
aliquota_pct = aliquota_imposto or 0
if aliquota_pct < 0 or aliquota_pct > 100 → 400
valor_imposto = round(valor_bruto * (aliquota_pct / 100), 2)
valor_liquido = round(valor_bruto - valor_imposto, 2)
```

Alíquota vazia/zero → imposto 0, líquido = bruto.

### Regras de `caixa`

| Evento | Caixa |
|--------|--------|
| Criar **Pendente** com `caixa` informado | codigo validado (`exigir_conta_corrente`) |
| Criar **Pendente** sem `caixa` | slot 1 ativo ou `codigo_padrao` |
| Criar **Recebida** | `caixa` informado ou slot 1/padrão (obrigatório corrente ativa) |
| Editar mantendo pendente | `caixa` atualizado se enviado; **não** zerar ao salvar pendente |
| Marcar recebida (PUT/modal) | usa `caixa` do body ou já gravado no registro |
| Remover pagamento (pendente) | `caixa` **permanece** (não voltar a NULL) |
| `investimento` no body | 400 |

Investimento **não** é opção do campo Conta desta feature.

### Migração

```sql
ALTER TABLE nfs ADD COLUMN IF NOT EXISTS aliquota_imposto FLOAT NULL;
```

Sem backfill. Registros antigos: imposto/líquido/bruto/caixa inalterados até edição explícita.

## Entidade de leitura: Resumo (`GET /api/nfs/resumo`)

Sem mudança de schema. Campos usados pela UI após a feature:

| Campo API | Card UI |
|-----------|---------|
| `total_bruto_pago` | Bruto Recebido (inalterado) |
| `total_liquido_pago` | Líquido Recebido (inalterado) |
| `total_liquido_pendente` | **Líquido Pendente** (antes: `total_bruto_pendente` + rótulo “Pendente”) |
| `total_liquido_vencido` | **Líquido Vencido** (antes: `total_bruto_vencido` + rótulo “Vencido”) |

Critérios de status (pendente vs vencida) permanecem os de `_calcular_status_nf` / filtros atuais.

## Entidades de tela (formulário)

| Campo UI | Bind | Comportamento |
|----------|------|---------------|
| Conta | `form.caixa` | Select correntes ativas; visível criação **e** edição; default slot 1 |
| Alíquota (imposto) | `form.aliquota_imposto` | Input percentual; criação e edição |
| Valor bruto | `form.valor_bruto` | Editável admin |
| Impostos | calculado | Read-only |
| Valor líquido | calculado | Read-only |

Modal **Marcar como recebido**: mantém select Conta; SHOULD pré-preencher com `nf.caixa` já gravado.

## Relacionamentos

```text
ContaCorrente.codigo ──< NF.caixa   (corrente ativa; pendente ou recebida)
```

Alíquota por linha **independe** da alíquota mensal (tooltip coluna Imposto — feature 037).

## Validação resumida

- Alíquota ∈ [0, 100] ou NULL (tratado como 0 no cálculo)
- Bruto &gt; 0 (regra existente)
- Caixa: corrente ativa; nunca investimento
- Imposto/líquido enviados divergentes do recálculo → servidor sobrescreve (não erro, salvo bruto inválido)
