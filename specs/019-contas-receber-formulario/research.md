# Research: Contas a Receber — Subtítulo, Recebido e Caixa oculta

**Feature**: `019-contas-receber-formulario` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

## R-001 — Título e Subtítulo reusam colunas existentes

**Decision**: **Título** = `nfs.posicao` (vaga). **Subtítulo** = `nfs.razao_social` (empresa). Sem coluna nova. Rótulos só na UI de Contas a Receber. `candidato` **não** é o subtítulo e não muda.

**Rationale**: Clarify Q1. Constitution V — menor mudança. Create já exige `razao_social`; `posicao` já é opcional.

**Alternatives considered**:
- Campo texto novo `subtitulo` — duplica empresa (rejeitado na clarify).
- Reusar `candidato` como subtítulo — contradiz Q1.

## R-002 — Caixa: forçar corrente só na transição de recebimento

**Decision**: Sem `ALTER` / backfill. Regras:

| Evento | Caixa |
|--------|-------|
| POST com `data_pagamento` (criação já recebida) | gravar **`corrente`** (ignorar valor enviado) |
| PUT em que `data_pagamento` passa de `NULL` → preenchido | gravar **`corrente`** |
| PUT **sem** `data_pagamento` no body (edição de NF/vencimento/título) | **não** alterar `caixa` |
| PUT que só muda a data de uma conta **já** recebida | **não** alterar `caixa` (não é transição) |
| Pendente → Recebido de novo (pagamento era `NULL`) | **`corrente`** |

Backend deixa de devolver 422 “Caixa obrigatória” nesse fluxo: se há pagamento novo e Caixa ausente/investimento no payload, persiste **corrente**. Cliente **não** escolhe investimento.

Frontend: no modal Recebido e no create/edit que **transiciona** para Recebido, enviar `caixa: 'corrente'`. Nas demais edições, **omitir** `caixa` do PUT (`exclude_unset`).

**Rationale**: Clarify Q3 + FR-007 + US3.7. “Pode deixar salvo” = legado investimento permanece até o próximo recebimento.

**Alternatives considered**:
- Migrar todas para corrente — rejeitado (Q3 = B).
- Qualquer save força corrente — quebraria US3.7.
- Continuar exigindo Caixa do usuário — contradiz FR-004/FR-006.

## R-003 — Colaboradores: omitir do payload, não enviar null

**Decision**: Remover Lead/Condução/Placement só da UI. No PUT, **não incluir** `colaborador_lead_id`, `colaborador_conducao_id`, `colaborador_placement_id`. Hoje o form envia `null` quando o select está vazio — isso **apagaria** vínculos (quebra FR-008).

**Rationale**: `NFUpdate` usa `exclude_unset`; campos omitidos não são escritos.

**Alternatives considered**:
- Enviar os IDs atuais hidden — desnecessário se omitir.
- Soft-delete no backend — fora de escopo.

## R-004 — Listagem: uma célula Título + Subtítulo

**Decision**: Substituir as colunas **Vaga** e **Empresa** por uma coluna (cabeçalho **Título**): linha 1 = `posicao` em destaque; linha 2 = `razao_social` menor/secundário. `posicao` vazia → `—` na linha 1; subtítulo sempre o cliente. Ordenação dessa coluna: por `posicao` (título); desempate visual irrelevante.

Export CSV da página: duas colunas **Título** e **Subtítulo** (arquivo tabular, não a célula). Sem coluna Caixa.

**Rationale**: Clarify Q2. Célula única é só apresentação; export separado evita perder empresa no Excel.

**Alternatives considered**:
- Duas colunas renomeadas — rejeitado (Q2 = B).
- Só mudar o modal — rejeitado.

## R-005 — Ação Recebido e modal só com data

**Decision**: `title` / `aria-label` / título do modal / botão confirmar usam vocabulário **Recebido** (não Pagar / Confirmar Pagamento). Modal: único input = data de pagamento (default hoje, como já faz `abrirPagar`). PUT `{ data_pagamento, caixa: 'corrente' }`. Sem select de Caixa. Contas paga/cancelada/arquivada continuam com a ação desabilitada.

**Rationale**: FR-003/FR-004/FR-011.

**Alternatives considered**:
- Manter “Registrar Pagamento” — vocabulário de contas a pagar.
- Exigir data sem default — pior UX; o default hoje já existe.

## R-006 — Export XLSX da página também sem Caixa

**Decision**: O CSV client-side (`exportar` em `NFs.tsx`) omite Caixa e usa Título/Subtítulo. O XLSX `GET /api/nfs/exportar-xlsx` (botão da mesma página) **omite** a coluna Caixa acrescentada em `excel_io.py`. Colunas lead/condução/placement do template XLSX **permanecem** (export oficial ≠ formulário; spec só tira Caixa da apresentação desta página e não pede remover colaboradores do XLSX).

**Rationale**: FR-006 cita “exportação gerada a partir desta página”. Fluxo de Caixa / Relatórios fora.

**Alternatives considered**:
- Só CSV — o admin também usa o XLSX da página.
- Remover colaboradores do XLSX — fora da spec (só o form).

## R-007 — Candidato e outras telas

**Decision**: Campo **Candidato** na edição permanece como está (grupo Maggo, fora da criação). Dashboard, Relatórios, DH, Calendário, Fluxo de Caixa **não** são alterados (continuam “vaga/empresa” se já usam esses nomes).

**Rationale**: Spec Out of Scope + “Candidato não muda”.
