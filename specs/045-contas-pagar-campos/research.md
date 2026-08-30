# Research: Contas a Pagar — Fornecedor, cards e campos Conta/Tipo

**Feature**: `045-contas-pagar-campos` | **Date**: 2026-08-29

## 1. Campo Tipo da despesa (Fixo / Variável)

**Decision**: Nova coluna `contas_pagar.tipo_despesa` (`fixo` | `variavel`), NOT NULL, default `variavel`. Exposta na API como `tipo_despesa`; rótulos UI **Fixo** / **Variável**.

**Rationale**: Distinto de `colaboradores.tipo_fornecedor` (`fixo` | `spot`). Nome explícito evita colisão semântica e no código. Dashboard continua usando mapa por categoria (`dashboardDespesas.ts`) — fora de escopo desta feature.

**Alternatives considered**:
- Reutilizar mapa de categoria → rejeitado (clarify: Tipo é da conta, não do Dashboard).
- Campo `tipo` genérico na API → rejeitado (ambiguidade com fornecedor e receber).

## 2. Persistência de `caixa` em conta pendente

**Decision**: `caixa` passa a ser **obrigatório na gravação** (create/update) com default `codigo_padrao(db)` quando omitido; **não** zera ao desmarcar pagamento — só limpa se a spec futura exigir (hoje mantém a conta escolhida).

**Rationale**: FR-008 / clarify: Conta gravada inclusive pendente. A feature 036 (`data-model.md`) dizia `null` quando não pago; esta feature **refina** esse comportamento só em Contas a Pagar.

**Alternatives considered**:
- Manter `caixa` só quando pago (036) → rejeitado (contradiz spec clarificada).
- Duplicar campo `conta_planejada` → rejeitado (complexidade desnecessária).

## 3. Cálculo dos cards Total / Pago / A pagar / Vencido

**Decision**: Calcular no **frontend** sobre `contasFiltradas` (mesmos filtros da listagem: categoria, status, descrição, período, alerta vencimento):

| Card | Regra |
|------|--------|
| Pago | `c.pago === true` |
| Vencido | `!c.pago && vencimento < hoje` |
| A pagar | `!c.pago && vencimento >= hoje` |
| Total | soma dos três |

**Rationale**: Lista já carrega até 500 registros; filtros são client-side hoje; evita endpoint novo. Corrige bug atual: cards usam `contas` (API) em vez de `contasFiltradas` e “Total a Pagar” inclui vencidas.

**Alternatives considered**:
- Endpoint `/contas/resumo` → rejeitado (escopo maior; filtros mistos server/client).
- Incluir vencido dentro de A pagar → rejeitado (clarify: parcelas exclusivas).

## 4. Fornecedor no select

**Decision**: Manter `colaboradoresService.listar(0, 500, true)` — backend já filtra `tipo == 'fornecedor'`. Opcionalmente passar `{ tipo: 'fornecedor' }` por clareza. Sem filtro `elegivel_equipe`.

**Rationale**: Após unificação 043, todos os registros do cadastro são fornecedores; listagem ativa cobre FR-001.

**Alternatives considered**:
- Novo endpoint `/fornecedores` → rejeitado (rota de colaboradores já serve).

## 5. Migração de dados legados

**Decision**: No `_migrar` de `main.py`:
1. `ADD COLUMN tipo_despesa ... DEFAULT 'variavel'`
2. `UPDATE contas_pagar SET caixa = :padrao WHERE caixa IS NULL` usando `codigo_padrao` da sessão (ou subquery na corrente `padrao=true`)

Importação XLSX: ao criar registro, setar `caixa=codigo_padrao(db)` e `tipo_despesa='variavel'`.

**Rationale**: Atende FR-012, FR-013 e clarify de migração.

**Alternatives considered**:
- Backfill só em pagas → rejeitado (clarify: todas sem Conta).

## 6. Exportação Excel e PDF

**Decision**:
- **XLSX** (`GET /api/contas/exportar-xlsx`): incluir coluna **Tipo** (rótulo Fixo/Variável) e manter **Conta corrente** (rótulo pelo `mapa_rotulos`); header da coluna 7 ou adjacente conforme template.
- **PDF**: `window.print()` — adicionar colunas **Conta** e **Tipo** na tabela HTML; impressão reflete listagem filtrada visível.
- **CSV** (`exportarCSV` local): alinhar colunas Conta + Tipo + Fornecedor.

**Rationale**: FR-017; PDF não tem pipeline separado — depende da tabela renderizada.

**Alternatives considered**:
- Só Excel → rejeitado (clarify pede ambos).

## 7. Valores default no formulário

**Decision**: `FORM_INICIAL` inclui `caixa: codigoPadrao(contasCorrentes)` e `tipo_despesa: 'variavel'`. Campo **Conta** sempre renderizado (remove condicional `form.data_pagamento`).

**Rationale**: FR-007, FR-010, clarify Tipo pré-selecionado.

**Alternatives considered**:
- Tipo vazio na criação → rejeitado (clarify).
