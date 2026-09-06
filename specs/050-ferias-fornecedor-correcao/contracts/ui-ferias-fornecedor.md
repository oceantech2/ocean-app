# Contrato UI: Férias — fornecedor, folha e elegibilidade

**Feature**: `050-ferias-fornecedor-correcao`  
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
| Export CSV coluna Colaborador | **Fornecedor** |
| Import exemplo `colaborador_id` | Exemplo/rótulo orientado a **fornecedor** (payload API ainda `colaborador_id`) |

---

## Header e card Total da Folha

Acima ou junto aos filtros, card destacado:

| Elemento | Comportamento |
|----------|----------------|
| Título | **Total da Folha** |
| Valor | BRL; soma `salario` dos elegíveis ativos carregados |
| Filtro fornecedor = Todos | Soma de todos |
| Filtro fornecedor = um id | Só o salário daquele id |
| Filtro ano | **Não** altera o card |

---

## Filtros

| Campo | Fonte |
|-------|--------|
| Fornecedor | `fornecedoresService.listar(..., ativo=true, elegivel_equipe=true)` — opções com **nome** |
| Ano | Inalterado |

Erro na carga da lista → toast de erro (não silenciar).

---

## Listagem (tabela)

Nova coluna **Salário** (BRL ou “—” se null), entre identificação do fornecedor e demais colunas existentes.

Demais colunas (ano, direito/tirados conforme layout atual, período, status, ações) permanecem; cabeçalho de pessoa = **Fornecedor**.

---

## Modal Novo / Editar Período

| Campo | Regra |
|-------|--------|
| Fornecedor | Select com nomes; obrigatório na criação |
| Ano | Obrigatório |
| Dias de direito | Lógica atual de base/fracionamento |
| Salário | Somente leitura; do cadastro do selecionado |
| Data Início / Data Fim | Opcionais; sem marcação de obrigatório |
| Dias tirados | Editável; sugerido se ambas as datas válidas |

### Override (&lt; 1 ano ou sem admissão)

Ao clicar Salvar (admin):

1. Se `temDireitoAdquirido` → salva normalmente.
2. Senão → `window.confirm` explicando falta de 1 ano / data; **OK** grava; **Cancelar** aborta e mantém o modal aberto.

Visualizador: sem modal de criação/edição (como hoje).

---

## Resumo do ano / pendências

Cards de resumo e aviso de pendência usam termo **fornecedor**; cálculo de saldo inalterado (023).
