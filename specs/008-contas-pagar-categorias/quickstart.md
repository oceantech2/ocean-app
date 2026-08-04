# Quickstart: Validação — Contas a Pagar (Categorias)

**Feature**: `008-contas-pagar-categorias` | **Date**: 2026-07-26  
**Contratos**: [api](./contracts/api-contas-pagar.md) · [ui](./contracts/ui-contas-pagar.md) · **Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- `docker compose up -d` (API **8001**, Postgres **5433**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Credenciais de desenvolvimento do projeto (não documentar senhas aqui)
- Ideal: ter pelo menos uma conta legada mapeável e uma não mapeável **antes** do deploy da migração (ou seed de teste)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Abrir `http://localhost:5193`, autenticar (admin e, depois, visualizador) e ir em **Contas a Pagar**.

## Cenários de validação

### V1 — Lançamento manual (P1)

1. Como admin, criar conta em **Marketing** (sem subcategoria).
2. **Esperado**: salva e aparece na lista sob Categorias = Marketing.
3. Criar conta **Recursos Humanos / Salário**.
4. **Esperado**: salva; lista mostra RH + Salário.
5. Tentar salvar RH sem subcategoria.
6. **Esperado**: bloqueio com feedback claro.

### V2 — Sem “Deletar todas” (P1)

1. Como admin, inspecionar ações da página.
2. **Esperado**: botão “Deletar todas” ausente.
3. (Opcional) `DELETE /api/contas/todas` → **403**.

### V3 — Rótulos e filtros (P1)

1. Conferir filtros/modal/coluna: texto **Categorias** (não “Centro de Custo”).
2. Filtrar por Operações; depois RH (todas); depois RH + Bônus.
3. **Esperado**: conjuntos corretos em cada filtro.

### V4 — Migração e pendência (P2)

1. Após deploy, listar contas.
2. **Esperado**: antigas mapeáveis já na taxonomia nova; não mapeáveis com aviso de pendência e ainda listáveis.
3. Marcar uma pendente como paga sem reclassificar.
4. **Esperado**: pagamento ok; aviso permanece.
5. Reclassificar a pendente para Adm/Financeiro; salvar.
6. **Esperado**: pendência some; filtros novos a incluem.

### V5 — Impostos / Retiradas / custo (P2)

1. Conta categoria **Impostos** → aparece em Impostos.
2. Conta RH / **Retirada Sócios** → aparece em Retiradas.
3. Dashboard / custo por categoria → totais batem com categorias novas (sem sumiço das migradas).

### V6 — Import (P1)

1. Importar linha com `categoria=marketing` válida.
2. **Esperado**: criada.
3. Importar linha com `administrativo` ou categoria inválida.
4. **Esperado**: erro na linha; sem conversão silenciosa.
5. Importar RH sem subcategoria → erro.

### V7 — Visualizador (P1)

1. Login visualizador com permissão do módulo.
2. **Esperado**: consulta + filtros; sem criar/editar/excluir/import.

## Checagens rápidas de build

```bash
cd frontend && npm run lint && npm run type-check
```

## Referências

- Decisões: [research.md](./research.md)
- Plano: [plan.md](./plan.md)
