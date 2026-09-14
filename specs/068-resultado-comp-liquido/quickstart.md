# Quickstart: Resultado Competência fixo em líquido

**Feature**: `068-resultado-comp-liquido`  
**Contratos**: [calc-resultado-comp-liquido.md](./contracts/calc-resultado-comp-liquido.md), [ui-resultado-comp-liquido.md](./contracts/ui-resultado-comp-liquido.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` (ou `visualizador` / `123456`)
- Período com **Total Fechado bruto ≠ líquido** e ao menos uma despesa paga (fixa ou variável) no período

## Setup rápido

```bash
docker compose up -d
cd frontend && npm run dev
```

Abrir `http://localhost:5193`, autenticar, ir ao **Dashboard**, escolher mês/ano com dados dual-base.

## Cenários de validação

### 1. Estabilidade no toggle + subtítulo (SC-001, SC-004, SC-007)

1. Toggle em **Líquido**; anotar valor e % de **Resultado Competência**.
2. Confirmar subtítulo **“base líquida”** no card Competência; confirmar que **Resultado Caixa** **não** tem esse subtítulo.
3. Anotar **Impostos Recolhidos** (aba Por Caixa) — deve permanecer estável no passo 4.
4. Alternar para **Bruto**.
5. **Esperado**: Resultado Competência **igual** ao passo 1 (tol. R$ 0,01 / 0,1 p.p.); subtítulo **“base líquida”** ainda visível; Impostos Recolhidos inalterado; Caixa sem “base líquida”.

### 2. Fórmula vs Total Fechado líquido (SC-002)

1. Em Por Competência (ou via Pipeline/API), obter **Total Fechado líquido**.
2. Somar Despesas Fixas + Variáveis do bloco.
3. Conferir Resultado Competência ≈ `fechado_líquido − (fixas + variáveis)` e % ≈ `resultado ÷ fechado_líquido × 100` (se fechado_líquido > 0).

### 3. Resultado Caixa ainda reage (SC-003)

1. Com Recebido bruto ≠ líquido, alternar Bruto ↔ Líquido.
2. **Esperado**: **Resultado Caixa** muda; **Resultado Competência** não muda.

### 4. Período e receita zero (SC-005, US3)

1. Trocar mês/ano; Resultado Competência recalcula em líquido em percepção &lt; 5 s; subtítulo permanece.
2. Período sem fechamentos: valor = `0 − despesas`; % “—”; subtítulo **“base líquida”** permanece.

### 5. Papéis (SC-006)

Repetir cenário 1 com `visualizador` — mesmos números e mesmo subtítulo.

## Smoke API (opcional)

Só para conferir insumos; a feature não altera endpoints:

```bash
# JWT + período de exemplo
curl -s "http://localhost:8001/api/relatorios/pipeline-receita?ano=AAAA&mes=M" \
  -H "Authorization: Bearer <token>"
```

Usar `fechado.valor_liquido` como receita canônica do card Competência.

## Critério de pronto

Todos os cenários 1–5 passam; subtítulo canônico **“base líquida”** só no Competência; nenhuma regressão em Despesas Fixas/Variáveis/Pendentes nem em Impostos Recolhidos.
