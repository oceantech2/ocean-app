# Quickstart: Validação — Contas a Receber

**Feature**: `007-contas-receber` | **Date**: 2026-07-26  
**Contratos**: [api](./contracts/api-contas-receber.md) · [ui](./contracts/ui-contas-receber.md) · **Modelo**: [data-model.md](./data-model.md)

## Pré-requisitos

- `docker compose up -d` (API **8001**, Postgres **5433**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Credenciais de desenvolvimento do projeto (não documentar senhas aqui)
- Stub Maggo ativo (padrão); para V5, poder setar `MAGGO_STUB_FAIL=true` no backend e reiniciar

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Abrir `http://localhost:5193`, autenticar (admin e, depois, visualizador) e ir em **Contas a Receber** (menu; rota `/nfs`).

## Cenários de validação

### V1 — Lista via stub (P1)

1. Abrir Contas a Receber.
2. **Esperado**: lista carrega com registros do stub (sem precisar criar NF); título/menu **Contas a Receber**.
3. Recarregar a página.
4. **Esperado**: mesma origem (stub); sem depender de “Nova NF”.

### V2 — Ações removidas (P1)

1. Como **admin**, inspecionar header e linhas.
2. **Esperado**: ausentes — Nova NF, Deletar Todas, Deletar individual, Importar CSV, Importar Excel, pasta/📁 NFs.
3. **Esperado**: presentes — exportações, filtros, Arquivar, Pagar/Editar (enriquecimento).

### V3 — Caixa corrente / investimento (P1)

1. Editar um registro; escolher Caixa **corrente**; salvar.
2. **Esperado**: coluna/lista mostra Corrente após reload.
3. Alterar para **investimento**; salvar.
4. **Esperado**: Investimento persistido.
5. Limpar / deixar não definido (se a UI permitir `null`).
6. **Esperado**: indicação clara de não definido.

### V4 — Campos somente leitura Maggo (P2)

1. Abrir edição.
2. **Esperado**: número, valores, cliente, emissão, vencimento, tipo não editáveis.
3. Alterar pagamento e/ou colaboradores; salvar.
4. **Esperado**: enriquecimento gravado; campos Maggo inalterados.

### V5 — Falha do stub (P1)

1. Ativar falha do stub (`MAGGO_STUB_FAIL=true`), reiniciar API.
2. Abrir Contas a Receber.
3. **Esperado**: toast/erro claro; **não** lista vazia apresentada como sucesso.
4. Desfazer a flag e reiniciar.

### V6 — Arquivar (P1)

1. Arquivar um registro.
2. **Esperado**: some da lista padrão; reaparece com “Mostrar arquivadas”; desarquivar restaura.

### V7 — Visualizador (P1)

1. Login como visualizador com permissão do módulo.
2. **Esperado**: consulta + Caixa visível; sem editar/pagar/arquivar.

### V8 — API bloqueada (opcional)

1. Como admin, tentar `POST /api/nfs`, `DELETE /api/nfs/{id}`, `DELETE /api/nfs/todas`, `POST /api/nfs/importar-xlsx`.
2. **Esperado**: **403** (ou equivalente documentado no contrato).

## Checagens rápidas de build

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto para esta validação

- V1–V7 passam; V5 e V8 recomendados antes de fechar a feature.
- Maggo real **não** é exigida neste quickstart.
