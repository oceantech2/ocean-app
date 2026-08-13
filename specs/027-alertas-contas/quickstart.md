# Quickstart: Alertas de Contas

**Feature**: `027-alertas-contas`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [ui](./contracts/ui-alertas-contas.md), [rest](./contracts/rest-leitura-alertas-contas.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Não há migration.

## Dados de teste (via UI, admin)

Na data de hoje **D**:

1. Conta a pagar não paga, vencimento **D−1** (vencida).
2. Conta a pagar não paga, vencimento **D** (vence hoje).
3. Conta a pagar não paga, vencimento **D+1** (não entra nos dois).
4. Conta a pagar **paga**, vencimento **D−1** (não entra).
5. Conta a receber ativa **sem** número de NF (pendente ou já recebida).
6. Conta a receber **com** número; outra **cancelada** ou **arquivada** sem número.

## Validação in-app

1. Logar. No topo, o painel mostra **Contas vencidas** = 1, **Contas a vencer em menos de 1 dia** = 1, **Contas com nota fiscal pendente** ≥ 1. Não mostra “Contas atrasadas”. NFs vencidas e férias, se houver, continuam.
2. Clicar **Contas vencidas** → `/contas` lista só a conta (1). Pagas, a de hoje e a de amanhã não aparecem.
3. Voltar ao painel, clicar **menos de 1 dia** → só a conta com vencimento D.
4. Clicar **nota fiscal pendente** → `/nfs` lista só ativas sem número (incluindo recebida sem NF). Com número, cancelada e arquivada fora.
5. Pagar a vencida (admin) → o item some ou a quantidade cai após o ciclo de ~30 s (ou ao navegar).
6. Logar como **visualizador**: mesmos três itens; sem ações de escrita.

## Fora desta prova

Não exigir mudança no e-mail de `POST /api/alertas/enviar` nem no preview `GET /api/alertas`.

## Lint

```bash
cd frontend && npm run lint && npm run type-check
```
