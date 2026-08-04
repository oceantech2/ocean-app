# Research: Calendário com Legenda de Status

**Feature**: `006-calendario-legenda` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

## 1. Escopo: só frontend vs. endpoint de calendário

**Decision**: Manter o padrão atual — `Calendario.tsx` busca listas via `nfsService.listar` + `contasService.listar` e monta eventos no client. **Não** criar endpoint agregado de calendário nesta feature.

**Rationale**: Spec pede “manter” o Calendário; o delta é legenda + regras de cor/filtro. Endpoint novo seria overkill e fora do escopo fechado.

**Alternatives considered**:
- `GET /api/calendario?mes=&ano=` — rejeitado (API nova sem ganho de negócio nesta entrega).
- Filtrar canceladas no backend — rejeitado (o front já tem o status; filtro local atende FR-002).

## 2. Onde aplicar filtro de NFs canceladas

**Decision**: Ao montar `eventosPorDia`, **não** chamar `addEvento` para NFs com `status === 'cancelada'`. Contas continuam todas as que tiverem `data_vencimento` (modelo atual sem status “cancelada” equivalente).

**Rationale**: Clarify Q1; evita poluir grade/detalhe/export do mês com itens sem efeito. Export CSV herda o mesmo conjunto (só eventos no mapa).

**Alternatives considered**:
- Filtrar na UI só na renderização — rejeitado (detalhe e export ainda veriam canceladas se o mapa as incluísse).
- Soft-hide com cor cinza — rejeitado (fora da legenda de 4 itens; clarify escolheu ocultar).

## 3. Mapeamento status → cor / rótulo de legenda

**Decision**: Função (ou tabela) única no client:

| Origem | Condição | Status visual | Cor Tailwind (marcador) |
|--------|----------|---------------|-------------------------|
| NF | `pendente` ou `vencida` | A receber | `blue-500` / `bg-blue-100 text-blue-700` (+ dark) |
| NF | `paga` | Recebido | `green-500` / `bg-green-100 text-green-700` (+ dark) |
| Conta | `pago === false` | A pagar | `orange-500` / `bg-orange-100 text-orange-700` (+ dark) |
| Conta | `pago === true` | Pago | mesmas classes green que Recebido |

Legenda exibe os quatro rótulos com **inicial maiúscula**, ordem: A receber → Recebido → A pagar → Pago.

**Rationale**: Spec FR-003–008 + clarify; reutiliza classes já presentes na página; Recebido e Pago compartilham verde sem ícone extra.

**Alternatives considered**:
- Tons de verde distintos — rejeitado (clarify Q3 = A).
- Legenda antiga (NF / Conta / Quitado) — rejeitada (FR-008).

## 4. Modelo interno do evento

**Decision**: Estender o tipo local `Evento` (ou equivalente) com campo derivado `statusVisual: 'a_receber' | 'recebido' | 'a_pagar' | 'pago'` **ou** manter `tipo` + `pago` e derivar classes/rótulos na renderização. Preferência: **derivar na renderização** a partir de `tipo` + `pago` (NF: `pago` iff `status === 'paga'`), desde que canceladas nunca entrem no mapa — menos churn no tipo.

**Rationale**: Comportamento atual já usa `ev.pago` + `ev.tipo` para cores; basta garantir filtro e legenda. Introduzir `statusVisual` só se a legenda/detalhe precisarem do rótulo textual do status (opcional; detalhe hoje mostra tipo NF/Conta).

**Alternatives considered**: Enum `statusVisual` obrigatório em todo evento — útil se export passar a usar os quatro rótulos; adiado (FR-009: não alterar escopo de negócio da exportação).

## 5. Exportação CSV / PDF

**Decision**: Manter botões e comportamento atuais. Coluna Status do CSV pode continuar “Pago” / “Pendente” (ou equivalente atual); **não** é requisito desta feature renomear para os quatro status da legenda.

**Rationale**: FR-009 — preservar funções auxiliares sem expandir escopo. Conjunto exportado = eventos do mapa (já sem canceladas).

**Alternatives considered**: Mapear Status para “A receber” / “Recebido” / … — polish futuro, fora do MVP desta spec.

## 6. Layout da legenda

**Decision**: Substituir o bloco atual de 3 spans pelo bloco de 4 itens (bolinha + rótulo), mesma tipografia/`flex gap-4 text-sm` já usada. Cores das bolinhas: `bg-blue-500`, `bg-green-500`, `bg-orange-500`, `bg-green-500` (duas verdes idênticas).

**Rationale**: Menor diff visual; atende SC-001/FR-003.

**Alternatives considered**: Legenda em card separado / tooltip — desnecessário.

## Resolução de NEEDS CLARIFICATION

Nenhum item “NEEDS CLARIFICATION” no Technical Context do plan — decisões acima fecham o desenho.
