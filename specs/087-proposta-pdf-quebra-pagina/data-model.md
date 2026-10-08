# Data Model: Blocos inteiros por página no PDF da proposta

Sem mudança de dados, tabelas, API ou tipos. A feature trata só da paginação visual do PDF.

## Blocos de paginação (entidades visuais)

| Bloco | Classe na página | Pode ser dividido? | Observação |
|---|---|---|---|
| Primeira seção da divisão | `#servico` | Não | Texto fixo por divisão |
| Seção do meio | `#metodologia` / `#principais-servicos` (`section` com `.steps` ou `.svcs`) | Sim, entre etapas/cartões | Título acompanha o 1º item |
| Etapa da metodologia | `.step` | Não | |
| Cartão de serviço | `.svc` | Não | |
| Escopo do Projeto | `#escopo` | Sim, entre parágrafos/itens | Título acompanha o 1º item |
| Item do escopo | `.scope li` | Não | |
| Investimento | `#investimento` | Sim, entre projetos e antes das Observações | Título acompanha o 1º projeto |
| Projeto | `.pos` | Não | Nome + todos os cartões |
| Cartão de investimento | `.plan` | Não | |
| Quadro de observações | `.notes` | Não | Investimento e Garantias |
| Garantias e condições | `#garantias` | Não | Até 3 linhas de 255 caracteres |
| Linha de garantia | `.info div` | Não | Reforço caso a seção quebre |
| Próximos passos | `.next` | Não | Botões ocultos na impressão |
| Cartão de contato | `.contact` | Não | |
| Rodapé | `footer` (dentro do `main`, após `.contact`) | Não se separa do contato | |
| Título | `.head`, `.pos h3`, `.notes h4` | Nunca fica sozinho no fim da página | |
