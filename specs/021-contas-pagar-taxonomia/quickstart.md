# Quickstart: Contas a Pagar — Taxonomia de Categorias

**Feature**: `021-contas-pagar-taxonomia` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-contas-pagar-taxonomia.md) · [ui](./contracts/ui-contas-pagar-taxonomia.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`
- Ideal: ao menos uma conta já gravada como `recursos_humanos` + `beneficios` (legado). Se não houver, inserir só para o teste de preservação (não via POST da taxonomia nova).

## Smoke API

```bash
TOKEN_ADMIN=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=admin&password=123456" | jq -r .access_token)

# POST Benefícios (categoria) — esperado 201, subcategoria null
curl -s -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"descricao":"QS Plano","categoria":"beneficios","subcategoria":null,"valor":100,"data_vencimento":"2026-08-20"}' \
  | jq '{id,categoria,subcategoria}'

# POST RH + beneficios — esperado 422
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"descricao":"QS Legado","categoria":"recursos_humanos","subcategoria":"beneficios","valor":100,"data_vencimento":"2026-08-20"}'
# → 422

# POST RH sem sub — esperado 422
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"descricao":"QS RH","categoria":"recursos_humanos","valor":100,"data_vencimento":"2026-08-20"}'
# → 422

# POST RH / Salário — esperado 201
curl -s -X POST http://localhost:8001/api/contas/ \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"descricao":"QS Folha","categoria":"recursos_humanos","subcategoria":"salario","valor":1000,"data_vencimento":"2026-08-20"}' \
  | jq '{id,categoria,subcategoria}'

# GET filtro Benefícios — só categoria=beneficios
curl -s "http://localhost:8001/api/contas/?limit=500&categoria=beneficios" \
  -H "Authorization: Bearer $TOKEN_ADMIN" | jq '[.[] | {id,categoria,subcategoria}]'

# GET filtro RH sem sub — inclui legado se existir
curl -s "http://localhost:8001/api/contas/?limit=500&categoria=recursos_humanos" \
  -H "Authorization: Bearer $TOKEN_ADMIN" | jq '[.[] | {id,subcategoria}]'
```

Se houver `ID_LEGADO` (RH + beneficios):

```bash
# PUT só valor — esperado 200, par legado intacto
curl -s -X PUT "http://localhost:8001/api/contas/$ID_LEGADO" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"valor":123}' | jq '{id,categoria,subcategoria,categoria_pendente,valor}'

# PUT reclassificar — esperado categoria=beneficios, sub=null
curl -s -X PUT "http://localhost:8001/api/contas/$ID_LEGADO" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"categoria":"beneficios","subcategoria":null}' | jq '{id,categoria,subcategoria}'
```

## Smoke UI

1. Login **admin** → Contas a Pagar. Select Categorias na ordem: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Benefícios, Tecnologia, Impostos.
2. Nova conta: RH → sub só com 4 opções (sem Benefícios). Salvar RH sem sub → bloqueado.
3. Criar Benefícios (categoria) e RH / Salário → ambas na lista com rótulos corretos.
4. Filtro Benefícios → só a categoria nova. Filtro RH (todas as subs) → oficiais + legado, **sem** a conta da categoria Benefícios.
5. Conta legado (se houver): rótulo **Recursos Humanos / Benefícios**, **sem** badge de reclassificar. Editar → valor atual visível; salvar só descrição/valor → par permanece. Trocar para categoria Benefícios → some do filtro RH.
6. Importar linha com categoria `recursos_humanos` e sub `beneficios` → erro na linha.
7. Dashboard: donut mostra fatia Benefícios se houver valor na categoria nova; RH não inclui essas contas.
8. Impostos / Retiradas: recortes iguais (Impostos; RH / Retirada Sócios).
9. Login **visualizador** → vê categorias e filtros; sem criar/editar/importar.

## Checks locais

```bash
cd frontend && npm run lint && npm run type-check
```

Critérios: SC-001 a SC-009 da spec. Sem converter contas legado no deploy.
