# Research: Contas a Pagar — Categorias e Exclusão em Massa

**Feature**: `008-contas-pagar-categorias` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

## 1. Modelo de persistência (categoria + subcategoria)

**Decision**: Substituir o enum `centro_custo` por três colunas em `contas_pagar`:
- `categoria` (VARCHAR, obrigatória) — código da categoria superior ou valor legado se pendente
- `subcategoria` (VARCHAR, nullable) — obrigatória apenas quando `categoria = recursos_humanos` e não pendente
- `categoria_pendente` (BOOLEAN, default false)

Códigos canônicos (snake_case, minúsculos):

| Código `categoria` | Label UI |
|--------------------|----------|
| `adm_financeiro` | Adm/Financeiro |
| `operacoes` | Operações |
| `marketing` | Marketing |
| `comercial` | Comercial |
| `recursos_humanos` | Recursos Humanos |
| `tecnologia` | Tecnologia |
| `impostos` | Impostos |

Subcategorias RH (`subcategoria`): `salario`, `bonus`, `comissao`, `retirada_socios`, `beneficios`.

**Rationale**: Espelha a hierarquia da spec (FR-004/005/007/008); filtros por pai (RH todas) e por subcategoria ficam triviais; Impostos/Retiradas filtram por códigos estáveis.

**Alternatives considered**:
- Um único campo “folha” (`rh_salario`, `adm_financeiro`, …) — filtro “RH todas” exige lista/prefixo; rejeitado em favor da hierarquia explícita.
- Manter enum PostgreSQL `CentroCusto` expandido — migração de ENUM no Postgres é frágil; VARCHAR + validação em serviço é mais simples (padrão já usado em outros campos string).

## 2. Migração de dados legados

**Decision**: One-shot na subida (ou script de migrate em `main.py`):

| Valor antigo (`centro_custo`) | Novo |
|-------------------------------|------|
| `administrativo` / `ADMINISTRATIVO` | `categoria=adm_financeiro`, `subcategoria=null`, `pendente=false` |
| `salario` | `recursos_humanos` + `salario` |
| `bonus` | `recursos_humanos` + `bonus` |
| `retirada_lucro` | `recursos_humanos` + `retirada_socios` |
| `impostos` / `imposto` | `impostos`, sub null |
| `reembolsos`, `evento`, outros | manter código antigo em `categoria`, `subcategoria=null`, `categoria_pendente=true` |

Após migrar todas as linhas, dropar/ignorar a coluna `centro_custo` (ou copiar e remover). Aceitar case misto legado na leitura do mapeamento.

**Rationale**: Clarify Q1 — migração persistente dos mapeáveis; não mapeáveis ficam pendentes sem default forçado.

**Alternatives considered**:
- Só remapear na UI — rejeitado (clarify A; quebra consumidores).
- Forçar default Adm/Financeiro nos não mapeáveis — rejeitado (clarify C).

## 3. Pendência de reclassificação

**Decision**: `categoria_pendente=true` gera aviso visual na lista/modal. Admin pode marcar como paga e editar outros campos sem reclassificar. Ao salvar com `categoria`+`subcategoria` válidos da taxonomia nova, limpar pendência (`false`). API de create/update (quando não pendente) rejeita combinação inválida (422). Update que só altera pagamento/descrição **não** exige reclassificação.

**Rationale**: Clarify Q5 — operação normal + aviso.

**Alternatives considered**: Bloquear pagar até reclassificar — rejeitado (clarify B/C).

## 4. Remoção de “Deletar todas”

**Decision**:
- **Frontend**: remover botão e handler `deletarTodas`.
- **Backend**: `DELETE /api/contas/todas` retorna **403** com mensagem clara (mesmo padrão de Contas a Receber). Exclusão individual `DELETE /api/contas/{id}` permanece.

**Rationale**: FR-002; defesa em profundidade (UI + API).

**Alternatives considered**: Soft-disable (botão cinza) — rejeitado (spec: indisponível). Remover rota do router — possível, mas 403 mantém descoberta explícita e evita 404 ambíguo.

## 5. Filtros de listagem

**Decision**: Query params:
- `categoria` — código superior (opcional)
- `subcategoria` — só faz sentido com RH (opcional)
- `pago` — mantém comportamento atual

Regras: se `categoria=recursos_humanos` sem `subcategoria` → todas as sub de RH; com `subcategoria` → AND. Contas `categoria_pendente=true` aparecem na lista geral e em filtro dedicado opcional (ou sempre visíveis quando “todas”); **não** entram no filtro de uma categoria nova específica (exceto se ainda exibidas em “todas”).

**Rationale**: Clarify Q3 / FR-008.

**Alternatives considered**: Filtro só por superior — rejeitado. Lista plana no filtro — rejeitado.

## 6. Importação CSV/XLSX

**Decision**: Aceitar apenas códigos/labels da taxonomia nova (documentar no contrato: preferir códigos; labels pt-BR aceitos como alias de import). Exigir `subcategoria` quando categoria for RH. Valores antigos (`administrativo`, `salario` isolado como centro antigo, etc.) → erro na linha, sem mapeamento silencioso.

**Rationale**: Clarify Q4 / FR-012.

**Alternatives considered**: Aceitar aliases legados na import — rejeitado. Remover import — rejeitado.

## 7. Consumidores Impostos, Retiradas, custo por categoria

**Decision**: Ajuste mínimo de filtros/agregações:
- **Impostos** (API/UI): `categoria == impostos` (em vez de `CentroCusto.IMPOSTOS`).
- **Retiradas**: `categoria == recursos_humanos` AND `subcategoria == retirada_socios`.
- **custo-por-categoria** (`/relatorios/custo-por-categoria`): agregar por `categoria` (nível superior); contas pendentes em grupo `pendente` ou excluídas do donut com nota — preferência: grupo separado `pendente` para não distorcer categorias oficiais.
- DRE/relatórios que separam impostos vs demais: `categoria == impostos` vs `!= impostos` (pendentes tratados como “demais” ou excluídos — documentar: pendentes entram em “demais despesas” até reclassificar).

Sem redesign de layout/nomenclatura completa nessas telas.

**Rationale**: Clarify Q2 / FR-011 / SC-007.

**Alternatives considered**: Só Contas a Pagar (deixar telas quebradas) — rejeitado. Redesign total de labels — fora de escopo.

## 8. Compatibilidade de API (campo `centro_custo`)

**Decision**: Resposta e body passam a usar `categoria`, `subcategoria`, `categoria_pendente`. Não manter `centro_custo` no contrato público (breaking change aceitável: app monolítico frontend+backend na mesma entrega). Store de filtros: renomear `contasCentro` → `contasCategoria` (+ `contasSubcategoria`) ou adaptar chaves existentes.

**Rationale**: Evita dualismo de nomes; Constitution V — uma entrega coordenada.

**Alternatives considered**: Alias `centro_custo` deprecated na API — overhead sem consumidor externo conhecido.
