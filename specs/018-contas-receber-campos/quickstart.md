# Quickstart: Contas a Receber — Campos Maggo e Ocean

**Feature**: `018-contas-receber-campos` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-contas-receber-campos.md) · [ui](./contracts/ui-contas-receber-campos.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Restart do backend após `_migrar()` (colunas novas + DROP NOT NULL das datas)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`

## Smoke API (admin)

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -d "username=admin&password=123456" | jq -r .access_token)

# Listagem: deve existir Maggo sem NF (ex. MAGGO-006) — numero null, status pendente
curl -s "http://localhost:8001/api/nfs?limit=100" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '[.[] | select(.origem=="maggo") | {id,maggo_id,numero,razao_social,valor_imposto,data_ent_pgto,data_emissao,data_vencimento,status}]'

# Create manual mínimo — esperado 201, datas/NF null, pendente
curl -s -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "razao_social":"Cliente Manual 018",
    "valor_bruto":1000,
    "valor_liquido":900,
    "tipo":"sucesso"
  }' | jq '{id,numero,data_emissao,data_vencimento,status,origem}'

# Create com NF sem emissão — esperado 422
curl -s -o /tmp/nf422.json -w "%{http_code}\n" -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "numero":"018-SO-NUMERO",
    "razao_social":"Sem Emissao",
    "valor_bruto":1,
    "valor_liquido":1,
    "tipo":"retainer"
  }'
# → 422

# PUT Ocean em Maggo (trocar ID de um maggo_id MAGGO-006): NF + emissão + vencimento
# curl -s -X PUT http://localhost:8001/api/nfs/<ID> \
#   -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
#   -d '{"numero":"018-NF-1","data_emissao":"2026-08-10","data_vencimento":"2026-08-31"}' \
#   | jq '{numero,data_emissao,data_vencimento,status}'

# PUT Maggo tentando alterar bruto — esperado 422
# curl -s -o /tmp/maggo422.json -w "%{http_code}\n" -X PUT http://localhost:8001/api/nfs/<ID> \
#   -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
#   -d '{"valor_bruto":1}'
```

Recarregar `GET /api/nfs` depois do PUT Ocean: `numero` permanece; se o stub alterar valores, `valor_bruto`/`valor_imposto` podem mudar e a NF não some.

## Validação UI (admin)

1. Abrir **Contas a Receber** (`http://localhost:5193/nfs`).
2. Listagem: colunas Vaga, Empresa, Método de pagamento, Imposto, Data ent. pgto, NF, Emissão, Vencimento, Pagamento, Status. Conta Maggo nova com **—** em NF/emissão/vencimento; status **Pendente**. Imposto `0` ≠ **—**.
3. Editar Maggo: bloco Maggo readonly; NF e data de emissão **no mesmo passo**, editáveis. Salvar só vencimento futuro → pendente. Salvar vencimento passado sem pagamento → vencida.
4. Informar NF sem emissão → toast/422; informar os dois → persiste; F5 mantém.
5. Marcar Recebido (Caixa + data) sem vencimento → status paga.
6. **Nova conta a receber**: só Empresa, Método, Bruto, Líquido; salvar sem datas → lista com **—** e pendente.
7. Recarregar a página (sync Maggo): NF lançada no passo 4 **não** some; valores Maggo podem atualizar.

## Validação UI (visualizador)

1. Vê os dois grupos e as colunas novas; sem criar/editar.

## Critérios de pronto (mapeamento)

| Critério | Como verificar |
|----------|----------------|
| SC-001 | Passo 3 — Maggo RO vs Ocean editável |
| SC-002 | Passos 3–4 em &lt; 2 min |
| SC-003 | Passo 7 + smoke GET após PUT |
| SC-004 | Passo 2 — Maggo sem NF |
| SC-005 | Passo 2 — imposto e data ent. pgto vs pagamento |
| SC-006 | Passos 2, 3 e 5 — pendente / vencida / paga |
| SC-007 | Visualizador |
| SC-008 | Passo 4 — NF e emissão juntos; reabertura preenchida |

## Checagens locais

```bash
cd frontend && npm run lint && npm run type-check
```
