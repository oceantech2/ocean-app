# Quickstart: Validação — Contas a Pagar agrupar por mês e filtrar categorias

**Feature**: `034-contas-pagar-agrupar-mes` | **Date**: 2026-08-18  
**Contrato**: [contracts/ui-contas-pagar-agrupar-mes.md](./contracts/ui-contas-pagar-agrupar-mes.md) · **Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- Infra / API conforme o projeto (`docker compose up -d` se necessário; API **8001**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Contas a pagar em **pelo menos dois meses** de vencimento, mais de uma **categoria** (incluindo **Recursos Humanos** com ao menos duas subcategorias, se possível) e, se houver, uma conta **sem vencimento**
- Credenciais de desenvolvimento do projeto (não documentar senhas neste artefato)

## Setup

```bash
cd frontend
npm run lint
npm run type-check
npm run dev
```

Abrir `http://localhost:5193`, autenticar e ir em **Contas a Pagar**.

## Cenários de validação

### 1. Padrão Por mês (P1)

1. Sair da rota (ex.: Dashboard) e entrar de novo em Contas a Pagar.
2. **Esperado**: listagem já agrupada por mês, sem clicar em Agrupar. Mês mais recente (com contas) aberto; meses anteriores fechados com total no cabeçalho.

### 2. Ordem, rótulo e total (P1)

1. Conferir ordem: mês mais novo no topo; “Sem vencimento” no fim, se existir.
2. Rótulo em português (ex.: Agosto 2026).
3. Com status “Todos”, o total do grupo = soma das linhas daquele mês (abrir para conferir). Fechado, o mesmo total permanece no cabeçalho.

### 3. Colapso (P1)

1. Abrir um mês anterior: as linhas aparecem; o mês mais recente continua no estado em que foi deixado.
2. Fechar o mês mais recente: só cabeçalho + total.
3. Trocar para **Por categoria**: todos os grupos de categoria abertos, sem colapso.
4. Voltar para **Por mês**: de novo só o mês mais recente visível começa aberto.

### 4. Filtro Recursos Humanos (P1)

1. Categorias = Recursos Humanos, subcategoria = Todas de RH, modo Por mês.
2. **Esperado**: só contas de RH; meses sem RH desaparecem.
3. Subcategoria = Salário.
4. **Esperado**: só RH/Salário; totais dos meses batem com essas linhas.
5. Repetir no modo Por categoria: mesmo recorte, grupos abertos.

### 5. Filtros combinados (P2)

1. RH + status Pendente + intervalo de vencimento + (opcional) busca na descrição.
2. **Esperado**: grupos e totais só com contas que passam em **todos** os filtros. Filtro que zera tudo → “Nenhuma conta encontrada”, sem grupo vazio.
3. Trocar Agrupar: filtros permanecem.

### 6. Pendência e papéis (P2)

1. Se houver conta pendente de reclassificação: no filtro RH ela **não** entra; no modo mês (Todas as categorias) ela aparece no mês do vencimento.
2. Login visualizador: mesmos agrupamento e filtros; sem criar/editar/excluir.

### 7. Regressão (P2)

1. Criar/editar conta, marcar paga, anexo de NF, import e cadastro de categoria no formulário (admin) continuam iguais.
2. Cartões do topo da página não mudam de regra.
3. Dashboard / Contas a Receber inalterados.
