# Quickstart: Validação — Padronizar ícones, menu aberto e botões

**Feature**: `045-padronizar-icones-menu` | **Date**: 2026-08-29  
**Contrato**: [contracts/ui-padronizar-icones-menu.md](./contracts/ui-padronizar-icones-menu.md) · **Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- Infra / API conforme projeto (`docker compose up -d` se necessário; API **8001**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Credenciais de desenvolvimento do projeto (ver README/CLAUDE)

## Setup

```bash
cd frontend
npm run dev
```

Abrir `http://localhost:5193` e autenticar como `admin`.

Opcional — simular usuário que tinha menu recolhido:

```javascript
// DevTools → Console
localStorage.setItem('ocean-sidebar-collapsed:admin', 'true');
```

Recarregar após implementação: menu deve abrir **expandido** mesmo com chave legada.

## Cenários de validação

### 1. Menu sempre aberto ao entrar (P1)

1. Com chave legada `ocean-sidebar-collapsed:admin = true`, recarregar a página.
2. **Esperado**: menu expandido (ícone + rótulo).
3. Recolher pelo controle da sidebar; recarregar de novo.
4. **Esperado**: menu expandido novamente (não lembra recolhido).

### 2. Clique no conteúdo não fecha menu (P1)

1. Com menu expandido, clicar em tabela/filtros/botões de uma listagem (ex.: Contas a Pagar).
2. **Esperado**: menu permanece expandido.

### 3. Colapso só pelo controle (sessão)

1. Recolher pelo botão da sidebar.
2. **Esperado**: modo só ícones até expandir de novo **na mesma sessão** (sem reload).

### 4. Ordem do cabeçalho — Novo por último (P1)

1. Abrir **Contas a Receber** (`/nfs`) e **Contas a Pagar** (`/contas`).
2. **Esperado**: ordem importar → exportar(s) → Novo/Nova (criar por último).
3. Tamanho de texto dos botões de cabeçalho visualmente igual entre as duas.

### 5. Ícones e rótulos iguais entre listagens (P1)

1. Comparar botão **Editar** em Contas a Pagar, Fornecedores e Férias.
2. **Esperado**: mesmo ícone, mesmo rótulo visível, sem depender de hover.

### 6. Excluir padronizado (P1)

1. Abrir Contas a Pagar como admin.
2. **Esperado**: ação destrutiva rotulada **Excluir** (não Deletar), sempre última na linha.

### 7. Fundo colorido suave nas linhas (P1)

1. Abrir Fluxo de Caixa (gerenciar contas) e Contas a Pagar.
2. **Esperado**: botões de linha com fundo suave (não só borda); mesma cor para mesma ação (ex.: Editar azul, Excluir vermelho).

### 8. Fora do escopo — Dashboard e Configurações

1. Abrir Dashboard e Configurações.
2. **Esperado**: botões de ação **inalterados** em relação ao baseline pré-feature (exceto menu lateral global).
3. Menu lateral dessas páginas segue regras 1–3.

### 9. Papéis e tema

1. Repetir amostra com `visualizador` — botões permitidos mantêm ordem/estilo; ações proibidas omitidas.
2. Alternar tema claro/escuro.
3. **Esperado**: ícones e botões legíveis nos dois temas.

### 10. Regressão lint/type-check

```bash
cd frontend
npm run lint
npm run type-check
```

**Esperado**: sem erros novos.

## Amostragem mínima (SC-005 a SC-011)

Validar em pelo menos **5** páginas no escopo, por exemplo:

1. Contas a Receber (`NFs.tsx`)
2. Contas a Pagar (`Contas.tsx`)
3. Fornecedores
4. Férias
5. Comissões (`Bonus.tsx`)

Checklist rápido por página: ordem cabeçalho ✓ | ordem linha ✓ | Excluir último ✓ | ícone+texto ✓ | cores linha ✓
