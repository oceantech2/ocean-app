# Research: Contas a Receber — Inserção Manual

**Feature**: `012-contas-receber-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md)

## 1. Baseline vs gap

**Decision**: Tratar 012 como **fechamento do cadastro manual** sobre Contas a Receber (007/011), não como módulo novo.

**Estado atual (baseline observado)**:
- `POST /api/nfs` e UI `abrirCriar` / “Nova receita” existem em WIP.
- Create **não** envia `caixa` / `data_pagamento`; formulário ainda inclui posição/candidato/colaboradores na criação.
- Não há campo `origem`; sync Maggo **sobrescreve** campos de negócio de qualquer linha com o mesmo `numero`.
- `NFUpdate` é allowlist de enriquecimento (+ número via 013); edição plena de manuais incompleta.
- Coluna Origem ausente; CTA não é o canônico “Nova conta a receber”.
- Import Excel pode aparecer no WIP de 013 — **fora do escopo** desta feature (FR-002).

**Rationale**: Spec + constitution V pedem a menor solução; reaproveitar `nfs` e rotas existentes.

**Alternatives considered**:
- Tabela `contas_receber_manuais` separada — rejeitado (duplica modelo e quebra Dashboard/export).
- Só frontend sem `origem` — rejeitado (FR-007/FR-014/FR-009 exigem distinção no servidor).

## 2. Persistência de origem

**Decision**: Coluna `nfs.origem VARCHAR(20) NOT NULL` com valores `manual` | `maggo`.

| Evento | `origem` |
|--------|----------|
| `POST` criação manual | `manual` |
| Upsert Maggo cria linha nova | `maggo` |
| Linhas legadas sem valor | Backfill `maggo` no `ALTER`/startup (eram só da fonte externa) |

**Rationale**: Clarify Q5 + FR-007/FR-009/FR-014; um atributo explícito evita heurísticas frágeis.

**Alternatives considered**:
- Inferir origem por “não está no stub” — rejeitado (stub muda; colisão e edição ficam ambíguas).
- Boolean `manual` — rejeitado (menos extensível; strings alinhadas aos rótulos UI).

## 3. Merge Maggo × manual (colisão)

**Decision**: Em `_sync_maggo_stub`, se existir `nfs` com mesmo `numero` e `origem == manual`:
1. **Não** atualizar campos de negócio nem “converter” origem.
2. Registrar o `numero` em lista de colisões da requisição.
3. Expor aviso opcional ao admin via header de resposta da listagem, ex.: `X-Ocean-Maggo-Ignorados: NUM1,NUM2` (FR-014 MAY).
4. Se existir com `origem == maggo` (ou legado backfill), manter comportamento atual de update Maggo + preservar enriquecimento Ocean.

**Rationale**: Clarify Q1 (manual prevalece).

**Alternatives considered**:
- Maggo sobrescreve manual — rejeitado (Clarify).
- Erro 502 na listagem — rejeitado (bloqueia o módulo por um número).
- Duplicar com sufixo — rejeitado (Clarify e unicidade de `numero`).

## 4. Create: pagamento Pendente | Recebido

**Decision**:
- UI: select **Pendente** | **Recebido** (rótulos canônicos).
- Persistência: **Recebido** ⇒ `data_pagamento` obrigatória + `caixa` ∈ {corrente, investimento} + `status` derivado `paga`; **Pendente** ⇒ `data_pagamento` null, `caixa` opcional/null, `status` via regra existente (`pendente`/`vencida`).
- Backend `POST`: validar a mesma regra de Caixa do PUT (011); rejeitar 422 se Recebido sem caixa/data.

**Rationale**: Clarify Q3/Q4; reutiliza `_calcular_status_nf` e mensagem de Caixa já existente.

**Alternatives considered**:
- Só status sem `data_pagamento` — rejeitado (domínio e Fluxo/Dashboard usam data).
- Criação sempre pendente — rejeitado (Clarify A).

## 5. Campos do formulário de criação

**Decision**: Create expõe apenas: NF, razão social, valor bruto, valor líquido, data emissão, vencimento, tipo, pagamento (Pendente|Recebido), e se Recebido: data pagamento + Caixa. **Sem** posição, candidato, colaboradores no create (edição depois).

**Rationale**: Clarify Q4.

**Alternatives considered**:
- Formulário completo igual ao legado “Nova NF” — rejeitado (Clarify).

## 6. PUT por origem

**Decision**:
- `origem == maggo`: manter allowlist de enriquecimento (caixa, data_pagamento, colaboradores, arquivada; número via política 013 se já existir).
- `origem == manual`: permitir também campos de negócio do create (razao_social, valores, datas, tipo, etc.), além do enriquecimento; validar Caixa se Recebido; unicidade de `numero`.

**Rationale**: FR-009 / FR-010.

**Alternatives considered**:
- Allowlist única igual para todos — rejeitado (impede correção de manuais ou abre Maggo à divergência).
- Endpoint `POST` só + sem editar negócio — rejeitado (US3).

## 7. CTA e import

**Decision**: CTA/modal **“Nova conta a receber”**. Nesta feature **não** expor Importar Excel/CSV (FR-002/FR-011). Se o WIP de 013 tiver reintroduzido o botão, 012 remove/oculta na superfície Contas a Receber até política explícita de outra feature.

**Rationale**: Clarify Q2 + Out of Scope da 012.

**Alternatives considered**:
- Manter “Nova receita” — rejeitado (Clarify C).
- Aceitar import nesta entrega — rejeitado (FR-002).

## 8. Resiliência Maggo down

**Decision**: Se stub falhar (502), ainda assim permitir operação sobre registros já no Ocean **quando fizer sentido no produto**. Pragmática recomendada: endpoints `POST`/`PUT` **não** dependem do stub; só `GET` listagem que chama `_sync_maggo_stub` falha hoje com 502. Para atender edge “listar manuais com Maggo down”: em falha do stub, **não** abortar a listagem — retornar query em `nfs` e feedback toast de “fonte Maggo indisponível” (warning), em vez de 502 total. Isso alinha FR edge case da spec.

**Rationale**: Spec edge case; manuais não devem ficar inacessíveis.

**Alternatives considered**:
- Manter 502 total — rejeitado (bloqueia manuais).
- Endpoint separado só manuais — rejeitado (complexidade desnecessária).
