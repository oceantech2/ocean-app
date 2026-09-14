# Contrato UI: Férias — fornecedor, folha, direito e ano

**Feature**: `062-fix-ferias-fornecedor`  
**Rota**: `/ferias`  
**Página**: `frontend/src/pages/Ferias.tsx`  
REST: [rest-fornecedores-ferias.md](./rest-fornecedores-ferias.md)

---

## Nomenclatura

| Antes | Depois |
|-------|--------|
| Colaborador (rótulos) | **Fornecedor** |
| “por colaborador” | “por fornecedor” |
| Aviso “colaborador(es) pendente” | “fornecedor(es) pendente” |
| Sobreposição “mesmo colaborador” | “mesmo fornecedor” |
| Export CSV coluna Colaborador | **Fornecedor** |
| Import exemplo `colaborador_id` | Rótulo/exemplo visível orientado a **fornecedor** (payload API ainda `colaborador_id`) |

---

## Header e card Total da Folha

Card visível (mesmo com total 0), no espírito do card da página Fornecedores:

| Elemento | Comportamento |
|----------|----------------|
| Título | **Total da Folha** |
| Valor | BRL; Σ `salario` dos **Tipo Fixo ativos** da carga |
| Filtro fornecedor = Todos | Soma de todos os Fixo ativos |
| Filtro fornecedor = um Fixo | Só o salário dele (ou 0) |
| Filtro fornecedor = um Spot | **0** |
| Filtro ano | **Não** altera o card |

---

## Filtros

| Campo | Fonte |
|-------|--------|
| Fornecedor | `fornecedoresService.listar(0, 1000, true)` — opções com **nome** (Fixo e Spot ativos) |
| Ano | Inalterado (filtra períodos, não a folha) |

Erro na carga da lista → toast de erro (não silenciar).

---

## Listagem (tabela)

Nova coluna **Salário** (BRL ou “—” se null), junto à identificação do fornecedor.

Demais colunas (ano, tirados, período, status, ações) permanecem; cabeçalho de pessoa = **Fornecedor**.

---

## Modal Novo / Editar Período

| Campo | Regra |
|-------|--------|
| Fornecedor | Select com nomes; obrigatório na criação |
| Ano | Obrigatório; **sugerido** na criação ao escolher o fornecedor ([data-model.md](../data-model.md)); admin pode alterar; na edição não recalcula |
| Dias de direito | Lógica atual de base/fracionamento (023) |
| Salário | Somente leitura; do cadastro do selecionado |
| Data Início / Data Fim | Opcionais; sem marcação de obrigatório |
| Dias tirados | Editável; sugerido se ambas as datas válidas |

### Override (&lt; 1 ano, data futura ou sem admissão)

Ao clicar Salvar **na criação** (admin):

1. Se `temDireitoAdquirido` → salva normalmente.
2. Senão → `window.confirm` explicando falta de 1 ano / data; **OK** grava; **Cancelar** aborta e mantém o modal aberto.

Na **edição**, não exigir novo override só por regravar.

Visualizador: sem modal de criação/edição (como hoje).

---

## Resumo do ano / pendências

Cards de resumo e aviso de pendência usam termo **fornecedor**; cálculo de saldo inalterado (023).
