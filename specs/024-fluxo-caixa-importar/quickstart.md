# Quickstart: Fluxo de Caixa — Contas a Receber e Contas a Pagar

**Feature**: `024-fluxo-caixa-importar`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [rest](./contracts/rest-leitura-fluxo.md), [ui](./contracts/ui-fluxo-caixa-movimentos.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Smoke API (leitura)

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=admin&password=123456" | jq -r .access_token)

# Contas a Receber pagas (sem mes/ano — o caixa filtra pagamento no cliente)
curl -s "http://localhost:8001/api/nfs?skip=0&limit=1000&status_filtro=paga&incluir_arquivadas=false" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'

# Contas a Pagar pagas
curl -s "http://localhost:8001/api/contas?skip=0&limit=1000&pago=true" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
```

Esperado: HTTP 200. Não usar `mes`/`ano` em `/nfs` para simular o caixa.

## Validação na UI

1. Como **admin**, em Contas a Receber: marcar uma conta **Recebido** no mês/ano de teste (valor líquido &gt; 0). Em Contas a Pagar: **Pagar** uma conta no mesmo período (valor &gt; 0).
2. Abrir **Fluxo de Caixa**, selecionar esse mês/ano. **Sem** clicar em Importar CSV.
3. Conferir duas linhas: Origem **Contas a Receber** (entrada, valor líquido, data de pagamento) e **Contas a Pagar** (saída, valor, data de pagamento). Totais incluem os dois.
4. Não deve existir ação de omitir/remover nessas duas linhas.
5. **Incluir receita** manual no mesmo período: linha Origem **Manual**, com Remover.
6. Exportar CSV: colunas Data, Tipo, Origem, Descrição, Valor; os três tipos presentes se o passo 5 foi feito.
7. Voltar a Contas a Pagar, limpar data de pagamento (pendente). Recarregar ou mudar o mês e voltar no Fluxo: a saída automática some; o manual permanece.
8. Login **visualizador**: vê as mesmas linhas automáticas; sem Importar CSV, sem incluir receita/despesa, sem Remover.

## Checagens extras

- Conta a receber **pendente**: não aparece.
- Receber **arquivada**: não aparece.
- Valor zero na origem: não gera linha; as demais seguem.
- Reabrir o mesmo período: sem duplicar o mesmo `id`.
- `npm run lint` e `npm run type-check` no `frontend`.

## Não validar nesta feature

- Recálculo dos cards de saldo corrente/investimento a partir dos movimentos
- Importar planilha de CR/CP pela tela de Fluxo de Caixa
- Endpoint novo de movimentos unificados
