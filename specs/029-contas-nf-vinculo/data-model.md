# Data Model: Contas a Pagar — Vincular nota fiscal por item

**Feature**: `029-contas-nf-vinculo` | **Date**: 2026-08-13  
**Spec**: [spec.md](./spec.md)

## Entidades

### Conta a pagar (`contas_pagar`)

Sem tabela nova. O vínculo da nota fiscal é o par já persistido:

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | int | sim | PK |
| … | | | Demais campos inalterados (descrição, categoria, valor, datas, `pago`) |
| `comprovante_path` | text \| null | não | Caminho no `UPLOAD_DIR`. Null = sem arquivo vigente |
| `comprovante_nome` | string(255) \| null | não | Nome original exibido na UI como nota fiscal |

**Regra**: no máximo um arquivo vigente (`path`/`nome` nulos juntos ou ambos preenchidos).

**Rótulo de negócio**: nota fiscal. Nomes de coluna/API permanecem `comprovante_*`.

### Arquivo de nota fiscal (não é tabela)

Arquivo em disco sob `UPLOAD_DIR`, nome interno `comprovante_{id}_{uuid}{ext}`.

| Atributo | Regra |
|----------|--------|
| Extensão (novo envio) | `.pdf`, `.jpg`, `.jpeg`, `.png` |
| Tamanho | ≤ `UPLOAD_MAX_MB` (10 por padrão) |
| Legado | Qualquer extensão já gravada continua baixável |

### Biblioteca compartilhada (fora do modelo ativo)

Arquivos em `COMPROVANTES_DIR` **não** entram no modelo desta feature: sem FK, sem listagem, sem delete em massa.

## Relacionamentos

```text
ContaPagar 1 ── 0..1 Arquivo em disco (via comprovante_path)
```

Não há relação com a pasta compartilhada.

## Validação

| Regra | Quando |
|-------|--------|
| Extensão permitida | POST upload novo |
| Tamanho ≤ limite | POST upload novo |
| Conta existe | POST/GET/DELETE anexo |
| Admin | POST e DELETE anexo |
| Autenticado | GET anexo e GET lista (`comprovante_nome`) |
| Conta sem arquivo | GET anexo → 404; lista mostra ausência |
| Cancelar formulário de criação | Nenhum INSERT e nenhum arquivo em `UPLOAD_DIR` dessa operação |

## Transições

```text
[sem arquivo] --admin POST válido--> [com arquivo]
[com arquivo] --admin POST válido--> [com arquivo]  (substitui; apaga o path anterior)
[com arquivo] --admin DELETE--> [sem arquivo]
[qualquer]    --admin DELETE conta--> conta e arquivo da conta removidos
```

Status pago/pendente/vencida **não** altera essas transições.

## Fora de escopo

- Migrar `COMPROVANTES_DIR` para contas
- Colunas `nota_fiscal_*`
- Múltiplos arquivos por conta
- Anexo na importação CSV/xlsx
