# Research: Contas a Pagar — Confirmar lógica do input manual

**Feature**: `020-contas-pagar-logica` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

## 1. Natureza da feature: confirmar, não reconstruir

**Decision**: Tratar 020 como **auditoria da lógica canônica** sobre o que 008/014 já entregaram. Não reabrir máscara BRL, CTA, taxonomia nem contrato de `data_pagamento` ↔ `pago`.

**Baseline observado (alinhado à spec)**:
- Formulário **Nova conta a pagar** / **Editar conta a pagar** com descrição, Categorias, subcategoria RH, valor (`formatarMoedaInput`), vencimento, data de pagamento opcional.
- Create: `pago` derivado de `data_pagamento` em `criar_conta`.
- Update: `data_pagamento` nula → `pago=False`; data preenchida → `pago=True`; valor editável com conta paga.
- **Pagar** na lista: `marcarPago` envia `pago: true` e `data_pagamento` = hoje (`toISOString().split('T')[0]`), sem modal.
- Sem botão Desfazer pagamento; só Editar / Deletar / Pagar (se pendente).
- Sem unique em `contas_pagar`; POST duplicado é aceito.
- Input `type="date"` sem `min`/`max` — qualquer data ISO válida passa.
- Import CSV/Excel permanece; `DELETE /todas` retorna 403.

**Rationale**: Constitution V + pedido “confirmar lógica”; Clarify manteve o comportamento atual da tela.

**Alternatives considered**:
- Reimplementar o módulo — rejeitado (duplica 014).
- Espelhar modal **Recebido** (019) no **Pagar** — rejeitado (Clarify Q1 = A).

## 2. Gap: escrita da API não exige admin

**Decision**: Trocar `get_current_user` por `require_admin` em:
- `POST /api/contas/`
- `PUT /api/contas/{id}`
- `DELETE /api/contas/{id}`
- `POST /api/contas/{id}/comprovante`

Manter `get_current_user` em GET listagem, GET por id, GET comprovante, GET export. Importação XLSX e `DELETE /todas` já usam `require_admin`.

**Rationale**: FR-009 e constitution II: visualizador só consulta. A UI já oculta ações, mas o token de visualizador ainda consegue criar/editar/pagar/excluir via API. Contas a Receber já trava escrita com `require_admin`.

**Alternatives considered**:
- Só UI (status quo) — rejeitado (FR-009 é do sistema, não só do botão).
- Middleware global de papéis — rejeitado (escopo maior que esta feature).

## 3. Datas de pagamento sem restrição

**Decision**: Não adicionar validação de “não futura” nem “não anterior ao vencimento” no backend nem `min`/`max` no input. Qualquer `date` parseável permanece válida. **Pagar** na lista continua usando a data de hoje no cliente (e o atalho `pago=true` sem data no PUT continua preenchendo hoje no servidor — comportamento já existente, coerente com Clarify Q1).

**Rationale**: Clarify Q2 = A.

**Alternatives considered**: Bloquear futuro / antes do vencimento — rejeitado (Clarify).

## 4. Duplicidade permitida

**Decision**: Não criar unique constraint, índice composto nem checagem de duplicata no create/update. Dois POSTs idênticos → dois registros.

**Rationale**: Clarify Q3 = A. Despesas repetidas são válidas.

**Alternatives considered**: Aviso ou bloqueio — rejeitado (Clarify A, não B/C).

## 5. Desfazer pagamento só na edição

**Decision**: Não adicionar ação na listagem. PUT com `data_pagamento: null` permanece o contrato para voltar a pendente. UI: botão **Pagar** só se `!conta.pago`.

**Rationale**: Clarify Q4 = A.

**Alternatives considered**: Ação Desfazer na lista — rejeitado (Clarify).

## 6. Importação e Caixa/Origem

**Decision**: Não remover importação; não introduzir coluna Origem nem Caixa nesta tela.

**Rationale**: FR-012/FR-014; Out of Scope; contraste explícito com Contas a Receber.

**Alternatives considered**: Remover import (padrão 012) — rejeitado (Clarify/Assumptions 014 e 020).
