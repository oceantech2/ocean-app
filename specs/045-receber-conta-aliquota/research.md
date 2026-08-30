# Research: Contas a Receber — Conta, Alíquota e cards líquidos

**Feature**: `045-receber-conta-aliquota` | **Date**: 2026-08-29  
**Spec**: [spec.md](./spec.md)

## R1 — Fórmula de Impostos e Líquido

**Decision**: `imposto = round(bruto × (alíquota / 100), 2)`; `líquido = round(bruto − imposto, 2)`.

**Rationale**: Confirmado na clarify 2026-08-29 (opção A). O texto original `Bruto × (1 − Alíquota)` descreve o **líquido**, não o imposto. Alinhado ao domínio fiscal e ao card **Líquido Recebido** já existente.

**Alternatives considered**:
- Texto literal `Impostos = Bruto × (1 − Alíquota)` — rejeitado (inverte imposto e líquido).
- Recalcular imposto a partir de líquido digitado — rejeitado (campos somente conferência).

## R2 — Persistência de Alíquota

**Decision**: Nova coluna `nfs.aliquota_imposto` (FLOAT NULL, percentual 0–100). Gravar na criação/edição junto com `valor_imposto` e `valor_liquido` recalculados.

**Rationale**: Spec FR-010 exige alíquota no momento do salvamento; edição futura precisa reabrir o percentual usado. Registros legados ficam `NULL` (sem recálculo em massa).

**Alternatives considered**:
- Derivar alíquota só na UI (`imposto/bruto`) — rejeitado (impreciso após arredondamento; Maggo pode ter imposto sem alíquota).
- Usar alíquota mensal da página Impostos — fora de escopo (spec Out of Scope).

## R3 — Autoridade do cálculo (backend vs frontend)

**Decision**: Frontend recalcula em tempo real para UX; **backend recalcula e sobrescreve** `valor_imposto`/`valor_liquido` quando `valor_bruto` e/ou `aliquota_imposto` vêm no POST/PUT, recusando alíquota &lt; 0 ou &gt; 100.

**Rationale**: Impostos/Líquido não são editáveis; evita inconsistência via API direta. Cliente pode omitir imposto/líquido no body — servidor preenche.

**Alternatives considered**:
- Confiar nos valores enviados pelo cliente — rejeitado (bypass da regra somente conferência).
- Validar igualdade estrita com tolerância — aceitável como teste, mas recalcular no servidor é mais simples.

## R4 — Campo Conta na criação pendente

**Decision**: Persistir `nfs.caixa` (codigo corrente ativa) **sempre** na criação/edição, independente de `data_pagamento`. Pré-seleção UI = **slot 1** (primeira corrente ativa na ordem `padrao DESC, nome ASC`, mesma lista da API/Dashboard); se slot vazio, `codigo_padrao`.

**Rationale**: Spec FR-001–FR-003. Hoje `criar_nf` zera `caixa` quando pendente (`caixa = None`); `atualizar_nf` limpa `caixa` ao remover pagamento — ambos devem mudar para manter destino escolhido.

**Alternatives considered**:
- Manter `caixa` só ao receber — rejeitado (contradiz spec).
- Nome literal “Conta Corrente 1” no banco — rejeitado; slot posicional + rótulo fallback já usado no Dashboard (040).

## R5 — Cards Pendente / Vencido

**Decision**: Apenas frontend: rótulos **Líquido Pendente** / **Líquido Vencido**; valores de `resumo.total_liquido_pendente` e `resumo.total_liquido_vencido`.

**Rationale**: Endpoint `GET /api/nfs/resumo` já retorna ambos os pares bruto/líquido; frontend usa bruto nos dois cards amarelos/vermelhos. Backend não precisa mudar.

**Alternatives considered**:
- Remover campos `total_bruto_pendente/vencido` da API — rejeitado (quebra compatibilidade desnecessária).

## R6 — UI Impostos e Valor líquido

**Decision**: Inputs `readOnly` + `disabled` (estilo `INPUT_RO` já usado para campos Maggo), atualizados por `useEffect`/`onChange` de bruto/alíquota. Remover `onChange` editável de imposto/líquido.

**Rationale**: Spec FR-006; padrão visual já existe na página. Edição Maggo hoje permite digitar imposto/líquido — deve alinhar à mesma regra.

**Alternatives considered**:
- Substituir por `<span>` formatado — válido, mas input read-only mantém grid do formulário.

## R7 — Conta Corrente 1 vs padrão

**Decision**: Helper `codigoSlot1(contas)` = `contas.filter(ativo)[0]?.codigo` na ordem recebida da API; fallback `codigoPadrao(contas)`. Label exibido = `nome` da conta (pode ser “Conta Corrente 1” ou nome cadastrado).

**Rationale**: Dashboard usa `contasCc[n-1]` para slots 1–3 (spec 040). Slot 1 = primeira corrente ativa na listagem.

**Alternatives considered**:
- Buscar por `nome === 'Conta Corrente 1'` — frágil se usuário renomear; slot posicional é o contrato do produto.
