# Quickstart: Cabeçalho com Filtros Fixo no Scroll

**Feature**: `076-cabecalho-filtro-fixo`  
**Modelo**: [data-model.md](./data-model.md) · **Contrato UI**: [ui-cabecalho-filtro-fixo.md](./contracts/ui-cabecalho-filtro-fixo.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Conteúdo suficiente para gerar **scroll da página** (listas longas e/ou KPIs + tabela)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação — referência Fluxo de Caixa (baseline)

1. Abrir **Fluxo de caixa** com conteúdo que force scroll da página.
2. Rolar: título + filtros + ações permanecem fixos **abaixo** do header global (logo/busca), não por baixo dele.
3. Alterar mês/ano/fluxo com a página rolada: filtro aplica sem voltar ao topo.
4. Tema escuro: repetir — texto legível, fundo opaco.

## Validação — Dashboard (clarify A)

1. Abrir **Dashboard** e rolar a home.
2. Card com título + mês/ano/visão Líquido·Bruto permanece fixo e utilizável.
3. Bloco “Limiar do Alerta” (se visível) **não** precisa ficar fixo.

## Validação — Contas a Pagar (dual + KPIs)

1. Abrir **Contas a pagar** com KPIs e lista longa.
2. Rolar: título/ações ficam fixos; KPIs sobem e saem; barra de filtros fica fixa **logo abaixo** do título (sem faixa vazia grande — SC-005).
3. Com a página rolada, mudar categoria/status/mês: listagem atualiza; botões do título (exportar/nova conta) continuam clicáveis.
4. Rolar a **área interna** da tabela: cabeçalho de **colunas** continua sticky (073 — sem regressão).

## Validação — cobertura P1 (amostra ≥ 5 telas)

Em cada página abaixo, forçar scroll da página e confirmar cabeçalho com filtros fixo e utilizável:

| Página | Esperado |
|--------|----------|
| Contas a receber (NFs) | Título + filtros sticky (dual ou combinado) |
| Férias | Idem |
| DH | Idem |
| Bônus | Idem |
| Auditoria | Idem |
| Patrimônio / Fornecedores / Impostos / Retiradas | Idem conforme filtros existentes |

Critério: SC-001 / SC-002 — equivalente em usabilidade ao Fluxo de Caixa (com offset Layout).

## Validação — fora de escopo / regressões

1. **Calendário** (ou outra tela sem filtro no topo): sem obrigação de sticky de página.
2. Tema claro e escuro nas telas acima (SC-003).
3. Abrir um modal a partir do cabeçalho (ex.: nova conta): modal usável; sticky da página não atrapalha.
4. `npm run lint` e `npm run type-check` no `frontend/` sem erros novos.

## Aceite rápido

- [ ] Fluxo de Caixa: sticky abaixo do header global
- [ ] Dashboard: filtros de período fixos
- [ ] Contas: KPIs rolam; título + filtros contíguos após scroll
- [ ] ≥ 5 telas no escopo validadas
- [ ] Sticky de colunas da tabela (073) sem regressão
- [ ] Lint / type-check OK
