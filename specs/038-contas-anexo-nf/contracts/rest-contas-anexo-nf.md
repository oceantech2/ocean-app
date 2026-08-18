# Contrato REST: Anexo de nota fiscal (Pagar e Receber)

**Feature**: `038-contas-anexo-nf` | **Date**: 2026-08-18  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

Auth: JWT Bearer. Limite de novos envios: **2 MiB**. Extensões: `.pdf`, `.jpg`, `.jpeg`, `.png`.

Campo multipart: `arquivo`.

## Contas a Pagar — `/api/contas`

Superfície **igual à 029** (nomes `comprovante` não mudam). Única mudança contratual: tamanho.

| Método | Caminho | Quem |
|--------|---------|------|
| POST | `/{id}/comprovante` | admin |
| GET | `/{id}/comprovante` | autenticado |
| DELETE | `/{id}/comprovante` | admin |

### POST `/{id}/comprovante`

| Código | Quando |
|--------|--------|
| 201 | `{ "comprovante_nome": "<nome original>" }` |
| 400 | Extensão inválida ou arquivo vazio; detalhe cita PDF, JPEG e PNG |
| 401/403 | Não autenticado / visualizador |
| 404 | Conta inexistente |
| 413 | Tamanho **> 2 MB**; detalhe cita **2 MB** (não mais `UPLOAD_MAX_MB`) |

GET/DELETE: inalterados em significado (200 blob `inline`; 204 remoção).

## Contas a Receber — `/api/nfs`

| Método | Caminho | Quem |
|--------|---------|------|
| POST | `/{id}/anexo` | admin |
| GET | `/{id}/anexo` | autenticado |
| DELETE | `/{id}/anexo` | admin |
| GET | `/` | autenticado; cada item inclui `anexo_nome` (string ou null) |

### POST `/{id}/anexo`

`multipart/form-data`, campo `arquivo`. Substitui o vigente; apaga o path anterior. Independente de origem Maggo/manual e de status.

| Código | Quando |
|--------|--------|
| 201 | `{ "anexo_nome": "<nome original>" }` |
| 400 | Extensão inválida ou vazio |
| 401/403 | Não autenticado / visualizador |
| 404 | NF inexistente |
| 413 | Tamanho > 2 MB; detalhe cita 2 MB |

### GET `/{id}/anexo`

| Código | Quando |
|--------|--------|
| 200 | Corpo do arquivo; `Content-Disposition: inline`; `media_type` pela extensão |
| 401 | Não autenticado |
| 404 | Sem vínculo ou arquivo ausente no disco |

### DELETE `/{id}/anexo`

Zera `anexo_path` / `anexo_nome` e remove o arquivo em `UPLOAD_DIR`.

| Código | Quando |
|--------|--------|
| 204 | Removido ou já não havia arquivo |
| 401/403 | Não autenticado / visualizador |
| 404 | NF inexistente |

### GET `/` (listagem)

Não dispara perda de anexo. Sync Maggo por `maggo_id` não inclui `anexo_*` no merge.

`NFResponse` ganha `anexo_nome: Optional[str] = None`. JSON de criar/editar NF **não** envia arquivo (igual Pagar: upload em request separado).

Sequência no formulário de edição: salvar campos da NF (se houver mudança) **e/ou** POST/DELETE anexo; cancelar o modal sem POST não grava arquivo.
