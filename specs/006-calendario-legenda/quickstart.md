# Quickstart: Validação — Calendário com Legenda de Status

**Feature**: `006-calendario-legenda` | **Date**: 2026-07-26  
**Contrato**: [contracts/ui-calendario-legenda.md](./contracts/ui-calendario-legenda.md) · **Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- Infra / API conforme projeto (`docker compose up -d` se necessário; API **8001**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Credenciais de desenvolvimento do projeto (não documentar senhas neste artefato — ver README/CLAUDE)
- Ideal: no mês corrente, amostras de NF `pendente` ou `vencida`, NF `paga`, conta não paga, conta paga; e pelo menos uma NF `cancelada` com vencimento no mês (para V4)

## Setup

```bash
cd frontend
npm run dev
```

Abrir `http://localhost:5193`, autenticar e ir em **Calendário**.

## Cenários de validação

### V1 — Legenda (P1)

1. Abrir `/calendario`.
2. **Esperado**: legenda com exatamente quatro itens, nesta ordem e grafia: **A receber** (azul), **Recebido** (verde), **A pagar** (laranja), **Pago** (verde). Sem rótulos “NF” / “Conta a pagar” / “Quitado” na legenda.

### V2 — Cores na grade e no detalhe (P1/P2)

1. Localizar (ou criar nas páginas NFs/Contas) um evento de cada status no mês visível.
2. Na grade, conferir cores dos chips; clicar no dia e conferir bolinhas no detalhe.
3. **Esperado**:
   - NF pendente/vencida → azul  
   - NF paga → verde  
   - Conta não paga → laranja  
   - Conta paga → verde  
4. No mesmo dia com NF paga + conta paga: ambas verdes; distinção por `(NF)` vs `(Conta)`.

### V3 — Calendário mantido (P1)

1. Navegar ← → entre meses; selecionar dia com e sem eventos.
2. **Esperado**: grade atualiza; dia vazio mostra mensagem; exportações CSV/PDF ainda disponíveis; sem regressão óbvia de layout.

### V4 — NFs canceladas ocultas

1. Garantir NF `cancelada` com `data_vencimento` no mês exibido.
2. **Esperado**: não aparece na grade nem no detalhe daquele dia; export CSV do mês também não a lista.

### V5 — NF vencida = A receber

1. NF com status `vencida` (não paga) no mês.
2. **Esperado**: azul (A receber), não oculta e sem cor extra.

### V6 — Permissões

1. Usuário com `calendario`: vê página e legenda (visualizador: só leitura, como hoje).
2. Usuário sem permissão: não acessa o Calendário (comportamento atual de rota/menu).

### V7 — Qualidade estática

```bash
cd frontend
npm run lint
npm run type-check
```

**Esperado**: sem erros novos introduzidos pela mudança em `Calendario.tsx`.

## Critério de aceite rápido

- [ ] Legenda 4 itens Title Case + cores corretas  
- [ ] Marcadores coerentes com a legenda  
- [ ] Canceladas ausentes  
- [ ] `vencida` em azul  
- [ ] Fluxo mensal/detalhe/export intacto  
