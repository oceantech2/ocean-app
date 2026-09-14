# Quickstart: Ajuste de Modais no Viewport

**Feature**: `072-ajuste-modais-viewport` | **Date**: 2026-09-14  
**Contrato**: [contracts/ui-modais-viewport.md](./contracts/ui-modais-viewport.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456`
- Ver [data-model.md](./data-model.md) para regiões header/body/footer

## Smoke — margem (conteúdo curto)

1. Abrir uma modal pequena (ex.: Férias → nova/editar, ou Import CSV se disponível).
2. Esperado: painel centralizado; **espaço visível ≥ ~24px** entre o painel e as bordas superior e inferior da janela; não há corte do painel.

## Smoke — miolo longo (chrome fixo)

1. Abrir `/contas` → **Nova conta a pagar** (formulário denso) ou `/nfs` → nova conta a receber.
2. Reduzir a altura da janela do browser (ou zoom ~125%) até o formulário não caber.
3. Esperado:
   - Painel ainda com margem ≥ ~24px em cima/baixo
   - Título permanece visível no topo do painel
   - Botões Cancelar/Salvar (e +1 se houver) permanecem visíveis no rodapé do painel
   - Apenas os campos do meio rolam até o fim

## Smoke — consistência (amostra ≥ 5)

Abrir e inspecionar enquadramento em pelo menos cinco superfícies, por exemplo:

| # | Onde | Ação |
|---|------|------|
| 1 | Contas | Nova / Editar |
| 2 | NFs | Nova conta a receber |
| 3 | Fluxo de Caixa | Modal de lançamento/transferência |
| 4 | Fornecedores | Cadastro/edição |
| 5 | Documentos (colaborador) ou Import CSV | Abrir modal |

Esperado: mesmo padrão de margem + (quando aplicável) header/footer fixos.

## Smoke — sem regressão funcional

1. Em Contas: criar ou editar e **Salvar** com dados válidos → sucesso e fechamento como hoje.
2. **Cancelar** / fechar → modal fecha sem persistir alteração pendente (como hoje).
3. Se a modal fecha no clique do backdrop hoje, o comportamento deve permanecer; se não fechava, não introduzir fechamento novo sem necessidade.

## Negativos / bordas

| Caso | Esperado |
|------|----------|
| Conteúdo curto | Sem barra de rolagem desnecessária no miolo |
| Mensagem de erro / seção extra após submit inválido | Painel não ultrapassa a altura máxima; miolo passa a rolar se preciso |
| Visualizador | Continua só leitura; modais de visualização (se houver) também respeitam margem |

## Checagens de código

```bash
cd frontend && npm run lint && npm run type-check
```

Confirmar que não restam overlays do padrão com `overflow-y-auto` no painel inteiro **quando** há header/footer separados (grep auxiliar após implementação).

## Critério de pronto (manual)

- SC-001 a SC-004 da [spec.md](./spec.md) cobertos pelos smokes acima.
- Consumidores listados no [contrato UI](./contracts/ui-modais-viewport.md) migrados (ou exceção da busca do Layout documentada).
- Nenhum endpoint novo; backend intocado.
