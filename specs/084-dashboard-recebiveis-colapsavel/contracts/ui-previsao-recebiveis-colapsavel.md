# Contrato UI: Previsão de Recebíveis Recolhível

**Feature**: `084-dashboard-recebiveis-colapsavel`  
**Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

| Aspecto | Contrato |
|---------|----------|
| Estado inicial | Fechada em todo carregamento do Dashboard |
| Sempre visível | Título "Previsão de Recebíveis", subtítulo (referência + visão de receita), "Total em aberto" |
| Visível só quando aberta | Grid de cards por faixa de vencimento **ou** mensagem de erro do aging |
| Gatilho | Todo o cabeçalho é um `button type="button"` (clique, Enter, Espaço) |
| Acessibilidade | `aria-expanded={aberto}` e `aria-controls` apontando para o id do conteúdo |
| Indicador | Seta (`ChevronRightIcon`) à esquerda do título; rotacionada 90° quando aberta |
| Dados | Sem nova requisição ao alternar; valores idênticos antes/depois |
| Papéis | Igual para `admin` e `visualizador` |
| Tema | Classes claras/escuras atuais preservadas; foco visível no botão |

## Fora de contrato

- Tornar recolhíveis outras seções do Dashboard
- Persistir o estado aberto/fechado
- Alterar cálculo, faixas ou endpoint da Previsão de Recebíveis
