# Data Model: Contas a Pagar — Tipo Imposto / DAS

**Feature**: `074-contas-tipo-imposto-das` | **Date**: 2026-09-16  
**Spec**: [spec.md](./spec.md)

## Enums

| Campo | Valores persistidos | Rótulo UI / export |
|-------|---------------------|--------------------|
| `tipo_despesa` | `fixo`, `variavel`, `imposto_das` | Fixo, Variável, Imposto / DAS |

## Taxonomia de Categorias (após a feature)

Conjunto oficial de primeiro nível (**sem** Impostos), na ordem de produto vigente:

| Código | Rótulo |
|--------|--------|
| `adm_financeiro` | Adm/Financeiro |
| `operacoes` | Operações |
| `marketing` | Marketing |
| `comercial` | Comercial |
| `recursos_humanos` | Recursos Humanos (+ subcategorias vigentes) |
| *(demais oficiais já existentes, ex. Benefícios/Tecnologia conforme catálogo)* | … |

Códigos rejeitados em create/update/import: `impostos`, `imposto` (e aliases de label “Impostos”).

## Entidade: ContaPagar (`contas_pagar`)

### Colunas impactadas

| Coluna | Tipo | Obrigatório | Default | Notas |
|--------|------|-------------|---------|-------|
| `tipo_despesa` | VARCHAR(20) | Sim | `variavel` | Ampliar de 10→20; aceita `imposto_das` |
| `categoria` | VARCHAR(64) | Condicional | — | Obrigatória se Tipo ≠ `imposto_das`; opcional/nullable se `imposto_das` |
| `subcategoria` | VARCHAR(64) | Condicional | — | Obrigatória só se categoria = RH |
| `categoria_pendente` | BOOLEAN | Sim | `false` | Migradas: `false` |

### Regras — `tipo_despesa`

| Evento | Comportamento |
|--------|---------------|
| Criar sem informar | `variavel` (UI pré-seleciona) |
| Criar/editar valor inválido | 422 |
| Valor `imposto_das` | Válido; alimenta página Impostos |
| Contas não-imposto na migração | Mantêm `fixo`/`variavel` |

### Regras — categoria × Tipo

| Tipo | Categoria | Subcategoria |
|------|-----------|--------------|
| `fixo` / `variavel` | Obrigatória (taxonomia sem Impostos) | Obrigatória se RH |
| `imposto_das` | Opcional (null/vazio permitido) | Só se categoria = RH |
| Troca `imposto_das` → `fixo`/`variavel` com categoria vazia | Bloqueado (422 / validação UI) | — |

### Migração (única)

| Origem | Destino |
|--------|---------|
| `categoria ∈ {impostos, imposto}` (case-insensitive) | `tipo_despesa=imposto_das`, `categoria=NULL`, `subcategoria=NULL`, `categoria_pendente=false` |
| Demais contas | Inalteradas no Tipo |

## Relacionamentos

```text
ContaPagar.tipo_despesa ──► página Impostos (/impostos/de-contas)
ContaPagar.categoria    ──► taxonomia operacional (sem impostos)
```

Sem nova entidade. Tabela `impostos` (cadastro manual legado de %/valor) **não** é alterada por esta feature; a tela Impostos que usa `de-contas` muda a fonte das Contas a Pagar.

## Validação (API)

- `tipo_despesa` ∉ {fixo, variavel, imposto_das} → 422
- `tipo_despesa` ∈ {fixo, variavel} e categoria ausente/inválida → 422
- categoria `impostos`/`imposto` → 422
- `imposto_das` + categoria RH sem subcategoria → 422
- Import: linha com categoria Impostos → rejeitada; Tipo ausente → `variavel`
