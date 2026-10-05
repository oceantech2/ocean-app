# Contrato: Interface do Proposal (alterações da 080)

App: `frontend/src/proposal/` (entrada `frontend/proposal.html`). Padrões mantidos: `ProposalLayout`, `react-hot-toast`, spinner `animate-spin`, `window.confirm` no cancelamento, mensagens de erro do backend via `mensagemErro`.

---

## Registro de modelos (frontend)

`frontend/src/proposal/modelos/index.ts`
```ts
export const MODELOS = {
  'executive-search': {
    nome: 'Executive Search',
    disponivel: true,
    versoes: { 1: lazy(() => import('./executive-search/v1/ExecutiveSearchV1')) },
  },
} as const;
```
- `modelosDisponiveis()` → entradas com `disponivel: true` (alimenta o seletor da Nova proposta).
- `componenteDoModelo(modelo, versao)` → componente da página pública; versão desconhecida → mensagem genérica "Não foi possível exibir esta proposta" (não deve ocorrer em produção).
- `setores.ts`: `SETORES = [{ chave, rotulo, foto }]` nas 5 chaves; `foto` = `/propostas/setores/infraestrutura.jpg` para todos até as fotos chegarem.
- `investimentos.ts`: `TIPOS = [{ tipo: 'retainer', rotulo: 'Retainer' }, { tipo: 'sucesso', rotulo: 'Sucesso' }, { tipo: 'valor-fechado', rotulo: 'Valor fechado' }]`.
- `formatacao.ts`: `formatarTaxa`, `formatarPagamento`, `formatarGarantia`, `digitosTelefone` (R10, R11), reutilizadas no formulário, no detalhe e na página pública.

---

## Rotas

| Rota | Tela | Mudança |
|---|---|---|
| `/nova` | `Nova.tsx` | Seletor de modelo + `ModeloForm`; não usa mais `PropostaForm` |
| `/nova?copiar={id}` | `Nova.tsx` | Só para propostas por modelo; origem `simples` → toast "Esta proposta não pode ser copiada" e formulário vazio |
| `/propostas/:id/editar` | `Editar.tsx` | `ModeloForm` se `modelo !== 'simples'`; `PropostaForm` (079) se `simples` |
| `/perfil` | `Perfil.tsx` (nova) | Perfil do consultor |
| `/p/:codigo` | `PropostaPublica.tsx` | Despacha por `modelo`: componente do modelo ou página legada |

`ProposalLayout`: link **Meu perfil** no cabeçalho, ao lado do nome do usuário.

---

## `Nova.tsx`

1. Carrega em paralelo `GET /proposal/perfil` (e a proposta de origem, se `?copiar`).
2. **Modelo (divisão)**: `<select>` com `modelosDisponiveis()`; com um só modelo, já vem selecionado e o formulário aparece direto (FR-001, FR-002).
3. Renderiza `ModeloForm` com `inicial`:
   - nova: Data = hoje (SP), validade = hoje + 30, consultor = perfil (campos `null` → vazios);
   - cópia: todos os campos da origem, exceto Data = hoje e validade = padrão (FR-029).
4. Perfil incompleto → aviso acima do formulário: "Preencha seu perfil para não precisar digitar seus dados de contato em cada proposta." com link para `/perfil` (US5, cenário 3).
5. Sucesso → tela "Proposta criada" atual, com resumo `{Empresa} · {Projeto} · válida até {validade}` (sem total).

## `components/ModeloForm.tsx` (novo)

Props: `inicial`, `rotuloSalvar`, `rotuloSalvando`, `salvando`, `onSubmit(payload)`, `aviso?` (mesma assinatura do `PropostaForm`).

Seções e campos:

| Seção | Campos |
|---|---|
| Cliente | Empresa (texto, máx. 255) · Data (`type="date"`) · Setor (`<select>` com os 5 rótulos) |
| Consultor | Nome · Cargo · Telefone (`inputMode="tel"`) · E-mail (`type="email"`) |
| Projeto | Nome do projeto · Garantia (meses, inteiro ≥ 1) · Validade (`type="date"`, mín. amanhã) |
| Investimento | 3 caixas de seleção (Retainer, Sucesso, Valor fechado). Cada uma marcada abre um quadro com: Taxa em `%` ou `R$` (alternador) + valor · Entrada (%) opcional · texto calculado "Após conclusão: {100 − entrada}%" |

Resumo lateral (como o do `PropostaForm`): para cada quadro marcado, o texto exatamente como o cliente verá (`formatarTaxa` + `formatarPagamento`), e a garantia formatada.

Validação no cliente espelhando o backend (data-model), erro sob cada campo; erro do backend → toast. Campo "Após conclusão" é só leitura.

## `Editar.tsx`

- Escolhe o formulário pelo `modelo`. Para modelo: `formDeModelo(proposta)` (todos os campos atuais, incluindo quadros) e envia `PUT` com `modelo` da proposta.
- Avisos e tratamento de `409`/`404` iguais aos da 079.

## `Detalhe.tsx`

