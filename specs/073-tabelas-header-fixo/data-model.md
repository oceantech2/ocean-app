# Data Model: Headers Fixos em Tabelas com Scroll

**Feature**: `073-tabelas-header-fixo` | **Date**: 2026-09-16

## Visão geral

Não há entidade persistida nem schema. O modelo é conceitual de UI: a área de rolagem da listagem e o cabeçalho de colunas.

## Entidade conceitual: Área de rolagem da tabela

| Campo | Tipo | Regras |
|-------|------|--------|
| `escopo` | enum lógico | `pagina_listagem` \| `dashboard` \| `modal` |
| `altura_limitada` | boolean | `true` obrigatório em `pagina_listagem` (padrão Contas); `false` forçado em `dashboard` e `modal` |
| `overflow` | enum lógico | Vertical + horizontal quando necessário (`overflow-auto`) |
| `conteudo` | grade | Linhas de registros; filtros/CTAs da página ficam **fora** desta área |

## Entidade conceitual: Cabeçalho de coluna

| Campo | Tipo | Regras |
|-------|------|--------|
| `fixo_no_scroll` | boolean | `true` quando a área de rolagem efetiva é a da tabela (ou o modal já rola) |
| `fundo` | token visual | Opaco claro/escuro (equivalente Contas); proibido semi-transparente no sticky |
| `controles` | opcional | Ordenação, checkbox etc. permanecem utilizáveis (FR-005) |
| `alinhamento_horizontal` | regra | Cabeçalho acompanha scroll X da mesma área |

### Matriz escopo × comportamento

| Escopo | Altura limitada estilo Contas | Cabeçalho sticky |
|--------|-------------------------------|------------------|
| Página de listagem/CRUD | Sim | Sim |
| NFs ( Contas a receber ) | Já tem área própria (`h-[36rem]`) | Já congelado (grade dual) — preservar |
| Dashboard | Não | Só se já existir scroll próprio |
| Modal / painel | Não (não forçar) | Só se já houver scroll do modal ou da tabela |

**Persistência**: nenhuma.  
**Relacionamentos**: nenhum com entidades de domínio além da associação visual à listagem já existente.  
**Validação**: em `pagina_listagem`, wrapper com altura máxima + `th` sticky opaco; controles do header não regressam.

## Fora de escopo (não modelar)

- Preferências de usuário para altura da tabela
- Virtualização de linhas
- Persistência de scroll position
- Mudança de colunas / dados / API
