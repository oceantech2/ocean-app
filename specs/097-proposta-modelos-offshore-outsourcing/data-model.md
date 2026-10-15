# Data Model: Modelos Offshore Talent e Outsourcing e Fotos de Capa por Setor

Sem mudança de esquema. As colunas `propostas.modelo` e `propostas.setor` são `VARCHAR(40)` sem constraint de valores; os valores aceitos são validados em `backend/app/services/proposta_modelos.py`.

## 1. Registro de modelos (`MODELOS`)

| Identificador | Nome | Versão atual | Disponível |
|---|---|---|---|
| `executive-search` | Executive Search | 3 | sim |
| `offshore-talent` | Offshore Talent | 1 | sim |
| `outsourcing` | Outsourcing | 1 | sim |
| `outplacement-development` | Development & Outplacement | 1 | sim |

A ordem do registro é a ordem de exibição (seletor da Nova proposta e filtro da lista). Frontend (`modelos/index.ts`): `rotuloEscopo` "Escopo" e `garantiasSempreVisivel` verdadeiro nos dois modelos novos.

## 2. Setores (`SETORES`)

| # | Chave | Rótulo | Foto |
|---|---|---|---|
| 1 | `oil-gas` | Petróleo & Gás | `/propostas/setores/oil-gas.jpg` |
| 2 | `energia` | Energia | `/propostas/setores/energia.jpg` |
| 3 | `infraestrutura` | Infraestrutura | `/propostas/setores/infraestrutura.jpg` (padrão) |
| 4 | `mineracao` | Mineração | `/propostas/setores/mineracao.jpg` |
| 5 | `tecnologia` | Tecnologia | `/propostas/setores/tecnologia.jpg` |
| 6 | `industria-servicos` | Indústria & Serviços | padrão, até a foto chegar |

## 3. Conteúdo da divisão (`ConteudoDivisao`, frontend)

Mudanças no tipo:

- `textoServico: string[]` — um item por parágrafo.
- `logo: { src; alt; largura?: number }` — largura em px no computador (padrão 220); substitui `larga?: boolean`.

Conteúdo das divisões novas (pt-BR; en-US equivalente):

| Campo | Offshore Talent | Outsourcing |
|---|---|---|
| `logo.src` | `/propostas/offshore-talent/logo-divisao.png` | `/propostas/outsourcing/logo-divisao.png` |
| `logo.largura` | 240 | 242 |
| `tituloDivisao` | Offshore Talent | Outsourcing |
| `textoServico` | 2 parágrafos do HTML | 2 parágrafos do HTML |
| `secaoMeio` | `metodologia`, id `areas-cargos`, "Áreas e cargos", 5 passos × 5 itens | `metodologia`, id `beneficios`, "Benefícios", 5 passos × 2–3 itens |
| `tituloEscopo` | Escopo | Escopo |
| `observacoesInvestimento` | item único remuneração/Retainer; mínimo R$ 15.000,00 | idem |
| `observacoesGarantias` | 3 itens do Executive Search | idem |
| `garantiasSempreVisivel` | true | true |
