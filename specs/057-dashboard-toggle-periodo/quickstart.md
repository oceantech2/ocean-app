# Quickstart: Toggle Bruto/Líquido + Configuração do Período

**Feature**: `057-dashboard-toggle-periodo`  
**Pré-requisitos**: Docker (API **8001**, Postgres **5433**), frontend **5193**, login `admin` / `123456` (e `visualizador` / `123456` para papéis).

Referências: [data-model.md](./data-model.md), [contracts/rest-configuracao-periodo.md](./contracts/rest-configuracao-periodo.md), [contracts/rest-pipeline-receita-toggle.md](./contracts/rest-pipeline-receita-toggle.md), [contracts/ui-dashboard-toggle-periodo.md](./contracts/ui-dashboard-toggle-periodo.md).

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Confirmar migração: após subir o backend, `metas_financeiras` possui coluna `aliquota_periodo`.

## Cenários de validação

### 1. Toggle padrão e troca de base (SC-002, SC-002a, SC-003)

1. Abrir Dashboard com mês selecionado; toggle em **Líquido**.
2. Anotar Pipeline (valores), meta mensal e cards de receita; anotar Impostos e despesas.
3. Alternar para **Bruto**.
4. **Esperado**: receita/Pipeline/meta mudam para base bruta; contagens do Pipeline iguais; Impostos e despesas **iguais**; sem card de receita mostrando a base oposta ao mesmo tempo.
5. Voltar para Líquido → valores líquidos restaurados.

### 2. Meta bruta (SC-001)

1. Como `admin`, salvar Configuração: meta líquida `300000`, alíquota `18.5` (confirmar massa se pedido).
2. Toggle **Bruto**.
3. **Esperado**: meta exibida ≈ `368098.16` (diff ≤ R$ 0,01).

### 3. Save obrigatório conjunto (SC-007, SC-008)

1. Tentar salvar só meta ou só alíquota / campo vazio.
2. **Esperado**: rejeição UI ou 422; nada persistido.
3. Período sem config: UI indica ausência; sem meta bruta inventada.

### 4. Confirmação e update em massa (SC-004, SC-004a)

1. Ter NFs com `data_emissao` no mês M e outras fora de M.
2. Alterar alíquota → salvar → **cancelar** confirmação.
3. **Esperado**: config e NFs inalterados.
4. Salvar de novo → **confirmar**.
5. **Esperado**: NFs com emissão em M com nova `aliquota_imposto` e `valor_liquido` coerente; NFs fora de M intactas; sem emissão intactas.
6. Alterar **só** meta líquida → save **sem** modal de massa.

### 5. Papéis (SC-005)

1. `visualizador`: usa toggle; vê números; **não** salva período (403 ou controles ausentes).
2. `admin`: salva com sucesso.

### 6. Pipeline identidade nas duas bases (SC-006)

1. Em Líquido e em Bruto: `A Faturar + Faturado + Recebido = Fechado` (valor); contagens iguais entre bases.

### 7. Meta anual intacta

1. Editar meta anual (`mes=0`) pelo fluxo já existente.
2. **Esperado**: continua funcionando; sem exigir alíquota.

## Smoke API (opcional)

```bash
# Após login e token:
# GET  /api/metas/periodo?mes=9&ano=2026
# PUT  /api/metas/periodo  (sem confirmar → 409 se alíquota mudou)
# PUT  /api/metas/periodo  com confirmar_atualizacao_massa=true
# GET  /api/relatorios/pipeline-receita?ano=2026&mes=9
#      → cada estágio com valor_liquido e valor_bruto
```

## Checks estáticos

```bash
cd frontend && npm run lint && npm run type-check
```

## Done quando

- Cenários 1–7 passam
- Lint/type-check OK
- Nenhum card das seções 05–09 foi implementado “por antecipação”
