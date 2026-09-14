# Data Model: Ajuste de Modais no Viewport

**Feature**: `072-ajuste-modais-viewport` | **Date**: 2026-09-14  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Escopo de persistência

Esta feature **não** altera banco, APIs nem entidades de domínio. O “modelo” abaixo descreve apenas a **estrutura de UI** do shell e regras de layout.

## Entidades de UI

### ModalShell (painel sobreposto)

Representa uma instância aberta do padrão fundo escurecido + painel central.

| Atributo | Tipo | Regras |
|----------|------|--------|
| visível | boolean | Controlado pelo estado já existente na página/componente pai |
| margem_viewport | length | Mínimo ~24px (1,5rem) em cima e embaixo (e preferencialmente nas laterais) |
| altura_máxima_painel | length | `100vh − 2 × margem` (ex.: `calc(100vh - 3rem)`) |
| largura_máxima | token | Mantém o `max-w-*` já usado por cada modal (`md` / `lg` / `2xl` / …) |
| regiões | header \| body \| footer | Header e footer `shrink-0`; body rolável |

### Região Header

| Atributo | Notas |
|----------|--------|
| título / subtítulo / botão fechar | Conteúdo já existente; não rola com o miolo |

### Região Body (miolo)

| Atributo | Notas |
|----------|--------|
| conteúdo | Formulário, lista, mensagens; `overflow-y: auto` quando excede altura disponível |
| scroll | Independente da página de fundo |

### Região Footer

| Atributo | Notas |
|----------|--------|
| ações | Cancelar, Salvar, Fechar, +1, etc.; sempre visíveis enquanto o modal estiver aberto (quando existirem) |

### Área útil da janela

Região visível do browser na qual o painel deve caber: viewport menos as margens do backdrop.

## Relacionamentos

```text
Página/Componente pai
  └── controla visibilidade + handlers de negócio
        └── ModalShell
              ├── Header (opcional mas preferível se houver título)
              ├── Body (obrigatório)
              └── Footer (opcional; obrigatório se houver ações principais)
```

## Validação / invariantes de layout

1. Painel **não** pode cruzar as bordas superior/inferior do viewport (respeitando margem ≥ 24px).
2. Se `altura(conteúdo body) > altura disponível do body`, aparece rolagem **somente** no body.
3. Conteúdo curto: painel centralizado; body **sem** scroll desnecessário.
4. Crescer conteúdo dinamicamente (erros, seções) **não** pode fazer o painel ultrapassar a altura máxima.

## Estado / ciclo de vida

Inalterado em relação ao produto atual: abrir → interagir → fechar/salvar. Esta feature não adiciona estados de domínio.
