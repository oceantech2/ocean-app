# Contrato: Textos do modelo Executive Search v1 (pt-BR ↔ en-US)

Fonte única para os dicionários `frontend/src/proposal/modelos/executive-search/v1/i18n/pt-BR.ts` e `en-US.ts`. A coluna **pt-BR** é o texto atual da página, literal. A coluna **en-US** é a tradução inicial, para revisão da Ocean. Itens marcados com **[revisar]** têm conteúdo específico do Brasil (research R9).

`{data}`, `{hora}`, `{nome}`, `{cliente}`, `{e}`, `{f}` e `{n}` são valores preenchidos pelo sistema. Datas e números seguem o formato do idioma ([research.md](../research.md) R6).

## Página e capa

| Chave | pt-BR | en-US |
|---|---|---|
| `pagina.titulo` | Proposta comercial — Ocean Talent Solutions | Commercial proposal — Ocean Talent Solutions |
| `pagina.lang` | pt-BR | en |
| `pagina.navegacao` | Seções | Sections |
| `capa.titulo` | Proposta / Comercial (duas linhas) | Commercial / Proposal (duas linhas) |
| `capa.preparadaPara` | Preparada para | Prepared for |
| `capa.data` | Data | Date |
| `capa.consultor` | Consultor | Consultant |
| `capa.atualizadaEm` | Atualizada em {data} | Updated on {data} |
| `capa.logoAlt` | Ocean Talent Solutions — Executive Search | Ocean Talent Solutions — Executive Search |

## Navegação

| Chave | pt-BR | en-US |
|---|---|---|
| `nav.servico` | Serviço | Service |
| `nav.metodologia` | Metodologia | Methodology |
| `nav.investimento` | Investimento | Investment |
| `nav.garantias` | Garantias e condições | Guarantees and terms |
| `nav.contato` | Contato | Contact |

Os títulos das seções (`<h2>`) usam os mesmos textos da navegação.

## Serviço

| Chave | pt-BR | en-US |
|---|---|---|
| `servico.texto` | Desenvolvemos inteligência de mercado e encontramos os profissionais que fazem a diferença, do especialista técnico ao C-level. Nosso processo vai além da captação de currículos: mapeamos o mercado ativamente, abordamos os profissionais mais aderentes ao desafio da sua empresa, checamos referências e mitigamos riscos de engajamento, garantindo uma contratação assertiva. | We develop market intelligence and find the professionals who make a difference, from technical specialists to the C-level. Our process goes beyond collecting résumés: we actively map the market, approach the professionals best suited to your company's challenge, check references and mitigate engagement risks, ensuring the right hire. |

## Metodologia (6 passos)

| Passo | pt-BR | en-US |
|---|---|---|
| 1 | **Alinhamento**: Entendimento da posição e cultura do cliente · Objetivos e desafios · Motivo da contratação · Definição do cronograma | **Alignment**: Understanding of the position and the client's culture · Goals and challenges · Reason for the hire · Timeline definition |
| 2 | **Mapeamento de mercado**: Universo de empresas target · Inteligência de mercado · Hunting ativo · Indicações | **Market mapping**: Target company universe · Market intelligence · Active hunting · Referrals |
| 3 | **Avaliação**: Entrevistas · Avaliação técnica e comportamental · Alinhamento de expectativas · Comparação entre os candidatos | **Assessment**: Interviews · Technical and behavioral assessment · Alignment of expectations · Comparison between candidates |
| 4 | **Apresentação dos candidatos**: Long list · Short list · Resumo dos perfis selecionados e recomendações · Referências profissionais | **Candidate presentation**: Long list · Short list · Summary of selected profiles and recommendations · Professional references |
| 5 | **Condução do processo**: Suporte nas entrevistas · Checagem de referências · Suporte na negociação salarial · Proximidade dos candidatos e gestores | **Process management**: Interview support · Reference checks · Salary negotiation support · Close contact with candidates and managers |
| 6 | **Onboarding**: Monitoramento formal pelos 6 primeiros meses do profissional contratado | **Onboarding**: Formal follow-up during the hired professional's first 6 months |

## Investimento

| Chave | pt-BR | en-US |
|---|---|---|
| `investimento.taxa` | Taxa | Fee |
| `investimento.pagamento` | Forma de pagamento | Payment terms |
| `investimento.tipos.retainer` | Retainer | Retainer |
| `investimento.tipos.sucesso` | Sucesso | Success fee |
| `investimento.tipos.valor-fechado` | Valor fechado | Fixed fee |
| `investimento.comEntrada` | {e}% de entrada + {f}% após conclusão | {e}% upfront + {f}% upon completion |
| `investimento.semEntrada` | 100% após conclusão | 100% upon completion |
| `investimento.observacoesTitulo` | Observações | Notes |
| `investimento.observacoes[0]` **[revisar]** | Remuneração anual inclui 13º salário, adicional de férias e bônus (se aplicável); | Annual compensation includes the 13th salary, vacation bonus and bonuses (if applicable); |
| `investimento.observacoes[1]` | A parcela inicial será calculada com base na remuneração estimada. A parcela final será calculada com base na remuneração praticada, descontando-se a parcela inicial; | The initial installment will be calculated based on the estimated compensation. The final installment will be calculated based on the actual compensation, less the initial installment; |
| `investimento.observacoes[2]` **[revisar]** | Valor mínimo de R$ 15.000,00 por projeto; | Minimum fee of BRL 15,000.00 per project; |
| `investimento.observacoes[3]` **[revisar]** | Impostos (até 19,55%) serão adicionados a todos os valores informados. | Taxes (up to 19.55%) will be added to all amounts stated. |

