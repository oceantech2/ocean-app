# Quickstart: Contas a Receber — Novos nomes dos tipos

**Feature**: `017-contas-receber-tipos` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Contratos**: [api](./contracts/api-contas-receber-tipos.md) · [ui](./contracts/ui-contas-receber-tipos.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Reiniciar o backend após o código desta feature (dispara `_migrar()`)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` e `visualizador` / `123456`

## Smoke API (admin)

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -d "username=admin&password=123456" | jq -r .access_token)

# Create com cada tipo oficial — esperado 201 e tipo ecoado
for T in retainer sucesso parcelamento; do
  curl -s -X POST http://localhost:8001/api/nfs \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{
      \"razao_social\":\"Cliente $T\",
      \"valor_bruto\":1000,
      \"valor_liquido\":900,
      \"data_emissao\":\"2026-08-01\",
      \"data_vencimento\":\"2026-08-31\",
      \"tipo\":\"$T\"
    }" | jq '{id,tipo,tipo_abertura_fechamento}'
done
# tipo_abertura_fechamento deve ser null

# Mix — esperado três chaves + total
curl -s "http://localhost:8001/api/relatorios/fechamentos-por-tipo?ano=2026" \
  -H "Authorization: Bearer $TOKEN" | jq .

# DH novo — assunto com nome canônico
curl -s -X POST http://localhost:8001/api/dh \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "empresa":"Cliente DH",
    "posicao":"Engenheiro",
    "tipo_fechamento":"sucesso",
    "colaborador_preencheu":"Admin"
  }' | jq '{id,tipo_fechamento,assunto}'
# assunto contém "Sucesso" (não "Retainer - Fechamento" nem "retainer (fechamento)")
```

Após o primeiro boot com a feature, listar NFs Maggo do stub:

- `MAGGO-002` (retainer abertura) → `tipo: "retainer"`
- `MAGGO-003` (retainer fechamento) → `tipo: "sucesso"`
- `MAGGO-001` / `004` / `005` (sucesso antigo) → `tipo: "parcelamento"`

## Validação UI (admin)

1. **Contas a Receber** (`http://localhost:5193/nfs`): badges só Retainer / Sucesso / Parcelamento; select de nova conta com as três opções; Maggo readonly com nome novo; export CSV com os mesmos nomes.
2. Recarregar (F5): tipos oficiais permanecem (conversão não reprocessa Sucesso novo).
3. **DH**: três opções; três totais; assunto preview canônico.
4. **Relatórios**: pizza/texto com três grupos.
5. **Dashboard**: mix com três grupos (não o par antigo).
6. **Calendário**: comportamento atual (sem tipo de fechamento) — ok.

## Validação UI (visualizador)

1. Vê os três nomes; não cria nem edita tipo.

## Critérios de pronto (mapeamento)

| Critério | Como verificar |
|----------|----------------|
| SC-001 / SC-005 | Inspeção das telas: só Retainer, Sucesso, Parcelamento; sem “Abertura/Fechamento” |
| SC-002 | Dados pré-existentes após restart batem com a tabela de mapeamento |
| SC-003 | Create/edit manual < 1 min; F5 mantém |
| SC-004 | Visualizador e Maggo RO |
| SC-006 | Relatórios + Dashboard com três grupos |
| SC-007 | Stub Maggo após sync (tabela acima) |
| SC-008 | DH novo com assunto canônico; DH antigo inalterado |

## Lint

```bash
cd frontend && npm run lint && npm run type-check
```
