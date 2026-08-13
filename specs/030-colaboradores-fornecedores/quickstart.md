# Quickstart: Colaboradores e Fornecedores

**Feature**: `030-colaboradores-fornecedores`  
Contratos: [rest-cadastro-pessoas.md](./contracts/rest-cadastro-pessoas.md), [ui-colaboradores-fornecedores.md](./contracts/ui-colaboradores-fornecedores.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- PostgreSQL na porta **5433** (não alterar)
- Login `admin` / credencial de desenvolvimento do projeto

## Subir

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação ponta a ponta

1. Abrir **Colaboradores**. Confirmar um único item de menu e duas visões.
2. Visão Colaboradores: um registro antigo aparece com Documento CPF e o mesmo CPF de antes; telefone e e-mail vazios.
3. Editar um colaborador: preencher telefone e e-mail válidos; gravar; reabrir e conferir.
4. Novo colaborador com CNPJ + Razão Social: grava. Tentar CNPJ sem razão social: recusa.
5. Visão Fornecedores: criar PF (CPF) e PJ (CNPJ + Razão Social). Não devem aparecer campos de salário/cargo.
6. Confirmar que o fornecedor **não** está na lista de Colaboradores (e vice-versa).
7. Em **Bônus** ou **Férias**, o select de pessoa não lista o fornecedor.
8. **Contas a Pagar**: criar conta sem fornecedor (ok). Editar, vincular o fornecedor, ver o nome na lista.
9. **Calendário**: no vencimento dessa conta, o título mostra o fornecedor.
10. Login `visualizador`: vê cadastros, contas e calendário; não cria nem vincula.
11. `npm run lint` e `npm run type-check` no `frontend` passam.

## Falhas esperadas

| Ação | Resultado |
|------|-----------|
| CPF/CNPJ inválido | Mensagem; não grava |
| Documento já usado por outro **ativo** do mesmo tipo | Mensagem de duplicidade |
| Trocar tipo na edição (se a UI permitir enviar) | API 400 |
| Vincular id de colaborador como fornecedor da conta | API 400 |
