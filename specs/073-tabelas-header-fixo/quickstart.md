# Quickstart: Headers Fixos em Tabelas com Scroll

**Feature**: `073-tabelas-header-fixo`  
**Modelo**: [data-model.md](./data-model.md) · **Contrato UI**: [ui-tabelas-header-fixo.md](./contracts/ui-tabelas-header-fixo.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Volume de dados suficiente para gerar scroll vertical (seed/dev ou criar registros)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação — referência Contas a Pagar (baseline)

1. Abrir **Contas a pagar** com lista longa.
2. Rolar a área da tabela: títulos das colunas permanecem no topo; fundo opaco; ordenação/checkbox (se admin) funcionam.
3. Tema escuro: repetir — texto do header legível.

## Validação — padrão completo em listagens (P1 / US1–US2)

Em cada página abaixo, com lista longa o bastante para scroll:

| Página | Esperado |
|--------|----------|
| Fornecedores | Área com altura limitada; header sticky |
| Férias | Idem |
| DH | Idem |
| Bônus / Comissões | Idem nas grades por colaborador |
| Patrimônio | Idem |
| Impostos | Idem |
| Retiradas | Idem |
| Auditoria | Idem |
| Configurações | Idem |
| Fluxo de caixa | Idem em **cada** tabela de listagem |

Critério: comportamento **equivalente** ao de Contas a Pagar (SC-002).

## Validação — NFs / Contas a receber (exceção)

1. Abrir **Contas a receber (NFs)** com muitas linhas.
2. Rolar o corpo: cabeçalho continua visível (grade atual).
3. Scroll horizontal: colunas alinhadas; coluna sticky esquerda preservada.
4. Não deve haver regressão vs. comportamento pré-feature.

## Validação — Dashboard e modais (clarify)

1. **Dashboard**: layout da home **sem** novos blocos com `max-h` estilo Contas forçado.
2. Abrir um **modal** com tabela (se houver): sem segundo `max-h` Contas; se o conteúdo rolar, header pode ficar sticky; se não rolar, layout inalterado.

## Validação — controles e temas (P2 / US3)

1. Em Contas (ou listagem com ordenação): rolar e clicar no header — ordenação responde.
2. Alternar tema claro/escuro em ≥5 telas amostradas — header legível (SC-005).

## Validação — qualidade

```bash
cd frontend && npm run lint && npm run type-check
```

## Critérios de sucesso mapeados

| Critério | Como verificar |
|----------|----------------|
| SC-001 | Passos das listagens + NFs (header visível ao rolar) |
| SC-002 | Comparar ≥3 telas com Contas |
| SC-003 | Usuário reconhece sticky em ≤5s |
| SC-004 | Ordenação / seleção / ações de linha intactas |
| SC-005 | Amostra claro/escuro em ≥5 telas |
