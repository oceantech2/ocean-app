# Quickstart: Validação — Barra Lateral Colapsável

**Feature**: `005-sidebar-collapse-icons` | **Date**: 2026-07-26  
**Contrato**: [contracts/ui-sidebar-collapse.md](./contracts/ui-sidebar-collapse.md) · **Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- Infra / API conforme projeto (`docker compose up -d` se necessário; API **8001**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Credenciais de desenvolvimento do projeto (não documentar senhas neste artefato — ver README/CLAUDE)

## Setup

```bash
cd frontend
npm run dev
```

Abrir `http://localhost:5193` e autenticar.

## Cenários de validação

### 1. Expandido com ícones (P1)

1. Login com usuário sem chave `ocean-sidebar-collapsed:*` (ou limpar a chave no DevTools).
2. **Esperado**: barra larga; cada item com ícone + rótulo; navegação e item ativo ok.

### 2. Colapsar / expandir pelo controle (P1)

1. Clicar no controle de recolher.
2. **Esperado**: barra estreita; só ícones; área de conteúdo maior; contadores numéricos ainda visíveis se houver alertas.
3. Clicar no controle de expandir.
4. **Esperado**: ícone + rótulo de volta.

### 3. Clique fora (P1)

1. Com barra expandida, clicar no conteúdo da página (`main`).
2. **Esperado**: barra colapsa.
3. Com barra colapsada, clicar de novo no conteúdo.
4. **Esperado**: permanece colapsada (só o controle reabre).

### 4. Tooltip / identificação (P2)

1. Barra colapsada; passar o mouse (e focar via Tab) em um ícone.
2. **Esperado**: nome do item aparece (tooltip nativo / nome acessível).

### 5. Preferência por usuário (P3)

1. Como usuário A, colapsar; recarregar (F5).
2. **Esperado**: continua colapsada.
3. Logout; login como usuário B sem preferência própria.
4. **Esperado**: B abre expandido (não herda A).
5. Voltar a A: preferência colapsada de A restaurada.

### 6. Permissões / admin

1. Login visualizador (ou com permissões limitadas): só itens permitidos, todos com ícone.
2. Login admin: Auditoria/Segurança/Configurações com ícones e colapso ok.

### 7. Qualidade estática

```bash
cd frontend
npm run lint
npm run type-check
```

**Esperado**: sem erros novos introduzidos pela feature.

## Critérios de “passou”

- SC-001 a SC-007 e SC-009 exercitados pelos cenários acima
- Sem regressão de busca/alertas do topo
- Sem mudança de portas ou chamadas de API novas
