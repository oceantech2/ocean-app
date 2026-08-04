# Research: Página Contas a Receber

**Feature**: `007-contas-receber` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

## 1. Fonte Maggo nesta entrega (stub vs real)

**Decision**: Implementar `backend/app/services/maggo_stub.py` que devolve lista fixa/determinística de contas a receber (mesmo shape do contrato Maggo esperado). A listagem da página **não** usa mais criação local como origem. Maggo real fica para feature seguinte.

**Rationale**: Clarify Q3 = stub agora; FR-002/FR-014 exigem fonte plugável e preparação para troca sem reabrir criar/importar/excluir.

**Alternatives considered**:
- Maggo real nesta feature — rejeitado (clarify C).
- Stub só no frontend — rejeitado (fonte deve ser a mesma superfície que a Maggo real usará no backend).
- Manter lista 100% da tabela `nfs` sem stub — rejeitado (não valida o novo modelo operacional).

## 2. Persistência do enriquecimento Ocean

**Decision**: Continuar usando a tabela `nfs` para enriquecimento. Adicionar coluna nullable `caixa` (`VARCHAR`, valores `corrente` \| `investimento` \| NULL). Merge na listagem: para cada item do stub, localizar/criar linha Ocean pela chave estável `numero` (único hoje) e devolver visão mesclada (campos Maggo do stub + `caixa`, pagamento, colaboradores, `arquivada` do Ocean).

**Rationale**: Menor migração; Dashboard/Calendário/Bônus já consomem `nfs`. `numero` único serve de chave até existir `maggo_id` na Maggo real.

**Alternatives considered**:
- Tabela nova `contas_receber_enrichment` — mais puro, mas dobra modelos e quebra consumidores sem ganho nesta entrega.
- Coluna `maggo_id` obrigatória já — adiada até contrato real da Maggo.

## 3. Nome e valores de Caixa

**Decision**: Campo `caixa` com strings `"corrente"` e `"investimento"` (mesmo vocabulário de `Saldo.conta` no Fluxo de Caixa). NULL = “não definido”.

**Rationale**: Consistência de domínio (Constitution IV); evita enum SQL novo desnecessário.

**Alternatives considered**:
- Reusar nome `conta` — rejeitado (ambíguo com Contas a Pagar / entidade Conta).
- Enum PostgreSQL — rejeitado (strings bastam; padrão do Fluxo de Caixa).

## 4. Allowlist de atualização (API + UI)

**Decision**: `PUT /api/nfs/{id}` aceita apenas: `caixa`, `data_pagamento` (e efeitos de status já existentes ao pagar), `colaborador_lead_id`, `colaborador_conducao_id`, `colaborador_placement_id`, `arquivada`. Rejeitar (422/400) tentativas de alterar `numero`, `razao_social`, valores, datas de emissão/vencimento, `tipo`, etc. UI: inputs Maggo `readOnly`/`disabled`; modal de criação removido.

**Rationale**: Clarify Q1 + FR-008; defesa em profundidade (UI + API).

**Alternatives considered**:
- Só UI readonly — rejeitado (admin poderia chamar API direto).
- Endpoint novo `/enrichment` — possível, mas PUT allowlist no recurso atual é mais simples.

## 5. Remoção de criar / importar / excluir / pasta

**Decision**:
- **Frontend**: remover botões e fluxos Nova NF, Deletar Todas, Deletar individual, Import CSV, Import Excel, pasta/`GerenciadorArquivos`.
- **Backend**: `POST /`, `DELETE /{id}`, `DELETE /todas`, `POST /importar-xlsx` retornam **403** (ou 410) com mensagem clara; exportações e GET/PUT (allowlist) permanecem. Rotas `arquivos-nfs` podem permanecer no servidor sem superfície na página (não é requisito deletar o módulo de arquivos nesta feature).

**Rationale**: Clarify Q2; FR-003–005, FR-013; Constitution V (não apagar backend de arquivos se outros usos futuros; só tirar da página).

**Alternatives considered**:
- Remover rotas do backend por completo — adiado (maior risco; pasta só precisa sumir da página).
- Soft-disable (botão cinza) — rejeitado (spec: remoção total na UI).

## 6. Navegação, rota e permissões

**Decision**: Label do menu e título da página → **Contas a Receber**. Manter `permKey: 'nfs'` e path canônico `/nfs` nesta entrega (opcional: alias `/contas-receber` redirecionando para `/nfs`). Atualizar label em Configurações. Não migrar JSON de permissões de usuários.

**Rationale**: FR-011 pede rótulos; migrar `permKey` quebraria acessos existentes sem benefício imediato.

**Alternatives considered**:
- Path + permKey `contas_receber` — melhor semanticamente; adiado (migration de permissões).
- Manter label “NFs” — rejeitado (FR-011).

## 7. Falha do stub (SC-005)

**Decision**: Stub pode simular falha via flag de config/env de desenvolvimento (ex.: `MAGGO_STUB_FAIL=true`) levantando erro controlado; a rota de listagem propaga 502/503 e o frontend mostra toast de erro sem lista vazia de sucesso.

**Rationale**: Atende FR-010/SC-005 sem depender de Maggo real.

**Alternatives considered**: Falha só com rede externa — inviável com stub local.

## 8. Consumidores secundários (Dashboard, Calendário, etc.)

**Decision**: Não alterar lógica de Dashboard/Calendário/Relatórios/Bônus nesta feature, além de labels se aparecerem como “NFs” no menu de Contas a Receber. Dados continuam vindos de `nfs` após merge do stub.

**Rationale**: Escopo fechado (Constitution V); merge mantém a tabela alimentada.

**Alternatives considered**: Renomear todas as strings “NF” no produto — fora de escopo (glossário amplo).
