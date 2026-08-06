# Contrato UI: Duplicidade de NFs / Contas a Receber

**Feature**: `013-nfs-duplicidade` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **API**: [api-nfs-duplicidade.md](./api-nfs-duplicidade.md)

> Página: Contas a Receber (`frontend/src/pages/NFs.tsx`), padrões Layout + toast do produto.

## Formulário criar / editar (número)

### Bloqueio

Quando a API retornar **409** `NF_NUMERO_DUPLICADO`:

1. Exibir feedback claro (toast e/ou mensagem no modal) com `message` e o número.
2. Oferecer ação explícita **“Abrir existente”** (ou equivalente).
3. Ao acionar: carregar a NF por `nf_id` e abrir o **modal de edição** já usado na página (`abrirEditar`).
4. Não exibir sucesso falso; registro novo/alteração de número não persiste.

### Edição sem mudança de número

Comportamento atual permanece; sem prompt de duplicidade.

### Papéis

- Admin: create/edit conforme 012 + validação 013.
- Visualizador: sem ações de escrita (inalterado).

## Importação XLSX

### Fluxo

1. Admin seleciona arquivo e inicia importação.
2. Se a API responder `NF_IMPORT_ON_CONFLICT_REQUIRED`:
   - Modal/diálogo **uma vez por lote** com opções:
     - **Rejeitar** linhas com número já cadastrado
     - **Atualizar** contas existentes com os dados do arquivo
   - Reenviar com `on_conflict` correspondente.
3. Se não houver conflitos de cadastro: importar direto (sem diálogo).
4. Ao concluir: toast com `ok` / `atualizados`; listar ou resumir `erros` (incl. `duplicado_arquivo` e `duplicado_cadastro`), no padrão Contas/Colaboradores (`ok` + erros).

### Cópia sugerida (pt-BR)

| Situação | Texto |
|----------|--------|
| 409 create/edit | “Já existe uma conta a receber com o número {numero}.” |
| CTA atalho | “Abrir existente” |
| Diálogo import | “Alguns números deste arquivo já existem. Deseja rejeitar essas linhas ou atualizar as contas existentes?” |
| Botões | “Rejeitar” / “Atualizar” / “Cancelar” |

## Fora de escopo UI

- Tela de varredura de duplicatas históricas.
- Decisão rejeitar/atualizar **por linha**.
- Deep-link por URL (opcional futuro); MVP = modal na mesma página.
