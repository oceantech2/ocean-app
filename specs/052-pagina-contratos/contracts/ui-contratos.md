# Contrato UI: Página Contratos

**Feature**: `052-pagina-contratos`  
**Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

## Catálogo e navegação

| Campo | Valor |
|-------|-------|
| `key` / `permKey` | `contratos` |
| `label` | Contratos |
| `path` | `/contratos` |
| `desc` | Acesso às pastas de contratos no Google Drive |
| `ocultavel` | `true` |
| `adminOnly` | ausente / `false` |
| Posição no menu | Após **Patrimônio**, antes de **Auditoria** |

**Menu / busca**: item visível se autenticação + (admin **ou** permissão `contratos`) + `paginasVisibilidade.contratos !== false`.

**Guarda de rota**: `PaginaVisivelGuard` com `permKey="contratos"` — visualizador com página oculta → redirect `/dashboard`; admin com página oculta acessa URL direta.

**Configurações**:
- Lista **Visibilidade de páginas**: item Contratos (toggle habilitado).
- Permissões de visualizador: toggle Contratos (desabilitado se oculta globalmente, padrão vigente).

## Página `/contratos`

**Acesso**: autenticado + regras acima.

**Conteúdo obrigatório**:
- Título da página: **Contratos**
- Texto de apoio mínimo opcional (ex.: instrução para abrir a pasta desejada)
- Exatamente **dois** atalhos:

| # | Rótulo exibido | `href` | Comportamento |
|---|----------------|--------|---------------|
| 1 | Contratos ativos | `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H` | Nova aba (`target="_blank"`), `rel="noopener noreferrer"` |
| 2 | Contratos arquivados | `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-` | Idem |

**Proibido nesta entrega**:
- Formulários, upload, listagem interna de arquivos, CRUD
- Diferença de conteúdo entre admin e visualizador (ambos veem os mesmos atalhos)
- Iframe do Drive
- Cards de métricas / gráficos

**Estados**:
- Sem loading de dados de domínio (página estática)
- Dark mode: tipografia/contraste alinhados ao restante do app

## Ícone de menu

Registrar ícone para path `/contratos` em `navIcons.tsx` (símbolo de documento/contrato, consistente com o set existente).

## API REST

Nenhum endpoint novo de contratos. Visibilidade continua em `GET/PUT /api/configuracoes/paginas-visibilidade` e no payload de login/`/auth/me` (chave `contratos` após atualização dos defaults).
