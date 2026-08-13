# Quickstart: Fluxo de Caixa — Transferência entre Caixas

**Feature**: `026-fluxo-caixa-transferencia`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [rest](./contracts/rest-fluxo-transferencias.md), [ui](./contracts/ui-fluxo-caixa-transferencia.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`
- Feature 025 no ar (dois fluxos). Espelho 024 (CR/CP) no período ajuda o teto, mas não é obrigatório para o smoke da API.

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Reiniciar o backend após o `ALTER TABLE` de `fluxo_movimentos.par_id` (startup do `main.py`).

## Smoke API

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=admin&password=123456" | jq -r .access_token)

curl -s -X POST http://localhost:8001/api/fluxo-transferencias \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"origem":"corrente","destino":"investimento","valor":100,"data_movimento":"2026-08-13"}'
```

Esperado: **201** com duas pernas, mesmo `par_id`, uma `conta=corrente` `tipo=despesa`, outra `investimento` `receita`, descrições com **para** / **de**.

```bash
# Recusar origem = destino
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8001/api/fluxo-transferencias \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"origem":"corrente","destino":"corrente","valor":10,"data_movimento":"2026-08-13"}'
# 400

# Listar por conta
curl -s "http://localhost:8001/api/fluxo-movimentos/?ano=2026&conta=corrente" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Desfazer (trocar PAR_ID)
curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "http://localhost:8001/api/fluxo-transferencias/PAR_ID" \
  -H "Authorization: Bearer $TOKEN"
# 204
```

Visualizador: POST deve ser **403**.

## Validação na UI

1. Como **admin**, abrir **Fluxo de Caixa**. **Não** há Incluir receita, Incluir despesa, Registrar saldo nem Importar CSV. Tabela de saldos **sem** Editar/Deletar.
2. Há **Transferência**. Abrir o modal: origem = fluxo ativo, destino = a outra conta.
3. Confirmar valor válido ≤ saldo visível da origem (se o card estiver zerado, usar valor pequeno só depois de haver base — ou recusar se teto 0).
4. Em Conta corrente: linha **Saída**, Origem **Transferência**, texto **para Conta investimento**. Totais incluem só esse lado. Card da corrente **cai** o valor.
5. Trocar para Conta investimento: **Entrada**, **de Conta corrente**, mesmo valor. Card **sobe**. CSV do fluxo ativo traz Origem Transferência.
6. Valor maior que o card da origem: toast, nada novo na lista.
7. **Desfazer**: as duas visões perdem a linha; cards voltam.
8. Manuais **antigos** (Origem Manual) continuam na lista; admin ainda pode Remover um legado.
9. **Visualizador**: vê transferências; sem botão Transferência, sem Desfazer, sem CSV de saldos.

## Checagens extras

- `npm run lint` e `npm run type-check` no `frontend`.
- DELETE `/fluxo-movimentos/{id}` de uma perna com `par_id` → 400.

## Não validar nesta feature

- Recálculo das **linhas** da tabela histórica de saldos
- Campo Caixa em Contas a Pagar
- Terceiro caixa ou transferência agendada
