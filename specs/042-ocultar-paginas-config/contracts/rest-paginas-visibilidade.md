# Contrato REST: Visibilidade de Páginas

**Feature**: `042-ocultar-paginas-config`

## `GET /api/configuracoes/paginas-visibilidade`

**Auth**: JWT (admin ou visualizador).

**Response 200**:

```json
{
  "paginas": {
    "dashboard": true,
    "calendario": true,
    "nfs": true,
    "contas": true,
    "fluxo_caixa": true,
    "impostos": true,
    "retiradas": true,
    "bonus": true,
    "dh": false,
    "colaboradores": true,
    "ferias": true,
    "patrimonio": true,
    "auditoria": true,
    "seguranca": true
  }
}
```

**Regras**:
- Ausência de chave no JSON persistido → tratada como `true` na resposta.
- `dashboard` sempre retorna `true`.

## `PUT /api/configuracoes/paginas-visibilidade`

**Auth**: JWT admin (`require_admin`).

**Body**:

```json
{
  "paginas": {
    "dh": false,
    "bonus": true
  }
}
```

**Comportamento**:
- Merge parcial sobre o JSON existente (chaves omitidas permanecem).
- Backend força `dashboard: true` independente do body.
- Rejeita tentativa de enviar `configuracoes` (400 ou ignora chave).
- Persiste em `configuracao_app.chave = 'paginas_visibilidade'`.

**Response 200**: mesmo formato do GET.

**Erros**:
- 401 sem token.
- 403 não-admin.
- 400 body inválido (não objeto).

## `POST /auth/token` e `GET /auth/me`

**Campo adicional** em ambas as respostas:

```json
{
  "paginas_visibilidade": { "...": true }
}
```

Mesmo objeto retornado pelo GET de visibilidade (campo `paginas` renomeado para consistência com login ou manter `paginas_visibilidade` flat — implementação deve usar **um nome** em todos os endpoints; recomendado: `paginas_visibilidade` no auth e `paginas` no CRUD dedicado, com mapper no frontend).

> **Nota de implementação**: O frontend normaliza para `Record<string, boolean>` no store independentemente do nome do campo na resposta auth vs configuracoes.

## Sem alteração

- CRUD de usuários (`/api/configuracoes`) permanece inalterado no contrato.
- Endpoints de módulos ocultos (ex.: `/api/dh`) **permanecem** acessíveis para admin via API direta.
