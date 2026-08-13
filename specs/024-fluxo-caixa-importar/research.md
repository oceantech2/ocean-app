# Research: Fluxo de Caixa — Contas a Receber e Contas a Pagar

**Feature**: `024-fluxo-caixa-importar` | **Date**: 2026-08-13

## 1. Espelho na tela vs copiar no banco

**Decision**: Movimento automático **não** é persistido. `FluxoCaixa.tsx` monta a lista a cada carga/filtro a partir de Contas a Receber, Contas a Pagar e `fluxo_movimentos` (manuais).

**Rationale**: Clarify opção A. Cópia congelada (botão Importar) foi recusada. Constitution V: menor solução. A página **já** lista NFs pagas + contas pagas.

**Alternatives considered**:
- Tabela `fluxo_movimentos` para automáticos + reimportar — duplica verdade financeira e exige idempotência/remoção (FR-007–009 viram ETL).
- `GET /fluxo-caixa/movimentos` no backend — útil se a lista paginar de verdade no servidor; hoje o produto já agrega no cliente.

## 2. Origem canônica das entradas

**Decision**: Entradas automáticas vêm só de **Contas a Receber** = registros `NF` (`GET /api/nfs`, rota de UI `/nfs`). Não somar uma segunda lista de “NFs” distinta. `status_filtro=paga` equivale a ter `data_pagamento` (`_calcular_status_nf`).

**Rationale**: Spec FR-019. No Ocean, `/contas-receber` redireciona para `/nfs`. Hoje o caixa já usa `nfsService.listar(..., 'paga')`.

**Alternatives considered**: Manter rótulo “NF” como origem na coluna — recusado (rótulos canônicos da spec). Buscar Maggo direto no caixa — fura o módulo oficial.

## 3. Filtro de período: pagamento, não emissão

**Decision**: **Não** passar `mes`/`ano` para `GET /nfs` no Fluxo de Caixa. Esses params usam `_filtrar_periodo` sobre emissão / data ent. pgto / `criado_em`, não sobre `data_pagamento`. Carregar recebidas (`status_filtro=paga`, `incluir_arquivadas=false`) e filtrar no cliente pela data de pagamento (mês opcional + ano). Contas a pagar: `pago=true` e o mesmo filtro de `data_pagamento` no cliente (o GET `/contas` não filtra por mês/ano de pagamento).

**Rationale**: Spec FR-004 e FR-012. O código atual já evita `mes`/`ano` no GET de NFs do caixa; isso deve permanecer explícito.

**Alternatives considered**: Novo query `data_ref=pagamento` na API — correto a longo prazo, muda contrato compartilhado com a página NFs (fora do escopo mínimo).

## 4. Paginação até esgotar

**Decision**: Percorrer `skip`/`limit` (limit=1000, teto da API) até página vazia para NFs pagas e contas pagas, depois filtrar o período. Manuais continuam `fluxoMovimentosService.listar(mes, ano)` (já recortados no servidor).

**Rationale**: Um único `limit=1000` pode omitir títulos antigos e falhar SC-002. Loop no cliente não exige mudar FastAPI.

**Alternatives considered**: Subir `le=1000` na API — impacto global. Aceitar teto 1000 — risco financeiro.

## 5. Identidade estável e “não duplicar”

**Decision**: Chave de linha: `receber-{id}`, `pagar-{id}`, `mov-{id}`. Um registro de origem → no máximo uma linha. Reabrir/refiltrar remonta o mesmo conjunto.

**Rationale**: Spec FR-007. Hoje as chaves são `nf-` / `conta-` / `mov-`; renomear prefixo `receber-`/`pagar-` alinha vocabulário sem mudar IDs de banco.

**Alternatives considered**: Deduplicar por descrição+valor — fundiria manuais “parecidos” (fora de escopo).

## 6. Coluna Origem e exportação

**Decision**: Coluna de tabela **Origem** com rótulos **Contas a Receber**, **Contas a Pagar**, **Manual**. CSV: Data, Tipo, Origem, Descrição, Valor. Remover a dependência de `✦` na descrição como único sinal (a coluna é canônica). Ações: **Remover** só em manual (admin); automático sem ocultar/excluir.

**Rationale**: Clarify Q3. FR-014, FR-017, FR-020.

**Alternatives considered**: Só cor/ícone ou prefixo na descrição — recusados.

## 7. Arquivadas, valor inválido, Caixa

**Decision**: `incluir_arquivadas=false` (padrão do GET `/nfs`). Valor líquido ≤ 0 (receber) ou valor ≤ 0 (pagar): não gera movimento; os demais seguem. Campo `caixa` da NF **não** vira coluna nesta tela (cards de saldo inalterados); ausência de Caixa não impede a entrada.

**Rationale**: Spec edge cases + Assumptions. 019 tirou Caixa da UI de Contas a Receber; não reabrir esse desenho no caixa.

**Alternatives considered**: Filtro por Caixa no fluxo — feature posterior.

## 8. Botão “Importar CSV”

**Decision**: Permanecer como está: importa **saldos**, modal “Saldos via CSV”. Não usar esse botão para Contas a Receber/Pagar. Não adicionar segundo botão Importar.

**Rationale**: Spec: CSV de saldos é outro fluxo. Clarify: sem importar CR/CP.

**Alternatives considered**: Renomear o botão nesta feature — cosmética opcional; só se o texto atual induzir erro. Plano: manter rótulo; o modal já diz que são saldos.

## 9. Falha de carga

**Decision**: Manter toast de erro ao falhar o `Promise.all` (ou as cargas paginadas). Não zerar manuais já em estado se uma das origens falhar **depois** de sucesso parcial: se qualquer GET crítico falhar, toast e **não** apresentar totais automáticos inventados (lista automática vazia; manuais só se a chamada de manuais tiver sucesso).

**Rationale**: FR-016. Implementação simples: se NFs ou contas falharem, `nfsPagas`/`contasPagas` = [] e toast; manuais preenchidos só se `fluxoMovimentosService` ok.

**Alternatives considered**: Retry silencioso — esconde falha.

## 10. Extração do mapeamento

**Decision**: Funções puras em `frontend/src/utils/fluxoCaixaMovimentos.ts` (elegível? período? mapear linha). A página só busca, chama o util e renderiza.

**Rationale**: Regras testáveis no quickstart mental; página já grande.

**Alternatives considered**: Deixar tudo em `FluxoCaixa.tsx` — funciona, mas mistura I/O e regra.
