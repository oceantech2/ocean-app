# Quickstart: Status Derivado + Pipeline de Receita

**Feature**: `056-status-conta-receber`  
**Objetivo**: Validar o card Pipeline no Dashboard e a invariante dos estágios.

## Pré-requisitos

- Docker: API **8001**, PostgreSQL **5433**, Redis **6380**
- Frontend: `cd frontend && npm run dev` → **5193**
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Contratos: [rest-pipeline-receita.md](./contracts/rest-pipeline-receita.md), [ui-pipeline-receita.md](./contracts/ui-pipeline-receita.md)

## Setup rápido

```bash
docker compose up -d
cd frontend && npm run dev
```

Smoke API (com token JWT após login):

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/pipeline-receita?ano=2026&mes=9"
```

## Cenários de validação

### 1. Identidade do funil (SC-002)

1. Abrir Dashboard no mês com vários fechamentos (`data_ent_pgto` no mês).
2. Anotar Fechado no mês (R$ e qtd) e os três estágios.
3. **Esperado**: soma dos três estágios = Fechado (valor e contagem).

### 2. Classificação por datas (SC-001)

Preparar (via cadastro NFs, sem mudar UI de status legado) pelo menos:

| Caso | data_ent_pgto | data_emissao | data_pagamento | Estágio esperado |
|------|---------------|--------------|----------------|------------------|
| A | no mês | vazia | vazia | A Faturar |
| B | no mês | preenchida | vazia | Faturado · Ag. Pagamento |
| C | no mês | preenchida | preenchida | Recebido |
| D | no mês | vazia | preenchida | Recebido |

Atualizar Dashboard → conferir impacto nos totais do estágio correspondente.

### 3. Cancelados e excluídos (SC-007)

1. Ter NF cancelada e/ou soft-deleted com fechamento no mês.
2. **Esperado**: não entram em Fechado nem nos estágios.

### 4. Arquivadas (FR-011)

1. Arquivar uma NF paga/pendente com fechamento no mês (sem excluir).
2. **Esperado**: **continua** entrando no Pipeline (alinhado aos KPIs de receita).

### 5. Período vazio (SC-006)

1. Selecionar mês sem nenhum `data_ent_pgto`.
2. **Esperado**: Pipeline zerado / “—” sem erro de tela.

### 6. Atualização após edição (SC-004)

1. Pegar registro em A Faturar; informar emissão; salvar; recarregar Dashboard.
2. **Esperado**: migra para Faturado · Ag. Pagamento.
3. Informar pagamento → Recebido.

### 7. Papéis (SC-005)

1. Comparar totais como `admin` e `visualizador` no mesmo período.
2. **Esperado**: idênticos.

## Checks estáticos

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

- Todos os cenários 1–7 OK
- Endpoint responde 200 com invariante de soma
- Página NFs inalterada quanto a coluna/status legado
- Sem migration nova
