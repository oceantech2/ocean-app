# Research: Comissões vinculadas à Conta a receber

**Feature**: `045-comissoes-conta-receber` | **Date**: 2026-08-29

## R1 — Origem do cadastro: sync no save da NF

**Decision**: Incluir array opcional `comissoes` em `POST /api/nfs` e `PUT /api/nfs/{id}`. Serviço `comissoes_sync.sincronizar(db, nf, linhas, user)` roda na mesma transação após persistir a NF.

**Rationale**: Garante vínculo atômico conta↔linhas; evita orphan records; atende FR-001/FR-006. Padrão similar a sync de anexos já acoplado à rota NF.

**Alternatives considered**:
- CRUD separado `/api/nfs/{id}/comissoes` chamado pelo frontend após save → rejeitado (duas transações; risco de conta sem comissão se segundo call falhar).
- Criar comissões só via `POST /api/bonus` → rejeitado (spec exige fluxo único na conta).

## R2 — FK `nf_id` vs `numero_nf` legado

**Decision**: Coluna `bonus.nf_id` (FK nullable `nfs.id`). Manter `numero_nf`, `cliente`, `posicao` para registros antigos. Novos registros preenchem `nf_id`; campos legados podem ser derivados da NF no GET ou deixados nulos.

**Rationale**: Editar pela conta exige ID estável; `numero_nf` string é frágil (duplicidade, NF sem número). Legado sem FK continua listável (spec edge case).

**Alternatives considered**:
- Só `numero_nf` → rejeitado (contas manuais sem número; exclusão soft da NF).
- Tabela nova `comissoes` → rejeitado (YAGNI; quebra relatórios `/api/relatorios/bonus-mensal`).

## R3 — Atividade multi-seleção (substitui Etapa)

**Decision**: Coluna `bonus.atividades` tipo `TEXT` com JSON array ordenado, ex.: `["lead","venda"]`. Valores canônicos: `lead`, `venda`, `conducao`, `placement`. UI rótulo **Atividade**; coluna `etapa` permanece para legado (leitura: se `atividades` vazio, exibir `[etapa]` migrada visualmente).

**Rationale**: Multi-select na spec; JSON simples sem tipo PG extra; validação Pydantic com `Literal` + lista.

**Alternatives considered**:
- Tabela N:N `bonus_atividades` → rejeitado (4 valores fixos; over-engineering).
- CSV separado por vírgula → rejeitado (ordem/validação piores que JSON).

## R4 — Cálculo de `valor_bonus`

**Decision**: Servidor recalcula `(percentual / 100) * nf.valor_liquido` em create/sync e quando `valor_liquido` muda no PUT da NF — **apenas** linhas com `liberado = false`. Cliente exibe preview read-only; payload não aceita `valor_bonus` editável em sync.

**Rationale**: FR-004; impede divergência; linhas liberadas congelam valor (spec edge case).

**Alternatives considered**:
- Cálculo só no frontend → rejeitado (não auditável; bypass via API).
- Recalcular liberadas → rejeitado (spec proíbe).

## R5 — Fornecedor vs `colaborador_id`

**Decision**: Manter FK `colaborador_id` → `colaboradores`. UI lista `GET /api/colaboradores?ativo=true` (todos fornecedores ativos). Rótulo **Fornecedor**. Filtro da página Comissões renomeado de “pessoa da equipe” para **Fornecedor**.

**Rationale**: Spec 043 unificou cadastro; coluna DB não precisa rename. Relatórios existentes seguem funcionando.

**Alternatives considered**:
- Renomear coluna para `fornecedor_id` → rejeitado (migração desnecessária).
- Restringir a `elegivel_equipe` → rejeitado (spec: qualquer fornecedor ativo).

## R6 — Ciclo Liberado → Pago

**Decision**: Colunas `liberado BOOLEAN`, `pago BOOLEAN`, `data_liberacao DATE`, `data_pagamento DATE`. Transições: pendente → liberar → liberada → pagar → paga. `Pagar` exige `liberado=true` e `pago=false`. Datas preenchidas automaticamente (hoje UTC/date local do servidor) sem modal extra (assumption clarify).

**Rationale**: Alinhado a Contas a Pagar (duas etapas) e respostas Q1/Q2 do clarify. Mais simples que modal de data nesta versão.

**Alternatives considered**:
- Só flags sem data → rejeitado (auditoria fraca).
- Pago automático ao receber conta → rejeitado (clarify Q1 = A).

## R7 — Ações em massa

**Decision**: Endpoints dedicados:

- `POST /api/bonus/acoes/liberar` body `{ "ids": [1,2,3] }`
- `POST /api/bonus/acoes/pagar` body `{ "ids": [...] }`

Resposta `{ "processados": n, "ignorados": n }`. Mesma regra de elegibilidade das ações individuais; confirmação no UI antes do POST.

**Rationale**: FR-013a–d; evita N requests; feedback de contagem explícito.

**Alternatives considered**:
- Loop de PUT no cliente → rejeitado (lento; sem contagem atômica).
- PATCH genérico `{ acao, ids }` → rejeitado (menos explícito nos contratos).

## R8 — Editar na página Comissões

**Decision**: Botão **Editar** faz `navigate('/nfs?edit=' + nf_id)`. `NFs.tsx` lê query param no mount/`useSearchParams`, abre modal de edição da conta com bloco de comissões. Sem `nf_id`: toast “Sem Conta a receber associada”.

**Rationale**: FR-007; reutiliza formulário único; rota existente `/nfs` (Contas a Receber).

**Alternatives considered**:
- Modal duplicado em Bonus.tsx → rejeitado (dois formulários; drift).
- Nova rota `/contas-receber/:id/comissoes` → rejeitado (fora do padrão atual).

## R9 — Remover Deletar da UI

**Decision**: Remover botão e `bonusService.deletar` do frontend. Manter `DELETE /api/bonus/{id}` no backend (import CSV legado / scripts); não documentar como fluxo de usuário.

**Rationale**: FR-008; escopo mínimo; importação fora desta feature.

## R10 — Ocultar comissões de NF excluída

**Decision**: `GET /api/bonus` faz join/filter: excluir linhas cujo `nf_id` aponta para NF com `excluida_em IS NOT NULL`. Legado sem `nf_id` permanece visível.

**Rationale**: Edge case spec (exclusão conta a receber).

## R11 — Coluna Liberado na UI agrupada

**Decision**: Por **grupo de fornecedor**, uma célula (cabeçalho ou coluna com `rowSpan`) exibe `Σ valor_bonus` das linhas `liberado=true` **no recorte filtrado** (mesma lógica de mês/trimestre do 044). Por linha: badge **Pago** / Pendente.

**Rationale**: Spec FR-011/FR-012; “de cada um” = cada fornecedor no agrupamento.

## R12 — Migração inline

**Decision**: `ALTER TABLE bonus ADD COLUMN IF NOT EXISTS ...` em `_migrar()` de `main.py`, padrão 043. Backfill: `atividades = json_build_array(etapa)` onde `etapa` preenchido e `atividades` nulo.

**Rationale**: Projeto não usa Alembic; `create_all` + inline migrations é o padrão vigente.

## R13 — Default Mês/Ano na nova linha

**Decision**: Ao adicionar linha no formulário da conta, default **mês/ano civil corrente** (editável). Não derivar automaticamente da data de vencimento da NF nesta versão.

**Rationale**: Outstanding do clarify (baixo impacto); default previsível; evita surpresa se vencimento for outro mês.
