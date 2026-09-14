# Data Model: Renomear Atalhos da Página Contratos

**Feature**: `063-contratos-clientes-internos` | **Date**: 2026-09-14

## Visão geral

Não há entidade persistida. O modelo continua o conjunto fixo de dois atalhos no frontend. Esta feature **só atualiza o campo `rotulo`**; URLs, ordem e ausência de persistência não mudam em relação a `052-pagina-contratos`.

## Entidade conceitual: Atalho de pasta de contratos

| Campo | Tipo | Regras |
|-------|------|--------|
| `rotulo` | texto | Obrigatório; valores fixos: **Contratos Clientes** \| **Contratos Internos** |
| `url` | URL HTTPS | Obrigatória; valor fixo por atalho (inalterado) |
| `ordem` | inteiro | 1 = cima (Clientes), 2 = baixo (Internos) |

### Instâncias fixas (após esta feature)

| Ordem | Rótulo (novo) | Rótulo anterior (não exibir) | URL |
|-------|---------------|------------------------------|-----|
| 1 | Contratos Clientes | Contratos ativos | `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H` |
| 2 | Contratos Internos | Contratos arquivados | `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-` |

**Persistência**: nenhuma (constantes de UI).  
**Relacionamentos**: nenhum com NFs, fornecedores ou demais módulos.  
**Validação**: exatamente duas instâncias; rótulos distintos; URLs iguais às já implantadas.

## Fora de escopo (não modelar)

- Arquivos ou metadados do Google Drive
- Visibilidade/permissões da página `contratos` (já existentes; sem mudança)
- CRUD ou versionamento de contratos
- Histórico de abertura de links
