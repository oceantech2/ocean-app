# Quickstart: Contas a Receber — Identificação de Caixa

**Feature**: `011-contas-receber-caixa` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-caixa-contas-receber.md) · [ui](./contracts/ui-caixa-contas-receber.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`

## Smoke API (admin)

```bash
# Obter token (form OAuth2)
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -d "username=admin&password=123456" | jq -r .access_token)

# Listar e anotar id de um registro sem pagamento
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/nfs?limit=5" | jq '.[0] | {id,numero,caixa,data_pagamento}'

# Esperado: 422 — pagar sem caixa
curl -s -o /tmp/caixa422.json -w "%{http_code}" -X PUT \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"data_pagamento":"2026-08-06"}' \
  "http://localhost:8001/api/nfs/<ID>"
# → 422

# Esperado: 200 — pagar com caixa
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"data_pagamento":"2026-08-06","caixa":"corrente"}' \
  "http://localhost:8001/api/nfs/<ID>" | jq '{caixa,data_pagamento,status}'
```

## Validação UI (admin)

1. Abrir **Contas a Receber** (`http://localhost:5193/nfs`).
2. Confirmar coluna Caixa: **Corrente** / **Investimento** / **—** (sem “Não definido”).
3. Editar conta **não recebida**: salvar com Caixa vazia → OK; definir Corrente → persiste após F5.
4. Abrir **Pagar** sem escolher Caixa → bloqueado; escolher Investimento + data → sucesso; lista mostra **Investimento**.
5. (Se houver legado pago sem Caixa) listagem com **—**; editar e salvar sem Caixa → bloqueado; salvar com Corrente → OK.
6. Exportar CSV e XLSX → coluna Caixa coerente com a tela.

## Validação UI (visualizador)

1. Login visualizador: vê Caixa na lista; sem alterar / pagar.

## Persistência no sync

1. Classificar uma conta (Caixa = Corrente).
2. Recarregar a página (dispara listagem/merge Maggo).
3. Confirmar que Caixa permanece **Corrente** no mesmo `numero`.

## Critérios de pronto (mapeamento)

| Critério | Como verificar |
|----------|----------------|
| SC-001 | Passos 3–4 UI admin |
| SC-002 | Passo 2 |
| SC-003 | Visualizador |
| SC-004 / SC-005 | Smoke 422 + UI Pagar |
| SC-006 | Sync Maggo |
| SC-007 | Export CSV/XLSX |
| SC-008 | Legado na listagem + bloqueio ao salvar |

## Lint / type-check

```bash
cd frontend && npm run lint && npm run type-check
```
