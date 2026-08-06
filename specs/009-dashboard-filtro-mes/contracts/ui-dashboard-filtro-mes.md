# Contract: UI — Dashboard Filtro de Mês

**Feature**: `009-dashboard-filtro-mes`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Papéis**: `admin` e `visualizador` podem alterar mês/ano; edição de metas só `admin` (inalterado).

## Controles de período (header)

| Controle | Comportamento |
|----------|----------------|
| Select **Mês** | Opções = `mesesPermitidos(ano)`; label “Mês:”; valor = estado `mes` |
| Select **Ano** | Igual ao atual; ao mudar, aplica clamp de `mes` se necessário |
| Comparar / ano comparar | Independente do mês; inalterado |

**Padrão na abertura**: `mes = mêsCivilCorrente`, `ano = anoCivilCorrente`.

**mesesPermitidos(ano)**:
- ano passado → Jan…Dez
- ano corrente → Jan…mês corrente
- ano futuro → nenhuma opção útil / indicadores vazios (sem inventar dados)

## Mapeamento bloco × período

| Bloco | Reage a `mes`? | Reage a `ano`? | Notas |
|-------|----------------|----------------|-------|
| Meta anual | Não | Sim | `progresso(0, ano)` |
| Meta mensal | Sim | Sim | Título `Meta de Faturamento — {MESES_NOME[mes-1]}/{ano}` |
| Saldos CC / Invest. | Sim | Sim | Fallback ≤ mes; rótulo do registro exibido |
| DRE | Não* | Sim | *refetch ok; série do ano intacta |
| Custo donut | Sim | Sim | `mes_de=mes_ate=mes`; título pode incluir mês/ano |
| Faturamento por mês | Não* | Sim | + `anoComparar` |

## Estados

| Situação | UI |
|----------|-----|
| Loading | Spinner existente da página |
| Sem dados no mês (meta/custo) | Mensagem/estado vazio do bloco |
| Sem saldo ≤ mes | “Sem registro” (ou equivalente atual) |
| Falha parcial | Feedback no bloco; demais seções usáveis |
| Troca rápida mês/ano | Último período vence (loading cobre intermediários) |

## Acessibilidade mínima

- Labels associados aos selects (texto visível “Mês:” / “Ano:”).
- Opções de mês em português (`MESES_NOME`).

## Fora de escopo UI

- Persistência do período na URL ou localStorage.
- Opção “Todos os meses”.
- Destaque do mês nos gráficos anuais.
- Filtro de mês em outras páginas.
