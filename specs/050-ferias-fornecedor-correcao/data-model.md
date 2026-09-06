# Data Model: Correção de Férias (fornecedor, listagem e folha)

**Feature**: `050-ferias-fornecedor-correcao` | **Date**: 2026-09-06

Nenhuma migration. Modelo lógico reusa entidades existentes.

## Entidades

### Fornecedor (tabela `colaboradores`)

| Campo | Uso em Férias |
|-------|----------------|
| `id` | Seleção / FK lógica em `ferias.colaborador_id` |
| `nome` | Listagem e filtros |
| `ativo` | Só ativos no seletor de novos períodos |
| `elegivel_equipe` | Filtro obrigatório na carga da página |
| `data_admissao` | Base do direito após 12 meses |
| `salario` | Coluna, formulário e Total da Folha (nullable → 0) |

**Regras**:
- Listáveis em Férias: `ativo = true` AND `elegivel_equipe = true`.
- Direito adquirido (sem override): existe `data_admissao` e data de referência ≥ aniversário de 1 ano (inclusivo).
- Sem `data_admissao` ou &lt; 1 ano: requer override do admin para salvar.

### Período de Férias (tabela `ferias`)

| Campo | Regras |
|-------|--------|
| `colaborador_id` | Obrigatório; referencia fornecedor elegível (validação de existência já implícita no uso) |
| `ano` | Obrigatório |
| `dias_direito` | Padrão 30 no 1º registro do ano; 0 em fracionamento (lógica atual) |
| `dias_tirados` | Informado ou sugerido pelas datas |
| `data_inicio`, `data_fim` | **Opcionais**; se ambos preenchidos, fim ≥ início |
| `aprovado` | Inalterado |

**Relacionamento**: N períodos → 1 fornecedor (`colaborador_id`).

### Total da Folha (visão, não persistida)

- Entrada: lista de fornecedores elegíveis ativos carregada na página.
- Fórmula: Σ `(salario ?? 0)` filtrada por `fornecedor_id` do filtro de página, se houver.
- Independente de `ferias` e do filtro de ano.

## Transições / fluxos

```text
[Abrir Novo Período]
  → carrega fornecedores elegíveis
  → seleciona fornecedor + ano
  → sugere dias_direito (30 se primeiro do ano)
  → datas opcionais
  → Salvar
      → se !temDireitoAdquirido: Confirm override?
           → Não: aborta
           → Sim: POST /ferias
      → se temDireito: POST /ferias
```

## Validação (resumo)

| Regra | Camada |
|-------|--------|
| Nomes no seletor | Frontend (carga + toast erro) |
| 12 meses / override | Frontend (`window.confirm`) |
| Datas invertidas | Frontend + backend (`datas_validas`) |
| Datas opcionais | Ambos (nullable) |
| Total da Folha | Frontend only |
| Papel visualizador | Frontend (sem botões de escrita) |
