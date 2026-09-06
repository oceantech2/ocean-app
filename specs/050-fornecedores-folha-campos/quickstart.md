# Quickstart: Fornecedores — PF parcial, salário, datas e Total da folha

**Feature**: `050-fornecedores-folha-campos`  
**Date**: 2026-09-06

## Pré-requisitos

- Docker Compose com API em **8001**, PostgreSQL **5433**, Redis **6380**
- Frontend: `cd frontend && npm run dev` → **5193**
- Login: `admin` / `123456` (e, para SC-006, `visualizador` / `123456`)
- Contratos: [rest](./contracts/rest-fornecedores-folha-campos.md) · [ui](./contracts/ui-fornecedores-folha-campos.md) · [data-model](./data-model.md)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

`frontend/.env.local`: `VITE_API_URL=http://localhost:8001/api`

## Validação manual

### 1. PF do CNPJ sem CPF/nascimento

1. Abrir **Fornecedores** → **Novo Fornecedor**.
2. Documento **CNPJ**, preencher CNPJ + Razão Social + Tipo Fixo.
3. PF: só **Nome** e **Endereço**; deixar CPF e Data de Nascimento vazios.
4. Salvar → deve aceitar.
5. Tentar sem Nome ou sem Endereço → deve recusar com toast.
6. Informar CPF inválido → deve recusar; CPF válido → aceitar.

### 2. Salário e datas opcionais (não legado)

1. Novo fornecedor Spot: preencher só identificação; **sem** salário e **sem** datas → aceitar.
2. Editar: informar Data de início e Salário → persistir ao reabrir.
3. Informar Data de término **anterior** à de início → recusar.
4. Confirmar rótulos **Data de início** / **Data de término** (não Admissão/Desligamento).

### 3. Card Total da folha

1. Garantir pelo menos: (A) Fixo ativo com salário 1000; (B) Spot ativo com salário 5000; (C) Fixo inativo com salário 2000.
2. Card **Total da folha** deve refletir **apenas** a soma dos Fixo ativos (ex.: inclui 1000, exclui 5000 e 2000).
3. Alterar (A) de Fixo → Spot → card diminui; reverter → card volta.
4. Filtrar busca por nome que esconda (A) → card **não** deve zerar por causa do filtro.

### 4. Visualizador

1. Login visualizador → ver card e abrir registro em leitura; sem salvar alterações.

### 5. Checagens estáticas

```bash
cd frontend && npm run lint && npm run type-check
```

## Resultado esperado

- SC-001 / SC-001a / SC-002: PF parcial e validações OK  
- SC-003: cadastro com campos opcionais fluido  
- SC-004 / SC-005: card coerente e atualizado na sessão  
- SC-006: visualizador somente leitura  
