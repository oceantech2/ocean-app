# Quickstart: Contas a Pagar — Confirmar lógica do input manual

**Feature**: `020-contas-pagar-logica` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-contas-pagar-logica.md) · [ui](./contracts/ui-contas-pagar-logica.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`

## Smoke API

```bash
TOKEN_ADMIN=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=admin&password=123456" | jq -r .access_token)

TOKEN_VIEW=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=visualizador&password=123456" | jq -r .access_token)

# Visualizador POST — esperado 403
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN_VIEW" -H "Content-Type: application/json" \
  -d '{"descricao":"QS View","categoria":"adm_financeiro","valor":10,"data_vencimento":"2026-08-20"}'
# → 403

# Create pendente
curl -s -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"descricao":"QS Aluguel","categoria":"adm_financeiro","subcategoria":null,"valor":5000,"data_vencimento":"2026-08-20","data_pagamento":null}' \
  | jq '{id,pago,data_pagamento}'

# Create duplicata — esperado 201 (segundo id)
curl -s -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"descricao":"QS Aluguel","categoria":"adm_financeiro","subcategoria":null,"valor":5000,"data_vencimento":"2026-08-20","data_pagamento":null}' \
  | jq '{id,descricao,valor}'

# Create com data futura — esperado 201, pago=true
curl -s -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"descricao":"QS Futuro","categoria":"adm_financeiro","valor":100,"data_vencimento":"2026-08-20","data_pagamento":"2027-01-15"}' \
  | jq '{id,pago,data_pagamento}'

# PUT Pagar (atalho) — esperado pago=true e data = hoje
ID=...
curl -s -X PUT "http://localhost:8001/api/contas/$ID" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"pago":true}' | jq '{id,pago,data_pagamento}'

# PUT limpar data — esperado pago=false
curl -s -X PUT "http://localhost:8001/api/contas/$ID" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"data_pagamento":null}' | jq '{id,pago,data_pagamento}'

# Visualizador PUT — esperado 403
curl -s -o /dev/null -w "%{http_code}\n" -X PUT "http://localhost:8001/api/contas/$ID" \
  -H "Authorization: Bearer $TOKEN_VIEW" -H "Content-Type: application/json" \
  -d '{"valor":1}'
# → 403
```

## Smoke UI

1. Login **admin** → Contas a Pagar.
2. CTA **“Nova conta a pagar”**; importação CSV/Excel visível; **sem** “Deletar todas”; **sem** coluna Origem/Caixa.
3. Criar pendente (sem data) → lista **Pendente** (ou **Vencida** se vencimento no passado).
4. Criar com data de pagamento (ex. ontem ou data futura) → **Pago**; valor em R$.
5. Criar segunda conta com os mesmos dados → as duas aparecem (sem aviso de duplicata).
6. Na pendente: **Pagar** um clique → “Pago em” **hoje**; **não** abre campo de data.
7. Conta paga: **não** há Desfazer na linha; Editar → limpar data → salvar → **Pendente**.
8. Editar conta paga: mudar valor → continua paga.
9. Login **visualizador** → consulta lista; sem criar/editar/pagar/importar.

## Checks locais

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de aceite rápido

- Lógica 014 preservada (máscara, CTA, status via data, import permanece).
- Visualizador: 403 na escrita da API e UI só leitura.
- Clarify: Pagar=hoje; qualquer data no form; duplicata ok; desfazer só na edição.
