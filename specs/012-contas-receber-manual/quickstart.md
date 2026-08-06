# Quickstart: Contas a Receber — Inserção Manual

**Feature**: `012-contas-receber-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-contas-receber-manual.md) · [ui](./contracts/ui-contas-receber-manual.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`

## Smoke API (admin)

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -d "username=admin&password=123456" | jq -r .access_token)

# Create Pendente — esperado 201, origem manual
curl -s -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "numero":"MANUAL-QS-001",
    "razao_social":"Cliente QS",
    "valor_bruto":1000,
    "valor_liquido":900,
    "data_emissao":"2026-08-01",
    "data_vencimento":"2026-08-31",
    "tipo":"sucesso",
    "data_pagamento":null,
    "caixa":null
  }' | jq '{id,numero,origem,status,caixa,data_pagamento}'

# Create Recebido sem caixa — esperado 422
curl -s -o /tmp/cr422.json -w "%{http_code}\n" -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "numero":"MANUAL-QS-002",
    "razao_social":"Cliente QS",
    "valor_bruto":1000,
    "valor_liquido":900,
    "data_emissao":"2026-08-01",
    "data_vencimento":"2026-08-31",
    "tipo":"sucesso",
    "data_pagamento":"2026-08-06",
    "caixa":null
  }'
# → 422

# Create Recebido OK
curl -s -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "numero":"MANUAL-QS-003",
    "razao_social":"Cliente QS",
    "valor_bruto":1000,
    "valor_liquido":900,
    "data_emissao":"2026-08-01",
    "data_vencimento":"2026-08-31",
    "tipo":"sucesso",
    "data_pagamento":"2026-08-06",
    "caixa":"corrente"
  }' | jq '{origem,status,caixa,data_pagamento}'

# Listagem — origem presente; checar header de colisões se aplicável
curl -s -D - -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/nfs?limit=20" -o /tmp/nfs.json | head -n 30
jq '.[] | select(.numero|startswith("MANUAL-QS")) | {numero,origem}' /tmp/nfs.json
```

## Validação UI (admin)

1. Abrir **Contas a Receber** (`http://localhost:5193/nfs`).
2. Confirmar botão **Nova conta a receber**; ausência de Importar / Deletar / pasta NFs.
3. Criar Pendente com campos obrigatórios → aparece na lista com Origem **Manual**.
4. Tentar Recebido sem Caixa → bloqueado; com Caixa + data → Origem Manual, status pago.
5. Editar manual: alterar razão social/valor → persiste após F5.
6. Editar Maggo: campos de negócio readonly; Caixa/pagamento editáveis.
7. Coluna **Origem** mostra Manual e Maggo.
8. (Opcional) Forçar número igual a item do stub Maggo no create manual; recarregar: manual permanece; Maggo não sobrescreve (aviso se implementado).

## Validação UI (visualizador)

1. Sem botão Nova conta a receber; sem edição/arquivar.

## Critérios de pronto (mapeamento)

| Critério | Como verificar |
|----------|----------------|
| SC-001 / SC-002 | Passos 3–4 UI + smoke POST |
| SC-003 | Passo 2 UI |
| SC-004 | Create inválido / 422 |
| SC-005 | Visualizador |
| SC-006 | Passo 7 + `origem` no JSON |

## Checagens locais

```bash
cd frontend && npm run lint && npm run type-check
```
