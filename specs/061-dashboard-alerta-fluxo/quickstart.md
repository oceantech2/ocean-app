# Quickstart: Alerta de Fluxo de Caixa no Dashboard

**Feature**: `061-dashboard-alerta-fluxo`  
**Branch**: `061-dashboard-alerta-fluxo`

Validação manual end-to-end. Detalhes: [data-model.md](./data-model.md), [contracts/](./contracts/).

## Pré-requisitos

- API `http://localhost:8001`, frontend `http://localhost:5193`
- Login `admin` / `123456` e `visualizador` / `123456`
- Features 057–060 disponíveis (toggle, Pipeline/Competência, Aging)
- Fixture no período selecionado:
  - Contas com fechamento no período: Total Fechado > 0 e Já Recebido tal que `%` fique **acima** e **abaixo** do limiar (ex. limiar 60 → cenários 70% e 40%)
  - NF em aberto com `data_vencimento` ≥ hoje (próximo)
  - NF em aberto só vencida no passado (sem próximo)
  - NF no bucket 60–90 do Aging (Aging em atenção > 0)

```bash
docker compose up -d
cd frontend && npm run dev
```

## 1. Smoke limiar

```bash
# GET /api/configuracoes/limiar-alerta-fluxo  → 200, limiar_percentual (default 60)
# PUT (admin) {"limiar_percentual": 50}     → 200, 50
# PUT (visualizador)                         → 403
# PUT {"limiar_percentual": 0} ou 101        → 422
# PUT {"limiar_percentual": 60.5}            → 422 (só inteiros)
```

## 2. Smoke próximo recebimento

```bash
# GET /api/relatorios/proximo-recebimento
```

Esperado: 200; `referencia` = hoje; com fixture ≥ hoje → `encontrado: true` + data/valores; só vencidos → `encontrado: false`.

## 3. Banner no Dashboard (SC-001, SC-008, SC-014)

1. Abrir Dashboard como `admin` em período com `% > limiar`.
2. Banner âmbar no topo com % , próximo e Aging em atenção.
3. Sem controle de dismiss.
4. Trocar para período com `% ≤ limiar` → banner some.
5. Controle de limiar visível mesmo com banner oculto.
6. (Opcional) Cenário com % calculado 60,04 e limiar 60 → banner **aparece** mesmo se a UI mostrar ~60,0%.

## 4. Toggle e papéis (SC-005, SC-007)

1. Alternar Bruto/Líquido → valores/% mudam; banner pode cruzar o limiar.
2. Login `visualizador`: mesmos números do banner; **sem** edição de limiar.

## 5. Limiar (SC-006, SC-013)

1. Com % ≈ 50 e limiar 60 → banner oculto.
2. Admin altera limiar para 40 → banner aparece sem precisar recriar dados.
3. Tentar salvar `60,5` → rejeitado; limiar anterior permanece.
4. Confirmar que Configuração do Período **não** inclui campo limiar.

## 6. Próximo e Aging (SC-003, SC-004)

1. Data do próximo = mínima ≥ hoje da fixture; valor bate com a NF.
2. Aging em atenção ≈ `d60_90` do card Aging (≤ R$ 0,01).
3. Só vencidos → “sem próximo / sem previsão”.

## 7. Falha parcial (SC-011, SC-012) — opcional

1. Simular falha do Aging (ex. bloquear rota) com % ainda acima do limiar → banner visível; Aging = “indisponível” (não R$ 0).
2. Simular falha do Pipeline → banner oculto.

## 8. Qualidade

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

- [x] Limiar GET/PUT conforme contrato (**inteiros** 1–100)
- [x] Próximo recebimento conforme contrato
- [x] Banner só com `% calculado > limiar`; não dismissível; arredondamento UI não decide
- [x] Reuso Pipeline + Aging; toggle coerente
- [x] Admin edita limiar no Dashboard; visualizador não
- [x] Lint + type-check OK _(alertaFluxo OK; ESLint sem config; erros tsc pré-existentes fora da 061)_
