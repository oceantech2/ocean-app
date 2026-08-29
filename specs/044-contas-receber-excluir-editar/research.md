# Research: Contas a Receber — Excluir linha, Tipo e campos Maggo editáveis

**Feature**: `044-contas-receber-excluir-editar` | **Date**: 2026-08-28  
**Spec**: [spec.md](./spec.md)

## R-001 — Como excluir sem a Maggo recriar a linha

**Decision**: Soft delete na própria tabela `nfs`: coluna `excluida_em` (`DateTime`, nullable). `DELETE /api/nfs/{id}` (admin) grava `excluida_em = agora`, registra auditoria `deletar` e **não** apaga a linha. Listagens, resumo, relatórios, metas, impostos, calendário e e-mails operacionais filtram `excluida_em IS NULL`. O merge Maggo, ao achar o mesmo `maggo_id` com `excluida_em` preenchido, **não** ressuscita nem cria duplicata.

**Rationale**: Hard delete apagaria o `maggo_id`; o stub/reenvio criaria a conta de novo (falha FR-002 / SC-008). Tombstone em tabela extra é mais complexo. Arquivar já existe e continua distinto (reexibível). Soft delete some inclusive do filtro de arquivadas. Lançamentos de caixa não referenciam `nf_id` — não mexer neles (clarify Q1).

**Alternatives considered**:
- Hard delete + tabela `nfs_maggo_ids_bloqueados` — duas estruturas para o mesmo fim.
- Hard delete só em origem manual — dois caminhos; Maggo ainda precisaria de tombstone.
- Reusar `arquivada` — mistura ocultar com remover; spec pede ação distinta.

## R-002 — Valor persistido de Parcela

**Decision**: Manter o enum `TipoFechamento.PARCELAMENTO = "parcelamento"` no banco e na API. Rótulo de negócio em **todas** as telas e e-mails **novos**: **Parcela**. Aceitar no write o alias `parcela` (mapear para o mesmo enum). Não fazer `ALTER TYPE` nem converter linhas.

**Rationale**: Spec 017 já gravou `parcelamento`. Renomear valor de enum PostgreSQL é arriscado e não muda o grupo de negócio. O pedido é nomenclatura visível (como “Método de pagamento” → “Tipo”).

**Alternatives considered**:
- `ALTER TYPE` para `parcela` — migração frágil, sem ganho operacional.
- Só mudar Contas a Receber — Sucesso/Parcela divergiriam do DH.

## R-003 — Campos Maggo editáveis e merge

**Decision**: PUT `/api/nfs/{id}` já aplica o grupo Maggo (exceto `origem` e `maggo_id`). Na UI, `maggoEditavel` passa a ser verdadeiro para admin também em origem Maggo (hoje só `isManual`). O merge `_sync_maggo_stub` **já não** atualiza registro existente; reforçar `continue` explícito e o skip de `excluida_em`. Incluir **candidato** e **projeto/posição** (`posicao`) no conjunto editável — hoje estão no bloco Maggo somente leitura. Sem escrita de volta à Maggo (não existe cliente Maggo de escrita).

**Rationale**: Clarify Q2: Maggo só cria fechamento novo. Backend de update já permite; o bloqueio é de UI. “Campos que vêm da Maggo” na tela inclui candidato, além da lista da spec 018.

**Alternatives considered**:
- Merge por campo (proteger só o que o admin editou) — rejeitado na clarify (Q2 = A).
- Maggo sempre sobrescreve — edição local inútil.

## R-004 — Consultas que devem ignorar excluídas

**Decision**: Helper único (ex. `_nfs_visiveis(query)`) com `excluida_em IS NULL` em: `GET /nfs`, resumo, exportação, `relatorios.py`, `metas.py`, `impostos.py`, `email.py` e qualquer listagem de calendário que use NF. `GET /nfs/{id}` de registro excluído → **404**. Unicidade de número de NF **permanece** (linha excluída ainda ocupa o número). `DELETE /nfs/todas` continua **403**.

**Rationale**: Totais e Dashboard não podem contar receita excluída. Liberar o número na exclusão geraria colisão silenciosa com Maggo/manual.

**Alternatives considered**:
- Filtrar só na listagem da página — Dashboard/impostos continuariam somando.
- Liberar `numero` no soft delete — risco de duplicidade.

## R-005 — UX da exclusão e rótulo Tipo

**Decision**: Botão/ícone **Excluir** na coluna Ações (admin), `window.confirm` no padrão Contas a Pagar, toast de sucesso/erro. Visualizador sem o botão. Cabeçalho, formulário e CSV da página: **Tipo** no lugar de “Método de pagamento”; opções Retainer / Sucesso / **Parcela** (value `parcelamento`). DH: cards, select, `tipoLabel` e assunto de e-mail **novo** usam Parcela. `DELETE /todas` e importação em lote fora de escopo.

**Rationale**: Constituição IV (confirmação + padrão da página). Spec FR-001 a FR-008.

**Alternatives considered**:
- Excluir só no modal de edição — o pedido é “excluir linha”.
- Modal custom no lugar de `confirm` — fora do padrão atual das outras telas.
