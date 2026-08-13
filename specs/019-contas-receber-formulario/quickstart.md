# Quickstart: Contas a Receber — Subtítulo, Recebido e Caixa oculta

**Feature**: `019-contas-receber-formulario` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-contas-receber-formulario.md) · [ui](./contracts/ui-contas-receber-formulario.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Restart do backend após a regra de Caixa no POST/PUT
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`

## Smoke API (admin)

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -d "username=admin&password=123456" | jq -r .access_token)

# Create já recebido sem caixa — esperado 201 e caixa=corrente
curl -s -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "razao_social":"Cliente Manual 019",
    "posicao":"Analista de RH",
    "valor_bruto":1000,
    "valor_liquido":900,
    "tipo":"sucesso",
    "data_pagamento":"2026-08-12"
  }' | jq '{id,razao_social,posicao,caixa,status,data_pagamento}'

# Create pendente — caixa null
curl -s -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "razao_social":"Pendente 019",
    "valor_bruto":1,
    "valor_liquido":1,
    "tipo":"retainer"
  }' | jq '{id,caixa,status}'
```

PUT de recebimento (trocar `ID` de uma pendente): esperado `caixa=corrente`.

```bash
# curl -s -X PUT http://localhost:8001/api/nfs/<ID> \
#   -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
#   -d '{"data_pagamento":"2026-08-12"}' | jq '{caixa,status,data_pagamento}'
```

PUT só vencimento numa conta **já** recebida com investimento (se houver): `caixa` permanece `investimento`.

## Validação UI (admin)

1. Abrir **Contas a Receber** (`http://localhost:5193/nfs`).
2. Listagem: uma coluna **Título** com vaga em destaque e empresa abaixo; **sem** colunas Vaga, Empresa e Caixa. Ação rápida diz **Recebido** (não Pagar).
3. **Nova conta a receber**: campos **Título** e **Subtítulo** (não Vaga/Empresa). Subtítulo obrigatório. Sem Caixa, Lead, Condução, Placement. Salvar com Recebido + data → lista com célula composta e status paga.
4. Editar Maggo: Título e Subtítulo somente leitura; sem colaboradores; sem Caixa. Salvar vencimento não pede Caixa.
5. Conta pendente: **Recebido** → modal só com data → confirmar → recebida. Sem select corrente/investimento.
6. Exportar CSV da página: colunas Título e Subtítulo; **sem** Caixa.
7. Conta legado investimento (se existir): listagem não mostra Caixa; editar só NF/vencimento e salvar → Caixa no GET continua investimento.

## Validação UI (visualizador)

1. Vê a coluna composta e não vê Caixa nem colaboradores no formulário.
2. Sem Nova conta, sem Recebido, sem editar.

## Critérios de pronto (mapeamento)

| Critério | Como verificar |
|----------|----------------|
| SC-001 | Passo 3 em &lt; 2 min |
| SC-002 | Passos 2–4 — rótulos e célula única |
| SC-003 | Passos 2 e 5 — Recebido + modal só data |
| SC-004 | Passos 3 e 5 + smoke POST/PUT corrente |
| SC-005 | Passos 2, 3, 5, 6 |
| SC-006 | Passos 3–4 e 7 — colaboradores omitidos |
| SC-007 | Bloco visualizador |
| SC-008 | Modal Recebido sem data → toast |
