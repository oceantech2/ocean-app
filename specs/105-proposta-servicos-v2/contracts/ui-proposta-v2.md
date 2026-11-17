# Contract: UI Proposta v2

## Formulário (Nova / Editar)

- Sem selects Divisão / Modelo de página.
- Card **Serviço**: checkboxes dos 5 serviços (ícone + título + tagline).
- **Setor**: opções atuais + Outros; preview de capa.
- **Observações**: dois textareas (investimento / garantias); hint `{imposto}` → valor da Config.
- Validação: ≥1 serviço; restante igual ao fluxo atual (projetos 1–10, escopo ≤5000, etc.).

## Página pública / PDF

- Estrutura: tabela `.pf` (thead/tfoot spacer 11mm) + capa + main (serviços, escopo, investimento, garantias, fechamento, footer).
- Print: `@page { size: A4; margin: 0 }`; mobile breakpoints só em `screen`.
- CTA Aceitar / WhatsApp / Baixar PDF; Baixar PDF = `window.print` com título do documento.

## Texto de imposto (obrigatório)

- pt-BR: `Impostos ({imposto}) serão adicionados a todos os valores informados.`
- en-US: `Taxes ({imposto}) will be added to all amounts stated.`
