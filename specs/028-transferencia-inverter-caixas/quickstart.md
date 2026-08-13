# Quickstart: Fluxo de Caixa — Inverter origem e destino da transferência

**Feature**: `028-transferencia-inverter-caixas`  
**Modelo**: [data-model.md](./data-model.md) · **UI**: [contracts/ui-fluxo-caixa-inverter-transferencia.md](./contracts/ui-fluxo-caixa-inverter-transferencia.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`
- Transferência 026 no ar (botão + POST)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação na UI

1. Como **admin**, **Fluxo de Caixa**, fluxo **Conta corrente**. Abrir **Transferência**.
2. Origem em texto: **Conta corrente**. Destino em texto: **Conta investimento**. **Não** há listas dessas duas contas.
3. Há o botão **Inverter**. Clicar nos nomes dos caixas **não** troca o par.
4. Preencher valor, data e observação. Acionar **Inverter**.
5. Origem = **Conta investimento**, destino = **Conta corrente**. Valor, data e observação **iguais**. O saldo visível da origem passa a ser o do investimento.
6. Acionar **Inverter** de novo: volta corrente → investimento, campos ainda preenchidos.
7. Com o par invertido (investimento → corrente), confirmar valor válido ≤ teto da **nova** origem. Na lista: saída no investimento, entrada na corrente.
8. Fechar sem salvar e reabrir: par volta ao padrão (fluxo ativo → o outro).
9. Repetir abertura com fluxo **Conta investimento** ativo: origem investimento, destino corrente.
10. **Visualizador**: sem Transferência e sem **Inverter**.

## Checagens extras

- `cd frontend && npm run lint && npm run type-check`
- Não há mudança esperada em `fluxo_movimentos.py` nem no contrato REST da 026.

## Não validar nesta feature

- Cálculo do saldo visível, teto, desfazer par, CSV, textos de/para (026)
- Terceiro caixa
