# Quickstart: Validação de Duplicidade de NFs

**Feature**: `013-nfs-duplicidade` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Contratos**: [contracts/](./contracts/)

## Pré-requisitos

- Stack no ar (portas fixas): API **8001**, frontend **5193**, PostgreSQL **5433**.
- Login **admin** / `123456`.
- Feature **012** (criação manual) disponível ou create/import reabilitados conforme [plan.md](./plan.md).
- Ao menos uma conta a receber existente com número conhecido (ex.: `DUP-001`).

## Cenários de validação

### 1. Criação duplicada + atalho (P1)

1. Contas a Receber → Nova receita/conta.
2. Informar número `DUP-001` (já existente) + demais obrigatórios → salvar.
3. **Esperado**: bloqueio; mensagem de duplicidade; botão **Abrir existente**.
4. Clicar no atalho → modal da NF/conta existente; listagem sem segundo registro com `DUP-001`.

### 2. Criação com número livre

1. Criar com número novo (ex.: `DUP-NOVO-1`).
2. **Esperado**: sucesso; aparece na lista.

### 3. Edição de número colidente (manual)

1. Abrir registro **manual** A; alterar número para o de outra conta B → salvar.
2. **Esperado**: 409 / bloqueio + atalho para B; A permanece com número anterior.

### 4. Edição mantendo o próprio número

1. Editar A sem mudar número (ou outros campos) → salvar.
2. **Esperado**: sucesso.

### 5. Import — escolha rejeitar

1. XLSX com uma linha `DUP-001` (já no cadastro) e linhas novas.
2. Iniciar import → diálogo rejeitar/atualizar → **Rejeitar**.
3. **Esperado**: novas linhas ok; `DUP-001` em erros/`duplicado_cadastro`; dados da existente inalterados; sem segundo registro.

### 6. Import — escolha atualizar

1. Mesmo arquivo (ou variante com valor diferente em `DUP-001`).
2. Escolher **Atualizar**.
3. **Esperado**: conta `DUP-001` atualizada; ainda um único registro; `atualizados >= 1`.

### 7. Import — duplicata no arquivo

1. Duas linhas com o mesmo número novo `DUP-FILE`.
2. Importar (sem conflito de cadastro ou após escolha).
3. **Esperado**: uma NF `DUP-FILE`; segunda linha em `duplicado_arquivo`; **sem** número `DUP-FILE-2`.

### 8. Trim

1. Tentar criar com número `  DUP-001  ` (espaços).
2. **Esperado**: tratado como `DUP-001` → conflito se já existir.

### 9. Visualizador

1. Login visualizador: sem create/import; sem contornar unicidade.

## Checagens rápidas de código

```bash
cd frontend && npm run lint && npm run type-check
```

Smoke API (com token admin): `POST /api/nfs` duplicado → 409 com `nf_id`; `POST /api/nfs/importar-xlsx` sem `on_conflict` e com conflito → código `NF_IMPORT_ON_CONFLICT_REQUIRED`.
