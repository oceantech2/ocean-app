# Quickstart: Contas a Pagar — Tipo Imposto / DAS

**Feature**: `074-contas-tipo-imposto-das` | **Date**: 2026-09-16  
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

## Pré-requisitos

- Docker: PostgreSQL **5433**, API **8001**, Redis **6380**
- Frontend: `cd frontend && npm run dev` → **5193**
- Login: `admin` / `123456` (escrita); `visualizador` / `123456` (leitura)

```bash
docker compose up -d
cd frontend && npm run dev
```

`VITE_API_URL=http://localhost:8001/api`

Após subir o backend, a migração inline deve ter convertido contas `categoria=impostos|imposto` para `tipo_despesa=imposto_das` com categoria vazia.

## Cenários de validação

### 1. Três Tipos no formulário (US1)

1. Abrir Contas a Pagar → Nova conta.
2. Conferir Tipo: Fixo, Variável, Imposto / DAS; default Variável.
3. Salvar uma conta de cada Tipo (Imposto / DAS pode ir sem categoria).
4. Conferir rótulos na listagem; editar e trocar Tipos.
5. Como visualizador: ver Tipo, sem editar.

**Esperado**: Persistência e rótulos corretos; bloqueio sem Tipo.

### 2. Categorias sem Impostos + opcional (US2)

1. No formulário, abrir Categorias: **sem** Impostos.
2. Com Tipo Imposto / DAS, salvar sem categoria (OK).
3. Com Tipo Variável, tentar salvar sem categoria (bloqueado).
4. Filtro de categorias na listagem: sem Impostos.

**Esperado**: FR-004 / FR-006a.

### 3. Migração (US3)

1. Antes (ou em BD de teste): ter ao menos uma conta categoria Impostos.
2. Reiniciar backend / confirmar migração.
3. Abrir a conta: Tipo **Imposto / DAS**, categoria vazia.
4. Conta que era só Variável/Marketing: Tipo inalterado.

**Esperado**: SC-003, SC-009.

### 4. Página Impostos + custo (US4)

1. Abrir `/impostos` no ano das contas migradas/novas Imposto / DAS → valores aparecem.
2. Empty state (se zerado): texto menciona Tipo Imposto / DAS.
3. Dashboard custo por categoria: sem fatia Impostos; contas Imposto / DAS fora das fatias operacionais.
4. Cards Fixas/Variáveis: valores de Imposto / DAS **não** somam como variável.

**Esperado**: FR-008, FR-009, SC-010.

### 5. Export / import (US5)

1. Exportar CSV/Excel/PDF com os três Tipos → coluna Tipo correta.
2. Importar linha com categoria Impostos → rejeitada.
3. Importar Tipo Imposto / DAS sem categoria → aceita.
4. Importar sem Tipo → Variável (padrão).

**Esperado**: FR-010, FR-011.

## Checagens rápidas de código

```bash
cd frontend && npm run type-check && npm run lint
```

- `TIPOS_DESPESA` / schemas incluem `imposto_das`
- `GET /api/impostos/de-contas` filtra por `tipo_despesa`
- `categorias_contas.CATEGORIAS` sem `impostos`

## Fora deste quickstart

- Filtro de listagem por Tipo
- Fatia Impostos no donut por Tipo
- Alterar impostos derivados de NF no Dashboard
