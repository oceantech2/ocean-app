# Implementation Plan: Carrossel da Equipe e logos de clientes em alta resolução no site

**Branch**: `101-site-equipe-carrossel-logos` | **Date**: 2026-10-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/101-site-equipe-carrossel-logos/spec.md`

## Summary

A seção Equipe da Home vira um componente `CarrosselEquipe` próprio: trilho com os consultores repetidos para giro infinito, avanço de 1 consultor a cada ~6 s com pausa por mouse/foco/toque/aba oculta/menos movimento, setas, indicadores por consultor e deslize por toque; 3/2/1 por vez conforme a largura. Foto e nome de cada consultor viram link para o LinkedIn, como na exportação. As 12 logos de clientes são trocadas por versões oficiais (SVG ou WebP em até 3×) obtidas nos sites das empresas, com o caminho do arquivo (incluindo extensão) em `conteudo.ts`. Sem backend, sem dependências novas, ERP/Proposal intocados.

## Technical Context

**Language/Version**: TypeScript 5 + React 18

**Primary Dependencies**: nenhuma nova (React, React Router já no projeto)

**Storage**: N/A

**Testing**: Sem suíte automatizada no frontend; `npx tsc --noEmit`, `npx vite build` e roteiro manual em [quickstart.md](./quickstart.md) (navegador em larguras de computador, tablet e celular)

**Target Platform**: Web pública (site institucional), computador e celular

**Project Type**: Aplicação web (só frontend)

**Performance Goals**: 12 logos somando < 300 KB (SC-004); carrossel sem trabalho contínuo além de um `setTimeout`

**Constraints**: Só classes existentes em `public/site/site.css` (research §5); visual da exportação aprovada (FR-011); processamento de imagens fora do repositório (Pillow em ambiente temporário, como na feature 100)

**Scale/Scope**: 1 componente novo, 2 arquivos editados (`Home.tsx`, `conteudo.ts`), 12 imagens trocadas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos e textos do site em pt-BR | ✅ |
| II. Domínio Financeiro Interno | Continua a feature 100 (site público), desvio já justificado lá; não toca dados nem telas do ERP | ⚠️ justificado (feature 100) |
| III. Clareza Antes de Implementar | Troca automática, giro infinito e origem/estilo das logos esclarecidos com o usuário | ✅ |
| IV. Consistência com o Produto | Segue o visual do `TeamCarousel` do protótipo e os padrões do módulo `src/site/` | ✅ |
| V. Simplicidade e Escopo Fechado | Componente próprio pequeno, sem biblioteca de carrossel; nada além de Equipe e Clientes | ✅ |

**Re-check pós-design**: sem novas violações.

## Project Structure

### Documentation (this feature)

```text
specs/101-site-equipe-carrossel-logos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

Sem `contracts/`: a feature não cria nem altera endereços, APIs ou formulários.

### Source Code (repository root)

```text
frontend/
├── public/site/img/clientes/          # 12 logos trocadas (.svg / .webp); .png antigos removidos
└── src/site/
    ├── components/
    │   └── CarrosselEquipe.tsx        # NOVO: carrossel infinito da Equipe
    ├── dados/conteudo.ts              # CLIENTES: logo → arquivo com extensão
    ├── icones.tsx                     # + IconeChevronEsquerda / IconeChevronDireita (chevrons Lucide)
    └── pages/Home.tsx                 # Equipe usa CarrosselEquipe; logos usam o arquivo novo
```

**Structure Decision**: Componente em `src/site/components/`, ao lado dos demais do site; nenhum import cruzado com ERP/Proposal.

## Complexity Tracking

Sem violações novas.
