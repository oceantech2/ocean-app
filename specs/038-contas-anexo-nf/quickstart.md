# Quickstart: Anexo de NF em Contas a Receber e Contas a Pagar

**Feature**: `038-contas-anexo-nf` | **Date**: 2026-08-18

Validação manual local. Portas: API **8001**, frontend **5193**, Postgres **5433**.

## Pré-requisitos

```bash
docker compose up -d
cd frontend && npm run dev
```

Login: `admin` / `123456` e, em outro perfil ou sessão, `visualizador` / `123456`.

Arquivos de teste: PDF, JPEG e PNG ≤ 2 MB; um arquivo > 2 MB; um `.webp` ou `.xlsx`.

## Contas a Pagar

1. Abrir **Contas a Pagar**. Confirmar coluna **Nota fiscal** em cada linha.
2. Admin: **+ Anexar** em uma linha com JPEG ≤ 2 MB → toast de sucesso; nome visível; clicar abre o arquivo.
3. Tentar arquivo > 2 MB → recusa citando 2 MB; o vínculo anterior (se houver) permanece.
4. Tentar `.xlsx` → recusa citando PDF, JPEG e PNG.
5. Formulário nova/editar: anexar PNG ≤ 2 MB, salvar; listagem mostra o nome.
6. Substituir e remover (com confirmação) pela linha e pelo formulário.
7. Visualizador: abre o arquivo; não vê Anexar/Substituir/Remover.

## Contas a Receber

1. Abrir **Contas a Receber**. Coluna **NF** continua o número; nova coluna **Nota fiscal** em todas as linhas.
2. Admin: anexar PDF ≤ 2 MB na linha de um lançamento Maggo → nome visível.
3. Recarregar a página (sync Maggo) → o **mesmo** lançamento ainda tem o arquivo ([FR-014](./spec.md)).
4. Editar a mesma (ou outra) NF: anexar/substituir/remover no modal; cancelar sem salvar não cria anexo órfão.
5. Repetir recusa > 2 MB e formato inválido.
6. Visualizador: só abre.

## API (opcional)

Com token admin:

- `POST /api/contas/{id}/comprovante` e `POST /api/nfs/{id}/anexo` com arquivo > 2 MB → **413** e detalhe com “2 MB”.
- `GET /api/nfs` inclui `anexo_nome`.
- Token visualizador em POST anexo → **403**.

## Fora desta checagem

Documentos de colaborador (limite 10 MB) e pastas compartilhadas.
