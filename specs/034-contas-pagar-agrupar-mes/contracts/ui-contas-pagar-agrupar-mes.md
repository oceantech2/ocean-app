# Contrato de UI: Contas a Pagar — Agrupar por Mês e Filtrar por Categorias

**Feature**: `034-contas-pagar-agrupar-mes` | **Date**: 2026-08-18  
**Página**: Contas a Pagar (`/contas`, `frontend/src/pages/Contas.tsx`)  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

Não há contrato REST novo. `GET /api/contas?categoria=&subcategoria=` e `GET /api/contas/categorias` permanecem.

## Superfície

| Região | Comportamento |
|--------|----------------|
| Cartões Total a Pagar / Vencido / Total Pago | Inalterados (regra vigente da página) |
| Filtro Categorias | Todas + oficiais + cadastradas; RH revela Subcategoria RH |
| Filtro Subcategoria RH | “Todas de RH” ou uma subcategoria; só com categoria RH |
| Demais filtros | Status/alertas, descrição, venc. de/até — inalterados |
| Controle Agrupar | Dois modos: **Por mês** (padrão) e **Por categoria** |
| Lista | Um card por grupo visível; vazio → “Nenhuma conta encontrada” |

## Controle de agrupamento

| Requisito | Contrato |
|-----------|----------|
| Padrão | Por mês ao entrar na página |
| Troca | Sem limpar filtros |
| Por mês | Grupos por vencimento; ordem mês mais recente → mais antigo; “Sem vencimento” no fim |
| Rótulo do mês | Português, mês por extenso + ano |
| Total | Um número no cabeçalho: soma dos valores visíveis do grupo (pago+pendente se ambos visíveis) |
| Colapso | Só Por mês: cabeçalho abre/fecha; só o mês datado mais recente inicia aberto |
| Por categoria | Comportamento atual de grupos; todos abertos; sem controle de colapso |

## Filtro × agrupamento

| Filtro | Efeito na lista agrupada |
|--------|---------------------------|
| Categoria nomeada | Só contas dessa categoria (pendentes de reclassificação fora) |
| RH sem subcategoria | Todas as subcategorias de RH |
| RH + subcategoria | Só aquela subcategoria |
| Status / datas / descrição | Aplicam-se **antes** de formar grupos |
| Resultado vazio | Sem cards de grupo |

## Papéis

| Papel | Agrupar e filtrar | Escrita |
|-------|-------------------|---------|
| `admin` | Sim | Inalterada |
| `visualizador` | Sim (mesmo recorte) | Não |

## Acessibilidade (mínimo)

- Controle de modo com rótulo visível (“Agrupar”).
- Cabeçalho de grupo no modo mês é acionável (botão ou equivalente) com indicação aberto/fechado (`aria-expanded`).
- Total permanece no cabeçalho com grupo fechado.

## Fora de escopo (não quebrar)

- CRUD, import CSV, anexo de NF, cadastro de categoria no formulário
- Persistência do modo após sair da rota
- Dashboard, Fluxo de Caixa, Contas a Receber
- Export agrupada, dois totais (pago vs pendente) no grupo
