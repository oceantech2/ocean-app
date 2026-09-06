# Research: NF — Conflito de Duplicidade entre Origens

**Feature**: `053-nf-duplicidade-origem` | **Date**: 2026-09-06

## 1. Unicidade no banco vs. regra de negócio por origem

**Decision**: Manter `UNIQUE` em `nfs.numero` (já existente). Não migrar para unique composto `(numero, origem)`.

**Rationale**: Após clarify, a regra efetiva é: no máximo um registro por número **por origem** **e** o mesmo número **não** pode existir em duas origens. Isso implica no máximo **um** registro por número no sistema — o UNIQUE global continua correto e cobre corrida (IntegrityError → 409).

**Alternatives considered**:
- Unique composto `(numero, origem)` — permitiria Manual+Maggo com o mesmo número, o que a spec proíbe.
- Remover UNIQUE e validar só em aplicação — pior sob concorrência; rejeitado.

## 2. Classificação de conflito

**Decision**: Estender `nf_duplicidade.py` com lookup que compara `origem` da NF existente com a origem da operação:

| Situação | Código / motivo | Comportamento |
|----------|-----------------|---------------|
| Número livre | — | Prosseguir |
| Mesmo número, mesma origem, **criação** de outro id | `NF_NUMERO_DUPLICADO` | 409 + atalho |
| Mesmo número, mesma origem, **reenvio/merge** (Maggo por `maggo_id` / import `on_conflict=update`) | — | Atualizar conforme fluxo existente |
| Mesmo número, **origem diferente** | `NF_NUMERO_ORIGEM_CONFLITO` | 409 (formulário) ou rejeição no lote (import/sync) |

**Rationale**: UI e testes precisam distinguir “já cadastrei nesta origem” de “essa nota já veio da outra fonte”.

**Alternatives considered**: Um único código 409 para ambos — rejeitado (spec exige feedback distinto).

## 3. Origem da importação XLSX

**Decision**: Novos registros da importação XLSX recebem `origem="manual"`. Conflitos com NF existente `manual` → entram no fluxo `on_conflict` (reject/update). Conflitos com NF existente `maggo` → sempre rejeitados (`motivo: conflito_origem`), **sem** exigir nem aplicar `on_conflict`.

**Rationale**: Import é ação administrativa do admin, alinhada ao create manual (012). Atualizar Maggo via arquivo importado seria sobrescrita cruzada de origem — proibida pela spec.

**Alternatives considered**:
- Import como `maggo` — inconsistente com create manual.
- `on_conflict=update` também em Maggo — viola FR-005b.

## 4. Quando exigir `on_conflict` no import

**Decision**: `NF_IMPORT_ON_CONFLICT_REQUIRED` (422) **somente** se houver ao menos um conflito de **mesma origem** (número já em NF `manual`) e `on_conflict` ausente. Conflitos só de origem diferente **não** disparam o 422; o import segue e registra essas linhas em `erros` com `conflito_origem`.

**Rationale**: Clarify Q2 — escolha rejeitar/atualizar só para mesma origem.

**Alternatives considered**: Exigir `on_conflict` para qualquer número já existente — rejeitado pela clarify.

## 5. Sync Maggo — feedback

**Decision**: Continuar reportando colisões no header `X-Ocean-Maggo-Ignorados` (já usado). Garantir que a detecção cubra: (a) `maggo_id` apontando registro manual; (b) tentativa de gravar/associar **número** que já existe em origem `manual` (quando o stub/payload tiver número). Sem toast dedicado e sem notificação persistente. UI pode exibir resumo discreto na página se o header vier preenchido (opcional, não bloqueante); o “resultado do sync” canônico é o diagnóstico do sync (header / lista de ignorados), não um canal novo.

**Rationale**: Clarify Q3 — apenas resultado do sync/lote.

**Alternatives considered**: Toast ao listar; fila de notificações — fora do escopo.

## 6. Relação com a feature 013

**Decision**: Esta feature **estende** 013, não a remove. Reusar trim, atalho “Abrir existente”, diálogo reject/update, mapeamento IntegrityError. Acrescentar código/mensagem de conflito de origem e separar conflitos no import.

**Rationale**: Clarify e FR-009.

## 7. Dados históricos

**Decision**: Não listar nem corrigir pares históricos. Se já existirem (improvável sob UNIQUE), ficam fora do escopo; novas escritas continuam bloqueadas pela validação + UNIQUE.

**Rationale**: Clarify Q4.

## 8. Número vazio / opcional

**Decision**: Número vazio após trim → sem checagem de duplicidade/origem (comportamento atual de `garantir_numero_livre`). Conflito só se aplica a número preenchido.

**Rationale**: Contas a receber podem ter NF opcional (016); não mudar isso aqui.
