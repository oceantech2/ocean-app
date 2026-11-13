# Contrato de UI: seletor de modelo por seção

## Componente `ModeloForm` (frontend/src/proposal/components/ModeloForm.tsx)

Props novas, opcionais:

| Prop | Tipo | Uso |
|------|------|-----|
| `modelosSecao` | `ModeloProposta[]` | Modelos da divisão oferecidos nos seletores de seção. Ausente ou vazio: nenhum seletor de seção. |
| `modeloSecaoInicial` | `string` | Id do modelo aplicado pelo seletor geral; vira a origem inicial de todas as seções. |

Quem passa: só `pages/Nova.tsx`. `pages/Editar.tsx` e `pages/ModeloEditor.tsx` não passam (sem seletores).

## Seletor no cabeçalho da seção

- Aparece à direita do título da seção, nas seções: Apresentação, Cliente, Escopo, Projetos, Garantias e condições, Validade.
- Não aparece em Consultor, nem quando idioma e moeda são fixos (Apresentação na edição).
- Primeira opção, desabilitada: "Usar modelo…". Demais: nome de cada modelo elegível, em ordem alfabética (ordem já vinda da API).
- Seção Cliente: só modelos com setor válido; sem modelos elegíveis, o seletor não aparece.
- `aria-label`: "Modelo da seção <nome da seção>".

## Comportamento ao escolher um modelo

1. Se a seção tem conteúdo (regras em research R5) e é diferente do conteúdo do modelo: `window.confirm("Substituir o conteúdo de <seção> pelo do modelo \"<nome>\"?")`. Cancelar: nada muda.
2. Aplica só os campos da seção (data-model).
3. Seletor passa a mostrar o modelo escolhido.

## Seletor geral (`Nova.tsx`)

- Continua como na feature 098.
- Texto de ajuda abaixo dele (quando há modelos): "Preenche todas as seções. Para usar outro modelo em uma seção, escolha no canto dela."