- Cabeçalho mostra o **modelo** (`modelo_nome`).
- Propostas por modelo: seções Cliente (Empresa, Data, Setor), Consultor (nome, cargo, telefone, e-mail), Projeto (nome, garantia, validade) e Investimento (um cartão por quadro, com a taxa e a forma de pagamento formatadas como na página do cliente).
- Propostas `simples`: exibição atual (CNPJ, valor, imposto, total).
- **Criar cópia**: só aparece quando `modelo !== 'simples'` (clarify).
- Histórico: rótulos novos — `cliente_nome` → "Empresa" (por modelo) ou "Cliente" (simples), `data_proposta` → "Data", `setor` → "Setor" (valor pelo rótulo), `consultor_*` → "Consultor: nome/cargo/telefone/e-mail", `projeto_nome` → "Projeto", `garantia_meses` → "Garantia" (`formatarGarantia`), `investimento.{tipo}` → "Investimento {Rótulo}" com `anterior`/`novo` formatados; `null` → "—" (inclusão/remoção).

## `Lista.tsx`

Colunas: **Empresa** · **Modelo** · **Projeto** · **Data** · **Validade** · **Status** · (admin) Criado por · Ações. Em `simples`: Modelo "Proposta simples", Projeto "—", Data = data de emissão. CNPJ e Total saem da tabela (FR-026).

## `Perfil.tsx` (nova)

Formulário com Nome, Cargo, Telefone e E-mail, todos opcionais; valida só os preenchidos (mesmas regras do `ModeloForm`). Salvar → `PUT /proposal/perfil`, toast "Perfil salvo". Texto de apoio: "Esses dados preenchem automaticamente o consultor nas novas propostas. Alterar o perfil não muda propostas já criadas."

---

## `PropostaPublica.tsx`

- Mantém carregamento, "não encontrada", erro de rede e mensagens de cancelada/expirada.
- `dados.modelo === 'simples'` (ou ausente) → página atual, sem mudança.
- Caso contrário → `<Suspense>` + `componenteDoModelo(dados.modelo, dados.modelo_versao)` com props `{ dados, codigo, onRecarregar }`.

## `modelos/executive-search/v1/ExecutiveSearchV1.tsx` (novo)

Reproduz o HTML de referência (R1, R2) dentro de `<div className="tpl-es">`, importando `executive-search-v1.css`:

| Bloco do modelo | Conteúdo |
|---|---|
| Capa | Foto do setor (`<img className="bg">`, `onError` oculta) · "Proposta Comercial" · Preparada para = `cliente_nome` · Data = `data_proposta` (+ "Atualizada em DD/MM/AAAA" quando `atualizada_em`) · Consultor = `consultor.nome` · logo `/propostas/executive-search/logo-divisao.png` |
| Navegação | Serviço · Metodologia · Investimento · Garantias e condições · Contato (âncoras) |
| Serviço, Metodologia | Texto fixo do modelo, literal |
| Investimento | `<h3>` = `projeto_nome`; um `.plan` por item de `investimentos`, título pelo rótulo do tipo, Taxa (`formatarTaxa`), Forma de pagamento (`formatarPagamento`); Observações fixas |
| Garantias e condições | Shortlist e SLA fixos · Garantia = `formatarGarantia(garantia_meses)` · Observações fixas |
| Vamos avançar? | Texto fixo · "Esta proposta é válida até DD/MM/AAAA." · botões **Aceitar proposta** (só se `pode_assinar`), **Falar com o consultor** (`wa.me/{telefone_digitos}?text=…{Empresa}.`), **Baixar PDF**. Assinada: no lugar de Aceitar, "Proposta aceita em DD/MM/AAAA às HH:MM por {nome}." |
| Contato | `consultor.nome`, `consultor.cargo`, telefone (`tel:+{telefone_digitos}`), e-mail (`mailto:`), LinkedIn e site fixos da Ocean |
| Rodapé | "Ocean Talent Solutions · Proposta comercial · {Data}" |
| Diálogo de aceite | `<dialog>` com `showModal()`; Nome completo, E-mail, "Li e aceito os termos desta proposta"; **Confirmar aceite** / **Cancelar**; mensagens `.msg.ok` / `.msg.err` (R12) |

Comportamentos:
- **Baixar PDF**: `document.title = "Proposta Comercial Ocean - {Empresa}"`, `window.print()`, restaura o título em `afterprint`.
- Nenhum `data-field`, `data-example`, `?campos` ou atalho Shift+C.
- Todo dado vem por JSX (escape automático; FR-020).

## `services/proposalApi.ts`

- Tipos: `ModeloId`, `Investimento`, `PropostaModeloPayload`, `PerfilConsultor`; `Proposta`, `PropostaListItem` e `PropostaPublicaData` ganham os campos dos contratos de API.
- Funções novas: `obterPerfil()`, `salvarPerfil(payload)`. `criarProposta`/`editarProposta` aceitam `PropostaPayload | PropostaModeloPayload`.

## Assets e HTML

- `frontend/public/propostas/executive-search/logo-divisao.png` e `frontend/public/propostas/setores/infraestrutura.jpg`, extraídos do HTML de referência.
- `frontend/proposal.html`: `preconnect` + `<link>` das fontes Inter e Poppins (pesos 400/500/600/700).
