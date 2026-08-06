# Quickstart: Contas a Pagar — Input Manual de Valores

**Feature**: `014-contas-pagar-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-contas-pagar-manual.md) · [ui](./contracts/ui-contas-pagar-manual.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`

## Smoke API (admin)

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=admin&password=123456" | jq -r .access_token)

# Create pendente — esperado 201, pago=false
curl -s -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "descricao":"QS Aluguel",
    "categoria":"adm_financeiro",
    "subcategoria":null,
    "valor":5000.0,
    "data_vencimento":"2026-08-20",
    "data_pagamento":null
  }' | jq '{id,descricao,valor,pago,data_pagamento}'

# Create paga — esperado 201, pago=true
curl -s -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "descricao":"QS Taxa",
    "categoria":"adm_financeiro",
    "subcategoria":null,
    "valor":150.5,
    "data_vencimento":"2026-08-06",
    "data_pagamento":"2026-08-06"
  }' | jq '{id,descricao,valor,pago,data_pagamento}'

# Create valor inválido — esperado 422
curl -s -o /tmp/cp422.json -w "%{http_code}\n" -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "descricao":"QS Zero",
    "categoria":"adm_financeiro",
    "valor":0,
    "data_vencimento":"2026-08-20"
  }'
# → 422

# PUT limpar data (substitua ID) — esperado pago=false
ID=...
curl -s -X PUT "http://localhost:8001/api/contas/$ID" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"data_pagamento":null}' | jq '{id,pago,data_pagamento}'

# PUT valor em conta paga — esperado 200, valor novo, pago=true
curl -s -X PUT "http://localhost:8001/api/contas/$ID" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"valor":4999.99,"data_pagamento":"2026-08-06"}' | jq '{id,valor,pago,data_pagamento}'
```

## Smoke UI

1. Login **admin** → Contas a Pagar.
2. Confirmar CTA **“Nova conta a pagar”** (não “Nova Conta”).
3. Abrir formulário: campo valor com máscara `R$ …`; digitar montante; salvar pendente → aparece na lista formatado.
4. Criar com data de pagamento → status **Pago**.
5. Editar conta paga: alterar valor; salvar → lista atualiza; continua paga.
6. Editar conta paga: limpar data de pagamento; salvar → **Pendente**.
7. Tentar valor zero/vazio → bloqueio com toast.
8. Login **visualizador** → sem CTA de criação / sem editar.

## Checks locais

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto (quickstart)

- [ ] POST pendente e pago com `data_pagamento` respeitado no backend
- [ ] PUT `data_pagamento: null` → pendente
- [ ] Valor ≤ 0 rejeitado (422 ou toast)
- [ ] Máscara BRL no formulário; lista em R$
- [ ] CTA “Nova conta a pagar”
- [ ] Visualizador somente leitura
