# Implementation Plan: Blocos inteiros por página no PDF da proposta

**Branch**: `087-proposta-pdf-quebra-pagina` (trabalho direto na `main`, como nas features 077 a 086) | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/087-proposta-pdf-quebra-pagina/spec.md`

## Summary

O PDF da proposta é a impressão do navegador da página pública (`window.print()` em `PaginaModelo.tsx`). Hoje o CSS de impressão marca **toda** `section` como "não dividir". A seção Investimento com vários projetos é maior que uma página: o Chrome a empurra para a página seguinte e, como todos os pontos de quebra dentro dela violam a mesma regra, escolhe o último, que cai no meio de um projeto ou cartão (reproduzido na proposta local 37: "Posição 2" dividida entre as páginas 4 e 5; cartão de contato dividido entre 5 e 6).

Abordagem: ajustar só o bloco `@media print` de `pagina-modelo.css`:

1. Tirar o "não dividir" das seções que podem passar de uma página (Investimento, Escopo, Metodologia/Principais serviços) e mantê-lo nas seções de tamanho limitado (primeira seção da divisão, Garantias e condições, Próximos passos).
2. Marcar como "não dividir" os blocos internos: projeto (`.pos`), cartão de investimento (`.plan`), quadro de observações (`.notes`), linha de garantia (`.info div`), item do escopo (`.scope li`), etapa (`.step`), cartão de serviço (`.svc`) e cartão de contato (`.contact`).
3. Marcar títulos (`.head`, nome do projeto, título das observações) como "não quebrar depois", para não ficarem sozinhos no fim da página.
4. Manter o rodapé junto do cartão de contato: o `<footer>` passa para dentro do `<main>`, logo após o contato, com `break-before: avoid` na impressão (research R7). Na tela, a posição e a aparência do rodapé não mudam.

Uma única alteração de CSS cobre os dois modelos, todas as versões e os dois idiomas, porque todos usam o mesmo layout compartilhado (`PaginaModelo`).

## Technical Context

**Language/Version**: CSS (folha `pagina-modelo.css`), TypeScript 5 / React 18 (só a posição do `<footer>` em `PaginaModelo.tsx`)

**Primary Dependencies**: Nenhuma nova. Propriedades CSS de fragmentação (`break-inside`, `break-after`) suportadas pelo Chrome/Edge atuais

**Storage**: N/A

**Testing**: Sem suíte automatizada. Validação pelo [quickstart.md](./quickstart.md): impressão em PDF com Chrome headless da página pública e inspeção página a página (texto + imagem), mais `npm run type-check` e `npm run build`

**Target Platform**: Página pública do Proposal (`proposal.oceantalentsolutions.com/p/:codigo`), "Salvar como PDF" no Chrome/Edge, A4, margens padrão

**Project Type**: Aplicação web (somente frontend nesta feature)

**Performance Goals**: N/A (só CSS de impressão)

**Constraints**:
- A página na tela não muda (todas as regras ficam dentro de `@media print`)
- Textos, valores, nome do arquivo e versões dos modelos não mudam (paginação não faz parte do conteúdo versionado)
- Nenhum arquivo do ERP nem do backend é alterado

**Scale/Scope**: 1 arquivo CSS (~8 linhas no bloco `@media print`) e 1 ajuste de marcação no rodapé

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Idioma português | OK. Artefatos em pt-BR. |
| II. Domínio financeiro interno | OK. Ajuste no Proposal, sem tocar no ERP, dados nem papéis. |
| III. Clareza antes de implementar | OK. Spec sem marcadores pendentes; 3 decisões registradas em Clarifications. |
| IV. Consistência com o produto | OK. Mesmo botão Baixar PDF e mesmo mecanismo de impressão; página na tela idêntica. |
| V. Simplicidade | OK. Só CSS de impressão; nenhuma biblioteca de geração de PDF (research R2). |

**Resultado**: aprovado. Reavaliado após o design (Phase 1): continua aprovado.

## Project Structure

### Documentation (this feature)

```text
specs/087-proposta-pdf-quebra-pagina/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-pdf-paginacao.md   # Regras de paginação por bloco
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/proposal/modelos/pagina/
├── pagina-modelo.css     # ALTERADO: bloco @media print
└── PaginaModelo.tsx      # ALTERADO: <footer> dentro do <main>, após o contato
```

**Structure Decision**: Alteração isolada no layout compartilhado dos modelos de proposta.

## Complexity Tracking

Sem violações.
