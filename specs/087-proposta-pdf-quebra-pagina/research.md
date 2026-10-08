# Research: Blocos inteiros por página no PDF da proposta

## R1. Por que o bloco do projeto é dividido mesmo com `break-inside: avoid` nas seções

- **Decisão**: Remover `break-inside: avoid` das seções que podem passar de uma página e aplicá-lo nos blocos internos.
- **Rationale**: O Chrome classifica cada ponto de quebra por "atratividade" (perfeito, viola orphans/widows, viola avoid, último recurso). Dentro de um elemento com `break-inside: avoid`, **todo** ponto de quebra é "viola avoid", não importa se há outro `avoid` aninhado (a penalidade não acumula). Quando a seção é maior que a página, o navegador:
  1. empurra a seção inteira para a página seguinte (quebra antes dela é "perfeita"), deixando espaço em branco;
  2. na nova página, precisa quebrar dentro dela e, entre pontos de igual atratividade, escolhe o **último** que cabe, que pode ficar no meio de um projeto ou cartão.
  Sem o `avoid` na seção, as quebras entre projetos passam a ser "perfeitas" e as quebras dentro de um projeto (`.pos` com `avoid`) ficam penalizadas, então o navegador quebra entre projetos.
- **Evidência**: PDF da proposta local 37 (Development & Outplacement, 2 projetos). Página 3 só com o Escopo (Investimento empurrado); página 4 termina com "Posição 2 / RETAINER / TAXA"; página 5 começa com "15%". O cartão de contato também fica dividido entre as páginas 5 e 6 (não tinha `avoid`).
- **Alternativas consideradas**: Só adicionar `avoid` em `.pos`/`.plan` mantendo o da seção. Rejeitada: pela regra acima, não muda a escolha do ponto de quebra.

## R2. Gerar PDF por biblioteca (jsPDF/html2canvas) ou backend

- **Decisão**: Manter a impressão do navegador.
- **Rationale**: O problema é só de paginação e se resolve com CSS. Biblioteca nova traria peso no bundle público, texto como imagem (não selecionável) ou um renderizador no backend, contra o princípio V.
- **Alternativas consideradas**: html2canvas + jsPDF (texto vira imagem, cortes por altura fixa); Playwright no backend (infra nova no Render).

## R3. Quais seções continuam "não dividir"

- **Decisão**: Manter `break-inside: avoid` em `#servico` (texto fixo da divisão), `#garantias` (3 campos de até 255 caracteres + observações fixas), `.next` (Próximos passos) e `.contact`. Tirar de `#investimento`, `#escopo` e da seção do meio (`#metodologia` / `#principais-servicos`).
- **Rationale**: As seções mantidas têm tamanho limitado e sempre cabem numa página, então ficam inteiras sem risco de R1. As removidas crescem com o conteúdo (projetos, texto rico, 5 etapas em uma coluna no A4).
- **Alternativas consideradas**: Remover de todas e depender só dos blocos internos. Rejeitada: Garantias poderia ficar com as linhas numa página e as observações na outra, contra o pedido de "seções juntas".

## R4. Título sozinho no fim da página

- **Decisão**: `break-after: avoid` em `.head` (título de seção), `.pos h3` (nome do projeto) e `.notes h4`.
- **Rationale**: O Chrome atual respeita `break-after: avoid` entre irmãos de bloco, penalizando a quebra logo após o título. Para o nome do projeto, o `avoid` do `.pos` já garante; a regra extra reforça quando o projeto é maior que a página.

## R5. Versionamento do modelo

- **Decisão**: Não criar nova versão dos modelos.
- **Rationale**: O comentário de `pagina-modelo.css` pede versionar mudanças de textos/medidas porque propostas assinadas devem continuar idênticas. Regras de impressão não mudam texto, valores nem layout na tela; aplicar a todas as versões é o desejado (FR-007), inclusive às assinadas.

## R6. Grade (`grid`) dos projetos e cartões

- **Decisão**: Manter `display: grid` em `.invest`, `.plans`, `.steps` e `.svcs`.
- **Rationale**: O Chrome fragmenta grid por linhas e respeita `break-inside: avoid` nos itens. Confirmado no PDF real (projetos e cartões inteiros nas propostas de teste).

## R7. Rodapé sozinho na última página

- **Decisão**: Mover o `<footer>` para dentro do `<main>`, logo após o cartão de contato (sem o `.wrap` interno, que o `main.wrap` já fornece), e aplicar `break-before: avoid` nele na impressão.
- **Rationale**: Com o contato marcado como "não dividir", uma proposta de teste com 3 projetos gerou uma 7ª página só com a linha do rodapé. `break-before: avoid` no rodapé fora do `<main>` não teve efeito (nem `break-after: avoid` no `main`/`.contact`): o Chrome só recua a quebra para um ponto entre **irmãos** do mesmo container. Com rodapé e contato irmãos, o Chrome quebra antes do contato e os dois vão juntos para a página seguinte.
- **Evidência**: Captura de tela da página antes e depois, em 1280 px e 390 px de largura, idêntica pixel a pixel; o PDF da proposta de teste passa a ter contato + rodapé juntos na página 7.
- **Alternativas consideradas**: Reduzir o espaçamento do rodapé só na impressão (diminui a chance, mas não elimina); ocultar o rodapé no PDF (muda o conteúdo, contra FR-008).
