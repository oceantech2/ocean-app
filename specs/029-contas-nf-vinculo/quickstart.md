# Quickstart: Contas a Pagar — Vincular nota fiscal por item

**Feature**: `029-contas-nf-vinculo`  
**Modelo**: [data-model.md](./data-model.md) · **REST**: [contracts/rest-contas-nf-vinculo.md](./contracts/rest-contas-nf-vinculo.md) · **UI**: [contracts/ui-contas-nf-vinculo.md](./contracts/ui-contas-nf-vinculo.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`
- Arquivos de teste: um `.pdf`, um `.jpg` ou `.jpeg`, um `.png`, e um rejeitado (ex. `.webp` ou `.xlsx`)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação na UI

### Pasta removida

1. Como **admin**, abrir **Contas a Pagar**.
2. No cabeçalho **não** há **Comprovantes** nem modal de biblioteca.
3. `GET http://localhost:8001/api/arquivos-comprovantes/` (com JWT) responde **404**.

### Vínculo por item

4. Em uma conta **pendente**, anexar PDF pela **linha**. A coluna **Nota fiscal** mostra o nome. Clicar abre em nova aba.
5. **Nova conta a pagar**: preencher dados obrigatórios, escolher JPEG, salvar. A linha nova já tem o arquivo.
6. **Editar** outra conta: anexar PNG, salvar/confirmar. Listagem atualiza.
7. Substituir o arquivo da linha por outro PDF/JPEG/PNG: o nome novo é o que abre.
8. Remover com confirmação: a linha fica sem arquivo e permite anexar de novo.
9. Tentar `.webp` ou planilha: recusa com mensagem de formatos; vínculo anterior (se houver) permanece.
10. Criar/editar **sem** arquivo: grava normal.

### Visualizador

11. Login `visualizador`: vê nomes, abre o arquivo, **não** anexa/remove, **não** vê pasta.

### Legado e disco

12. Se existir conta com anexo antigo não-PDF/JPEG/PNG: ainda abre.
13. Arquivos que só estavam na pasta compartilhada **não** aparecem na listagem e **não** são apagados em massa no servidor.

## Checagens extras

```bash
cd frontend && npm run lint && npm run type-check
```

## Não validar nesta feature

- Contas a Receber / página NFs
- Importação CSV/xlsx com coluna de arquivo
- Apagar o diretório `COMPROVANTES_DIR`
- Exigir nota fiscal para marcar **Pagar**
