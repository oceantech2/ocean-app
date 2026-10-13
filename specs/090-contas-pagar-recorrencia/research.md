# Research: Recorrência de contas a pagar

## R1 — Onde criar as cópias

- **Decision**: No servidor, dentro de `POST /api/contas`, com o campo opcional `repetir_meses`.
- **Rationale**: Garante atomicidade (FR-007) com um único `commit`; evita N requisições do navegador e estados parciais.
- **Alternatives considered**: Loop de `contasService.criar` no frontend — rejeitado (não atômico); endpoint novo `/contas/recorrente` — rejeitado (duplicaria validações de categoria/tipo/fornecedor/caixa).

## R2 — Regra de data

- **Decision**: `vencimento_k = data(ano', mes', min(dia, último_dia(ano', mes')))`, com `mes' = mes + k` normalizado para o ano.
- **Rationale**: Mantém o "mesmo dia" pedido e trata meses curtos (FR-005). Implementado com `calendar.monthrange`.

## R3 — Resposta

- **Decision**: Retornar a conta original (`ContaPagarResponse`), sem mudar o contrato. O frontend já sabe N para montar o toast.
- **Rationale**: Retrocompatível com chamadas existentes (importação CSV usa o mesmo endpoint sem o campo).

## R4 — Vínculo entre cópias

- **Decision**: Nenhum (clarify: cópias independentes). Sem coluna nova, sem migration.
