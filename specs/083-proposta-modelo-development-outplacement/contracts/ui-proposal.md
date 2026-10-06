# Contrato: Interface (Proposal interno e página do cliente)

## Nova proposta

- Seletor **Modelo (divisão)**: Executive Search (padrão) e Development & Outplacement. Trocar o modelo **não** reinicia o formulário; muda só o rótulo do escopo ("Escopo do Projeto" ↔ "Escopo") e o modelo enviado.
- Em **Criar cópia**, o seletor vem com o modelo da origem e pode ser trocado.

## Formulário (`ModeloForm`, os dois modelos)

Ordem das seções:

1. **Apresentação**: `Idioma da apresentação` (Português | Inglês) e `Moeda` (Real (R$) | Dólar (US$)), lado a lado. Na edição, os dois desabilitados com "Idioma e moeda não podem ser alterados depois de criada.".
2. **Cliente**: Empresa, Data, Setor.
3. **Consultor**: nome, cargo, telefone, e-mail.
4. **Escopo** (`Escopo do Projeto (opcional)` no ES, `Escopo (opcional)` no D&O): editor da 082.
5. **Projetos**: um cartão por projeto com título "Projeto N", botões **Subir**, **Descer** e **Remover** (Remover oculto com 1 projeto), campo Nome do projeto, checkboxes Retainer/Sucesso/Valor fechado e um quadro por tipo marcado (taxa %/moeda, entrada opcional, "Após conclusão: X%"). Botão **Adicionar projeto** (desabilitado com 10, com a indicação "Limite de 10 projetos"). Erros por projeto abaixo do respectivo campo.
6. **Garantias e condições**: Shortlist, SLA e Garantia (inputs de texto, `maxLength` 255, rótulo "(opcional)"), com a dica "Campos vazios não aparecem na proposta." (D&O: "Se os três ficarem vazios, a seção não aparece."; ES: "As Observações do modelo continuam aparecendo.").
7. **Validade**: `Validade (dias)` (inteiro) e o texto "Válida até dd/mm/aaaa" calculado, ou a mensagem de erro.

Resumo lateral: para cada projeto, o nome e os quadros (tipo, taxa, forma de pagamento); depois Garantia (texto ou "—") e "Válida até".

## Lista

- Coluna **Modelo**: nome do modelo e, abaixo, "Português · Real", "Inglês · Dólar" etc.
- Coluna **Projeto**: nome do primeiro projeto e " + N" quando houver mais.

## Detalhe

- Cabeçalho: "{modelo} · {Idioma} · {Moeda} · {primeiro projeto}{ + N}".
- Cartões: Cliente; Consultor; **Condições** (Shortlist, SLA, Garantia — "—" quando vazios — e Validade "dd/mm/aaaa (N dias)"); Escopo (título conforme o modelo); **Investimento** com um bloco por projeto (nome + quadros).
- Propostas no formato antigo: um bloco de projeto, Garantia "N meses", Shortlist/SLA "—".
- Histórico: rótulos "Projeto N", "Shortlist", "SLA", "Garantia", "Validade (dias)"; valor de projeto formatado como "Nome — Retainer 15% (40% de entrada + 60% após conclusão); …"; `null` como "—".

## Página do cliente

### Comum às duas divisões (formato novo)

- Idioma = `dados.idioma`; moeda = símbolo dos valores.
- Investimento: um `.pos` por projeto (`h3` com o nome) e `.plans` com os quadros; em taxa percentual, `dd.rate-sub` com "sobre a remuneração anual" / "of annual compensation".
- Garantias e condições: `dl.info` só com as linhas preenchidas.

### Executive Search v3

Como a v2, mais o comum acima. A seção Garantias aparece sempre, com a caixa de Observações, mesmo sem linhas.

### Development & Outplacement v1

Ordem: capa (logo D&O, 290px/190px) → menu (Development & Outplacement, Principais serviços, Escopo?, Investimento, Garantias e condições?, Contato) → `#servico` (título da divisão + lead) → `#principais-servicos` (`.svcs` com 3 `.svc`: ícone, `h3`, `p`) → `#escopo`? → `#investimento` (projetos + Observações da divisão) → `#garantias`? (sem Observações) → `#proximos-passos` → `#contato` → rodapé → diálogo de aceite.

### Textos fixos D&O

| Chave | pt-BR | en-US |
|---|---|---|
| Título da divisão | Development & Outplacement | Development & Outplacement |
| Seção do meio | Principais serviços | Key services |
| Cartão 1 | Assessment | Assessment |
| Cartão 2 | Outplacement | Outplacement |
| Cartão 3 | Soluções Personalizadas | Tailored Solutions |
| Escopo | Escopo | Scope |
| Obs. 1 | Valor mínimo de R$ 10.000,00 por projeto; | Minimum fee of BRL 10,000.00 per project; |
| Obs. 2 | Impostos (até 19,55%) serão adicionados a todos os valores informados. | Taxes (up to 19.55%) will be added to all amounts stated. |

Textos longos (lead e cartões) conforme o HTML de referência e a tradução em `outplacement-development/v1/conteudo/en-US.ts`.
