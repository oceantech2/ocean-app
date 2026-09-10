# Contract: REST — Limiar do Alerta de Fluxo

**Feature**: `061-dashboard-alerta-fluxo`  
**Endpoints**:
- `GET /api/configuracoes/limiar-alerta-fluxo`
- `PUT /api/configuracoes/limiar-alerta-fluxo`

**Auth**: JWT Bearer. GET: `admin` e `visualizador`. PUT: **somente** `admin` (`require_admin`).

Parâmetro global que dispara o banner quando `% não recebida > limiar`.

## GET — Response 200

```json
{
  "limiar_percentual": 60
}
```

| Campo | Descrição |
|-------|-----------|
| `limiar_percentual` | Inteiro vigente (1–100). Se chave ausente em `configuracao_app`, retornar **60** (default) sem erro |

## PUT — Request

```json
{
  "limiar_percentual": 45
}
```

| Regra | Detalhe |
|-------|---------|
| Obrigatório | `limiar_percentual` |
| Validação | **inteiro** finito, `1 ≤ x ≤ 100` (rejeitar `60.5`, `0`, `101`, string não numérica) |
| Persistência | upsert `configuracao_app.chave = limiar_alerta_fluxo` (valor texto do inteiro) |

## PUT — Response 200

Mesmo shape do GET com o valor salvo (inteiro).

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem JWT |
| 403 | PUT por não-admin |
| 422 | limiar &lt; 1, &gt; 100, não inteiro, não numérico ou ausente |

## Fora deste contrato

- Campo na Configuração do Período (`/metas/periodo`)
- Página Configurações de usuários
- Cálculo do % ou do banner
