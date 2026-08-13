# Research: Contas a Receber — Campos Maggo e Ocean

**Feature**: `018-contas-receber-campos` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

## R-001 — Chave de merge Maggo sem NF

**Decision**: Nova coluna `nfs.maggo_id` (string, unique quando preenchida). Stub envia `maggo_id` estável. Sync casa por `maggo_id`, **não** por `numero`. Manuais ficam com `maggo_id IS NULL`.

**Rationale**: FR-011 — a NF nasce depois; `numero` deixa de identificar o fechamento. Unique parcial (`WHERE maggo_id IS NOT NULL`) permite vários manuais sem id.

**Alternatives considered**:
- Continuar merge por `numero` — incompatível com conta Maggo sem NF (FR-005).
- Chave composta vaga+empresa+data — instável se Maggo corrigir vaga/empresa (FR-011 atualiza esses campos).
- UUID gerado no Ocean — não sobrevive a re-sync se o stub reenviar o mesmo fechamento.

**Backfill**: `UPDATE nfs SET maggo_id = numero WHERE origem = 'maggo' AND maggo_id IS NULL AND numero IS NOT NULL`. Os `MAGGO-00x` atuais passam a ser id da fonte; o `numero` já gravado permanece como NF Ocean (spec: valores antigos viram dados Ocean).

## R-002 — Maggo não grava mais NF / emissão / vencimento

**Decision**: Stub **não envia** `numero`, `data_emissao`, `data_vencimento`. Se ainda mandar, `_sync_maggo_stub` **ignora**. Insert Maggo: `numero`/`data_emissao`/`data_vencimento` = `NULL`, `status` = `pendente`. Update Maggo: só grupo Maggo (`razao_social`, `posicao`, `candidato`, `tipo`, `valor_bruto`, `valor_imposto`, `valor_liquido`, `data_ent_pgto`).

**Rationale**: FR-004 e clarify Q4 — valores Maggo atualizam depois da NF; lado Ocean não é tocado.

**Alternatives considered**:
- Congelar valores após NF — rejeitado na clarify (Q4 = A).
- Apagar `numero` legado no backfill — contradiz “valores antigos permanecem”.

## R-003 — Novos campos Maggo: imposto e data ent. pgto

**Decision**: `nfs.valor_imposto FLOAT NULL` e `nfs.data_ent_pgto DATE NULL`. `NULL` = ausente (UI `—`); `0` é zero válido. Ocean **não** calcula `líquido = bruto − imposto`.

**Rationale**: FR-007/FR-008. Distinguir ausência de zero exige `NULL`, não `0` default.

**Alternatives considered**:
- Reusar módulo Impostos (contas a pagar) — domínio diferente (despesa vs imposto da receita Maggo).
- Coluna `imposto` sem prefixo — colide semanticamente com a tela Impostos; `valor_imposto` na linha da NF é explícito.

## R-004 — Datas Ocean anuláveis

**Decision**: `ALTER` `data_emissao` e `data_vencimento` para `NULL`. Create/update aceitam ausência. `_calcular_status_nf` já trata vencimento `None` como **pendente** (não vencida) — alinhar só o tipo (`date | None`).

**Rationale**: FR-005/FR-015 e clarify Q1. Hoje `nullable=False` impede conta Maggo sem nota.

**Alternatives considered**:
- Sentinel `1900-01-01` — inventa data (quebra FR-005) e polui filtros/relatórios.
- Manter NOT NULL só em manuais — Maggo ainda precisa NULL.

## R-005 — Filtro de período na listagem

**Decision**: Em `GET /api/nfs` (e export XLSX da página), a data de referência do filtro mês/ano é `COALESCE(data_emissao, data_ent_pgto, criado_em::date)`. Dashboard, Relatórios, metas e DRE **continuam** em `data_emissao` (receita faturada). Conta Maggo sem emissão **não** entra no faturamento até a Ocean lançar a emissão.

**Rationale**: Sem isso, filtro atual por `data_emissao` **esconde** contas Maggo novas (FR-005/FR-014). Mudar DRE/relatórios nesta feature inflaria o escopo (constitution V).

