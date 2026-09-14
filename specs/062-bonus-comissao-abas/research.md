# Research: Página Bônus e Comissão com abas

**Branch**: `062-bonus-comissao-abas` | **Date**: 2026-09-14

## R1 — Persistência: coluna `tipo` na tabela `bonus`

**Decision**: Uma coluna `tipo` (`comissao` | `bonus`) na tabela `bonus` existente. Default `'comissao'`. Sem tabela nova. Sem backfill explícito além do DEFAULT (linhas atuais = Comissão).

**Rationale**: Liberar, Pagar, lote, `nf_id`, agrupamento por fornecedor e filtros já operam em `Bonus`. Constitution V: menor solução. Clarify Q1 exige tipo novo sem reclassificar histórico — DEFAULT cobre isso.

**Alternatives considered**:
- Tabela `bonus_remuneracao` separada → duplica máquina de estados e rotas; rejeitado.
- Inferir tipo por `percentual IS NULL` → frágil (legado com percentual 0); rejeitado.
- Renomear tabela/rotas para `/api/comissoes` → fora de escopo; prefixo `/api/bonus` permanece.

## R2 — Sync NF isolado por tipo (obrigatório)

**Decision**: `sincronizar()` de comissões consulta e apaga **somente** `tipo='comissao'` da NF. Novo `sincronizar_bonus()` faz o mesmo para `tipo='bonus'`. Payload `comissoes[]` e `bonus[]` independentes; `None` = não mexer naquele conjunto.

**Rationale**: Hoje `sincronizar` lista `Bonus.nf_id == nf.id` e **deleta** não-liberadas omitidas. Sem filtro de tipo, gravar só comissões apagaria bônus (e vice-versa) — quebra SC-008 e FR-027.

**Alternatives considered**:
- Um único array com discriminador no item → mistura blocos na UI; rejeitado na spec.
- Soft-flag “não deletar o outro tipo” dentro do sync atual → mais fácil errar; função irmã é explícita.

## R3 — Campos `percentual` e `etapa` em linha de bônus

**Decision**: Tornar `percentual` e `etapa` **nullable**. Linha `tipo=bonus`: `percentual=NULL`, `etapa=NULL`, `atividades=NULL`. `valor_bonus` obrigatório, informado no payload, **nunca** recalculado pelo líquido.

**Rationale**: FR-030 proíbe Atividade e Percentual. Sentinela `percentual=0` vaza na UI e em CSV. Nullable é o modelo honesto.

**Alternatives considered**:
- `percentual=0` + `etapa=''` sem DDL de nullability → rejeitado (lixo visível).
- Calcular bônus como % (espelhar comissão) → rejeitado na clarify Q4.

## R4 — Listagem GET `/api/bonus?tipo=`

**Decision**: Query `tipo` obrigatória na prática da UI (`comissao` ou `bonus`). Default do endpoint: `comissao` (compatibilidade de callers que hoje listam a tela de Comissões). `GET ?nf_id=` no modal da NF deve passar o tipo do bloco que está carregando (dois GETs ou um GET por bloco).

**Rationale**: SC-008 exige conjuntos disjuntos. Default `comissao` evita que a aba Comissão mostre bônus se o front esquecer o param numa regressão parcial.

**Alternatives considered**:
- Sem filtro, filtrar só no cliente → risco de misturar no import/CSV e em `NFs.tsx` (`bonusToLinha`); rejeitado.
- Default `all` → quebraria a tela atual; rejeitado.

## R5 — URL e nomenclatura

**Decision**: Manter path `/comissoes` e `key: 'bonus'` no catálogo. Trocar só **label** e **desc** para **Bônus e Comissão**. Título da página idem. Dashboard e Contas a Pagar “(legado)” **não** mudam (assumption da spec).

**Rationale**: Spec: mesmo item de menu; endereço no plano. Evita quebrar visibilidade/permissões persistidas pela `key`.

**Alternatives considered**:
- `/bonus-e-comissao` + redirect → escopo extra, permissões por path; rejeitado nesta versão.

## R6 — UI das abas e listagem

**Decision**: Abas no estilo visual do Dashboard (botões no `border-b`). Ordem **Bônus** | **Comissão**; estado inicial **Comissão**. Filtros (fornecedor, ano, recorte) compartilhados; seleção e paginação limpas ao trocar aba (e já ao filtrar/paginar). Aba Bônus: colunas Mês/Ano, Cliente/Posição, NF Ref., Valor, Liberado, Pago, ações — **sem** Atividade/Percentual. Importar CSV permanece só na aba **Comissão** (colunas atuais). Exportar CSV/PDF da aba ativa.

**Rationale**: Clarify + FR-003/004/023. CSV de comissão exige percentual/etapa; bônus não. Spec: importação não é o foco.

**Alternatives considered**:
- Persistência da aba no Zustand → spec pede padrão Comissão a cada abertura; rejeitado.
- Import CSV na aba Bônus nesta versão → fora do foco; rejeitado.

## R7 — Ações Liberar/Pagar/lote

**Decision**: Reusar endpoints atuais por `id`. Não criar `/api/bonus-remuneracao`. Mensagens de confirmação/toast flexionam “bônus” ou “comissão” conforme a aba. Sem Deletar na UI (já ausente).

**Rationale**: FR-007–FR-022 já implementados para comissão; bônus entra no mesmo pipeline de estado.

**Alternatives considered**: Rotas duplicadas por tipo → rejeitado.

## R8 — Carregamento no modal da NF

**Decision**: Ao abrir criar/editar NF: carregar `GET /api/bonus?nf_id=&tipo=comissao` no bloco Comissões e `GET /api/bonus?nf_id=&tipo=bonus` no bloco Bônus (ou um GET cada). PUT envia `comissoes` e `bonus` quando o admin salva (ambos no `model_fields_set` se o form os gerencia).

**Rationale**: Deep-link `/nfs?edit=` (045) precisa mostrar os dois blocos. Omitir um array no PUT não deve apagar o outro (`None` = no-op).

**Alternatives considered**: Um GET sem tipo e fatiar no cliente → só seguro se o GET filtrar; ainda assim dois blocos no form pedem dois arrays.

## NEEDS CLARIFICATION

Nenhum. Clarify 2026-09-14 e inspeção de `comissoes_sync` / `Bonus.tsx` / `NFs.tsx` resolvem o Technical Context.
