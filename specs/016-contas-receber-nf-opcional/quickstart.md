# Quickstart: Contas a Receber — NF opcional

**Feature**: `016-contas-receber-nf-opcional` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-contas-receber-nf-opcional.md) · [ui](./contracts/ui-contas-receber-nf-opcional.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`

## Smoke API (admin)

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -d "username=admin&password=123456" | jq -r .access_token)

# Create sem numero — esperado 201, numero null, origem manual
curl -s -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "razao_social":"Cliente Sem NF",
    "valor_bruto":1000,
    "valor_liquido":900,
    "data_emissao":"2026-08-01",
    "data_vencimento":"2026-08-31",
    "tipo":"sucesso"
  }' | jq '{id,numero,origem,status}'

# Segundo create sem numero — esperado 201 (não 409)
curl -s -o /tmp/cr2.json -w "%{http_code}\n" -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "numero":"",
    "razao_social":"Outro Cliente Sem NF",
    "valor_bruto":500,
    "valor_liquido":450,
    "data_emissao":"2026-08-02",
    "data_vencimento":"2026-08-31",
    "tipo":"sucesso"
  }'
# → 201

# Create com numero duplicado (usar um numero já existente) — esperado 409
curl -s -o /tmp/cr409.json -w "%{http_code}\n" -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "numero":"MAGGO-001",
    "razao_social":"Duplicado",
    "valor_bruto":1,
    "valor_liquido":1,
    "data_emissao":"2026-08-01",
    "data_vencimento":"2026-08-31",
    "tipo":"sucesso"
  }'
# → 409

# PUT limpar numero de um manual (trocar ID) — esperado numero null
# curl -s -X PUT http://localhost:8001/api/nfs/<ID> \
#   -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
#   -d '{"numero":null}' | jq '{id,numero}'
```

## Validação UI (admin)

1. Abrir **Contas a Receber** (`http://localhost:5193/nfs`).
2. **Nova conta a receber**: campo **NF** sem `*`; preencher só cliente, valores, datas, tipo; pagamento Pendente; salvar → aparece na lista com **—** na coluna Nº.
3. Repetir o passo 2 com outro cliente → segunda linha também com **—** (sem erro de duplicidade).
4. Criar com NF preenchida livre → número visível; tentar o mesmo número de novo → 409 + atalho.
5. Editar um manual com NF: apagar o número, salvar, F5 → **—**.
6. Editar Maggo: NF readonly.
7. Marcar como Recebido uma conta sem NF: Caixa + data ainda obrigatórios.

## Validação UI (visualizador)

1. Sem criação/edição; listagem mostra **—** nas contas sem NF.

## Critérios de pronto (mapeamento)

| Critério | Como verificar |
|----------|----------------|
| SC-001 / SC-002 | Passos 2–3 UI + smoke POST sem numero |
| SC-003 | Coluna Nº com **—** |
| SC-004 | Passo 4 (409) vs passo 3 (dois sem NF) |
| SC-005 | Visualizador |
| SC-006 | Rótulo NF sem `*` |

## Checagens locais

```bash
cd frontend && npm run lint && npm run type-check
```
