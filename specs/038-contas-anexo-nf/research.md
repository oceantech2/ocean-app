# Research: Anexo de NF em Contas a Receber e Contas a Pagar

**Feature**: `038-contas-anexo-nf` | **Date**: 2026-08-18

## 1. Reuso do vínculo de Contas a Pagar

**Decision**: Manter em Pagar os campos `comprovante_path` / `comprovante_nome` e os endpoints `POST|GET|DELETE /api/contas/{id}/comprovante`. Ajustar só o teto de **2 MB** e a validação no cliente.

**Rationale**: A feature 029 já entregou coluna, formulário e REST. Renomear rotas quebraria o frontend sem ganho de negócio.

**Alternatives considered**: Renomear para `/anexo` (ruído). Blob no Postgres (pior para PDF de 2 MB e para `FileResponse`).

## 2. Persistência em Contas a Receber (Maggo)

**Decision**: Colunas novas em `nfs`: `anexo_path` (TEXT) e `anexo_nome` (VARCHAR 255). Vínculo pelo `id` local. `_sync_maggo_stub` continua a casar por `maggo_id` e **não** escreve essas colunas (hoje o update de Maggo existente já não sobrescreve enriquecimento Ocean).

**Rationale**: O stub/ Maggo não envia arquivo. Recarregar a lista atualiza/insere linhas por `maggo_id` sem zerar o anexo. Manuais usam o mesmo `id`.

**Alternatives considered**: Tabela satélite `nfs_anexos` (overkill para um arquivo). Guardar por `maggo_id` no disco sem FK (órfãos se o id local mudar).

## 3. Limite 2 MB sem alterar upload global

**Decision**: Constante **2 145 728 bytes** (2 MiB) só para anexo de NF (Pagar e Receber). `UPLOAD_MAX_MB` (hoje 10) permanece para documentos de colaborador.

**Rationale**: A spec fixa 2 MB nestas notas; documentos de RH não fazem parte deste pedido.

**Alternatives considered**: Baixar `UPLOAD_MAX_MB` para 2 (quebraria colaboradores). Limite só no frontend (inseguro).

## 4. Validação de formato

**Decision**: Recusar por extensão (`.pdf`, `.jpg`, `.jpeg`, `.png`, case-insensitive) **antes** de gravar, no servidor e no cliente. MIME derivado da extensão no GET (`inline`). Arquivo vazio (`len == 0`) → 400.

**Rationale**: Igual à 029; simples e alinhado ao seletor `accept`.

**Alternatives considered**: Sniff de magic bytes (mais robusto, fora do escopo). Aceitar só MIME do browser (instável).

## 5. Coluna na tabela de Contas a Receber

**Decision**: A coluna atual **NF** continua sendo o **número**. Nova coluna **Nota fiscal** (arquivo), no mesmo padrão visual de Contas a Pagar (nome truncado, Anexar / Substituir / Remover). Formulário de editar/criar em `NFs.tsx` ganha o mesmo campo.

**Rationale**: Duas colunas “NF” confundem; Pagar já usa o rótulo “Nota fiscal” para o arquivo.

**Alternatives considered**: Substituir a coluna de número pelo arquivo (perde o número). Chamar a nova coluna também de “NF”.

## 6. Extração de helper de anexo

**Decision**: Extraír validação + gravação em `backend/app/services/anexo_nf.py` e usar em `contas.py` e `nfs.py`. Frontend: constante compartilhada de 2 MB e extensões (pode ficar duplicada leve nas duas páginas se o extract UI for maior que o ganho).

**Rationale**: Uma regra de 2 MB / formatos em dois routers.

**Alternatives considered**: Copiar o bloco de `contas.py` em `nfs.py` (drift do limite).
