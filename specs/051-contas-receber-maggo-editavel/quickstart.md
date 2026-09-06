# Quickstart: Contas a Receber — Maggo editável

**Feature**: `051-contas-receber-maggo-editavel`  
**Contratos**: [rest-maggo-editavel.md](./contracts/rest-maggo-editavel.md) · [ui-maggo-editavel.md](./contracts/ui-maggo-editavel.md)  
**Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

```bash
docker compose up -d
# API http://localhost:8001 — frontend http://localhost:5193
cd frontend && npm run dev
```

Login: `admin` / `123456` e, nos testes de RO, `visualizador` / `123456`.

## V1 — Editar campos Maggo (P1 / SC-001, SC-005)

1. Abrir **Contas a Receber**; escolher uma conta com origem **Maggo**.
2. Editar: empresa (ou projeto), valor bruto e/ou alíquota, data de fechamento; opcionalmente tipo.
3. Confirmar: imposto e líquido **não** são digitáveis e mudam com o cálculo.
4. Salvar → recarregar.
5. **Esperado**: valores novos persistidos; origem continua **Maggo**.

## V2 — Maggo não é atualizada / merge não reverte (SC-002, SC-003, SC-006)

1. Anotar `maggo_id` e valores após V1.
2. Recarregar a listagem (dispara sync stub).
3. **Esperado**: campos Maggo no Ocean **iguais** aos salvos (stub não sobrescreve existente).
4. Se houver fechamento stub **novo** (id ainda inexistente): aparece na lista com dados da fonte.

## V3 — Conta Recebida: caixa intacto (SC-007)

1. Conta Maggo **Recebida** com lançamento já visível no **Fluxo de Caixa** (anotar valor/data/conta).
2. Alterar bruto ou alíquota; salvar.
3. **Esperado**: listagem/totais de Contas a Receber com valor novo; lançamento de caixa **igual** ao anotado.

## V4 — Comissões não recalculam sozinhas (SC-008)

1. Conta Maggo com ao menos uma comissão vinculada (anotar `valor_bonus` e se liberada).
2. Alterar só bruto/alíquota (não editar linhas de comissão); salvar.
3. Abrir de novo a conta / página Comissões.
4. **Esperado**: valores e status das comissões **iguais** aos anotados.

## V5 — Visualizador (SC-004)

1. Login visualizador; abrir a mesma conta Maggo.
2. **Esperado**: campos Maggo não editáveis; sem salvar.

## V6 — Manual sem regressão + Ocean

1. Editar conta **manual** (campos Maggo + um campo Ocean, ex. vencimento).
2. **Esperado**: ambos persistem; status derivado coerente.

## Lint

```bash
cd frontend && npm run lint && npm run type-check
```

## Mapa SC → cenários

| Critério | Cenário |
|----------|---------|
| SC-001 | V1 |
| SC-002 / SC-003 | V2 |
| SC-004 | V5 |
| SC-005 | V1 |
| SC-007 | V3 |
| SC-008 | V4 |
| FR-007 / US3 | V6 |
