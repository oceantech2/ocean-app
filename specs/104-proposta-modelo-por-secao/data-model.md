# Data Model: Modelo por seção na nova proposta

Nenhuma tabela, coluna ou campo de API muda. Abaixo, só o estado da tela.

## Modelo de proposta (existente — feature 098)

Usado como fonte; campos lidos por seção:

| Seção | Campos do modelo |
|-------|------------------|
| Apresentação | `idioma`, `moeda` |
| Cliente | `setor` (só se válido) |
| Escopo | `projeto_escopo` |
| Projetos | `projetos[]` (nome + investimentos) |
| Garantias e condições | `shortlist`, `sla`, `garantia` |
| Validade | `validade_dias` |

## Origem da seção (novo, só na tela)

Um registro por seção com seletor:

| Campo | Descrição |
|-------|-----------|
| `secao` | `apresentacao` \| `cliente` \| `escopo` \| `projetos` \| `garantias` \| `validade` |
| `modeloId` | id do modelo aplicado por último na seção (vazio se nenhum) |
| `assinatura` | conteúdo da seção serializado no momento da aplicação |

**Regras**:

- Exibição: o seletor mostra `modeloId` se `modeloId` está entre as opções atuais da seção **e** a assinatura do conteúdo atual é igual a `assinatura`; senão mostra "Usar modelo…".
- Aplicar modelo na seção: atualiza os campos da seção e grava `modeloId` + assinatura do novo conteúdo.
- Formulário montado pelo seletor geral: todas as seções começam com o modelo geral e a assinatura do conteúdo inicial.
- Não é enviado ao servidor nem gravado.
