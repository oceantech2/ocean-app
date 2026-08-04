# Data Model: Ocean App — Baseline

**Feature**: `001-ocean-app-baseline` | **Date**: 2026-07-26  
**Fonte**: `backend/app/models/__init__.py`

## Diagrama de relacionamentos (conceitual)

```text
UsuarioApp ── (login) ──► JWT
UsuarioAuth ── (TOTP por usuario)

Colaborador ──┬── NF (lead | condução | placement)
              ├── Bonus
              ├── Ferias
              ├── HistoricoColaborador
              ├── DocumentoColaborador
              └── Patrimonio

ContaPagar (centros de custo; comprovante opcional em disco)
NF ──► faturamento / fluxo / bônus / relatórios
Saldo + FluxoMovimento ──► fluxo de caixa
MetaFinanceira ──► dashboard
DH ──► checklist financeiro/CEO
Imposto ──► cadastro opcional (UI preferencialmente deriva de Contas)
AuditLog ──► trilha de alterações
```

## Enums

| Enum | Valores |
|------|---------|
| `TipoFechamento` | `retainer`, `sucesso` |
| `StatusNF` | `paga`, `pendente`, `vencida`, `cancelada` |
| `CentroCusto` | `administrativo`, `retirada_lucro`, `salario`, `impostos`, `reembolsos`, `bonus`, `evento` |

## Entidades

### Colaborador (`colaboradores`)

| Campo | Tipo | Regras |
|-------|------|--------|
| id | int PK | |
| nome, cargo | string | obrigatórios |
| cpf | string(14) | único, obrigatório |
| salario | float | obrigatório |
| data_nascimento | date | obrigatório |
| endereco_completo, cep, observacao, beneficio | text/string | opcionais |
| data_admissao / data_desligamento | datetime | desligamento no soft-delete |
| ativo | bool | default true; soft-delete = false |

**Transitions**: ativo → inativo (desligar); exclusão permanente remove relacionados (fluxo admin).

### HistoricoColaborador (`historico_colaboradores`)

Períodos de cargo/salário: `colaborador_id`, `cargo`, `salario`, `data_inicio`, `data_fim?`, `observacao?`.

### NF (`nfs`)

| Campo | Notas |
|-------|--------|
| numero | único |
| razao_social, posicao?, candidato? | cliente / vaga |
| valor_bruto, valor_liquido | obrigatórios |
| data_emissao, data_vencimento, data_pagamento? | filtros usam emissão |
| tipo | retainer \| sucesso |
| tipo_abertura_fechamento | abertura/fechamento (retainer) |
| status | enum StatusNF |
| colaborador_*_id | 3 FKs opcionais |
| arquivada | default false; oculto na lista padrão |

**Transitions**: pendente ↔ paga (data_pagamento); → vencida (regra de negócio por vencimento); → cancelada; arquivar/desarquivar independente.

### Bonus (`bonus`)

`colaborador_id`, `mes`, `ano`, `etapa` (lead|conducao|placement), `percentual`, `valor_bonus`, `cliente?`, `posicao?`, `numero_nf?`.  
Cálculo típico: `% × valor_liquido` da NF vinculada.

### Ferias (`ferias`)

`colaborador_id`, `ano`, `dias_direito`, `dias_tirados`, `data_inicio?`, `data_fim?`, `aprovado`.  
Saldo = direito − tirados; não aprovado alimenta alertas.

### ContaPagar (`contas_pagar`)

`descricao`, `centro_custo`, `valor`, `data_vencimento?`, `data_pagamento?`, `pago`, `comprovante_path?`, `comprovante_nome?`.  
Atrasada = não paga + vencimento passado.

### FluxoMovimento (`fluxo_movimentos`)

Movimentos manuais: `tipo` (receita|despesa), `descricao`, `valor`, `data_movimento`, `mes`, `ano`.

### Saldo (`saldos`)

`mes`, `ano`, `conta` (corrente|investimento), `saldo`, `data_registro`.

### DH (`dhs`)

`empresa`, `posicao`, `tipo_fechamento`, `tipo_abertura_fechamento?`, `colaborador_preencheu`, `assunto` (auto), `enviado_financeiro`, `enviado_ceo`, `data_envio`.

### Imposto (`impostos`)

`mes`, `ano`, `faturamento`, `percentual_imposto`, `valor_imposto`.  
UI principal usa visão derivada de contas + NFs (`/impostos/de-contas`).

### MetaFinanceira (`metas_financeiras`)

`mes` (1–12 ou 0 = anual), `ano`, `valor_meta`.

### DocumentoColaborador (`documentos_colaborador`)

`colaborador_id`, `nome_original`, `nome_arquivo` (uuid em disco), `tipo_mime?`, `tamanho?`.

### Patrimonio (`patrimonio`)

`descricao`, `tipo`, `numero_serie?`, `marca?`, `modelo?`, `valor_aquisicao?`, `data_aquisicao?`, `status` (ativo|em_manutencao|descartado), `colaborador_id?`, `observacao?`.

### AuditLog (`audit_logs`)

`usuario`, `acao` (criar|editar|deletar), `entidade`, `entidade_id?`, `descricao?`, `criado_em`.

### UsuarioApp (`usuarios_app`)

`usuario` único, `senha_hash`, `papel` (admin|visualizador), `permissoes` (JSON texto), `ativo`.

### UsuarioAuth (`usuarios_auth`)

`usuario` único, `totp_secret?`, `twofa_ativo`.

## Arquivos fora do banco

| Área | Persistência |
|------|----------------|
| Biblioteca NFs | diretório `NFS_DIR` (lista/upload/download/delete por nome) |
| Biblioteca comprovantes | `COMPROVANTES_DIR` |
| Docs colaborador / comprovante de conta | `UPLOAD_DIR` + metadados no banco |
