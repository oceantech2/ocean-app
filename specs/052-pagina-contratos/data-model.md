# Data Model: Página Contratos

**Feature**: `052-pagina-contratos` | **Date**: 2026-09-06

## Visão geral

Não há entidade persistida de contrato no Ocean App. O “modelo” é um conjunto fixo de atalhos no frontend e a inclusão da chave de página no JSON de visibilidade global já existente.

## Entidade conceitual: Atalho de pasta de contratos

| Campo | Tipo | Regras |
|-------|------|--------|
| `rotulo` | texto | Obrigatório; valores fixos: **Contratos ativos** \| **Contratos arquivados** |
| `url` | URL HTTPS | Obrigatória; valor fixo por atalho (abaixo) |
| `ordem` | inteiro | 1 = ativos, 2 = arquivados |

### Instâncias fixas

| Ordem | Rótulo | URL |
|-------|--------|-----|
| 1 | Contratos ativos | `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H` |
| 2 | Contratos arquivados | `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-` |

**Persistência**: nenhuma (constantes de UI).  
**Relacionamentos**: nenhum com NFs, fornecedores ou demais módulos.

## Extensão: Visibilidade de páginas

Registro existente `configuracao_app` com `chave = paginas_visibilidade`.

| Chave nova | Default | Ocultável | adminOnly |
|------------|---------|-----------|-----------|
| `contratos` | `true` | sim | não |

Merge com defaults existentes (`dashboard`, `calendario`, …, `patrimonio`, `auditoria`, `seguranca`) sem alterar valores já gravados das demais chaves.

## Permissões de usuário (visualizador)

JSON em `UsuarioApp.permissoes` pode incluir `"contratos": true|false` quando o admin editar o visualizador. Ausência da chave = sem acesso (mesmo padrão das demais páginas do formulário de permissões).

## Fora de escopo (não modelar)

- Arquivos ou metadados do Google Drive
- Histórico de abertura de links
- CRUD ou versionamento de contratos
- Sincronização bidirecional Drive ↔ Ocean
