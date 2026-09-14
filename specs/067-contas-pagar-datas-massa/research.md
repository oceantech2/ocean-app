# Research: Contas a Pagar — Edição em massa de datas

**Branch**: `067-contas-pagar-datas-massa` | **Date**: 2026-09-14

## R1 — Endpoint de lote dedicado (não N PUTs)

**Decision**: Um endpoint `POST /api/contas/acoes/editar-datas` que recebe `ids` + datas opcionais, aplica em uma transação e devolve `{ processados, ignorados }`, no mesmo espírito de `POST /api/bonus/acoes/liberar|pagar`.

**Rationale**: Spec exige feedback parcial (FR-012), confirmação única (FR-005) e SC-001 (várias contas em &lt; 1 min). N chamadas `PUT /contas/{id}` aumentam latência, inconsistência parcial sem contagem agregada e complexidade no cliente. Constitution V: um contrato mínimo.

**Alternatives considered**:
- Loop de `contasService.atualizar` no frontend → rejeitado (falha parcial opaca, N round-trips).
- Reativar exclusão em massa e genérico “patch em massa” → fora de escopo; exclusão em massa já descontinuada em `contas.py`.

## R2 — Semântica omitido vs limpar

**Decision**: No body do lote, campo **ausente** (ou `null`) = **não alterar**. Só aplica se vier uma **data válida**. O endpoint **não** limpa `data_pagamento` nem `data_vencimento` (clarify Q1 / FR-003a).

**Rationale**: Clarify: branco no formulário = não alterar; limpeza só na edição individual. Diferente do `PUT` unitário, onde `data_pagamento: null` zera e reabre pendente — o lote não deve reutilizar essa semântica.

**Alternatives considered**:
- Espelhar `ContaPagarUpdate` com `exclude_unset` + null limpa → rejeitado (contradiz clarify).
- Flag `limpar_pagamento: true` → rejeitado na clarify (opção A).

## R3 — Status pago no lote

**Decision**: Se `data_pagamento` for aplicada (data válida), setar `pago=True` em cada conta processada. Não alterar `pago` quando o lote só mexe em `data_vencimento`. Não oferecer caminho para `pago=False` via este endpoint.

**Rationale**: Alinha a `atualizar_conta` ao receber `data_pagamento` preenchida (FR-004). Conta já paga com nova data de pagamento permanece paga (edge case da spec).

**Alternatives considered**:
- Só gravar data sem tocar `pago` → desalinha edição individual e cards.
- Exigir `pago` explícito no body → UI extra sem valor.

## R4 — Conta corrente (`caixa`) ao marcar paga

**Decision**: Antes de marcar paga no lote, se `caixa` estiver vazio, resolver com `_resolver_caixa_conta(db, None)` (padrão Conta Corrente 1). Se ainda assim inválido, contar a conta como **ignorada** (não abortar o lote inteiro).

**Rationale**: `PUT` unitário exige caixa válido quando `pago`; contas antigas podem estar sem caixa. Resolver o padrão maximiza `processados`; ignorar o restante atende FR-012.

**Alternatives considered**:
- Abortar lote inteiro no primeiro erro de caixa → piora UX do lote.
- Pedir caixa no modal em massa → fora do escopo (só datas).

## R5 — “Grupo visível” na tabela plana (046)

**Decision**: Manter a **tabela plana** de `046-contas-pagar-listagem-colunas` (sem voltar aos blocos colapsáveis de `034`). Introduzir **linhas de cabeçalho de grupo** por `chaveMesVencimento` (rótulo Mês/Ano) com checkbox que marca/desmarca todas as contas **visíveis** daquele mês/ano no recorte filtrado atual; checkbox por linha; opcional “marcar todas as linhas visíveis” no `thead`. Padrão visual espelha `Bonus.tsx` (checkbox de grupo), sem colapsar grupos.

**Rationale**: Clarify Q3 pediu linha + grupo; `046` removeu agrupamento colapsável. Cabeçalho de grupo + colunas planas cumpre ambos sem reabrir `034`.

**Alternatives considered**:
- Restaurar blocos Por mês de `034` → conflita com `046`; rejeitado.
- Só “selecionar todas as visíveis” sem grupo por mês → não cobre clarify “grupo mês/ano”.
- “Selecionar todas do filtro no servidor” → rejeitado na clarify (opção C).

## R6 — UI: um modal, confirmação, seleção

**Decision**: Uma ação **Editar datas em massa** (barra quando `selecionados.size > 0`, só `admin`). Modal com dois `input type="date"` (vencimento, pagamento); validação cliente: ao menos um preenchido. Confirmação com resumo (N contas + quais campos). Sucesso → toast com processados/ignorados, reload da listagem/cards, **limpar seleção**. Cancelar → nada grava, seleção permanece. Mudança de filtros / mês-ano / busca → limpar seleção (`useEffect` como em Bonus).

**Rationale**: Clarify Q2, Q5 e FR-002/005/007/007a. Reuso de padrões já aceitos no produto.

**Alternatives considered**:
- Duas ações separadas → rejeitado na clarify.
- `window.confirm` só → fraco para escolher duas datas; modal + confirm explícito.

## R7 — Escopo e auditoria

**Decision**: Sem migration de schema. Auditoria: uma entrada `editar` por conta processada (`ContaPagar`), espelhando o lote de bônus. Contas a Receber e demais módulos fora. Edição individual inalterada.

**Rationale**: Datas já existem em `ContaPagar`. Constitution V e FR-010/011.

**Alternatives considered**:
- Uma única linha de auditoria “lote” → dificulta rastreio por conta; rejeitado.
- Alterar modelo de datas → desnecessário.
