# Quickstart: Página Contratos

**Feature**: `052-pagina-contratos`  
**Modelo**: [data-model.md](./data-model.md) · **Contrato UI**: [ui-contratos.md](./contracts/ui-contratos.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Reiniciar o backend após o deploy para carregar o default `contratos: true` em `paginas_visibilidade`.

## Validação — menu e página (P1 / US1)

1. Logar como **admin**.
2. Menu lateral: item **Contratos** aparece após **Patrimônio**.
3. Abrir **Contratos** → título da página e **exatamente dois** atalhos: **Contratos ativos** e **Contratos arquivados**.
4. Em **Configurações** → **Visibilidade de páginas**: existe toggle **Contratos**.
5. Editar um visualizador: existe permissão **Contratos**.

## Validação — atalhos Drive (P1 / US2)

1. Na página Contratos, acionar **Contratos ativos** → nova aba com URL  
   `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H`.
2. Aba do Ocean permanece em `/contratos`.
3. Acionar **Contratos arquivados** → nova aba com URL  
   `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-`.
4. Login Google / acesso negado no Drive (se ocorrer) é tratado pelo Google — não quebra o Ocean.

## Validação — permissões e visibilidade (SC-004)

1. Visualizador **sem** permissão `contratos`: item ausente no menu; `/contratos` não exibe o conteúdo (mesmo tratamento das demais páginas restritas).
2. Admin concede permissão `contratos` ao visualizador → item aparece (com página globalmente visível).
3. Admin oculta **Contratos** na visibilidade global → some do menu (admin e visualizador); admin ainda abre `/contratos` por URL; visualizador é redirecionado ao Dashboard.

## Validação — escopo fechado (SC-005)

1. Na página Contratos: **não** há botões de criar/editar/excluir, upload nem listagem de arquivos internos.
2. `npm run lint` e `npm run type-check` no frontend passam.

## Critérios de sucesso mapeados

| Critério | Como verificar |
|----------|----------------|
| SC-001 | Admin abre Contratos pelo menu em segundos |
| SC-002 | Dois links abrem URLs corretas em nova aba |
| SC-003 | Rótulos ativos/arquivados identificáveis |
| SC-004 | Passos de permissão/visibilidade acima |
| SC-005 | Sem CRUD na página |
