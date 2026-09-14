# Quickstart: Ações de Tabela Só com Tooltip

**Feature**: `064-tabelas-acoes-tooltip`  
**Modelo**: [data-model.md](./data-model.md) · **Contrato UI**: [ui-acoes-tabela-tooltip.md](./contracts/ui-acoes-tabela-tooltip.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456`)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação — ícone + tooltip (P1 / US1–US2)

1. Logar como **admin**.
2. Abrir **Contas a receber (NFs)** e inspecionar a coluna de ações de uma linha:
   - Sem textos permanentes “Recebido”, “Editar”, “Arquivar”, “Excluir” ao lado dos ícones.
   - Hover em cada ícone → tooltip com o nome correto.
   - Clique em Editar → mesmo modal/fluxo de antes.
3. Repetir em **Contas a pagar**: Pagar / Editar / Excluir (e Anexar se for `ActionButton`) só com ícone + tooltip.
4. Confirmar que **Substituir** / **Remover** (anexos) **continuam com texto** visível.

## Validação — layout horizontal (FR-009 / SC-006)

1. Em uma linha com várias ações (ex.: NFs ou Fornecedores), verificar que os controles ficam **na mesma linha**, sem empilhar.
2. Redimensionar a janela: a célula não deve quebrar os ícones em duas linhas (scroll horizontal da tabela pode existir; wrap dos botões não).

## Validação — consistência entre páginas (P2 / US3)

Percorrer e conferir o mesmo padrão (`ActionButton` row = ícone + tooltip):

| Página | Ações típicas |
|--------|----------------|
| Fornecedores / Colaboradores | Docs, Histórico, Editar, Desativar/Reativar, Excluir |
| Bônus | Liberar, Pagar, Editar |
| Férias | Aprovar, Rejeitar, Editar, Excluir |
| DH | Excluir (badges de envio só-texto permanecem) |
| Patrimônio | Editar, Excluir |
| Fluxo de caixa | Desfazer/Remover / Editar conta etc. (`context="row"`) |

## Validação — header intacto (FR-007)

1. Em qualquer listagem, botões do topo (Importar, Exportar, Novo…) **continuam** com ícone + texto.

## Validação — visualizador (FR-005)

1. Logar como visualizador.
2. Onde já não havia ações de admin, continua sem; onde havia só leitura, sem novos botões.

## Validação — qualidade

```bash
cd frontend && npm run lint && npm run type-check
```

## Critérios de sucesso mapeados

| Critério | Como verificar |
|----------|----------------|
| SC-001 | Passos NFs/Contas (sem texto ao lado do ícone) |
| SC-002 | Hover ≤ ~1s mostra nome |
| SC-003 | Clique Editar/Excluir etc. = fluxo antigo |
| SC-004 | Identificação por ícone/tooltip ou texto na exceção |
| SC-005 | Nenhuma página mistura ícone+texto com ícone-only no mesmo tipo `ActionButton` row |
| SC-006 | Sem wrap na célula de ações |
| SC-007 | Substituir/Remover (e similares) com texto |
