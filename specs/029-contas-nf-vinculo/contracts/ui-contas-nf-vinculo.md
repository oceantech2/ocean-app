# Contrato UI: Contas a Pagar — Nota fiscal por item

**Feature**: `029-contas-nf-vinculo` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md) · **REST**: [rest-contas-nf-vinculo.md](./rest-contas-nf-vinculo.md)

Página: `frontend/src/pages/Contas.tsx`

## Remover

| Elemento | Ação |
|----------|------|
| Botão **📁 Comprovantes** no cabeçalho | Remover |
| Modal `GerenciadorArquivos` título Comprovantes | Não renderizar |
| Uso de `comprovantesService` | Remover desta página |

Nenhum outro ponto do produto oferece a pasta compartilhada.

## Listagem

Coluna da nota fiscal (hoje “comprovante”):

| Estado | Admin | Visualizador |
|--------|-------|--------------|
| Sem arquivo | Ação para anexar (qualquer status) | Traço / vazio |
| Com arquivo | Nome visível (abre); ações substituir e remover | Nome visível (abre); sem escrita |

- Abrir: nova aba com o blob (PDF/JPEG/PNG visualizáveis).
- Anexar/substituir: seletor `accept=".pdf,.jpg,.jpeg,.png"`.
- Remover: `window.confirm` antes do DELETE.
- Toast de sucesso/erro (`react-hot-toast`).
- Recusa de formato: mensagem clara (PDF, JPEG ou PNG).

Rótulos visíveis: **Nota fiscal** (não “Comprovante”), **Anexar**, **Remover**.

## Formulário criar / editar

Campo de arquivo no mesmo modal de **Nova conta a pagar** / **Editar conta a pagar**.

| Criar | Editar |
|-------|--------|
| Input opcional PDF/JPEG/PNG | Mostra nome vigente (abre); anexar/substituir/remover |
| Arquivo só no estado até **Salvar** | Remoção com confirmação |
| Cancelar: descarta o arquivo local | Visualizador não abre o modal de escrita |

Salvar criar sem arquivo: permitido (FR-010). Arquivo inválido: recusar o arquivo, conta pode salvar sem ele.

## Papéis

- **admin**: anexar, substituir, remover, criar com arquivo.
- **visualizador**: listar e abrir; sem botões de escrita e sem pasta.

## Fora

- Viewer embutido na tabela
- Anexar na importação CSV/xlsx
- Exigir nota fiscal para **Pagar**
