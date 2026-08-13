# Contrato REST: Contas a Pagar — Nota fiscal por item

**Feature**: `029-contas-nf-vinculo` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

Base: `/api/contas` · Auth: JWT Bearer

## Superfície desta feature

| Método | Caminho | Quem |
|--------|---------|------|
| POST | `/{id}/comprovante` | **admin** |
| GET | `/{id}/comprovante` | autenticado |
| DELETE | `/{id}/comprovante` | **admin** |
| POST | `/` | **admin** (JSON inalterado; arquivo **não** vai neste body) |
| GET | `/` | autenticado (já inclui `comprovante_nome`) |

Caminhos REST de comprovante **não** mudam de nome.

## POST `/{id}/comprovante`

`multipart/form-data`, campo `arquivo`.

**Aceito**: extensão `.pdf`, `.jpg`, `.jpeg`, `.png` (case-insensitive).  
**Recusado**: qualquer outra (incl. `.webp`, planilha).  
**Tamanho**: > `UPLOAD_MAX_MB` → 413.

Substitui arquivo vigente da conta (apaga o path anterior). Independente de `pago`.

| Código | Quando |
|--------|--------|
| 201 | `{ "comprovante_nome": "<nome original>" }` |
| 400 | Extensão não permitida; detalhe cita PDF, JPEG e PNG |
| 401/403 | Não autenticado / visualizador |
| 404 | Conta inexistente |
| 413 | Excede limite |

## GET `/{id}/comprovante`

Arquivo vigente, inclusive legado fora da lista de extensões novas.

| Código | Quando |
|--------|--------|
| 200 | Corpo do arquivo; `media_type` segundo extensão conhecida |
| 401 | Não autenticado |
| 404 | Sem vínculo ou arquivo ausente no disco |

## DELETE `/{id}/comprovante`

Remove arquivo da conta em `UPLOAD_DIR` e zera `comprovante_path` / `comprovante_nome`. **Não** toca `COMPROVANTES_DIR`.

| Código | Quando |
|--------|--------|
| 204 | Removido ou já não havia arquivo |
| 401/403 | Não autenticado / visualizador |
| 404 | Conta inexistente |

## POST `/` (criação)

Body JSON igual ao contrato vigente (014/020). **Sem** campo de arquivo.

Sequência no cliente quando o formulário tem arquivo: 201 da conta → POST comprovante. Falha no segundo passo não desfaz a conta.

## Biblioteca compartilhada (removida do produto)

| Método | Caminho antigo | Comportamento nesta feature |
|--------|----------------|------------------------------|
| * | `/api/arquivos-comprovantes/*` | Router **não montado** → 404 |

Não há exclusão em massa dos arquivos em disco.
