# Data Model: Site institucional da Ocean

Nada é persistido nesta feature. As estruturas abaixo vivem no frontend do site.

## Vaga (lista fixa em `frontend/src/site/dados/vagas.ts`)

| Campo | Tipo | Regra |
|-------|------|-------|
| `id` | texto | Único na lista |
| `titulo` | texto | Obrigatório |
| `area` | texto | Um dos valores do filtro Área |
| `nivel` | texto | Um dos valores do filtro Nível |
| `local` | texto | Obrigatório |
| `resumo` | texto | Obrigatório, 1 frase |

Filtros (mesmo arquivo):

- **Área**: Todas, Finanças, Tecnologia, Comercial, Recursos Humanos, Operações
- **Nível**: Todos, Gerência, Diretoria, VP, C-Level

Lista inicial (do protótipo):

| id | Título | Área | Nível | Local | Resumo |
|----|--------|------|-------|-------|--------|
| v1 | CFO | Finanças | C-Level | São Paulo / SP | Indústria de bens de consumo, controle de planejamento e M&A. |
| v2 | VP de Engenharia | Tecnologia | VP | Remoto · Brasil | Scale-up SaaS B2B, liderança de 4 squads e cultura técnica. |
| v3 | Diretor Comercial | Comercial | Diretoria | São Paulo / SP | Varejo premium, expansão multicanal e gestão de KAMs. |
| v4 | Head de RH | Recursos Humanos | Diretoria | Híbrido · SP | Reestruturação organizacional e desenho de cultura. |
| v5 | Gerente de Operações | Operações | Gerência | São Paulo / SP | Logística e melhoria contínua em operação industrial. |

## Manifestação de interesse (estado do formulário, não persistido)

`vaga`, `nome`, `email`, `linkedin`, `mensagem`. Regras em [contracts/formularios.md](./contracts/formularios.md).

## Contato (estado do formulário, não persistido)

`nome`, `email`, `telefone`, `linkedin`, `cargo`, `empresa`, `tipo` (`empresa` | `profissional` | `outro`), `mensagem`. Regras em [contracts/formularios.md](./contracts/formularios.md).

## Conteúdo estático

Equipe (8), clientes (12), casos (3), valores (5), soluções (4) e setores (6) ficam em constantes no próprio site, com os textos da exportação e do protótipo.
