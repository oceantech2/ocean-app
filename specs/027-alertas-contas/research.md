# Research: Alertas de Contas (Vencer, Vencidas e NF Pendente)

**Feature**: `027-alertas-contas` | **Date**: 2026-08-13

## 1. Onde calcular as contagens in-app

**Decision**: Continuar em `useNotificacoes` (cliente), estendendo o objeto. **Não** usar nem alterar `GET /api/alertas` / `coletar_alertas`.

**Rationale**: O preview REST e o e-mail compartilham `coletar_alertas` (NFs a vencer em N dias + contas no mesmo recorte + férias). Mudar isso violaria FR-012. O badge do topo já ignora esse endpoint e lista NFs/contas/férias.

**Alternatives considered**: Endpoint novo `/alertas/in-app` (contagem exata no servidor, mas API extra fora do menor caminho). Reusar `GET /alertas` (mistura regra de e-mail de 5 dias com “vence hoje”).

## 2. Dia civil vs timestamp

**Decision**: Comparar `data_vencimento` como `YYYY-MM-DD` com `hoje = new Date().toISOString().slice(0, 10)` (já usado em `useNotificacoes` para atrasadas). Vencida: `pago === false` e data `< hoje`. Vence hoje: `pago === false` e data `=== hoje`. Sem data: fora dos dois.

**Rationale**: `isVencida` em `Contas.tsx` usa `new Date(vencimento) < new Date()`, o que no mesmo dia (meia-noite vs agora) trata **hoje** como vencida — contradiz FR-002/FR-003. SC-001 exige partição ontem / hoje / amanhã.

**Alternatives considered**: Manter `Date` vs agora (quebra “menos de 1 dia”). Usar fuso explícito America/Sao_Paulo (desnecessário no app interno se o browser e o servidor estiverem no mesmo dia civil).

## 3. Filtro na destinação — contas a pagar

**Decision**: Novo campo Zustand `contasAlertaVencimento: '' | 'hoje' | 'vencida'`. Ao clicar: `setContasFilters('', 'false')` + esse campo. `Contas.tsx` recorta a lista: pendentes + vencimento hoje **ou** &lt; hoje. Limpar o alerta ao mudar Status/datas manualmente (volta a `''`). Datas locais `dataInicio`/`dataFim` **não** são o mecanismo do alerta (não persistem na navegação).

**Rationale**: Clarify Q3. Hoje o clique só põe `pago=false` e mistura vence hoje, vencidas e futuras. FR-007 exige conjuntos disjuntos. Status atual da UI só tem Pendente/Pago.

**Alternatives considered**: Preencher `dataInicio`/`dataFim` iguais a hoje (não persiste; usuário perde o recorte se recarregar a página de outro jeito). Query nova na API (desnecessário com lista de 500 já usada).

## 4. Filtro na destinação — NF pendente

**Decision**: Novo campo `nfsSemNumero: boolean` (ou `nfsStatus` sentinela `'sem_nf'` só no cliente). Ao clicar: mês vazio, não arquivadas, `nfsSemNumero=true`. Lista: `!numero?.trim()` e `status !== 'cancelada'`. Inclui `paga`/`pendente`/`vencida`. Opção visível no select de status: **Sem NF**.

**Rationale**: Status atuais (pendente/paga/vencida) não expressam ausência de número. Recebida sem NF deve aparecer (clarify Q2). Cancelada/arquivada fora (FR-006). Mês vazio evita perder NF de outro período.

**Alternatives considered**: Query `sem_numero` no GET `/nfs` (mais preciso acima de 500, mas API nova). Filtrar só `pendente` (excluiria recebidas).

## 5. Limite de 200/500 registros

**Decision**: Contagens usam o mesmo teto das listagens atuais (NFs 200 no hook, contas 200 no hook, páginas 500). Sem paginar todas as páginas só para o badge nesta feature.

**Rationale**: Constituição V. O produto já aceita esse teto no alerta de NFs vencidas. Corrigir paginação global de alertas é outra spec.

**Alternatives considered**: Contar no servidor (melhor, escopo maior). Loop de páginas no hook (carga e complexidade).

## 6. Rótulos e itens que permanecem

**Decision**: Substituir o texto **Contas atrasadas** por **Contas vencidas**. Acrescentar os dois itens novos. Manter **NFs vencidas** e **Férias aguardando aprovação**. Item some se `count === 0`. Indicador some se `total === 0`.

**Rationale**: Spec FR-008/FR-011 e padrão visual do `Layout`.

**Alternatives considered**: Quatro linhas de contas (rejeitado). Remover NFs/férias (fora).
