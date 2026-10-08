# Contrato de UI: paginação do PDF da proposta

**Escopo**: página pública `/p/:codigo` dos modelos `executive-search` (v1 a v3) e `outplacement-development` (v1), botão **Baixar PDF** (`window.print()`).

## Regras (somente em `@media print`)

1. **Não dividir** (`break-inside: avoid`): `#servico`, `#garantias`, `.next`, `.contact`, `.step`, `.svc`, `.pos`, `.plan`, `.notes`, `.info div`, `.scope li`.
2. **Pode dividir entre filhos** (sem `break-inside: avoid`): `#investimento`, `#escopo`, seção do meio (`#metodologia` / `#principais-servicos`).
3. **Não quebrar logo após** (`break-after: avoid`): `.head`, `.pos h3`, `.notes h4`.
4. **Rodapé junto do contato**: `footer` dentro do `main`, irmão seguinte do `.contact`, com `break-before: avoid`.
5. Continua: `nav` e `.next .cta` ocultos; cores de fundo da capa, contato e cabeçalho de tabela preservadas; neutralização do CSS global de impressão do ERP.

## Invariantes

- Fora de `@media print`, nenhuma regra muda: a página na tela é idêntica.
- Textos, valores, idioma, moeda e nome do arquivo do PDF não mudam.
- Nenhuma seção é forçada a começar em página nova (`break-before: page` não é usado).
