# Research: Contas a Pagar — Input Manual de Valores

**Feature**: `014-contas-pagar-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md)

## 1. Baseline vs gap

**Decision**: Tratar 014 como **fechamento do input manual de valores** sobre Contas a Pagar já existente (008), não como módulo novo.

**Estado atual (baseline observado)**:
- CRUD manual existe: botão **“Nova Conta”**, modal create/edit, listagem com `fmt` BRL, import CSV/Excel.
- Campo valor: `input type="number"` + `parseFloat` — **sem** máscara monetária brasileira (FR-013).
- `ContaPagarCreate` **não** declara `data_pagamento`/`pago` — payload do frontend com data na criação é **ignorado** pelo schema (gap FR-006 create).
- `PUT`: só marca `pago=True` se `data_pagamento` truthy; **não** deriva `pago=False` ao receber `data_pagamento: null` (gap FR-015).
- Frontend `salvar`: se data vazia no edit, **não** envia `data_pagamento`/`pago` — limpar data não reabre pendente.
- Valor pago já é editável no formulário (FR-007 OK no UI); falta reforçar validação `valor > 0` no backend.
- CTA/modal: **“Nova Conta”** — precisa virar **“Nova conta a pagar”** (FR-014).

**Rationale**: Spec + constitution V pedem a menor solução; reaproveitar `contas_pagar` e rotas existentes.

**Alternatives considered**:
- Módulo/página paralela “lançamentos manuais” — rejeitado (duplica domínio).
- Remover importação — rejeitado (Clarify/Assumptions: import permanece).

## 2. Máscara monetária brasileira (sem lib nova)

**Decision**: Util leve `frontend/src/utils/moeda.ts` (ou nome equivalente):
- **Exibir**: digitar como centavos ou formatar progresso para `R$ 1.234,56` (pt-BR).
- **Persistir**: parse → `number` (float) com 2 casas; rejeitar ≤ 0 / NaN no cliente antes do POST/PUT.
- Usar no create e no edit de Contas; listagem continua com `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`.

**Rationale**: Clarify Q1 (opção A); package.json sem lib de máscara; constitution V evita dependência só para um campo.

**Alternatives considered**:
- `react-number-format` / IMask — rejeitado nesta feature (overhead e escopo).
- Manter `type="number"` — rejeitado (Clarify A).

## 3. Create: data de pagamento opcional

**Decision**:
- Estender `ContaPagarCreate` com `data_pagamento: Optional[date] = None` (e opcionalmente `pago` ignorado em favor da derivação).
- Em `criar_conta`: se `data_pagamento` preenchida → `pago=True`; se vazia → `pago=False` e `data_pagamento=None`.
- Sem seletor Pendente|Pago na UI (Clarify Q4).
- Validar `valor > 0` (422 se inválido).

**Rationale**: Clarify Q4; fecha gap do schema Create.

**Alternatives considered**:
- Seletor Pendente|Pago — rejeitado (Clarify).
- Só frontend setar `pago` sem schema — rejeitado (campos extras descartados).

## 4. Update: limpar data → pendente; editar valor pago

**Decision**:
- Em `atualizar_conta`, após aplicar campos:
  - Se `data_pagamento` veio no payload e é **não-nula** → `pago=True`.
  - Se `data_pagamento` veio no payload e é **null** → `pago=False` (e data null).
- Frontend no edit: **sempre** enviar `data_pagamento` (string ISO ou `null`) e alinhar `pago` com a regra acima; valor sempre enviado (máscara → number), inclusive conta já paga.
- Manter botão “Pagar” da listagem (atalho) como hoje.

**Rationale**: Clarify Q2 (editar valor pago) + Q5 (limpar data).

**Alternatives considered**:
- Exigir `pago: false` explícito sem null em data — rejeitado (regra canônica é a data).
- Bloquear edição de valor se pago — rejeitado (Clarify B).

## 5. Rótulo canônico

**Decision**: Substituir **“Nova Conta”** por **“Nova conta a pagar”** no botão CTA e no título do modal de criação. Título de edição pode permanecer “Editar Conta” ou “Editar conta a pagar” — preferir **“Editar conta a pagar”** para consistência leve, sem redesign.

**Rationale**: Clarify Q3.

**Alternatives considered**:
- Manter “Nova Conta” — rejeitado (Clarify B).

## 6. Importação e taxonomia

**Decision**: Não alterar fluxo de import CSV/Excel nem taxonomia de Categorias (008). Import continua aceitando valor numérico nas linhas (máscara é só do formulário unitário).

**Rationale**: FR-011/FR-012; Out of Scope.

**Alternatives considered**:
- Máscara também no import — fora de escopo / baixo valor.
