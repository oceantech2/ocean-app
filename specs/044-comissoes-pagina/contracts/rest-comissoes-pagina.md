# Contrato REST: Comissões (API existente)

**Feature**: `044-comissoes-pagina`  
**Prefixo**: `/api/bonus` (inalterado)  
**Auth**: JWT Bearer, papéis `admin` e `visualizador` (escrita só admin, como hoje)

Esta feature **não** adiciona endpoints nem campos. Documenta o contrato vigente usado pela UI.

## GET `/api/bonus`

Lista registros.

| Query | Tipo | Uso nesta feature |
|-------|------|-------------------|
| skip, limit | int | Paginação de fetch (UI pede até 500) |
| colaborador_id | int? | Filtro de pessoa da equipe |
| ano | int? | Sempre enviado com o ano do filtro de tela |
| mes | int? | **Não usado** pelo recorte da tela (filtro mês/trimestre é no cliente; ver [research.md](../research.md) R3) |

**200**: lista de objetos `BonusResponse` (campos atuais: `id`, `colaborador_id`, `mes`, `ano`, `etapa`, `percentual`, `valor_bonus`, `cliente`, `posicao`, `numero_nf`, …).

## GET `/api/bonus/{id}`

Inalterado. Mensagem de 404 visível: vocabulário **comissão** (não bônus).

## POST `/api/bonus`

Inalterado. Usado pela **importação CSV**, não pelo botão removido.

## PUT `/api/bonus/{id}`

Inalterado. Usado pela edição na listagem (`admin`).

## DELETE `/api/bonus/{id}`

Inalterado. Confirmação na UI; 204.

## Fora de escopo REST

- Novo parâmetro `trimestre`
- Rename de `/api/bonus` ou de `valor_bonus`
- Alterar entidade gravada na auditoria (`Bonus`)
