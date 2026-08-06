# Research: Contas a Receber — Identificação de Caixa

**Feature**: `011-contas-receber-caixa` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md)

## 1. Baseline vs gap (007 vs 011)

**Decision**: Tratar a feature 011 como **fechamento de regras e UX** sobre a coluna `nfs.caixa` já criada na 007, não como nova modelagem.

**Estado atual (baseline)**:
- Coluna `caixa`, schema Pydantic, merge Maggo preservando `caixa`, listagem/modal/CSV com Caixa.
- Lacunas: sem obrigatoriedade ao pagar; listagem mostra “Não definido”; modal Pagar não pede Caixa; XLSX sem coluna Caixa.

**Rationale**: Spec 011 e constitution V pedem menor solução; reinventar persistência duplicaria 007.

**Alternatives considered**:
- Nova tabela de enriquecimento — rejeitado (já existe em `nfs`).
- Feature só frontend — rejeitado (FR-003/SC-005 exigem rejeição no servidor).

## 2. Onde validar obrigatoriedade de Caixa

**Decision**: Validar no **backend** no `PUT /api/nfs/{id}` (fonte da verdade) e espelhar no **frontend** (toast imediato) nos fluxos Editar e Pagar.

**Regra canônica**:
- Se o estado resultante tiver `data_pagamento` preenchido → `caixa` MUST ser `"corrente"` ou `"investimento"`.
- Se `data_pagamento` for limpo (null) → `caixa` pode voltar a null.
- Estado resultante = merge do registro atual com o payload (`exclude_unset`).

**Rationale**: Clarify Q1 + Q5; evita bypass pela API; UI reduz fricção.

**Alternatives considered**:
- Só frontend — rejeitado (inseguro / incompleto).
- Constraint SQL CHECK com trigger em status — rejeitado (mais complexo; legados quebrariam listagem se CHECK forçar NOT NULL em pagos).
- Endpoint dedicado `/pagar` — rejeitado (já existe PUT allowlist).

## 3. Legados já recebidos sem Caixa

**Decision**: Não migrar; listagem continua; PUT com `data_pagamento` efetivo e `caixa` null → **422** com mensagem clara.

**Rationale**: Clarify Q5 (opção B); FR-012.

**Alternatives considered**:
- Default `corrente` em massa — rejeitado (Clarify A).
- Bloquear listagem — rejeitado (Clarify C).

## 4. Exibição de ausência e rótulos

**Decision**:
- Valores: rótulos **“Corrente”** / **“Investimento”**.
- Ausência: célula **“—”** (ou vazia visualmente equivalente) na listagem; select com opção vazia no formulário.
- CSV/XLSX: exportar `Corrente` / `Investimento` / célula vazia ou `—` (consistente com a tela; não usar “Não definido”).

**Rationale**: Clarify Q3 e Q4; alinha SC-002.

**Alternatives considered**:
- Manter “Não definido” — rejeitado (Clarify).
- Rótulos longos “Conta Corrente” — rejeitado (Clarify B).

## 5. Persistência no sync Maggo

**Decision**: Nenhuma mudança de merge necessária se o código 007 já preserva `caixa` no upsert por `numero`. Validar no quickstart; corrigir só se regressão for encontrada.

**Rationale**: Clarify Q2; FR-009 já coberto pelo padrão “atualizar Maggo, preservar enriquecimento”.

**Alternatives considered**:
- Limpar caixa no sync — rejeitado (Clarify).

## 6. Export XLSX

**Decision**: Incluir coluna **Caixa** no export XLSX de Contas a Receber (append em memória se o template não tiver a coluna), espelhando o CSV.

**Rationale**: FR-010 / SC-007; CSV já exporta; XLSX é o outro canal oficial da página.

**Alternatives considered**:
- Só CSV — rejeitado (dois exports na UI; usuário espera paridade).
- Alterar template em disco — rejeitado (padrão do projeto: preencher em memória).
