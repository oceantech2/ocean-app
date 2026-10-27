# Implementation Plan: Site institucional da Ocean (landing page, Soluções e Vagas)

**Branch**: `100-site-institucional` | **Date**: 2026-10-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/100-site-institucional/spec.md`

## Summary

O site institucional vira uma terceira entrada do frontend (`site.html` + `src/site/`), servida por host no domínio principal (`oceantalentsolutions.com` e `www`), no mesmo esquema que já separa ERP e Proposal. É um app React pequeno com 3 rotas (Home, Soluções, Vagas) que reproduz a exportação aprovada usando o próprio CSS compilado dela (arquivo estático em `public/site/`), imagens extraídas e otimizadas, e conteúdo em constantes. As vagas são uma lista fixa num único arquivo, com filtro por área e nível. Os formulários (contato e "Tenho interesse") validam e confirmam, mas não enviam nada. Sem backend, sem variáveis novas, sem mudança no ERP e no Proposal.

## Technical Context

**Language/Version**: TypeScript 5 + React 18

**Primary Dependencies**: Vite 5 (nova entrada + plugin de host em dev), React Router 6, react-hot-toast (todos já no projeto). Nenhuma dependência nova.

**Storage**: N/A (nada é persistido)

**Testing**: Sem suíte automatizada no frontend; `npx tsc --noEmit`, `npx vite build` e roteiro manual em [quickstart.md](./quickstart.md)

**Target Platform**: Web pública — Vercel (mesmo projeto, novos domínios); navegadores de computador e celular

**Project Type**: Aplicação web (só frontend nesta feature)

**Performance Goals**: Textos da Home visíveis em até 3 s em conexão móvel (SC-004); nenhuma imagem acima de ~400 KB

**Constraints**: Fidelidade à exportação aprovada; ERP/Proposal intocados (SC-005); portas fixas; CSS do site limitado às classes da exportação (ver research §2)

**Scale/Scope**: 3 páginas, ~12 arquivos novos em `src/site/`, ~30 imagens em `public/site/img/`, 4 arquivos de configuração tocados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos e textos do site em pt-BR | ✅ |
| II. Domínio Financeiro Interno | Site público fora do domínio financeiro; não toca dados, papéis nem telas do ERP. Desvio justificado em Complexity Tracking | ⚠️ justificado |
| III. Clareza Antes de Implementar | Páginas, destino dos formulários e vagas esclarecidos com o usuário | ✅ |
| IV. Consistência com o Produto | Segue o padrão de entrada por host do Proposal; feedback com `react-hot-toast`; visual próprio do site é o aprovado | ✅ |
| V. Simplicidade e Escopo Fechado | Sem backend, sem dependências novas, sem Notícias/EN; vagas fixas | ✅ |

**Re-check pós-design**: sem novas violações.

## Project Structure

### Documentation (this feature)

```text
specs/100-site-institucional/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── enderecos.md
│   └── formularios.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── site.html                          # NOVO: entrada do site (metadados, fontes, /site/site.css)
├── vite.config.ts                     # entrada "site" no build + host site.localhost em dev
├── vercel.json                        # rewrites de oceantalentsolutions.com e www → /site.html
├── tailwind.config.js                 # exclui src/site/** do CSS do ERP
├── public/site/
│   ├── site.css                       # NOVO: CSS compilado da exportação (sem base64)
│   └── img/                           # NOVO: logo, hero, equipe, clientes, soluções, setores
└── src/site/
    ├── main.tsx                       # NOVO
    ├── App.tsx                        # NOVO: rotas /, /solucoes, /vagas, * → /
    ├── icones.tsx                     # NOVO: SVGs Lucide usados no site
    ├── dados/
    │   ├── vagas.ts                   # NOVO: lista fixa + opções de filtro
    │   └── conteudo.ts                # NOVO: equipe, clientes, casos, valores, soluções, setores
    ├── components/
    │   ├── Cabecalho.tsx              # NOVO: logo, menu, menu do celular
    │   ├── Rodape.tsx                 # NOVO: rodapé + "Voltar ao topo"
    │   ├── WhatsAppFlutuante.tsx      # NOVO
    │   ├── FormularioContato.tsx      # NOVO
    │   └── ModalInteresse.tsx         # NOVO
    └── pages/
        ├── Home.tsx                   # NOVO
        ├── Solucoes.tsx               # NOVO
        └── Vagas.tsx                  # NOVO
.env.deploy.example                    # checklist de domínio/DNS do site
```

**Structure Decision**: Novo módulo `frontend/src/site/`, isolado de `src/` (ERP) e `src/proposal/`; nenhum import cruzado.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Princípio II (feature fora do domínio financeiro interno) | A Ocean pediu o site institucional no mesmo repositório e deploy que já hospedam ERP e Proposal | Repositório/deploy separado duplicaria configuração e publicação sem benefício nesta fase de validação |
| CSS compilado de terceiros no repositório | Fidelidade ao visual aprovado sem tocar o Tailwind do ERP | Recriar em Tailwind 3 perde `color-mix` e muda nomes de classes; migrar para Tailwind 4 afeta o ERP |
