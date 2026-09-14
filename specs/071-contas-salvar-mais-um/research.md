# Research: Contas a Pagar e Receber — botão +1

**Feature**: `071-contas-salvar-mais-um` | **Date**: 2026-09-14

## 1. Onde implementar (páginas)

**Decision**: Contas a Pagar em `frontend/src/pages/Contas.tsx`; Contas a Receber em `frontend/src/pages/NFs.tsx` (rota `/nfs`; `/contas-receber` redireciona).

**Rationale**: São as únicas superfícies com “Nova conta a pagar” / “Nova conta a receber” e modal de criação com Salvar/Cancelar.

**Alternatives considered**: Página dedicada “ContasReceber.tsx” (não existe); alterar só Contas (incompleto frente à spec).

## 2. Backend vs só frontend

**Decision**: Apenas frontend. Reutilizar `contasService.criar` e `nfsService.criar` (e upload de anexo quando houver, como no Salvar atual). Sem endpoint “salvar e continuar”.

**Rationale**: +1 é orquestração de UX após um create bem-sucedido; o domínio e validações já estão no POST.

**Alternatives considered**: Endpoint batch (fora de escopo / FR-009); query `?continue=1` (desnecessário).

## 3. Refatorar `salvar` vs handler separado

**Decision**: Extrair/parametrizar o fluxo de criação com flag `continuar: boolean` (ou função `salvarCriacao({ continuar })`) compartilhada pelo Salvar e pelo +1. Em sucesso com `continuar=false`: fechar modal (comportamento atual). Com `continuar=true`: toast, recarregar listagem, aplicar `formPosMaisUm(valoresEnviados)`, limpar anexo, manter `editando=null` / `criando=true`, modal aberta.

**Rationale**: Evita divergência de validação entre Salvar e +1 (FR-002).

**Alternatives considered**: Duplicar todo o `salvar` no clique do +1 (risco de drift); fechar e reabrir modal (pior UX).

## 4. Mapa de campos pós-+1

### Contas a Pagar (`Contas.tsx`)

| Campo form | Após +1 |
|------------|---------|
| descricao, categoria, subcategoria, valor, data_vencimento, fornecedor_id, caixa, tipo_despesa | **Copiar** do que foi enviado |
| data_pagamento | **Limpar** (`''`) → pendente (FR-010) |
| arquivoNf / File | **Limpar** (`null`) (FR-005) |
| id / editando | Permanecer criação (`editando = null`) |

Não há `nf_id` no form de pagar; “vínculo NF” materializa-se como anexo → limpar arquivo cobre FR-011 nesta página.

### Contas a Receber (`NFs.tsx`)

| Campo form | Após +1 |
|------------|---------|
| razao_social, posicao, valor_bruto, aliquota_imposto, valor_imposto, valor_liquido, data_ent_pgto, data_vencimento, tipo, caixa | **Copiar** |
| comissoesLinhas / bonusLinhas | **Copiar** estado do formulário (sem ids de registro persistido) |
| pagamento_estado | **`pendente`** (FR-010) |
| data_pagamento | **Limpar** |
| numero (NF) | **Limpar** (FR-011) |
| data_emissao | **Limpar** quando `numero` é limpo (evita estado inconsistente “emissão sem NF” / regra NF exige emissão) |
| arquivoNfForm | **Limpar** |
| criando | **`true`**; `editando = null` |

**Rationale**: Alinha clarify (liquidação e NF); cópia dos demais campos atende “dados antigos” do pedido.

**Alternatives considered**: Copiar liquidação/NF (rejeitado no clarify); limpar valor/vencimento (pior produtividade).

## 5. Visibilidade do botão +1

**Decision**: Renderizar **+1** somente quando `!editando` (Contas) / `criando` (NFs). Na edição, footer inalterado (Cancelar + Salvar). Apenas `papel === 'admin'` (mesmo gate do botão Nova / Salvar).

**Rationale**: FR-001, FR-004, FR-006.

## 6. Rótulo, ordem e acessibilidade

**Decision**: Rótulo visível **`+1`**; `title` e `aria-label` = `Salvar e cadastrar mais um`. Ordem sugerida no footer: **Cancelar** · **+1** · **Salvar** (primário Salvar à direita, padrão atual). Estilo do +1: secundário/outline (não competir visualmente com Salvar azul).

**Rationale**: Spec pede rótulo +1 com texto de apoio; Salvar permanece ação “padrão” que fecha.

**Alternatives considered**: Texto longo no botão (ocupa espaço); +1 como ActionButton `variant=criar` (semântico fraco).

## 7. Anti double-submit e erros

**Decision**: Reutilizar `salvando` para desabilitar Salvar e +1; em erro de validação ou API, não aplicar `formPosMaisUm` e não fechar. Em falha só do upload de anexo após create (padrão atual), manter política já usada no Salvar — se create já persistiu, para +1: tratar como sucesso parcial da conta (toast de aviso do anexo), aplicar form pós-+1 e manter modal (conta já existe).

**Rationale**: FR-007, FR-008; evita segundo POST idêntico por double-click.

## 8. Helper compartilhado

**Decision**: Preferir lógica inline nas duas páginas; extrair `frontend/src/utils/formularioMaisUm.ts` **somente** se as regras de “limpar liquidação/NF/anexo” ficarem idênticas o suficiente para valer um helper tipado mínimo. Não criar componente de modal genérico nesta entrega.

**Rationale**: Constituição V — simplicidade; as forms têm shapes diferentes.

## Resoluções NEEDS CLARIFICATION

Nenhum item técnico bloqueante restante após o clarify da spec. Detalhes de CSS/ordem exata do botão ficam no contrato UI e podem ajustar fino na implementação sem mudar requisitos.
