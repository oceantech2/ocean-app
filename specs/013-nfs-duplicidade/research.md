# Research: Validação de Duplicidade de NFs

**Feature**: `013-nfs-duplicidade` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md)

## Contexto do código atual

- Tabela `nfs`: coluna `numero` já é `unique=True` (SQLAlchemy / PostgreSQL).
- `POST /api/nfs` e `POST /api/nfs/importar-xlsx` retornam **403** (escrita local desabilitada; fonte Maggo).
- `PUT /api/nfs/{id}` usa allowlist de enriquecimento (pagamento, caixa, colaboradores, arquivada) — **não** altera `numero` hoje.
- Sync Maggo (`_sync_maggo_stub`) faz merge por `numero` (update ou insert); não cria segundo registro.
- `parse_nfs_xlsx` gera sufixos `-2`, `-3`… para números repetidos no arquivo — **contraria** a spec 013 (primeira linha vale; demais rejeitadas).
- Spec **012** reabilita criação manual e edição de campos de negócio (incl. número) em origem manual; rejeita duplicidade de forma genérica; mantém import **fora** da 012.
- Spec **013** detalha bloqueio com atalho e política de import (rejeitar vs atualizar por lote).

---

## R1 — Escopo vs. 012 (criação manual) e importação

**Decision**: Tratar 013 como camada de **unicidade + UX de conflito** sobre a entidade `NF` / Contas a Receber.

- **P1 (formulário)**: depende da criação/edição de número reabilitada pela **012** (ou implementação conjunta). 013 especifica o contrato de erro (409 + id da NF existente + atalho na UI).
- **P2 (importação)**: 013 **reintroduz** importação XLSX de NFs com escolha por lote rejeitar/atualizar. Isso **amplia** o que a 012 deixou de fora; a política de 013 prevalece para o fluxo de import.

**Rationale**: Sem create/edit de número, P1 não é testável. Sem reabilitar import, P2 fica código morto; a clarify da 013 pediu explicitamente a escolha do lote.

**Alternatives considered**:
- Só validar create (deixar import 403) — rejeitado (FR-005–009 / US3).
- Implementar 013 sem 012 — inviável para P1; coordenar ordem: 012 primeiro ou mesmo release.

---

## R2 — Critério de igualdade e normalização

**Decision**: Comparar `numero.strip()` apenas. Persistir o valor já com trim no create/update/import. Não remover zeros à esquerda; não case-fold.

**Rationale**: Confirmado no clarify (Q5). Alinha ao unique textual do banco.

**Alternatives considered**:
- Equivalência numérica / zeros à esquerda — rejeitado no clarify.
- Case-insensitive — rejeitado no clarify.

**Nota Excel**: células numéricas no openpyxl podem chegar como `float` e hoje viram `str(int(...))`, o que remove zeros à esquerda **na origem do arquivo**. Manter esse comportamento de parsing de célula numérica (já existente); a regra “só trim” aplica-se ao valor textual já parseado. Números importados como texto preservam zeros.

---

## R3 — Erro de duplicidade no formulário (API + UI)

**Decision**:
- Antes de insert/update que altere `numero`, consultar NF existente por `numero` trimado (excluindo o próprio `id` no update).
- Resposta **409 Conflict** com `detail` estruturado, ex.:
  ```json
  {
    "code": "NF_NUMERO_DUPLICADO",
    "message": "Já existe uma conta a receber com este número.",
    "nf_id": 42,
    "numero": "12345",
    "razao_social": "Cliente X"
  }
  ```
- Capturar também `IntegrityError` (corrida) e mapear para o mesmo 409 (lookup do existente após rollback parcial / nova query).
- UI: toast/mensagem + botão/link “Abrir existente” que fecha o formulário atual (ou mantém) e chama `abrirEditar` / carrega a NF pelo `nf_id` no modal da mesma página.

**Rationale**: Padrão semelhante ao CPF em colaboradores (400 antecipado), mas 409 é semanticamente melhor para conflito de recurso; payload com `nf_id` viabiliza FR-004 sem segunda busca frágil só por número.

**Alternatives considered**:
- Só confiar no unique do banco + 500 genérico — rejeitado (UX).
- 400 como colaboradores — aceitável, mas 409 comunica conflito de unicidade com mais clareza.

---

## R4 — Edição de número

**Decision**: Validação de duplicidade no `PUT` somente quando o payload incluir `numero` (registros manuais, pós-012). Registros Maggo continuam sem permitir alterar `numero`. Auto-conflito (mesmo id) ignorado.

**Rationale**: Spec 012 + FR-003 da 013.

**Alternatives considered**: Sempre permitir editar número em qualquer NF — rejeitado pela 012.

---

## R5 — Importação: escolha por lote e duplicidade no arquivo

**Decision**:
1. Remover geração de sufixos `-2`, `-3` em `parse_nfs_xlsx` (ou pós-processar): manter número base; marcar ocorrências >1 como rejeitadas por duplicidade interna **antes** de persistir.
2. Fluxo em duas fases (ou um request com parâmetro):
   - **Preview / dry-run** (opcional mas recomendado): retorna contagem de novos, conflitos com cadastro, duplicatas internas.
   - **Commit**: body/query `on_conflict: "reject" | "update"`.
   - Se houver conflitos com cadastro e `on_conflict` ausente → **400/422** pedindo a escolha (UI pergunta antes de reenviar).
   - Se não houver conflitos com cadastro → importar sem exigir `on_conflict`.
3. Duplicatas internas: sempre **primeira linha processada**; demais → `erros` / status `duplicado_arquivo` (nunca atualizam a primeira).
4. `on_conflict=reject`: linhas com número já no DB → não insert/update; reportar rejeitadas.
5. `on_conflict=update`: upsert por `numero` nos campos de negócio do arquivo; **preservar** enriquecimento Ocean (pagamento, caixa, colaboradores, arquivada) salvo se o template trouxer esses campos explicitamente (padrão Maggo merge: preservar Ocean).
6. Reabilitar `POST /api/nfs/importar-xlsx` para admin; UI Contas a Receber / NFs: ImportCSV ou fluxo XLSX com modal de escolha.

**Rationale**: Clarify Q2/Q3; remove comportamento legado incompatível.

**Alternatives considered**:
- Sempre upsert silencioso — rejeitado (clarify pediu pergunta).
- Decisão linha a linha — rejeitado (por lote).
- Manter sufixos `-N` — rejeitado (cria “números diferentes” artificiais).

---

## R6 — Cancelada / arquivada e Maggo

**Decision**: Unique global cobre canceladas/arquivadas. Maggo merge continua update-or-insert por número; se número for de NF **manual**, prevalece regra 012 (ignorar item Maggo). 013 não altera essa precedência; apenas garante que create/import local não criem segundo registro.

**Rationale**: Clarify Q1 + 012 FR-014.

---

## R7 — Atalho “abrir NF existente”

**Decision**: Sem rota nova. Reutilizar modal de edição da página Contas a Receber (`NFs.tsx`): ao receber 409, oferecer ação que faz `obter(nf_id)` + `abrirEditar`. Se a NF estiver arquivada, abrir modal mesmo assim (ou ajustar filtro só para essa abertura).

**Rationale**: Página já é modal-based; FR-004 satisfeito sem deep-link.

**Alternatives considered**: Query string `?edit=id` — útil depois, fora do MVP se o modal bastar.

---

## R8 — Testes e validação

**Decision**: Quickstart manual cobrindo create duplicado, edit número colidente, import reject/update, duplicata no arquivo, trim. Lint/type-check frontend; smoke API com token admin.

**Rationale**: Padrão das features recentes do Ocean App.
