# Contract UI: Contas a Pagar — Tipo Imposto / DAS

**Feature**: `074-contas-tipo-imposto-das` | **Date**: 2026-09-16

## Página Contas a Pagar (`/contas`)

### Campo Tipo (criar / editar)

| Elemento | Comportamento |
|----------|---------------|
| Opções | **Fixo**, **Variável**, **Imposto / DAS** (nessa ordem) |
| Default (nova) | **Variável** |
| Obrigatório | Sim |
| Listagem / export | Mesmos rótulos |

### Campo Categorias

| Tipo selecionado | Categorias |
|------------------|------------|
| Fixo / Variável | Obrigatório; lista **sem** Impostos |
| Imposto / DAS | Opcional (pode ficar em branco); lista **sem** Impostos; se RH → exige subcategoria |

### Filtro de categorias

Sem opção Impostos.

### Validação cliente (antes do POST/PUT)

- Sem Tipo → toast/bloqueio.
- Fixo/Variável sem categoria → bloqueio.
- Troca de Imposto / DAS → Fixo/Variável com categoria vazia → bloqueio.
- Imposto / DAS sem categoria → permitir salvar.

### Papéis

| Papel | Tipo / categoria |
|-------|------------------|
| `admin` | Criar / editar |
| `visualizador` | Somente leitura |

## Página Impostos (`/impostos`)

| Elemento | Comportamento |
|----------|---------------|
| Dados | Continuam via `impostosService.deContas(ano)` |
| Empty state | Texto orienta a criar conta a pagar com Tipo **Imposto / DAS** (não categoria Impostos) |

## Dashboard (ajuste mínimo)

| Elemento | Comportamento |
|----------|---------------|
| Donut / custo por categoria | Sem fatia Impostos; contas Imposto / DAS fora das fatias |
| Cards Fixas / Variáveis | Continuam classificando fixo vs variável; excluem Imposto / DAS da soma (antes excluíam categoria Impostos) |
| Métricas de imposto via NF | Inalteradas |
