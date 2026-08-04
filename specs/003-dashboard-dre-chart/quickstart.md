# Quickstart: validar gráfico DRE na Dashboard

**Feature**: `003-dashboard-dre-chart` | **Date**: 2026-07-26  
Modelo: [data-model.md](./data-model.md) · Contratos: [contracts/rest-dre-mensal.md](./contracts/rest-dre-mensal.md), [contracts/ui-dashboard-dre.md](./contracts/ui-dashboard-dre.md)

## Pré-requisitos

- Stack no ar (baseline / Docker)
- Portas: API **8001**, frontend **5193**
- Contas: `admin` / `123456`

```bash
docker compose up -d
cd frontend && npm run dev
```

Abrir: http://localhost:5193

## Cenários de validação

### V1 — Posição e layout do gráfico

1. Login → Dashboard no **ano corrente**.
2. **Esperado**: bloco DRE **logo abaixo** dos cards de saldo; título com o ano; por mês duas barras (receita | pilha); cores azul / vermelho / cinza / verde; eixo só até o **mês atual**.

### V2 — Ano anterior (12 meses)

1. Seletor de ano → ano anterior ao corrente.
2. **Esperado**: eixo jan–dez; pares de barras por mês.

### V3 — Labels (toggle)

1. Desmarcar Receita bruta → some barra azul; pilha permanece.
2. Desmarcar Despesa → some vermelho; impostos/lucro reempilham.
3. Remarcar tudo → volta ao estado completo.
4. Desmarcar todos → chart vazio/legível, sem crash.

### V4 — Lucro negativo

1. Identificar (ou preparar) um mês com despesa+impostos &gt; receita.
2. **Esperado**: sem segmento verde negativo; tooltip mostra lucro negativo; Despesa/Impostos ainda na pilha.

### V5 — Coerência com fontes (amostra)

1. Escolher um mês com dados.
2. Comparar `receita_bruta` com NFs pagas (bruto) do mês; `impostos` com tela Impostos / contas centro impostos no vencimento; despesa com demais centros (**exceto impostos**, inclui retirada).
3. Conferir `lucro = receita − despesa − impostos`.
4. Opcional API:

```bash
# Com token JWT
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/dre-mensal?ano=2026"
```

### V6 — Erro / vazio isolado

1. Ano sem lançamentos ou ano futuro no seletor.
2. **Esperado**: mensagem no bloco DRE; saldos e restante da dashboard utilizáveis.
3. (Opcional) Forçar falha do endpoint → erro só no bloco DRE.

## Checagens rápidas

```bash
cd frontend && npm run type-check && npm run lint
```
