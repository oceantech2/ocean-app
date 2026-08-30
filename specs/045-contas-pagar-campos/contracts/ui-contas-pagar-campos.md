# Contrato UI: Contas a Pagar — Fornecedor, cards, Conta e Tipo

**Feature**: `045-contas-pagar-campos`  
**Página**: `Contas.tsx` (`/contas`)  
**Papéis**: `admin` escreve; `visualizador` lê.

## Cards de totais

Ordem (grid 4 colunas): **Total** | **Pago** | **A pagar** | **Vencido**

| Card | Cor sugerida (herdar padrão atual) | Cálculo |
|------|-------------------------------------|---------|
| Total | neutro / azul | Pago + A pagar + Vencido |
| Pago | verde | Σ pagas |
| A pagar | amarelo | Σ pendentes com vencimento ≥ hoje |
| Vencido | vermelho | Σ pendentes com vencimento &lt; hoje |

Fonte: **`contasFiltradas`** (não a lista bruta da API). Recalcula ao mudar filtros locais ou recarregar dados.

## Formulário Nova / Editar conta a pagar

| Campo | Comportamento |
|-------|---------------|
| **Fornecedor** | Select; opções = fornecedores ativos (`colaboradoresService.listar`); opção vazia “Sem fornecedor”; inativo só na edição com vínculo legado |
| **Conta** | Select **sempre visível**; rótulo **Conta**; opções = correntes ativas pelo nome; default = corrente padrão (`codigoPadrao`); sem investimento |
| **Tipo** | Select Fixo / Variável; default **Variável** na criação; obrigatório |
| Demais campos | Inalterados (descrição, categorias, valor, vencimento, data pagamento, NF) |

**Salvar**: envia `caixa` e `tipo_despesa` sempre (não só quando pago).

## Modal / ação Pagar na listagem

- Conta inicial = `caixa` já gravada na conta (fallback padrão).
- Admin pode trocar antes de confirmar.

## Listagem (tabela)

Colunas existentes + ajustes:

| Coluna | Conteúdo |
|--------|----------|
| Fornecedor | Nome ou “—”; “(inativo)” se aplicável |
| Conta | Rótulo via `rotuloContaOrigem(caixa, contasCorrentes)` — renomear header de “Conta corrente” para **Conta** |
| Tipo | **Fixo** ou **Variável** (nova coluna) |

## Exportação

| Saída | Conta | Tipo | Fornecedor |
|-------|-------|------|------------|
| Excel (API) | Sim | Sim | Conforme template/evolução |
| CSV (botão local) | Sim | Sim | Incluir se já exportado |
| PDF (`window.print`) | Sim (coluna visível) | Sim (coluna visível) | Como na tela |

Export reflete o **conjunto visível** após filtros (listagem filtrada).

## Visualizador

- Vê cards, colunas Conta/Tipo/Fornecedor.
- Formulários e selects desabilitados; sem criar/editar/pagar.

## Fora de escopo (não alterar)

- Cards Despesas Fixas/Variáveis do **Dashboard**
- Colunas novas na planilha de importação
- Filtros dedicados por Tipo/Conta/Fornecedor
