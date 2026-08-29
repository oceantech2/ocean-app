# Quickstart: Ocultar Páginas — Configuração em Settings

**Feature**: `042-ocultar-paginas-config`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [REST](./contracts/rest-paginas-visibilidade.md), [UI](./contracts/ui-paginas-visibilidade.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Após deploy da feature: migration inline cria `configuracao_app` e seed com **DH oculta**.

## Validação — estado inicial (P1)

1. Logar como **admin**.
2. Menu lateral: **DH não aparece** (nem na busca `/` + “DH”).
3. Abrir **Configurações** → seção **Visibilidade de páginas**: DH desmarcada/oculta; Dashboard ligada e **desabilitada**.
4. Acessar **`/dh` diretamente** na barra de endereços → conteúdo DH carrega (admin bypass URL).
5. Logar como **visualizador** (com permissão DH habilitada no cadastro, se existir).
6. Menu: DH ausente.
7. Acessar **`/dh`** → redireciona para **`/dashboard`**.

## Validação — ocultar e reativar (P2)

1. Admin em Configurações → marcar **Bônus** como oculta → Salvar.
2. Recarregar app (admin e visualizador): Bônus sumiu do menu.
3. Visualizador em **`/bonus`** → redirect Dashboard.
4. Admin reativa Bônus → Salvar → item volta no menu para quem tem permissão.

## Validação — permissões de usuário (P3)

1. Com **DH oculta**, admin abre editar visualizador.
2. Toggle DH **desabilitado** com indicação “Oculta no sistema”.
3. Reativar DH globalmente → toggle DH volta habilitável; visualizador com permissão vê DH no menu.

## Validação — alertas (FR-012)

1. Criar férias “aguardando aprovação” (ou usar dado existente).
2. Com **Férias visível**: alerta aparece no topo.
3. Ocultar **Férias** globalmente → alerta **some** (mesmo com contagem > 0 no backend).
4. Reativar Férias → alerta volta se ainda houver pendências.

## Validação — Dashboard protegida

1. Admin tenta desmarcar Dashboard na seção → toggle não responde / permanece ligado.
2. PUT manual com `dashboard: false` → backend retorna/força `true`.

## Lint

```bash
cd frontend && npm run lint && npm run type-check
```

## Fora desta prova

- Não exige apagar dados de DH ao ocultar.
- Não exige alterar e-mail de alertas (`/api/alertas`).
