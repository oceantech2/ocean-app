# Quickstart: Contas a Pagar — Edição em massa de datas

**Feature**: `067-contas-pagar-datas-massa`  
**Contratos**: [rest](./contracts/rest-contas-pagar-datas-massa.md) · [ui](./contracts/ui-contas-pagar-datas-massa.md)  
**Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

```bash
docker compose up -d
cd frontend && npm run dev
```

- API: http://localhost:8001  
- App: http://localhost:5193  
- Login admin: `admin` / `123456`  
- Login visualizador: `visualizador` / `123456`

Ter ao menos **3 contas a pagar** com vencimentos em **dois meses distintos** (pode criar pela UI).

## Smoke UI (admin)

1. Abrir **Contas a Pagar**.
2. Confirmar checkboxes por linha e cabeçalho de grupo **Mês/Ano**.
3. Marcar o grupo de um mês → todas as linhas daquele mês selecionadas; contador N &gt; 0.
4. **Editar datas em massa** → informar só novo vencimento → confirmar.
5. Esperado: toast com processados; listagem/cards atualizados; **seleção limpa**; pagamento antigo preservado.
6. Selecionar 2+ contas → lote só com data de pagamento.
7. Esperado: contas ficam **Pagas** com a data informada; cards refletem.
8. Selecionar contas → abrir modal → **Cancelar**.
9. Esperado: datas intactas; seleção permanece.
10. Alterar filtro Mês/Ano com seleção ativa → seleção limpa.
11. Modal sem nenhuma data → não grava; mensagem de validação.

## Smoke UI (visualizador)

1. Login como visualizador → Contas a Pagar.
2. Esperado: sem checkboxes de seleção e sem **Editar datas em massa**.

## Smoke API (opcional)

```bash
# Obter token (ajuste se o form de login local diferir)
TOKEN=...  # Bearer do admin

curl -s -X POST "http://localhost:8001/api/contas/acoes/editar-datas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids":[1,2],"data_vencimento":"2026-11-01"}'
```

Esperado: `{"processados":...,"ignorados":...}`.  
Sem datas / ids vazio → 422. Token visualizador → 403.

## Critérios de aceite rápidos

| Critério | Ok? |
|----------|-----|
| SC-001: ≥5 contas em um lote &lt; 1 min | |
| SC-002: cancelar não grava | |
| SC-003: sucesso atualiza listagem/cards e limpa seleção | |
| SC-004: visualizador bloqueado | |
| SC-005: resumo mostra N e campos antes de confirmar | |

## Fora deste quickstart

Implementação linha a linha, migrations e suíte automatizada completa ficam em `/speckit-tasks` + `/speckit-implement`.