**Alternatives considered**:
- Incluir `data_emissao IS NULL` em todo mês — a mesma conta apareceria em todos os filtros.
- Só `criado_em` — ignora a data de negócio Maggo (`data_ent_pgto`).

## R-006 — Allowlist PUT Maggo vs Ocean

**Decision**: Separar conjuntos:

| Grupo | Campos | Maggo PUT | Manual PUT |
|-------|--------|-----------|------------|
| Maggo RO | `razao_social`, `posicao`, `candidato`, `valor_bruto`, `valor_imposto`, `valor_liquido`, `tipo`, `data_ent_pgto` | 422 se enviados | editáveis |
| Ocean | `numero`, `data_emissao`, `data_vencimento`, `data_pagamento`, `caixa`, colaboradores, `arquivada` | **permitidos** | permitidos |

Hoje `_CAMPOS_NEGOCIO` inclui `numero`/`data_emissao`/`data_vencimento` e bloqueia Maggo — isso **inverte** a spec.

**Rationale**: FR-002/FR-003. NF e datas da nota passam a ser Ocean.

**Alternatives considered**:
- Endpoint novo `/api/nfs/{id}/ocean` — churn desnecessário; o PUT atual basta com allowlist nova.

## R-007 — Create manual: schema e validação

**Decision**: `NFCreate`: obrigatórios só `razao_social`, `tipo`, `valor_bruto`, `valor_liquido`. `data_emissao`/`data_vencimento`/`numero`/`posicao`/`valor_imposto`/`data_ent_pgto` opcionais. Se `numero` preenchido → exigir `data_emissao` (422). Recebido → Caixa + `data_pagamento` (regra vigente).

**Rationale**: Clarify Q2 e Q3. Pydantic hoje exige as duas datas — bloqueia o create novo.

**Alternatives considered**:
- Default `date.today()` nas datas — inventa emissão/vencimento (quebra FR-005 no manual).

## R-008 — Nomes de coluna vs rótulos

**Decision**: **Não** renomear `razao_social` → empresa nem `posicao` → vaga nem `tipo` → método. Só rótulos na UI: Empresa, Vaga, Método de pagamento. API continua com os nomes atuais + `valor_imposto` e `data_ent_pgto`.

**Rationale**: Relatórios, bônus, e-mail e Excel já usam `razao_social`/`posicao`. Rename é migração sem ganho de negócio.

**Alternatives considered**:
- Alias Pydantic `empresa` — dois nomes no contrato; risco de clientes internos (frontend) divergirem.

## R-009 — Stub Maggo (contrato desta entrega)

**Decision**: Shape do stub:

- Envia: `maggo_id`, `razao_social`, `posicao`, `candidato?`, `valor_bruto`, `valor_imposto?`, `valor_liquido`, `data_ent_pgto?`, `tipo` + `tipo_abertura_fechamento` (semântica antiga; `_parse_tipo_maggo` grava oficial — 017).
- Não envia (ou é ignorado): `numero`, `data_emissao`, `data_vencimento`.
- Manter ids `MAGGO-001`…`MAGGO-005` para casar o backfill; incluir ao menos **um** id novo (`MAGGO-006`) sem linha prévia → nasce sem NF.

**Rationale**: Maggo real continua fora de escopo; o stub precisa exercitar FR-005 e FR-011.

## R-010 — UI: grupos e listagem

**Decision**: Modal em dois blocos (Dados Maggo / Dados Ocean). NF e data de emissão **adjacentes** no bloco Ocean. Listagem: colunas mínimas da FR-014; rótulos novos; `—` para nulos; export CSV/XLSX inclui imposto e data ent. pgto. `negocioEditavel` deixa de controlar NF/emissão/vencimento — esses ficam editáveis no Maggo para o admin.

**Rationale**: FR-010/FR-014. Sem OCR/pasta (out of scope).

## Resolução de NEEDS CLARIFICATION

Nenhum item do Technical Context ficou como NEEDS CLARIFICATION. Clarify (4 Qs) + decisões R-001–R-010 cobrem id Maggo, datas nulas, filtro de período e allowlist.
