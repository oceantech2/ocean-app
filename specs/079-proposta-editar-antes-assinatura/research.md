# Research: Editar Proposta Antes da Assinatura

**Feature**: `079-proposta-editar-antes-assinatura` | **Date**: 2026-10-02

Base: implementação atual do Proposal (feature 077) em `backend/app/services/propostas.py`, `backend/app/api/routes/proposal_propostas.py`, `backend/app/api/routes/public_propostas.py` e `frontend/src/proposal/`. Nenhum item do Technical Context ficou como NEEDS CLARIFICATION; as decisões abaixo fecham os pontos de projeto.

---

## R1. Garantir que o cliente assine exatamente a versão que está na tela (FR-013, FR-015, SC-004)

**Decision**: Coluna `versao INTEGER NOT NULL DEFAULT 1` em `propostas`, incrementada a cada edição efetiva. O `GET` público devolve `versao`; o `POST /assinar` passa a receber `versao` e o `UPDATE` condicional da assinatura ganha `AND versao = :versao`. Se a versão não bater, a resposta é `409` com `"Esta proposta foi atualizada. Revise os dados e assine novamente."`, e a página do cliente (que já recarrega em `409`) passa a mostrar a versão atual.

**Rationale**: um número de versão é a forma mais simples e barata de concorrência otimista; entra no mesmo `UPDATE` que já resolve a corrida de assinatura dupla (077, R8), sem lock adicional na rota pública. `versao` ausente (aba antiga aberta antes do deploy) é tratada como divergente: o cliente recarrega e assina a versão vigente, nunca uma desatualizada.

**Alternatives considered**:
- Enviar o `conteudo_hash` no lugar da versão: funciona, mas expõe um valor mais longo sem ganho; a versão também facilita o histórico.
- Comparar só `atualizada_em`: frágil (precisão de timestamp, edições no mesmo segundo).
- Sem token de versão, apenas recalcular o hash no servidor: não detecta que o cliente estava vendo dados antigos.

---

## R2. Concorrência entre edição e assinatura, e entre duas edições (FR-014, edge cases)

**Decision**: O endpoint de edição abre a transação com `SELECT ... FOR UPDATE` na linha da proposta, confere o status efetivo, calcula o diff, aplica o `UPDATE` (incluindo `versao = versao + 1`) e insere o registro de histórico, tudo no mesmo commit.
- Se o cliente assinar primeiro, a edição encontra `status = 'assinada'` depois do lock e devolve `409 "Proposta já assinada"`.
- Se a edição pegar o lock primeiro, a assinatura concorrente espera e, ao reavaliar o `WHERE`, falha pela versão (R1).
- Duas edições simultâneas são serializadas pelo lock: vale a última salva, e o diff de cada uma é calculado sobre o estado realmente anterior a ela, então o histórico fica coerente.

**Rationale**: o lock de linha é curto (uma requisição autenticada, volume baixo) e evita "diff com valor anterior desatualizado" no histórico, que o `UPDATE` condicional sozinho não resolveria.

**Alternatives considered**: versão otimista também na edição (o usuário teria que recarregar ao colidir com outra edição); rejeitada porque a spec define "vale a última edição salva" e o caso é raro.

---

## R3. Status depois da edição e visualização da versão atual (FR-010, FR-017, Clarifications)

**Decision**:
- Toda edição efetiva grava `status = 'aguardando'` e `versao_visualizada_em = NULL`; `visualizada_em` (primeira visualização do link) **não muda**.
- O `GET` público marca visualização quando o status efetivo é `aguardando` e `versao_visualizada_em IS NULL`: `UPDATE ... SET status='visualizada', versao_visualizada_em=now(), visualizada_em=COALESCE(visualizada_em, now()) WHERE id=:id AND status='aguardando' AND versao_visualizada_em IS NULL`.
- Proposta **Expirada** editada com validade futura volta naturalmente a `aguardando` (o "expirada" continua derivado, 077 R7).

**Rationale**: mantém o status persistido com os mesmos quatro valores (sem mudar a `CHECK`), e a regra "Visualizada = cliente viu a versão vigente" fica representada por uma única coluna nova.

**Migração dos dados existentes**: `UPDATE propostas SET versao_visualizada_em = visualizada_em WHERE versao_visualizada_em IS NULL AND visualizada_em IS NOT NULL AND versao = 1 AND atualizada_em IS NULL`. O filtro `versao = 1 AND atualizada_em IS NULL` deixa o comando idempotente em `_migrar()` (roda a cada boot) sem desfazer o reset de propostas já editadas.

---

## R4. Visualização aberta pelo próprio usuário não conta (edge case "Visualizações pelo usuário")

**Decision**: O `GET` público aceita, opcionalmente, o token do Proposal (`Authorization: Bearer`). Se o token for válido e o usuário puder ver a proposta (`pode_ver`), a resposta é a mesma, mas **nenhuma** visualização é registrada. Token ausente, inválido ou de outro usuário: comportamento normal, sem erro. No frontend, `consultarPublica` envia o token salvo em `localStorage` (`proposal_access_token`) quando existir, o que funciona porque a página pública e o Proposal estão na mesma origem (`proposal.oceantalentsolutions.com`).

