# Data Model: Carrossel da Equipe e logos de clientes

Não há persistência. Os dados são constantes em `frontend/src/site/dados/conteudo.ts`.

## Consultor (`EQUIPE`, 8 itens, ordem fixa)

| Campo | Tipo | Regra |
|---|---|---|
| `nome` | texto | obrigatório; usado no texto alternativo da foto e no rótulo do indicador |
| `cargo` | texto | obrigatório |
| `foto` | texto | nome do arquivo em `/site/img/equipe/{foto}.jpg` (224×224) |
| `linkedin` | URL | perfil do consultor; abre em nova aba pela foto, pelo nome e pelo ícone |

Sem mudança de campos nesta feature.

## Cliente (`CLIENTES`, 12 itens, ordem fixa)

| Campo | Tipo | Regra |
|---|---|---|
| `nome` | texto | obrigatório; texto alternativo da logo |
| `logo` | texto | **muda**: nome do arquivo **com extensão** em `/site/img/clientes/` (`.svg` ou `.webp`) |

## Estado do carrossel (memória do componente)

| Estado | Regra |
|---|---|
| `porVez` | 3 (≥1024 px), 2 (≥640 px) ou 1 |
| `indice` | posição no trilho de 3×8 cartões; sempre volta ao bloco do meio (8–15) após cada transição |
| `pausado` | verdadeiro com mouse sobre a seção, foco dentro, toque ativo ou aba oculta |
| `menosMovimento` | reflete `prefers-reduced-motion`; desliga troca automática e animação |

Consultor ativo (indicador destacado) = `indice mod 8`.
