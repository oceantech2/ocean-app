# Quickstart: Renomear Atalhos da Página Contratos

**Feature**: `063-contratos-clientes-internos`  
**Modelo**: [data-model.md](./data-model.md) · **Contrato UI**: [ui-contratos-rotulos.md](./contracts/ui-contratos-rotulos.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456` com permissão Contratos)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação — novos rótulos (P1 / US1)

1. Logar como **admin**.
2. Abrir **Contratos** no menu (o item continua chamado **Contratos**).
3. Conferir exatamente dois atalhos, de cima para baixo:
   - **Contratos Clientes**
   - **Contratos Internos**
4. Confirmar que **Contratos ativos** e **Contratos arquivados** **não** aparecem na página.
5. Título da página permanece **Contratos**.

## Validação — mesmos destinos (P1 / US2)

1. Acionar **Contratos Clientes** → nova aba com URL  
   `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H`.
2. Aba do Ocean permanece em `/contratos`.
3. Acionar **Contratos Internos** → nova aba com URL  
   `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-`.

## Validação — papel visualizador (opcional)

1. Logar como visualizador **com** permissão Contratos.
2. Abrir a página e ver os **mesmos** dois rótulos, na mesma ordem.

## Validação — escopo fechado

1. Menu, Configurações (visibilidade/permissões) e descrição do catálogo **não** passam a usar os nomes antigos dos atalhos.
2. `npm run lint` e `npm run type-check` no frontend passam.

## Critérios de sucesso mapeados

| Critério | Como verificar |
|----------|----------------|
| SC-001 | Passos US1 (rótulos cima/baixo) |
| SC-002 | Passos US2 (URLs e nova aba) |
| SC-003 | Nomes Clientes/Internos identificáveis na primeira visita |
| SC-004 | Nomes antigos ausentes na página; menu continua Contratos |