**Rationale**: hoje o botão "Abrir página do cliente" do detalhe chama o mesmo endpoint e marca a proposta como **Visualizada** (lacuna em relação ao FR-024 da 077). Com a edição voltando o status para **Aguardando assinatura**, o usuário conferir a versão nova não pode "fingir" que o cliente viu.

**Alternatives considered**: parâmetro `?preview=1` na URL; rejeitado porque qualquer pessoa com o link poderia evitar o registro, e o cliente poderia receber o link com o parâmetro copiado.

---

## R5. Histórico de edições (FR-011, FR-012, FR-018)

**Decision**: Tabela nova `propostas_edicoes` (append-only), um registro por edição efetiva: `proposta_id`, `versao` resultante, `editada_em`, `editado_por_id` (FK `ON DELETE SET NULL`), `editado_por_usuario` (snapshot do login) e `alteracoes JSONB` com a lista `[{campo, anterior, novo}]`. Campos comparados: `cliente_nome`, `cnpj`, `valor`, `imposto_ativo`, `aliquota`, `valor_imposto`, `total`, `validade`. Valores gravados em forma canônica (decimais como string com 2 casas, datas ISO, booleanos, CNPJ sem máscara); a formatação para exibição fica no frontend. Nenhum endpoint altera ou apaga registros. Se o diff vier vazio, nada é gravado e a proposta não muda (FR-012).

**Rationale**: o histórico é sempre lido inteiro junto do detalhe, nunca filtrado por campo; `JSONB` evita uma tabela filha só para pares campo/valor. Uma tabela própria do Proposal mantém o isolamento em relação ao ERP: a auditoria do ERP (`services/audit.py`) aparece para usuários do ERP e não deve receber dados do Proposal.

**Alternatives considered**:
- Guardar snapshots completos de cada versão: mais dados, e a tela precisaria calcular o diff na leitura.
- Tabela filha `(edicao_id, campo, anterior, novo)`: normalizada, mas sem consulta que justifique.
- `TEXT` com JSON (padrão de `permissoes`): funciona, mas `JSONB` valida o formato no banco sem custo extra.

---

## R6. Data da última edição na página pública (FR-019)

**Decision**: Coluna `atualizada_em TIMESTAMP NULL` em `propostas` (UTC), gravada a cada edição efetiva. O `GET` público passa a devolver `atualizada_em` (ou `null` se nunca editada), e a página mostra "Atualizada em dd/mm/aaaa" ao lado da emissão, formatada em `America/Sao_Paulo` por `formatarData` (já existente). Não é exposto quem editou nem o que mudou.

**Rationale**: evita consultar o histórico na rota pública e mantém a resposta pública restrita aos dados da própria proposta (FR-017 da 077).

---

## R7. Hash do conteúdo após edição (FR-015)

**Decision**: O formato do conteúdo canônico (077, data-model §4) **não muda**. A edição recalcula e grava `conteudo_hash`; a assinatura continua conferindo `calcular_hash(p) == p.conteudo_hash` e grava esse hash na evidência.

**Rationale**: manter o formato preserva a validade dos hashes das propostas já assinadas. A amarração "assinou a versão da tela" vem da `versao` (R1), e a amarração "evidência = conteúdo assinado" vem do hash calculado no mesmo instante do aceite.

---

## R8. Validações compartilhadas e mensagem de validade (FR-005)

**Decision**: Extrair de `validar_criacao` uma função comum `validar_dados(payload, validade_padrao)` usada na criação e na edição. Na edição, o payload traz todos os campos (formulário completo, pré-preenchido). A mensagem de validade passa a ser **"Validade deve ser posterior a hoje"** nos dois fluxos (backend e frontend).

**Rationale**: na criação, "hoje" e "data de emissão" coincidem, mas na edição de uma proposta emitida há semanas a mensagem atual ("posterior à data de emissão") ficaria errada. Unificar a mensagem atende ao "mesmas mensagens" do FR-005 sem confundir o usuário.

---

## R9. Reaproveitamento do formulário no frontend (FR-004, FR-006)

**Decision**: Extrair de `pages/Nova.tsx` o componente `components/PropostaForm.tsx` (campos, validação local, prévia em centavos e resumo), usado por `Nova.tsx` (botão "Gerar proposta") e pela nova página `pages/Editar.tsx` (rota `/propostas/:id/editar`, botão "Salvar alterações", link "Cancelar" de volta ao detalhe). Ao desligar o toggle de imposto, a alíquota é descartada no envio (já é o comportamento de `Nova.tsx`).

**Rationale**: garante que criação e edição tenham exatamente os mesmos campos, cálculos e mensagens, como exige a spec, sem duplicar ~200 linhas.

**Alternatives considered**: modal de edição no `Detalhe.tsx`; rejeitado porque o formulário tem resumo lateral e já é uma página inteira na criação.

---

## R10. Testes e validação

**Decision**: Sem suíte automatizada (padrão do repositório). Validação pelo [quickstart.md](./quickstart.md), com cenários via interface e `curl` (edição de assinada/cancelada, assinatura com versão antiga, corrida edição × assinatura, visualização pelo próprio usuário), mais `npm run lint`, `npm run type-check` e `npm run build` no `frontend/`.
