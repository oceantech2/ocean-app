# Data Model: Página Comissões

**Feature**: `044-comissoes-pagina` | **Date**: 2026-08-28

Nenhuma tabela nova. Nenhuma coluna nova. O registro persistido continua sendo a entidade `Bonus` (`bonus`).

## Entidade: Comissão (persistida como Bonus)

Representa um valor de comissão de uma pessoa da equipe em um mês/ano.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|--------|
| id | int | sim | PK |
| colaborador_id | int | sim | FK `colaboradores`; UI lista só `elegivel_equipe` |
| mes | int | sim | 1–12 |
| ano | int | sim | Ano civil do registro |
| etapa | string | sim | lead / conducao / placement |
| percentual | float | sim | |
| valor_bonus | float | sim | Nome interno; rótulo UI **Valor da comissão** |
| cliente | string? | não | |
| posicao | string? | não | |
| numero_nf | string? | não | |
| criado_em | datetime | sim | default agora |

**Validação**: inalterada. Esta feature não cria registro pela UI avulsa; import/edição/exclusão seguem as regras atuais.

**Estado**: sem máquina de estados. Soft delete não se aplica (delete físico já existente).

## Recorte temporal (estado de sessão, não persistido)

Vive em `usePageFilters` (Zustand). Não vai ao banco.

| Campo | Valores | Padrão |
|-------|---------|--------|
| bonusColaboradorId | id ou vazio (todos) | vazio |
| bonusAno | int | ano civil corrente |
| bonusRecorte | `ano` \| `mes` \| `trimestre` | `ano` |
| bonusMes | 1–12 | irrelevante se recorte ≠ `mes` |
| bonusTrimestre | 1–4 | irrelevante se recorte ≠ `trimestre` |

**Regras**:

- `ano`: listagem/total/export = todos os meses de `bonusAno` (e pessoa, se houver).
- `mes`: listagem/total/export = `mes == bonusMes` e `ano == bonusAno`.
- `trimestre`: listagem/total/export = `mes` ∈ trimestre civil (ver [research.md](./research.md) R3) e `ano == bonusAno`.
- Gráfico: sempre agrega os 12 meses de `bonusAno` no conjunto carregado (não aplica `bonusRecorte`).
- Troca de `bonusAno`: mantém `bonusRecorte` e o número de mês/trimestre.

## Taxonomia visível (sem mudar chaves)

| Chave interna | Rótulo atual | Rótulo novo |
|---------------|--------------|-------------|
| página `bonus` | Bônus | Comissões |
| Dashboard `BONUS` / `bonus` | Bônus | Comissões |
| RH `bonus` | Bônus | Comissões |
| legado `bonus` | Bônus (legado) | Comissões (legado) |
| RH `comissao` | Comissão | Comissão (inalterado) |
| auditoria entidade `Bonus` | Bonus | Comissão (filtro/exibição; valor da API continua `Bonus`) |

## Relacionamentos

- Comissão N:1 pessoa da equipe (`colaboradores`).
- Recorte temporal 1:N comissões do ano carregado (filtro de apresentação).
