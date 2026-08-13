# Quickstart: Correção do cálculo de férias

**Feature**: `023-ferias-calculo`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [rest](./contracts/rest-ferias.md), [ui](./contracts/ui-ferias-calculo.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`
- Pelo menos um colaborador ativo (`COLAB` abaixo)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Smoke API

Ajuste `COLAB`. Os IDs `IDA`/`IDB` saem do `jq`.

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=admin&password=123456" | jq -r .access_token)
COLAB=1
ANO=2026

# 1) Primeira parcela — direito 30, 10 dias (01/03–10/03)
IDA=$(curl -s -X POST http://localhost:8001/api/ferias/ \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"colaborador_id\":$COLAB,\"ano\":$ANO,\"dias_direito\":30,\"dias_tirados\":10,\"data_inicio\":\"$ANO-03-01\",\"data_fim\":\"$ANO-03-10\"}" \
  | jq -r .id)

# 2) Fracionamento — direito 0, 8 dias
IDB=$(curl -s -X POST http://localhost:8001/api/ferias/ \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"colaborador_id\":$COLAB,\"ano\":$ANO,\"dias_direito\":0,\"dias_tirados\":8,\"data_inicio\":\"$ANO-04-01\",\"data_fim\":\"$ANO-04-08\"}" \
  | jq -r .id)

# 3) PUT intervalo invertido — esperado 422
curl -s -o /dev/null -w "%{http_code}\n" -X PUT "http://localhost:8001/api/ferias/$IDA" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"data_inicio\":\"$ANO-03-10\",\"data_fim\":\"$ANO-03-01\"}"
# → 422

# 4) PUT dias_direito — esperado 200 e valor persistido
curl -s -X PUT "http://localhost:8001/api/ferias/$IDA" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"dias_direito":30}' | jq '{id,dias_direito}'

# 5) DELETE da parcela com 30 — B deve ficar com dias_direito=30
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:8001/api/ferias/$IDA" \
  -H "Authorization: Bearer $TOKEN"
# → 204
curl -s "http://localhost:8001/api/ferias/$IDB" \
  -H "Authorization: Bearer $TOKEN" | jq '{id,dias_direito,dias_tirados}'
# → dias_direito 30, dias_tirados 8

# 6) DELETE da última — 204
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:8001/api/ferias/$IDB" \
  -H "Authorization: Bearer $TOKEN"
```

Na UI, após os passos 1–2 (antes do DELETE): resumo **direito 30, tirados 18, saldo 12**.

## Validação UI (checklist)

1. Abrir Férias no ano do teste → **resumo** com direito / tirados / saldo; tabela **sem** colunas Direito e Saldo.
2. Um período 30/10 → resumo saldo **20**.
3. Segunda parcela 8 dias (direito 0) → resumo 30 / 18 / **12**; linhas mostram 10 e 8.
4. Novo período no mesmo colaborador/ano: direito desabilitado; disponível = 12.
5. Datas 01/03–10/03 → 10 dias; mesmo dia início/fim → 1 dia.
6. Fim antes do início → aviso; **Salvar desabilitado**.
7. Datas que excedem o disponível → aviso; **Salvar habilitado**; resumo pode ficar negativo.
8. Segunda parcela com datas que cruzam a primeira → aviso de sobreposição; salva; saldo soma os dois `dias_tirados`.
9. Editar a parcela que tem 30: disponível = 30 − tirados das **outras**.
10. Excluir a parcela dos 30 com outra restante → resumo ainda usa direito 30.
11. Período pendente de 30 dias → saldo **0** e **banner de pendência visível**.
12. Como `visualizador`: resumo/lista corretos; sem criar/editar.

## Qualidade rápida

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

Checklist UI completo; DELETE transfere direito; PUT rejeita intervalo invertido e persiste `dias_direito`; lint/type-check passam; sino do menu inalterado (só o banner da página).
