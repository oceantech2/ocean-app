# Contrato UI: Contas a Receber

**Feature**: `007-contas-receber` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md) · **API**: [api-contas-receber.md](./api-contas-receber.md)

## Superfície

| Item | Valor |
|------|-------|
| Rota | `/nfs` (canônica); opcional alias `/contas-receber` → redirect |
| Componente | `frontend/src/pages/NFs.tsx` |
| Título | **Contas a Receber** |
| Menu (`Layout`) | Label **Contas a Receber**; `path` `/nfs`; `permKey` `nfs` |
| Configurações | Label do módulo **Contas a Receber** (`key: nfs`) |

## Ações ausentes (admin e visualizador)

Não renderizar (nem desabilitados):

- “+ Nova NF” / criação
- “Deletar Todas”
- Exclusão individual na linha
- Importar CSV / Importar Excel
- Pasta / botão “📁 NFs” / `GerenciadorArquivos`

## Ações presentes

| Ação | Quem | Notas |
|------|------|-------|
| Exportar CSV / Excel / PDF | conforme hoje | FR-012 |
| Filtrar mês / ano / status | todos com permissão | |
| Mostrar arquivadas | todos com permissão | |
| Pagar / data pagamento | admin | |
| Editar enriquecimento | admin | ver campos abaixo |
| Arquivar / Exibir | admin | |

## Listagem

Coluna nova (ou equivalente legível): **Caixa** — `Corrente` / `Investimento` / indicação de **não definido** quando `caixa` é null.

## Modal de edição

| Campo | UI |
|-------|-----|
| número, razão social, posição, candidato, valores, emissão, vencimento, tipo | somente leitura |
| data pagamento | editável (admin) |
| colaboradores lead/condução/placement | editáveis (admin) |
| caixa | select: (vazio/não definido) \| corrente \| investimento |
| arquivar | via ação da linha (já existente), não via criação |

Sem modo “Nova NF” / título “Nova NF”.

## Estados

| Estado | Comportamento |
|--------|----------------|
| Loading | spinner (padrão Dashboard/NFs) |
| Erro stub/API | toast de erro; **não** lista vazia de sucesso |
| Vazio legítimo | stub OK e zero registros após filtro — mensagem de vazio |
| Visualizador | sem botões de escrita |

## Glossário na página

Usar **Contas a Receber** no H1 e textos principais. Evitar CTA “Nova NF”. Termos técnicos internos (`nfs` path/perm) podem permanecer no código.
