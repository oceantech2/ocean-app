# Contract: UI — Card NFs com pagamento pendente (R$)

**Feature**: `010-dashboard-nfs-pendente`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Papéis**: `admin` e `visualizador` veem o card (somente leitura; sem ações)

## Faixa de KPIs

Ordem (inalterada): **Faturamento Bruto** → **Faturamento Líquido** → **NFs com pagamento pendente (R$)**.

Layout: `grid grid-cols-1 md:grid-cols-3 gap-4` (3 cards; sem 4º card de quantidade).

## Card unificado (3º KPI)

| Elemento | Conteúdo / regra |
|----------|------------------|
| Título (`h3`) | `NFs com pagamento pendente (R$)` |
| Valor principal | `fmt(resumo.faturamento_bruto_pendente)` — tipografia/cor no padrão laranja do KPI anterior |
| Subtítulo | `{resumo.quantidade_pendentes} NFs pendentes` (ex.: `3 NFs pendentes`, `0 NFs pendentes`, `1 NFs pendentes`) |

**Proibido**: card separado cujo valor principal seja só a quantidade de NFs pendentes.

## Estados

| Situação | UI |
|----------|-----|
| Loading | Spinner de página existente |
| Sem pendentes | Valor `R$ 0,00` (via `fmt(0)`) + subtítulo `0 NFs pendentes` |
| Falha no resumo | Feedback de erro no padrão da página; sem inventar valores |
| Backend sem o campo novo | Tratar como `0` no render (`?? 0` / `\|\| 0`) até deploy alinhado |

## Fora de escopo UI

- Página Relatórios.
- Alterar cards de Faturamento Bruto / Líquido.
- Ações de clique/navegação a partir do card.
- Flexão singular (`1 NF pendente`).
