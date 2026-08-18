# Contrato UI: Anexo de nota fiscal (Pagar e Receber)

**Feature**: `038-contas-anexo-nf` | **Date**: 2026-08-18  
**REST**: [rest-contas-anexo-nf.md](./rest-contas-anexo-nf.md)

## Contas a Pagar — `frontend/src/pages/Contas.tsx`

Comportamento da 029 permanece. Ajustes:

- Cliente recusa arquivo **> 2 MB** antes do POST, com toast que cita 2 MB.
- Se o servidor devolver 413, a mensagem visível cita 2 MB.
- Coluna **Nota fiscal** continua em todas as linhas.

## Contas a Receber — `frontend/src/pages/NFs.tsx`

A coluna existente **NF** (número) **não** muda de significado.

Nova coluna **Nota fiscal** (arquivo), largura compatível com a grade fixa (ex. ~7rem), posicionada junto da coluna NF/número (antes de Emissão) ou imediatamente antes de **Ações** — desde que não cubra sticky esquerda/direita.

| Estado | Admin | Visualizador |
|--------|-------|--------------|
| Sem arquivo | **+ Anexar** | Traço |
| Com arquivo | Nome (abre); Substituir; Remover | Nome (abre); sem escrita |

- Abrir: blob em nova aba (`inline`), como Pagar.
- Seletor: `accept=".pdf,.jpg,.jpeg,.png"`.
- Recusa de formato/tamanho no cliente **antes** do envio; toast claro.
- Remover: `window.confirm`.
- `react-hot-toast` para sucesso/erro.

### Formulário criar / editar (`NFs.tsx`)

Campo opcional de arquivo, mesmas regras da coluna.

| Criar | Editar |
|-------|--------|
| Arquivo só no estado até salvar com sucesso (POST NF → POST anexo) | Mostra nome vigente (abre); anexar/substituir/remover |
| Cancelar: descarta arquivo local; sem POST anexo | Remoção com confirmação; visualizador não escreve |

Salvar sem arquivo: permitido. Arquivo inválido: recusar o arquivo; demais campos da NF podem ser salvos.

## Papéis

- **admin**: anexar, substituir, remover (tabela e formulário).
- **visualizador**: listar e abrir.

## Fora

- Pasta compartilhada `/arquivos-nfs` ou comprovantes.
- Viewer embutido na célula.
- Exigir anexo para pagar/receber.
- Alterar `UPLOAD_MAX_MB` global de colaboradores.
