# Data Model: Correção de Férias (fornecedor, listagem, direito e folha)

**Feature**: `062-fix-ferias-fornecedor` | **Date**: 2026-09-14

Nenhuma migration. Modelo lógico reusa entidades existentes.

## Entidades

### Fornecedor (tabela `colaboradores`)

Cadastro unificado (`tipo = 'fornecedor'`). O GET de listagem já aplica esse filtro.

| Campo | Uso em Férias |
|-------|----------------|
| `id` | Seleção / FK lógica em `ferias.colaborador_id` |
| `nome` | Seletor, filtro, tabela, avisos |
| `ativo` | Só ativos no seletor e no filtro de novos períodos |
| `tipo_fornecedor` | `'fixo'` \| `'spot'` (default operacional `'fixo'` se nulo) — **não** filtra o seletor; **filtra** o Total da Folha |
| `data_admissao` | Data de entrada; direito após 12 meses; sugestão de ano |
| `salario` | Coluna, formulário e Total da Folha (nullable → 0) |

**Regras**:
- Listáveis no seletor/filtro: `ativo = true` (Fixo e Spot). Sem `elegivel_equipe`.
- Direito adquirido (sem override): existe `data_admissao` e data de referência ≥ aniversário de 1 ano (inclusivo).
- Sem `data_admissao`, data no futuro, ou &lt; 1 ano: override do admin **na criação**.
- Inativo: não entra no seletor; períodos já salvos continuam na tabela.

### Período de Férias (tabela `ferias`)

| Campo | Regras |
|-------|--------|
| `colaborador_id` | Obrigatório; ID do fornecedor |
| `ano` | Obrigatório; na criação **sugerido** (ver abaixo); editável |
| `dias_direito` | Padrão 30 no 1º registro do ano; 0 em fracionamento (lógica 023) |
| `dias_tirados` | Informado ou sugerido pelas datas |
| `data_inicio`, `data_fim` | **Opcionais**; se ambos preenchidos, fim ≥ início |
| `aprovado` | Inalterado |

**Relacionamento**: N períodos → 1 fornecedor (`colaborador_id`).

### Sugestão de ano (não persistida)

Entrada: `data_admissao`, data de referência (hoje, início do dia local).

| Condição | Ano sugerido |
|----------|----------------|
| Sem `data_admissao` | Ano corrente |
| `data_admissao + 12 meses` já passou (≤ hoje) | Ano corrente |
| `data_admissao + 12 meses` no futuro | Ano civil dessa data de conclusão |

Na edição, o `ano` gravado **não** é recalculado.

### Total da Folha (visão, não persistida)

- Universo: fornecedores **ativos** carregados na página com `tipo_fornecedor` efetivo **fixo** (`null` → fixo).
- Fórmula: Σ `(salario ?? 0)`.
- Filtro de pessoa = Todos → soma do universo.
- Filtro = um Fixo → salário dele (ou 0).
- Filtro = um Spot → **0**.
- Independente da tabela `ferias` e do filtro de ano.

## Transições / fluxos

```text
[Abrir Novo Período]
  → seletor com fornecedores ativos (nomes)
  → seleciona fornecedor
       → sugere ano (FR-013)
       → sugere dias_direito (30 se primeiro daquele ano)
       → mostra salário somente leitura
  → datas opcionais
  → Salvar (criação)
      → se !temDireitoAdquirido: Confirm override?
           → Não: aborta (modal aberto)
           → Sim: POST /ferias
      → se temDireito: POST /ferias

[Editar]
  → ano e fornecedor gravados; sem novo override só por regravar
```

## Validação (resumo)

| Regra | Camada |
|-------|--------|
| Nomes no seletor (todos ativos) | Frontend (carga + toast erro) |
| 12 meses / override na criação | Frontend (`window.confirm`) |
| Sugestão de ano | Frontend (`sugerirAnoAquisitivo`) |
| Datas invertidas | Frontend + backend (`datas_validas`) |
| Datas opcionais | Ambos (nullable) |
| Total da Folha (Fixo) | Frontend only |
| Papel visualizador | Frontend (sem botões de escrita) |
