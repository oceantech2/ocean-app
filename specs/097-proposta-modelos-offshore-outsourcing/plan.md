# Implementation Plan: Modelos Offshore Talent e Outsourcing e Fotos de Capa por Setor

**Branch**: `097-proposta-modelos-offshore-outsourcing` (trabalho direto na `main`, como nas features anteriores) | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/097-proposta-modelos-offshore-outsourcing/spec.md`

## Summary

Duas divisões novas no Proposal, **Offshore Talent** (`offshore-talent`) e **Outsourcing** (`outsourcing`), ambas na versão 1 e no formato novo da `083`, mais o setor **Tecnologia** e a foto de capa por setor nas quatro divisões.

Abordagem técnica: a `083` já deixou a página como um layout compartilhado (`PaginaModelo`) parametrizado pelo "conteúdo da divisão". Cada divisão nova é só:

- uma entrada em `MODELOS` no backend e no frontend;
- um componente de 10 linhas que monta `PaginaModelo` com os recursos do formato novo;
- os textos fixos em `conteudo/{pt-BR,en-US}.ts`, reutilizando a seção do meio do tipo `metodologia` (grade numerada com tópicos), que é exatamente o que "Áreas e cargos" e "Benefícios" são nos HTML;
- a logo extraída do HTML.

Ajustes no layout compartilhado: `textoServico` aceita vários parágrafos e a logo passa a ter largura por divisão (research R2 e R3). Setores: `tecnologia` nos dois registros e foto por setor com fallback para a padrão (research R4).

Nenhuma mudança de banco: `modelo` e `setor` são `VARCHAR(40)` sem constraint de valores; a validação fica em `proposta_modelos.py`.

## Technical Context

**Language/Version**: Python 3.10+ (backend), TypeScript 5 / React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy 2.0, Pydantic 2.5; React 18, Vite 5, Tailwind 3. Nenhuma dependência nova.

**Storage**: PostgreSQL 16 (Supabase em produção). Sem migração: valores novos cabem nas colunas existentes. Fotos e logos em `frontend/public/propostas/`.

**Testing**: Sem suíte automatizada no projeto. Validação pelo [quickstart.md](./quickstart.md), `npm run type-check`, `npm run build` e importação do módulo Python.

**Target Platform**: API no Render, frontend na Vercel (`proposal.oceantalentsolutions.com`), navegadores de computador e celular.

**Project Type**: Aplicação web (backend + frontend).

**Performance Goals**: Cada divisão continua um chunk preguiçoso pequeno; fotos de setor com ~170–290 KB cada, como a foto padrão atual.

**Constraints**:
- Executive Search e Development & Outplacement sem mudança de texto (FR-013); hashes de aceite intactos (setor e modelo já fazem parte do canônico e não mudam).
- Portas fixas; nenhum arquivo do ERP é alterado.

**Scale/Scope**: 2 modelos, 1 setor, 5 fotos, 2 logos, ~4 arquivos de conteúdo, 2 ajustes no layout compartilhado.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Idioma português | OK. Artefatos em pt-BR; inglês só no conteúdo em inglês da página do cliente e em nomes de serviço/cargo. |
| II. Domínio financeiro interno | OK. Fica no Proposal, sem tocar no ERP nem nos papéis. |
| III. Clareza antes de implementar | OK. Instruções da Ocean e HTML de referência definem o conteúdo; decisões por padrão registradas em Assumptions. |
| IV. Consistência com o produto | OK. Mesmo formulário, fluxo de criação, edição, cópia, aceite e layout das divisões existentes. |
| V. Simplicidade | OK. Reaproveita o layout compartilhado e o tipo de seção `metodologia`; nenhum tipo de seção novo, nenhuma coluna nova. |

**Resultado**: aprovado. Reavaliado após o design (Phase 1): continua aprovado.

## Project Structure

### Documentation (this feature)

```text
specs/097-proposta-modelos-offshore-outsourcing/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── modelos-setores.md   # identificadores, nomes, setores e fotos (API e página pública)
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/services/proposta_modelos.py   # MODELOS (+ offshore-talent, outsourcing), SETORES (+ tecnologia)

frontend/
├── public/propostas/
│   ├── offshore-talent/logo-divisao.png   # NOVO (extraída do HTML)
│   ├── outsourcing/logo-divisao.png       # NOVO (extraída do HTML)
│   └── setores/{oil-gas,energia,infraestrutura,mineracao,tecnologia}.jpg  # fotos de externo/, pelo conteúdo
└── src/proposal/
    ├── services/proposalApi.ts            # ModeloId e SetorId
    └── modelos/
        ├── index.ts                       # registro na ordem ES, Offshore, Outsourcing, D&O
        ├── setores.ts                     # tecnologia + foto por setor + FOTO_PADRAO exportada
        ├── pagina/
        │   ├── PaginaModelo.tsx           # parágrafos do serviço, largura da logo, fallback da foto
        │   ├── pagina-modelo.css          # largura da logo via variável CSS
        │   └── i18n/tipos.ts              # textoServico: string[]; logo.largura
        ├── executive-search/v1/conteudo/{pt-BR,en-US}.ts          # textoServico em array (texto igual)
        ├── outplacement-development/v1/conteudo/{pt-BR,en-US}.ts  # textoServico em array; largura 290
        ├── offshore-talent/v1/
        │   ├── OffshoreTalentV1.tsx       # NOVO
        │   └── conteudo/{pt-BR,en-US}.ts  # NOVO
        └── outsourcing/v1/
            ├── OutsourcingV1.tsx          # NOVO
            └── conteudo/{pt-BR,en-US}.ts  # NOVO
```

**Structure Decision**: Mesma estrutura das divisões existentes (research R1).

## Complexity Tracking

Nenhuma violação a justificar.
