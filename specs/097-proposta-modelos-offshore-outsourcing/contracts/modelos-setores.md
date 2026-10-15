# Contrato: modelos e setores

Sem endpoints novos. Os endpoints existentes passam a aceitar e devolver os valores novos.

## API do Proposal (`POST/PUT /api/proposal/propostas`)

- `modelo`: aceita também `offshore-talent` e `outsourcing`. Valor fora do registro → 422 (regra atual).
- `setor`: aceita também `tecnologia`. Vazio ou fora da lista → 422 "Selecione o setor" (regra atual).
- Demais campos, validações e respostas: iguais ao formato novo da `083` (`contracts/api-proposal.md` daquela feature).
- `modelo_versao` gravado: 1 para os dois modelos novos.

## Lista e detalhe

- `modelo_nome`/nome exibido: "Offshore Talent" e "Outsourcing" (`nome_modelo()`), também no e-mail de aceite (feature 095).
- Filtro de modelo da lista: inclui os dois modelos, na ordem do registro.

## Página pública (`GET /api/public/propostas/{codigo}`)

- `modelo` e `modelo_versao` selecionam o componente: `offshore-talent` v1 → `OffshoreTalentV1`; `outsourcing` v1 → `OutsourcingV1`.
- `setor` seleciona a foto da capa (`fotoSetor`), com fallback para a foto padrão.

## Página do cliente — âncoras e menu

| Modelo | Menu (ordem) |
|---|---|
| Offshore Talent | `#servico` Offshore Talent · `#areas-cargos` Áreas e cargos · `#escopo` (opcional) · `#investimento` · `#garantias` · `#contato` |
| Outsourcing | `#servico` Outsourcing · `#beneficios` Benefícios · `#escopo` (opcional) · `#investimento` · `#garantias` · `#contato` |
