# Contrato de UI: Tooltip de alíquota na coluna Imposto

**Feature**: `037-contas-receber-aliquota-tooltip` | **Date**: 2026-08-18  
**Página**: Contas a Receber (`/nfs`, `frontend/src/pages/NFs.tsx`)  
**Spec**: [spec.md](../spec.md)

## Superfície

Somente a **célula de dados** da coluna **Imposto** (não o nome da coluna no cabeçalho, não o campo Imposto do modal).

O valor visível na célula **não muda**: reais formatados ou “—”.

## Conteúdo do tooltip / `aria-label`

| Situação | Texto (pt-BR) |
|----------|----------------|
| Percentual efetivo do mês de competência `> 0` | `Alíquota do mês (MMM/AAAA): X,XX%` — MMM abreviação pt-BR (ex.: Mar); percentual com vírgula e até 2 casas |
| Competência indefinida, percentual ≤ 0, sem dado do mês, ou falha ao carregar | `Alíquota do mês indisponível` |

O percentual **não** é o da linha (imposto ÷ bruto). Linhas do mesmo mês/ano de competência compartilham o mesmo texto de alíquota.

Filtro da página (mês/ano da lista) **não** substitui o mês de competência da linha.

## Interação

| Ação | Resultado |
|------|-----------|
| Hover na célula Imposto | Tooltip nativo (`title`) com o texto da tabela acima |
| Foco via teclado (Tab até o controle da célula) | Mesmo texto em `aria-label`; `title` também presente |
| Sair com o cursor / blur | Tooltip some; tabela inalterada |
| Célula “—” com alíquota disponível | Texto de alíquota do mês (não sugere valor em reais) |

Papéis `admin` e `visualizador`: mesmo comportamento.

## Fora de escopo (não quebrar)

- Cabeçalho em duas linhas, colunas fixas, scrolls (033)
- CRUD, filtros, export, modal pagar/editar
- Página Impostos, Dashboard, Contas a Pagar
- Recalcular ou editar alíquota a partir do tooltip
