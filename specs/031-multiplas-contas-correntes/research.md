# Research: Múltiplas contas correntes

**Feature**: `031-multiplas-contas-correntes` | **Date**: 2026-08-17

## 1. Tabela de contas correntes vs ampliar o enum string

**Decision**: Criar tabela `contas_correntes` com `codigo` estável (string). Investimento **não** vira linha dessa tabela; permanece o sentinela `investimento`. Legado `corrente` vira a primeira linha (`codigo='corrente'`, `padrao=true`).

Colunas de roteamento (`nfs.caixa`, `fluxo_movimentos.conta`, `saldos.conta`) continuam VARCHAR, alargadas para caber códigos novos (`cc_{id}`), não viram FK numérica nesta versão.

**Rationale**: Constituição V — menor migração. Todo o produto já filtra por string `corrente`/`investimento`. Seed com `codigo='corrente'` faz NFs, saldos e manuais existentes caírem na conta padrão sem UPDATE em massa.

**Alternatives considered**: FK `conta_corrente_id` em NF/movimento/saldo (mais íntegro, mas migra três tabelas e quebra o sentinela investimento). Só enum aberto sem cadastro (não atende gerenciar nome/banco/padrão).

## 2. Código estável das contas novas

**Decision**: Após o INSERT, gravar `codigo = 'cc_' || id` se ainda vazio. A conta seed permanece `corrente`. UI e seletor usam **nome**; API e persistência usam **codigo**.

**Rationale**: Evita colisão com `investimento`. Ids sequenciais são suficientes na escala interna (poucas contas bancárias).

**Alternatives considered**: UUID no codigo (mais longo nos VARCHAR atuais). Slug do nome (quebra se o nome mudar).

## 3. Recebimento sempre na padrão

**Decision**: No primeiro preenchimento de `data_pagamento` da NF, a API **ignora** `caixa` do body e grava o `codigo` da conta corrente com `padrao=true`. Contas a Pagar continuam sem coluna de caixa; o cliente só espelha CP quando o fluxo ativo é o codigo da padrão.

**Rationale**: Clarify 1. Hoje `nfs.py` já força `"corrente"` no receber e **descarta** `caixa` no PUT — o descarte impede FR-015 e precisa ser seletivo (ver item 4).

**Alternatives considered**: Confiar no frontend para enviar a padrão (frágil). Campo caixa em Contas a Pagar (fora da spec).

## 4. Reclassificar caixa na NF

**Decision**: PUT da NF **passa a aceitar** `caixa` somente se a NF **já está recebida** (`data_pagamento` preenchido). Valores válidos: `investimento` ou `codigo` de conta corrente **ativa**. O movimento no Fluxo de Caixa é derivado da NF: não há segundo lançamento.

Hoje `dados_atualizacao.pop("caixa", None)` e o set `"corrente"` no primeiro pagamento bloqueiam a correção — ambos mudam neste plano.

**Rationale**: Clarify 2. Contas a Receber no produto **são** NFs (`/contas-receber` redireciona para `/nfs`).

**Alternatives considered**: Endpoint `PATCH /nfs/{id}/caixa` (API extra sem ganho). Transferência para corrigir (rejeitado no clarify).

## 5. Cadastro na mesma tela do Fluxo de Caixa

**Decision**: Ação **Gerenciar contas** em `FluxoCaixa.tsx` (modal/painel). REST novo `/api/contas-correntes`. Sem item de menu e sem `permKey` novo (usa `fluxo_caixa` + `require_admin` na escrita).

**Rationale**: Clarify 3. Constituição IV — mesmo padrão de modal da tela.

**Alternatives considered**: Página `/contas-bancarias` (menu novo, fora da spec).

## 6. Dashboard consolidada

**Decision**: Um card **Conta corrente** = soma do **saldo visível** de cada conta corrente **ativa** (mesmo algoritmo do Fluxo de Caixa: último `saldos` daquele `codigo` + movimentos posteriores). Card de investimento inalterado (um caixa). Reutilizar helpers em `fluxoCaixaMovimentos.ts`.

**Rationale**: Clarify 5 e FR-012. Somar só a última linha de `saldos` onde `conta='corrente'` ignoraria contas novas e divergiria do card do fluxo.

**Alternatives considered**: Um card por conta (fora). Somar só histórico sem movimentos (mais simples, mentiria o consolidado).

## 7. Unicidade de nome e uma padrão

**Decision**: Índice único parcial `(LOWER(nome)) WHERE ativo`. Exatamente uma linha com `padrao=true` entre as ativas (enforçado na API: ao marcar padrão, desmarca as outras; recusa desativar a padrão ou a última ativa).

**Rationale**: FR-002 e FR-005. Soft delete alinhado a colaboradores.

**Alternatives considered**: Unique incluindo inativos (impede reusar o nome). Unique (banco, nome) (o seletor é só pelo nome).

## 8. Banco obrigatório no seed

**Decision**: Seed da conta `corrente` com `nome='Conta corrente'` e `banco='A definir'`. O administrador completa o banco real em Gerenciar contas. Novos cadastros recusam banco vazio.

**Rationale**: Clarify 4 exige banco NOT NULL; a linha legado não tem banco hoje.

**Alternatives considered**: Deixar banco nullable só no seed (duas regras). Bloquear o Fluxo de Caixa até preencher banco (atrito desnecessário).
