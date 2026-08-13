# Quickstart: Fluxo de Caixa — Conta Corrente e Conta Investimento

**Feature**: `025-fluxo-caixa-contas`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [rest](./contracts/rest-fluxo-movimentos-conta.md), [ui](./contracts/ui-fluxo-caixa-contas.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`
- Espelho 024 funcionando (CR recebida / CP paga no período)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Reiniciar o backend após o `ALTER TABLE` de `fluxo_movimentos.conta` (startup do `main.py`).

## Smoke API

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=admin&password=123456" | jq -r .access_token)

# Criar manual na corrente
curl -s -X POST http://localhost:8001/api/fluxo-movimentos/ \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tipo":"receita","descricao":"teste corrente","valor":10,"data_movimento":"2026-08-13","conta":"corrente"}'

# Listar só corrente
curl -s "http://localhost:8001/api/fluxo-movimentos/?ano=2026&conta=corrente" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Listar só investimento (não deve incluir o teste corrente)
curl -s "http://localhost:8001/api/fluxo-movimentos/?ano=2026&conta=investimento" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Esperado: POST 201 com `"conta":"corrente"`; GET investimento sem essa linha.

## Validação na UI

1. Como **admin**, abrir **Fluxo de Caixa**. O seletor está em **Conta corrente**. Um card de saldo (corrente), gráfico de uma série, tabela de saldos só corrente.
2. Ter no período: CR recebida com Caixa **investimento**, CR recebida **corrente** (ou sem Caixa), CP **paga**.
3. Em Conta corrente: ver CR corrente/sem Caixa e a CP; **não** ver a CR investimento.
4. Trocar para **Conta investimento** (mesmo mês/ano): ver só a CR investimento; **não** ver CP nem a CR corrente. Card/tabela/gráfico só investimento.
5. **Incluir receita** em investimento: modal **sem** campo conta; a linha aparece só nesse fluxo. Voltar à corrente: a receita não está lá.
6. **Registrar saldo** em investimento: sem select de conta; a linha não aparece na tabela da corrente.
7. Exportar CSV no fluxo ativo: só as linhas visíveis.
8. **Visualizador**: troca os dois fluxos; sem incluir, remover, registrar saldo nem Importar CSV.
9. Recarregar a página: volta para **Conta corrente**.

## Checagens extras

- Formulários de receita/despesa/saldo sem `<select>` de conta.
- Manuais antigos (antes da coluna) aparecem na **Conta corrente**.
- `npm run lint` e `npm run type-check` no `frontend`.

## Não validar nesta feature

- Campo Caixa em Contas a Pagar
- Recálculo automático dos saldos a partir dos movimentos
- Tipo transferência
- Memória do último fluxo após F5
