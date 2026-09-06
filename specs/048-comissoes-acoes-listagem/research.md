# Research: Comissões — ações da listagem (048)

**Branch**: `048-comissoes-acoes-listagem` | **Date**: 2026-09-06

## R1 — Estado atual vs spec 048

**Decision**: Tratar a feature como **fechamento/gap-fill** sobre o que já foi entregue em `045-comissoes-conta-receber`, não como reimplementação.

**Rationale**: Backend (`liberar`/`pagar`/lote, `liberado`/`pago`/`nf_id`) e frontend (`Bonus.tsx`: Editar→NF, sem Deletar na UI, colunas, checkboxes, lote) já cobrem FR-001–FR-011 e FR-013–FR-015. Clarify e FR-012a exigem limpar seleção ao **paginar** — hoje só limpa em mudança de filtro.

**Alternatives considered**:
- Reescrever página Comissões do zero → rejeitado (duplica 045, risco alto).
- Ignorar gap de paginação → rejeitado (contradiz clarify Q5 / FR-012a).

## R2 — Escopo de implementação residual

**Decision**: Trabalho residual mínimo:

1. **Obrigatório**: em `Bonus.tsx`, ao mudar `pagina`, limpar `selecionados` (mesmo padrão dos filtros).
2. **Recomendado (hardening FR-003)**: remover ou desabilitar `DELETE /api/bonus/{id}` e `bonusService.deletar` (UI já não expõe; endpoint ainda existe).
3. **Verificação**: percorrer [quickstart.md](./quickstart.md) para regressão dos fluxos já existentes.

**Rationale**: Spec 048 é a listagem; cadastro na Conta a receber fica fora (Assumptions → 045). Hardening do DELETE alinha “MUST NOT oferecer Deletar” também na API.

**Alternatives considered**:
- Só documentar como “já feito” sem task → rejeitado (FR-012a falha no código).
- Remover DELETE como única task → insuficiente (gap de UX da seleção permanece).

## R3 — Paginação por grupos

**Decision**: Manter paginação atual: **20 grupos** de fornecedor por página (`ITENS_POR_PAGINA = 20`). Seleção “página atual” = linhas dos grupos visíveis nessa página. Limpar seleção ao `onChange` da paginação.

**Rationale**: Já é o comportamento do produto; a clarify “página atual” aplica-se a esse modelo sem mudar o tamanho da página.

**Alternatives considered**:
- Repaginar por linha individual → fora de escopo (mudança de UX não pedida).
- Manter seleção ao paginar → rejeitado na clarify Q5.

## R4 — Coluna Liberado (linha + grupo)

**Decision**: Manter UI atual: coluna por linha (valor se `liberado`, senão “—”) + soma `liberadoTotal` no cabeçalho do grupo. Contratos 048 documentam os dois níveis (045 UI citava Liberado só no grupo).

**Rationale**: Confirmado na clarify Q2 (opção B); código já alinhado.

**Alternatives considered**: Só grupo ou só linha → rejeitados na clarify.

## R5 — Contrato REST

**Decision**: Documentar endpoints de status já existentes; não inventar novos. Incluir nota de remoção/desativação de `DELETE` se o hardening for executado.

**Rationale**: Prefixo `/api/bonus` preservado; papéis admin/visualizador inalterados.

**Alternatives considered**: Renomear para `/api/comissoes` → fora de escopo (constitution: consistência + simplicidade).

## NEEDS CLARIFICATION

Nenhum. Clarify 2026-09-06 (5/5) e inspeção do código resolvem o Technical Context.
