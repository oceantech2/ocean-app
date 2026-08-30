# Data Model: Contas a Pagar — Listagem plana e filtro Mês/Ano

**Feature**: `046-contas-pagar-listagem-colunas` | **Date**: 2026-08-29  
**Spec**: [spec.md](./spec.md)

> Modelo de **apresentação e filtro na UI**, com ajuste opcional de **exportação XLSX**. Sem novas tabelas ou colunas de banco.

## Entidades persistidas (existentes)

### Conta a pagar

Campos usados nas colunas e filtros (já gravados):

| Campo | Coluna / filtro |
|-------|-----------------|
| `descricao` | Descrição |
| `categoria`, `subcategoria`, `categoria_pendente` | Categoria (rótulo derivado) |
| `data_vencimento` | Mês/Ano (derivado), Vencimento, filtro mensal |
| `fornecedor_nome`, `fornecedor_id`, `fornecedor_ativo` | Fornecedor |
| `valor` | Valor; cards |
| `data_pagamento`, `pago` | Pagamento, Status; cards |
| `caixa` | Conta |
| `tipo_despesa` | Tipo (`fixo` \| `variavel`) |
| `comprovante_nome` | Nota fiscal |

Nenhuma transição de ciclo de vida nova.

## Estado de UI (novo / alterado)

### Filtro Mês/Ano

| Campo | Tipo | Default | Regras |
|-------|------|---------|--------|
| `contasMesTodos` | boolean | `false` | `true` → ignora recorte mensal; inclui sem vencimento |
| `contasMes` | number (1–12) | mês civil corrente | Jan–dez inclusive futuros no ano corrente |
| `contasAno` | number | ano civil corrente | Opções: corrente ±5 |

Persistência: **memória da página** (`useState` em `Contas.tsx`). Perde ao desmontar a rota.

**Exceção**: alerta de vencimento ativo → forçar `contasMesTodos = true` (ver [research.md](./research.md) §4).

### Ordenação da tabela

| Campo | Tipo | Default | Regras |
|-------|------|---------|--------|
| `sortField` | string | `data_vencimento` | Reset ao mudar filtros |
| `sortDir` | `asc` \| `desc` | `asc` | Colunas: inclui `categoria`, `mes_ano`, `tipo_despesa` |

### Removido (feature 034)

| Campo | Status |
|-------|--------|
| `modoAgrupamento` (`categoria` \| `mes`) | **Removido** |
| `gruposAbertos` | **Removido** |
| Grupos mensais / por categoria na listagem | **Removidos** |

## Valores derivados (somente leitura)

### Competência Mês/Ano (coluna)

| Entrada | Saída |
|---------|--------|
| `data_vencimento` válida | `"Agosto/2026"` (pt-BR, barra) |
| sem vencimento | `—` |
| Chave interna para filtro/ordenação | `YYYY-MM` ou `sem-vencimento` |

Função: `rotuloMesAnoColuna` + `chaveMesVencimento` (existente).

### Categoria (coluna)

| Entrada | Saída |
|---------|--------|
| RH + subcategoria | `"Recursos Humanos / Salário"` |
| Categoria simples | Nome oficial/cadastrado |
| `categoria_pendente` | Rótulo legado + badge Reclassificar |

### Tipo (coluna)

| `tipo_despesa` | Exibição |
|----------------|----------|
| `fixo` | Fixo |
| outro / null | Variável (legado) |

## Relacionamentos (fluxo de dados)

```text
GET /api/contas?categoria&subcategoria&pago
        ↓
contas (estado)
        ↓
contasFiltradas
  ├── busca descrição
  ├── intervalo venc. de/até
  ├── alertas vencimento
  └── filtro Mês/Ano (se não Todos)
        ↓
contasOrdenadas (sort + default vencimento asc)
        ↓
├── Tabela plana (12 colunas ordem fixa)
├── Cards Total/Pago/A pagar/Vencido
└── Export CSV / print PDF / GET exportar-xlsx (params alinhados)
```

## Regras de validação

- Filtro mensal específico: conta **sem** `data_vencimento` **excluída**.
- Filtro **Todos**: contas sem vencimento **incluídas** (`Mês/Ano` = `—`).
- Interseção: Mês/Ano ∧ categoria ∧ status ∧ descrição ∧ intervalo — resultado vazio permitido.
- Cards = soma de `contasFiltradas` com parcelas Pago / A pagar / Vencido mutuamente exclusivas (regra 045).
- Visualizador: mesma tabela e filtros; sem escrita.

## Exportação XLSX (contrato de dados)

Parâmetros opcionais alinhados à listagem:

| Param | Espelha |
|-------|---------|
| `categoria`, `subcategoria`, `pago` | Filtros API |
| `mes`, `ano` | Filtro Mês/Ano (omitir se Todos) |

Colunas no arquivo: mesma ordem lógica da tabela (FR-011).
