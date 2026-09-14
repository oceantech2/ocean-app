# Contrato UI: Modais no Viewport

**Feature**: `072-ajuste-modais-viewport`  
**Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

## Componente `Modal` (shell)

**Arquivo alvo**: `frontend/src/components/Modal.tsx`

**Acesso**: qualquer página/componente que hoje renderiza overlay `fixed inset-0` + painel; permissões e handlers permanecem no pai.

### Layout obrigatório

| Aspecto | Contrato |
|---------|----------|
| Margem viewport | ≥ **24px** (~1,5rem) em cima e embaixo (padding do backdrop) |
| Altura máxima do painel | `calc(100vh - 3rem)` (ou equivalente que preserve as duas margens) |
| Centralização | Eixo vertical e horizontal (exceto exceção documentada abaixo) |
| Header | Fixo (`shrink-0`); não rola com o miolo |
| Body | Única região com scroll vertical interno |
| Footer | Fixo (`shrink-0`); ações principais sempre visíveis quando existirem |
| Visual | Manter linguagem atual: `rounded-xl`, sombra, `bg-white` / `dark:bg-gray-800`, overlay escurecido |

### Props (contrato de uso)

| Prop | Obrigatório | Descrição |
|------|-------------|-----------|
| `children` | sim | Conteúdo do miolo |
| `header` ou `titulo` | recomendado | Cabeçalho fixo |
| `footer` | quando houver ações | Rodapé fixo com botões |
| `maxWidth` | não | Classe Tailwind já usada (`max-w-md` default) |
| `onBackdropClick` | não | Só se o modal atual já fecha no clique do fundo |

Comportamento de negócio (validação, POST, toasts, `salvando`) **não** entra no shell.

## Consumidores no escopo

| Superfície | Arquivo |
|------------|---------|
| Contas a pagar (CRUD + datas em massa + categoria) | `pages/Contas.tsx` |
| Contas a receber / NFs | `pages/NFs.tsx` |
| Férias | `pages/Ferias.tsx` |
| DH | `pages/DH.tsx` |
| Patrimônio | `pages/Patrimonio.tsx` |
| Fluxo de caixa | `pages/FluxoCaixa.tsx` |
| Fornecedores / colaboradores | `pages/Fornecedores.tsx` |
| Configurações | `pages/Configuracoes.tsx` |
| Documentos | `components/DocumentosModal.tsx` |
| Import CSV | `components/ImportCSV.tsx` |
| Gerenciador de arquivos | `components/GerenciadorArquivos.tsx` |

### Exceção opcional

| Superfície | Tratamento |
|------------|------------|
| Busca global (`Layout.tsx`) | **Migrada** para o shell `Modal` (centralizada, margem 24px, miolo rolável); fecha no backdrop |

## Fora do escopo

- Dropdown de notificações / menus do header
- `window.confirm` / `alert`
- Mudança de textos, campos, validações, APIs
- Biblioteca externa de dialog/modal

## API REST

Nenhum endpoint alterado ou criado.

## Proibido nesta entrega

- Deixar `overflow-y-auto` no painel inteiro (faz header/footer rolarem) **quando** houver header/footer distintos
- Remover margem vertical (&lt; 24px) para “ganhar espaço”
- Alterar z-index de forma a esconder toasts ou quebrar overlays aninhados sem necessidade
- Refatorar formulários além do necessário para encaixar nas três regiões

## Mapeamento de requisitos

| FR | Contrato |
|----|----------|
| FR-001 | Padding/margem ≥ 24px no backdrop |
| FR-002 / FR-007 | Body scroll; header/footer fixos |
| FR-003 | Lista de consumidores acima |
| FR-004 | Handlers/validações no pai, inalterados |
| FR-005 | `max-h` + scroll em viewport baixo |
| FR-006 | Conteúdo curto centralizado, sem stretch |

## Critérios de aceite (UI)

1. Em notebook (~768–900px de altura), modal de Contas aberta: gap visível ≥ 24px no topo e na base.
2. Modal longa (Contas/NFs): rolar o miolo **não** move título nem botões Salvar/Cancelar.
3. Amostragem ≥ 5 páginas da lista de consumidores: mesmo comportamento de enquadramento.
4. Abrir/fechar/salvar funcionam como antes (SC-004).
