# Contrato de UI: Contas a Pagar — Tabela plana, colunas e filtro Mês/Ano

**Feature**: `046-contas-pagar-listagem-colunas` | **Date**: 2026-08-29  
**Página**: Contas a Pagar (`/contas`, `frontend/src/pages/Contas.tsx`)  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

Substitui o contrato de agrupamento da feature `034`. REST de listagem inalterado salvo export XLSX ([rest-contas-pagar-listagem-colunas.md](./rest-contas-pagar-listagem-colunas.md)).

## Superfície

| Região | Comportamento |
|--------|----------------|
| Cards Total, Pago, A pagar, Vencido | Soma sobre **todas** as linhas visíveis após filtros (incl. Mês/Ano) |
| Filtro **Todos** (Mês/Ano) | Desativa recorte mensal; Mês/Ano desabilitados |
| Seletor **Mês** | Janeiro–dezembro (inclusive futuros no ano corrente) |
| Seletor **Ano** | Ano corrente ±5 |
| Filtros existentes | Categorias, Sub RH, Status/alertas, Descrição, Venc. de/até — inalterados |
| Listagem | **Uma tabela plana**; vazio → mensagem clara |
| ~~Agrupar Por mês / Por categoria~~ | **Removido** |

## Colunas (ordem fixa)

| # | Coluna | Conteúdo |
|---|--------|----------|
| 1 | Descrição | Texto + badge Reclassificar se pendente |
| 2 | Categoria | Rótulo taxonomia; RH = `Cat / Sub` |
| 3 | Mês/Ano | `Mês/AAAA` ou `—` |
| 4 | Fornecedor | Nome ou `—` |
| 5 | Valor | Moeda BRL |
| 6 | Vencimento | Data |
| 7 | Pagamento | Data ou vazio |
| 8 | Conta | Nome caixa |
| 9 | Tipo | Fixo ou Variável |
| 10 | Status | Pago / Pendente / Vencida |
| 11 | Nota fiscal | Ações anexo |
| 12 | Ações | Editar, pagar, excluir (admin) |

Cabeçalhos clicáveis para ordenação (incl. Categoria, Mês/Ano, Tipo).

## Filtro Mês/Ano

| Requisito | Contrato |
|-----------|----------|
| Padrão ao abrir | Mês + ano civis correntes; **não** Todos |
| **Todos** | Lista multi-mês; sem vencimento visível; seletores Mês/Ano desabilitados |
| Mês + ano específicos | Só contas com vencimento na competência |
| + demais filtros | Interseção |
| Alerta vencimento ativo | Forçar **Todos** no recorte mensal (notificações e status alerta) |

## Ordenação

| Evento | Ordem |
|--------|-------|
| Abrir página / mudar filtro | Vencimento **asc** |
| Clique em cabeçalho | Toggle asc/desc no campo |
| Mês/Ano asc | Cronológico; sem vencimento no final |
| Sem vencimento | Após linhas datadas (vencimento ou Mês/Ano asc) |

## Exportação

| Formato | Fonte | Colunas |
|---------|-------|---------|
| CSV | `contasFiltradas` ordenadas | Ordem da tabela + campos auxiliares vigentes |
| PDF | Impressão da tabela visível | Idem |
| Excel | API com params dos filtros | Idem (+ ver contrato REST) |

## Papéis

| Papel | Tabela, filtros, export | Escrita |
|-------|-------------------------|---------|
| `admin` | Sim | Inalterada |
| `visualizador` | Sim (mesmo recorte) | Não |

## Acessibilidade (mínimo)

- Rótulos visíveis em Mês, Ano e opção Todos.
- Cabeçalhos de coluna ordenáveis permanecem legíveis.
- Estado vazio anunciado na região da tabela.

## Fora de escopo (não quebrar)

- Formulário criar/editar (campos 045)
- CRUD, import, comprovante
- Dashboard, Fluxo de Caixa, Contas a Receber
- Persistência do filtro Mês/Ano após sair da rota
- Subtotais por grupo na listagem
