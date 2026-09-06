# Research: Contas a Receber — Campos Maggo editáveis no Ocean

**Feature**: `051-contas-receber-maggo-editavel` | **Date**: 2026-09-06  
**Spec**: [spec.md](./spec.md)

## R-001 — Estado herdado (044 / 045) vs gaps desta feature

**Decision**: Tratar 051 como **fechamento** da editabilidade Maggo, não como reimplementação. Reutilizar: `maggoEditavel` na UI, PUT que já aplica grupo Maggo (exceto `origem`/`maggo_id`), `_sync_maggo_stub` que já dá `continue` em registro existente, e cálculo fiscal bruto+alíquota da 045.

**Rationale**: Grande parte do pedido “deixar campos Maggo editáveis sem mudar na Maggo” já foi entregue na 044. O clarify 2026-09-06 restringe side-effects (fiscal digitável, caixa, comissões) que ainda precisam de regra explícita.

**Alternatives considered**:
- Reescrever fluxo Maggo do zero — escopo e risco desnecessários.
- Só documentar “já feito” sem tasks — deixa FR-012 (comissões) e imposto digitável sem aceite testável.

## R-002 — Imposto e líquido somente calculados

**Decision**: Admin edita **valor bruto** e **alíquota**; imposto e líquido são derivados no servidor (`calcular_imposto_liquido` / `_aplicar_recalculo_fiscal`) e na UI (somente leitura). No `PUT`, **ignorar** `valor_imposto` e `valor_liquido` enviados pelo cliente (ou sobrescrever sempre pelo cálculo após aplicar bruto/alíquota). Incluir **alíquota** no conjunto editável Maggo (FR-001 clarify).

**Rationale**: Clarify Q1 = A. Evita inconsistência fiscal e alinhamento com 045.

**Alternatives considered**:
- Digitação livre de imposto/líquido — rejeitada na clarify.
- Sobrescrita opcional de líquido — rejeitada (opção C).

## R-003 — Merge Maggo não sobrescreve existente

**Decision**: Manter comportamento atual: se `maggo_id` já existe (visível **ou** excluída), `_sync_maggo_stub` **não** atualiza campos Maggo nem ressuscita. Só **cria** fechamento novo. Sem cliente de escrita Maggo.

**Rationale**: Spec FR-002–FR-004 e clarify 044 (Q2). Já implementado; validar no quickstart.

**Alternatives considered**:
- Merge campo a campo (proteger só o editado) — rejeitado antes; mais complexo e contradiz “nunca sobrescrever existente”.

## R-004 — Caixa intacto ao editar valores de conta Recebida

**Decision**: `PUT` que altera bruto/alíquota **não** cria, atualiza nem remove lançamentos de Fluxo de Caixa. Totais de Contas a Receber refletem o novo valor naturalmente. Sem hooks novos em `fluxo_movimentos`.

**Rationale**: Clarify Q2 = A; paralelo à exclusão 044. Hoje o PUT já não toca movimentos de caixa ao mudar valor — apenas confirmar e cobrir no quickstart.

**Alternatives considered**:
- Ajustar lançamento de caixa automaticamente — rejeitado (risco financeiro).
- Bloquear edição monetária em Recebida — rejeitado (clarify).

## R-005 — Comissões existentes não recalculam automaticamente

**Decision**: Ao alterar valores Maggo (e o líquido derivado), **não** alterar `valor_bonus`, `liberado`, `pago` nem demais campos de comissões já existentes.

Gap atual: `comissoes_sync.sincronizar` (1) recalcula `valor_bonus` em `_aplicar_linha` com o líquido novo quando o frontend reenvia as linhas; (2) no final, recalcula **todas** as não liberadas (`Bonus.nf_id` + `liberado=False`) mesmo sem mudança de percentual.

Ajuste:

1. Remover o loop final que força recálculo de todas as não liberadas só porque o líquido da NF mudou.
2. Ao atualizar linha existente cujo `percentual` (e atividades) **não** mudaram em relação ao gravado, **preservar** `valor_bonus` atual — não recalcular a partir do novo líquido.
3. Recalcular `valor_bonus` apenas quando a linha for **nova** ou quando `percentual`/atividades mudarem explicitamente no payload de comissões.

**Rationale**: Clarify Q3 = A (FR-012 / SC-008). Evita efeito colateral silencioso em Comissões ao corrigir Maggo.

**Alternatives considered**:
- Omitir `comissoes` no PUT Maggo-only no frontend — frágil (fácil esquecer; outro cliente API ainda quebraria).
- Recalcular só não liberadas — rejeitado na clarify (opção B).
- Recalcular todas — rejeitado (opção C).

## R-006 — Terminologia vaga / projeto e data ent. pgto

**Decision**: Manter rótulos de UI já usados na página (**Projeto**, **Data de fechamento**); mapear para colunas `posicao` e `data_ent_pgto`. Sem renomear colunas. Indicador visual “editado localmente” **fora** desta entrega (deferred no clarify).

**Rationale**: Consistência com produto; clarify deferiu indicador e alinhar sinônimos no plano/UI sem schema.

**Alternatives considered**:
- Badge “corrigido no Ocean” — baixo impacto; fora do escopo mínimo.