## Garantias e condições

| Chave | pt-BR | en-US |
|---|---|---|
| `garantias.shortlist` | Shortlist: | Shortlist: |
| `garantias.shortlistValor` | 3 a 5 candidatos | 3 to 5 candidates |
| `garantias.sla` | SLA: | SLA: |
| `garantias.slaValor` | 5 a 10 dias úteis | 5 to 10 business days |
| `garantias.garantia` | Garantia: | Guarantee: |
| `garantias.meses` | 1 mês / {n} meses | 1 month / {n} months |
| `garantias.observacoes[0]` | Prazo de garantia para reposição caso o candidato contratado deixe a empresa (sem custo adicional); | Replacement guarantee period if the hired candidate leaves the company (at no additional cost); |
| `garantias.observacoes[1]` | A Ocean não abordará profissionais do cliente por 12 meses após a última posição atendida; | Ocean will not approach the client's employees for 12 months after the last position filled; |
| `garantias.observacoes[2]` | O cliente deverá reembolsar a Ocean se contratar candidatos apresentados em até 12 meses. | The client shall compensate Ocean if it hires any presented candidate within 12 months. |

## Vamos avançar?

| Chave | pt-BR | en-US |
|---|---|---|
| `proximos.titulo` | Vamos avançar? | Shall we move forward? |
| `proximos.texto` | Agradecemos o seu interesse e nos colocamos à disposição para eventuais esclarecimentos ou negociações. Esperamos desenvolver uma parceria de longo prazo! | Thank you for your interest. We are available for any questions or negotiations. We look forward to building a long-term partnership! |
| `proximos.validadeAte` | Esta proposta é válida até {data}. | This proposal is valid until {data}. |
| `proximos.aceitaEm` | Proposta aceita em {data} às {hora} por {nome}. | Proposal accepted on {data} at {hora} by {nome}. |
| `proximos.aceitar` | Aceitar proposta | Accept proposal |
| `proximos.falarConsultor` | Falar com o consultor | Talk to the consultant |
| `proximos.baixarPdf` | Baixar PDF | Download PDF |

## Contato e rodapé

| Chave | pt-BR | en-US |
|---|---|---|
| `contato.telefone` | Telefone | Phone |
| `contato.email` | E-mail | Email |
| `contato.linkedin` | LinkedIn | LinkedIn |
| `contato.site` | Site | Website |
| `rodape.texto` | Ocean Talent Solutions · Proposta comercial · {data} | Ocean Talent Solutions · Commercial proposal · {data} |

## Janela de aceite

| Chave | pt-BR | en-US |
|---|---|---|
| `aceite.titulo` | Aceitar proposta | Accept proposal |
| `aceite.texto` | Ao confirmar, registramos o aceite da proposta comercial e encaminhamos você para o contrato. | By confirming, we will record your acceptance of this commercial proposal and follow up with the contract. |
| `aceite.nome` | Nome completo | Full name |
| `aceite.email` | E-mail | Email |
| `aceite.declaracao` | Li e aceito os termos desta proposta | I have read and accept the terms of this proposal |
| `aceite.confirmar` | Confirmar aceite | Confirm acceptance |
| `aceite.cancelar` | Cancelar | Cancel |
| `aceite.fechar` | Fechar | Close |
| `aceite.erroNome` | Informe o nome completo | Please enter your full name |
| `aceite.erroEmail` | E-mail inválido | Invalid email address |
| `aceite.erroAceite` | É necessário aceitar os termos da proposta | You must accept the terms of this proposal |
| `aceite.sucesso` | Aceite registrado. Nossa equipe enviará o contrato em breve. | Acceptance recorded. Our team will send you the contract shortly. |
| `aceite.erro` | Erro: não foi possível registrar o aceite. Tente novamente ou fale com o consultor. | Error: we could not record your acceptance. Please try again or contact the consultant. |
| `aceite.versaoAtualizada` | Esta proposta foi atualizada. Revise os dados e assine novamente. | This proposal has been updated. Please review the details and accept again. |

## Proposta indisponível e carregamento

| Chave | pt-BR | en-US |
|---|---|---|
| `indisponivel.moldura` | Proposta comercial | Commercial proposal |
| `indisponivel.cancelada` | Esta proposta não está mais disponível. | This proposal is no longer available. |
| `indisponivel.expirada` | Esta proposta expirou. Entre em contato com a Ocean para receber uma nova. | This proposal has expired. Please contact Ocean to receive a new one. |
| `indisponivel.carregando` | Carregando proposta… | Loading proposal… |

## Ações externas

| Chave | pt-BR | en-US |
|---|---|---|
| `whatsapp.mensagem` | Olá, gostaria de falar sobre a proposta comercial da Ocean Talent Solutions para a {cliente}. | Hello, I would like to talk about Ocean Talent Solutions' commercial proposal for {cliente}. |
| `pdf.nomeArquivo` | Proposta Comercial Ocean - {cliente} | Ocean Commercial Proposal - {cliente} |

## Exemplos de formatação

| Dado | pt-BR | en-US |
|---|---|---|
| Data `2026-10-24` | 24/10/2026 | October 24, 2026 |
| Hora do aceite | 10:24 | 10:24 AM |
| Taxa percentual `17.50` | 17,5% | 17.5% |
| Taxa em valor `50000.00` | R$ 50.000 | US$ 50,000 |
| Taxa em valor `50000.50` | R$ 50.000,50 | US$ 50,000.50 |
| Garantia `1` / `4` | 1 mês / 4 meses | 1 month / 4 months |
