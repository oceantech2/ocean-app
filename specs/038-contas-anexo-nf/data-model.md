# Data Model: Anexo de NF em Contas a Receber e Contas a Pagar

**Feature**: `038-contas-anexo-nf` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

## Entidades

### Conta a pagar (`contas_pagar`) — inalterado no desenho

| Campo | Tipo | Notas |
|-------|------|--------|
| comprovante_path | TEXT, nullable | Caminho no `UPLOAD_DIR` |
| comprovante_nome | VARCHAR(255), nullable | Nome original para exibir/baixar |

Relação: 0..1 arquivo vigente por conta. Substituição apaga o arquivo anterior no disco.

### Conta a receber (`nfs`) — colunas novas

| Campo | Tipo | Notas |
|-------|------|--------|
| anexo_path | TEXT, nullable | Caminho no `UPLOAD_DIR` |
| anexo_nome | VARCHAR(255), nullable | Nome original |

Migração inline em `backend/app/main.py` (`_migrar`), no mesmo estilo de `comprovante_*` em contas:

```sql
ALTER TABLE nfs ADD COLUMN IF NOT EXISTS anexo_path TEXT;
ALTER TABLE nfs ADD COLUMN IF NOT EXISTS anexo_nome VARCHAR(255);
```

Relação: 0..1 arquivo por NF. Identidade estável: `nfs.id`. Sync Maggo por `maggo_id` **não** altera `anexo_*`.

## Arquivo de nota fiscal (conceitual)

- Formatos novos: `.pdf`, `.jpg`, `.jpeg`, `.png`
- Tamanho máximo novos envios: **2 145 728 bytes** (2 MiB); exatamente 2 MiB é aceito
- Um vigente; POST substitui
- GET autenticado; POST/DELETE admin
- Arquivos já gravados em Pagar (qualquer tamanho/formato legado) continuam baixáveis; novo POST aplica as regras desta feature

## Regras de validação

| Regra | Comportamento |
|-------|----------------|
| Extensão fora da lista | 400; detalhe cita PNG, JPEG e PDF; vínculo anterior intacto |
| Tamanho > 2 MiB | 413; detalhe cita 2 MB; vínculo anterior intacto |
| Arquivo vazio | 400; vínculo anterior intacto |
| Conta/NF inexistente | 404 |
| Visualizador POST/DELETE | 403 |

## Ciclo de vida

```text
sem arquivo → POST válido → com arquivo
com arquivo → POST válido → arquivo novo (antigo apagado)
com arquivo → DELETE (confirmado na UI) → sem arquivo
com arquivo → sync Maggo / recarga lista → com o mesmo arquivo (mesmo id / maggo_id)
registro excluído → arquivo no disco removido (Pagar já faz; Receber igual)
```

Arquivar NF: o anexo permanece no registro; some da listagem ativa junto com a linha (não “pula” para outra).

## Payload de listagem

- `GET /api/contas`: já devolve `comprovante_nome` (não o path).
- `GET /api/nfs`: passa a devolver `anexo_nome` (não o path). Path nunca vai ao cliente.
