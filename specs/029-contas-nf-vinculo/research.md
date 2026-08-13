# Research: Contas a Pagar — Vincular nota fiscal por item

**Feature**: `029-contas-nf-vinculo` | **Date**: 2026-08-13

## 1. Pasta compartilhada: UI vs disco vs API

**Decision**: Retirar o botão **Comprovantes** e o `GerenciadorArquivos` de `Contas.tsx`. **Não** incluir `arquivos_comprovantes.router` em `main.py`. **Não** apagar arquivos em `COMPROVANTES_DIR` nem o arquivo `arquivos_comprovantes.py` nesta entrega. Remover `comprovantesService` de `api.ts` se ficar sem uso.

**Rationale**: Clarify opção A (FR-001, FR-012, SC-004). Constituição V: menor mudança que tira o recurso do produto. Exclusão em massa no disco seria perda irreversível.

**Alternatives considered**: Apagar a pasta no deploy (rejeitado no clarify). Manter a API “por se acaso” (ainda acessível — viola SC-004). Mover arquivos para contas (sem chave de correspondência).

## 2. Reusar colunas `comprovante_*` vs entidade “nota fiscal”

**Decision**: Continuar `contas_pagar.comprovante_path` e `comprovante_nome`. Rotas permanecem `/api/contas/{id}/comprovante`. Na UI, o rótulo canônico é **Nota fiscal**.

**Rationale**: Sem migração, sem quebrar listagem/GET que já devolve `comprovante_nome`. Constituição V. O pedido é de produto (vínculo por item), não de rename de schema.

**Alternatives considered**: Colunas `nota_fiscal_*` + migração (custo sem ganho). Endpoints `/nota-fiscal` com alias (duplica superfície).

## 3. Criação com arquivo (FR-014)

**Decision**: No modal **Nova conta a pagar**, guardar `File | null` no estado React. Ao salvar: `POST /api/contas` (JSON) e, se houver arquivo válido, `POST /api/contas/{id}/comprovante`. Cancelar o modal descarta o `File` (nenhuma chamada). Se o segundo POST falhar, a conta já existe; toast de erro e a linha permite anexar de novo (vínculo continua opcional).

**Rationale**: `criar_conta` hoje é JSON; multipart no create misturaria validação de valor/categoria com arquivo. Dois passos no cliente atendem “persistir junto com a criação” do ponto de vista do usuário (um Salvar) sem órfãos no cancelamento.

**Alternatives considered**: `POST /contas` multipart (muda contrato 014/020). Upload temporário anônimo (órfãos e auth). Só anexar depois de salvar (pior UX, mas o formulário deixaria de cumprir o clarify C).

## 4. Extensões e limite de tamanho

**Decision**: Novos envios: extensão em `{.pdf, .jpg, .jpeg, .png}` (case-insensitive). Recusa **400** com mensagem citando os formatos. Tamanho: `UPLOAD_MAX_MB` já usado (padrão **10** MB) → **413**. GET de arquivo legado (ex. `.webp`) continua servindo o arquivo (FR-013). Frontend: `accept=".pdf,.jpg,.jpeg,.png"` e a mesma checagem antes do POST.

**Rationale**: Spec + clarify (PNG incluído). Limite já existe no upload da conta; não inventar outro número.

**Alternatives considered**: Validar magic bytes (melhor, fora do mínimo). Aceitar WebP (rejeitado: não está na spec). Limite 2 MB (quebraria o default atual de 10).

## 5. Listagem: anexo em qualquer status

**Decision**: Remover a condição `conta.pago` para mostrar **+ Anexar** / input. Admin vê anexar/substituir/remover em pendente, vencida e paga. Visualizador só o nome clicável (abrir).

**Rationale**: FR-003, SC-002. Hoje o anexo some para pendentes.

**Alternatives considered**: Manter só pago (contradiz a spec).

## 6. Abrir vs baixar

**Decision**: GET continua autenticado. Resposta com `media_type` conforme extensão (`application/pdf`, `image/jpeg`, `image/png`, senão `application/octet-stream`). No cliente, abrir o blob em **nova aba** (`window.open`) em vez de forçar `a.download`, para PDF/JPEG/PNG serem visualizáveis. Nome do arquivo permanece no `Content-Disposition` / `comprovante_nome`.

**Rationale**: FR-006 / SC-005 (“abrir ou baixar”). O download forçado atual impede pré-visualização.

**Alternatives considered**: Só `a.download` (status quo). Viewer embutido na página (escopo extra).

## 7. Remoção e substituição

**Decision**: Manter `DELETE /{id}/comprovante` (apaga o arquivo em `UPLOAD_DIR` da **conta**, zera colunas). Substituição = POST que já remove o path anterior. UI: `window.confirm` antes do DELETE (listagem e formulário de edição).

**Rationale**: Já implementado no backend; alinhado à constituição IV.

**Alternatives considered**: Soft delete do arquivo (não há padrão no módulo).
