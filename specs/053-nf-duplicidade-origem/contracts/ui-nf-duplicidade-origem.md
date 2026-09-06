# Contrato UI: NF — Duplicidade entre Origens

**Feature**: `053-nf-duplicidade-origem` | **Date**: 2026-09-06  
**Spec**: [spec.md](./spec.md) · **API**: [rest-nf-duplicidade-origem.md](./rest-nf-duplicidade-origem.md)

> Página: Contas a Receber (`frontend/src/pages/NFs.tsx`), padrões Layout + toast do produto. Estende UI da 013.

## Formulário criar / editar

### Bloqueio — duplicidade mesma origem

Quando a API retornar **409** `NF_NUMERO_DUPLICADO`:

1. Toast e/ou mensagem no modal com `message` e número.
2. CTA **“Abrir existente”** → modal de edição da NF `nf_id`.
3. Sem sucesso falso.

### Bloqueio — conflito entre origens

Quando a API retornar **409** `NF_NUMERO_ORIGEM_CONFLITO`:

1. Feedback claro de que o número já existe em **outra origem** (usar `origem_existente` / mensagem da API).
2. Mesmo CTA **“Abrir existente”** para `nf_id`.
3. Sem sucesso falso; não sugerir “atualizar” a NF da outra origem a partir do formulário.

### Edição sem mudança de número

Inalterado.

### Papéis

- Admin: escrita + validação.
- Visualizador: só leitura (inalterado).

## Importação XLSX

1. Admin seleciona arquivo e inicia importação.
2. Se **422** `NF_IMPORT_ON_CONFLICT_REQUIRED` (só conflitos Manual):
   - Diálogo **uma vez por lote**: Rejeitar / Atualizar / Cancelar (cópia alinhada à 013, deixando claro que vale para números já Manual).
   - Reenviar com `on_conflict`.
3. Se não houver conflitos Manual: importar direto (mesmo que existam linhas que serão rejeitadas por `conflito_origem` com Maggo).
4. Ao concluir: toast com `ok` / `atualizados`; resumir `erros`, distinguindo:
   - `duplicado_arquivo`
   - `duplicado_cadastro` (mesma origem / reject)
   - `conflito_origem` (número já em outra origem)

### Cópia sugerida (pt-BR)

| Situação | Texto |
|----------|--------|
| 409 duplicidade | “Já existe uma conta a receber com o número {numero}.” |
| 409 origem | “O número {numero} já existe na origem {Origem}. A mesma nota não pode vir de duas origens.” |
| CTA atalho | “Abrir existente” |
| Diálogo import | “Alguns números deste arquivo já existem em lançamentos Manual. Deseja rejeitar essas linhas ou atualizar as contas existentes?” |
| Botões | “Rejeitar” / “Atualizar” / “Cancelar” |
| Erro conflito origem no resumo | “Conflito de origem (já existe em Maggo)” |

## Sync Maggo

- **MUST NOT** exibir toast dedicado nem notificação persistente por colisão de origem nesta feature.
- Diagnóstico permanece no resultado do sync (header `X-Ocean-Maggo-Ignorados` / mecanismo já usado). Indicação discreta na página é opcional.

## Fora de escopo UI

- Tela de varredura / correção de duplicatas históricas entre origens.
- Decisão rejeitar/atualizar **por linha**.
- Oferecer atualizar NF Maggo a partir da importação Manual.
