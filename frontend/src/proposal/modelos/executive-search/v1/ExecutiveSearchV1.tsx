import { FormEvent, useEffect, useRef, useState } from 'react';
import { assinarPublica } from '../../../services/proposalApi';
import { formatarData } from '../../../utils/propostaCalculo';
import { dataHoraSP, EMAIL_RE, formatarDataISO, formatarGarantia, formatarPagamento, formatarTaxa } from '../../formatacao';
import type { ModeloPaginaProps } from '../../index';
import { rotuloTipo } from '../../investimentos';
import { fotoSetor } from '../../setores';
import './executive-search-v1.css';

const TITULO_PAGINA = 'Proposta comercial — Ocean Talent Solutions';
const MSG_VERSAO_DESATUALIZADA = 'Esta proposta foi atualizada';

type Mensagem = { texto: string; tipo: 'ok' | 'err' } | null;

const PASSOS: { titulo: string; itens: string[] }[] = [
  {
    titulo: 'Alinhamento',
    itens: [
      'Entendimento da posição e cultura do cliente',
      'Objetivos e desafios',
      'Motivo da contratação',
      'Definição do cronograma',
    ],
  },
  {
    titulo: 'Mapeamento de mercado',
    itens: ['Universo de empresas target', 'Inteligência de mercado', 'Hunting ativo', 'Indicações'],
  },
  {
    titulo: 'Avaliação',
    itens: [
      'Entrevistas',
      'Avaliação técnica e comportamental',
      'Alinhamento de expectativas',
      'Comparação entre os candidatos',
    ],
  },
  {
    titulo: 'Apresentação dos candidatos',
    itens: ['Long list', 'Short list', 'Resumo dos perfis selecionados e recomendações', 'Referências profissionais'],
  },
  {
    titulo: 'Condução do processo',
    itens: [
      'Suporte nas entrevistas',
      'Checagem de referências',
      'Suporte na negociação salarial',
      'Proximidade dos candidatos e gestores',
    ],
  },
  {
    titulo: 'Onboarding',
    itens: ['Monitoramento formal pelos 6 primeiros meses do profissional contratado'],
  },
];

export default function ExecutiveSearchV1({ dados, codigo, onRecarregar }: ModeloPaginaProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [aceite, setAceite] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem>(null);
  const [enviando, setEnviando] = useState(false);
  const [aceito, setAceito] = useState(false);

  const consultor = dados.consultor;
  const cliente = dados.cliente_nome ?? '';
  const data = formatarDataISO(dados.data_proposta);
  const telefoneDigitos = consultor?.telefone_digitos ?? '';
  const linkWhatsApp =
    `https://wa.me/${telefoneDigitos}?text=` +
    encodeURIComponent(`Olá, gostaria de falar sobre a proposta comercial da Ocean Talent Solutions para a ${cliente}.`);

  useEffect(() => {
    const anterior = document.title;
    document.title = TITULO_PAGINA;
    const restaurar = () => {
      document.title = TITULO_PAGINA;
    };
    window.addEventListener('afterprint', restaurar);
    return () => {
      window.removeEventListener('afterprint', restaurar);
      document.title = anterior;
    };
  }, []);

  const baixarPdf = () => {
    document.title = `Proposta Comercial Ocean${cliente ? ` - ${cliente}` : ''}`;
    window.print();
  };

  const abrirAceite = () => {
    setMensagem(null);
    setAceito(false);
    dialogo.current?.showModal();
  };

  const fecharAceite = () => dialogo.current?.close();

  const aoFecharDialogo = () => {
    if (aceito) onRecarregar();
  };

  const confirmar = async (e: FormEvent) => {
    e.preventDefault();
    if (nome.trim().length < 3) return setMensagem({ texto: 'Informe o nome completo', tipo: 'err' });
    if (!EMAIL_RE.test(email.trim())) return setMensagem({ texto: 'E-mail inválido', tipo: 'err' });
    if (!aceite) return setMensagem({ texto: 'É necessário aceitar os termos da proposta', tipo: 'err' });

    setEnviando(true);
    setMensagem(null);
    try {
      await assinarPublica(codigo, { nome: nome.trim(), email: email.trim(), aceite, versao: dados.versao });
      setAceito(true);
      setMensagem({ texto: 'Aceite registrado. Nossa equipe enviará o contrato em breve.', tipo: 'ok' });
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 409 && typeof detail === 'string' && detail.startsWith(MSG_VERSAO_DESATUALIZADA)) {
        setMensagem({ texto: detail, tipo: 'err' });
        onRecarregar();
      } else if (status === 409 || status === 404) {
        fecharAceite();
        onRecarregar();
      } else {
        setMensagem({
          texto: 'Erro: não foi possível registrar o aceite. Tente novamente ou fale com o consultor.',
          tipo: 'err',
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  const assinatura = dados.status === 'assinada' && dados.assinatura ? dados.assinatura : null;
  const aceitaEm = assinatura ? dataHoraSP(assinatura.assinada_em) : null;

  return (
    <div className="tpl-es">
      <header className="cover inv">
        <div className="bg-slot">
          <img
            className="bg"
            alt=""
            aria-hidden="true"
            src={fotoSetor(dados.setor)}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="wrap">
          <h1>
            Proposta
            <br />
            Comercial
          </h1>
          <div className="meta">
            <div>
              <span>Preparada para</span>
              <strong>{cliente}</strong>
            </div>
            <div>
              <span>Data</span>
              <strong>{data}</strong>
              {dados.atualizada_em && <small>Atualizada em {formatarData(dados.atualizada_em)}</small>}
            </div>
            <div>
              <span>Consultor</span>
              <strong>{consultor?.nome}</strong>
            </div>
            <div className="div-logo">
              <img src="/propostas/executive-search/logo-divisao.png" alt="Ocean Talent Solutions — Executive Search" />
            </div>
          </div>
        </div>
      </header>

      <nav aria-label="Seções">
        <div className="wrap">
          <a href="#servico">Serviço</a>
          <a href="#metodologia">Metodologia</a>
          <a href="#investimento">Investimento</a>
          <a href="#garantias">Garantias e condições</a>
          <a href="#contato">Contato</a>
        </div>
      </nav>

      <main className="wrap">
        <section id="servico">
          <div className="head">
            <h2>Serviço</h2>
          </div>
          <p className="lead">
            Desenvolvemos inteligência de mercado e encontramos os profissionais que fazem a diferença, do especialista
            técnico ao C-level. Nosso processo vai além da captação de currículos: mapeamos o mercado ativamente, abordamos
            os profissionais mais aderentes ao desafio da sua empresa, checamos referências e mitigamos riscos de
            engajamento, garantindo uma contratação assertiva.
          </p>
        </section>

        <section id="metodologia">
          <div className="head">
            <h2>Metodologia</h2>
          </div>
          <div className="steps">
            {PASSOS.map((passo, i) => (
              <div className="step" key={passo.titulo}>
                <div className="hd">
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{passo.titulo}</h3>
                </div>
                <ul>
                  {passo.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="investimento">
          <div className="head">
            <h2>Investimento</h2>
          </div>
          <div className="invest">
            <div className="pos">
              <h3>{dados.projeto_nome}</h3>
              <div className="plans">
                {(dados.investimentos ?? []).map((inv) => (
                  <article className="plan" key={inv.tipo}>
                    <h4>{rotuloTipo(inv.tipo)}</h4>
                    <dl>
                      <div>
                        <dt>Taxa</dt>
                        <dd className="rate">{formatarTaxa(inv)}</dd>
                      </div>
                      <div>
                        <dt>Forma de pagamento</dt>
                        <dd>{formatarPagamento(inv.entrada)}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="notes">
            <h4>Observações</h4>
            <ul>
              <li>Remuneração anual inclui 13º salário, adicional de férias e bônus (se aplicável);</li>
              <li>
                A parcela inicial será calculada com base na remuneração estimada. A parcela final será calculada com base
                na remuneração praticada, descontando-se a parcela inicial;
              </li>
              <li>Valor mínimo de R$ 15.000,00 por projeto;</li>
              <li>Impostos (até 19,55%) serão adicionados a todos os valores informados.</li>
            </ul>
          </div>
        </section>

        <section id="garantias">
          <div className="head">
            <h2>Garantias e condições</h2>
          </div>
          <dl className="info">
            <div>
              <dt>Shortlist:</dt>
              <dd>3 a 5 candidatos</dd>
            </div>
            <div>
              <dt>SLA:</dt>
              <dd>5 a 10 dias úteis</dd>
            </div>
            <div>
              <dt>Garantia:</dt>
              <dd>{formatarGarantia(dados.garantia_meses)}</dd>
            </div>
          </dl>
          <div className="notes">
            <h4>Observações</h4>
            <ul>
              <li>Prazo de garantia para reposição caso o candidato contratado deixe a empresa (sem custo adicional);</li>
              <li>A Ocean não abordará profissionais do cliente por 12 meses após a última posição atendida;</li>
              <li>O cliente deverá reembolsar a Ocean se contratar candidatos apresentados em até 12 meses.</li>
            </ul>
          </div>
        </section>

        <section className="next" id="proximos-passos">
          <div className="head">
            <h2>Vamos avançar?</h2>
          </div>
          <p>
            Agradecemos o seu interesse e nos colocamos à disposição para eventuais esclarecimentos ou negociações.
            Esperamos desenvolver uma parceria de longo prazo!
          </p>
          <p>Esta proposta é válida até {formatarDataISO(dados.validade)}.</p>
          {assinatura && aceitaEm && (
            <p className="aceita">
              Proposta aceita em {aceitaEm.data} às {aceitaEm.hora} por {assinatura.nome}.
            </p>
          )}
          <div className="cta">
            {dados.pode_assinar && (
              <button type="button" className="btn btn-primary js-accept" onClick={abrirAceite}>
                Aceitar proposta
              </button>
            )}
            <a className="btn btn-secondary js-consultant" href={linkWhatsApp} target="_blank" rel="noopener">
              Falar com o consultor
            </a>
            <button type="button" className="btn btn-secondary js-pdf" onClick={baixarPdf}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v12" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
              <span>Baixar PDF</span>
            </button>
          </div>
        </section>

        <div className="contact inv" id="contato">
          <div>
            <h2>{consultor?.nome}</h2>
            <p>{consultor?.cargo}</p>
          </div>
          <ul>
            <li>
              <span>Telefone</span>
              <a href={`tel:+${telefoneDigitos}`}>{consultor?.telefone}</a>
            </li>
            <li>
              <span>E-mail</span>
              <a href={`mailto:${consultor?.email ?? ''}`}>{consultor?.email}</a>
            </li>
            <li>
              <span>LinkedIn</span>
              <a href="https://www.linkedin.com/company/ocean-talent-solutions/">/company/ocean-talent-solutions</a>
            </li>
            <li>
              <span>Site</span>
              <a href="https://www.oceantalentsolutions.com">www.oceantalentsolutions.com</a>
            </li>
          </ul>
        </div>
      </main>

      <footer>
        <div className="wrap">Ocean Talent Solutions · Proposta comercial · {data}</div>
      </footer>

      <dialog id="accept-dialog" aria-labelledby="accept-title" ref={dialogo} onClose={aoFecharDialogo}>
        <h3 id="accept-title">Aceitar proposta</h3>
        <p id="accept-text">
          Ao confirmar, registramos o aceite da proposta comercial e encaminhamos você para o contrato.
        </p>
        <form onSubmit={confirmar} noValidate>
          {!aceito && (
            <div className="campos">
              <div>
                <label htmlFor="accept-nome">Nome completo</label>
                <input
                  id="accept-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  maxLength={255}
                />
              </div>
              <div>
                <label htmlFor="accept-email">E-mail</label>
                <input
                  id="accept-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  maxLength={255}
                />
              </div>
              <label className="check">
                <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
                <span>Li e aceito os termos desta proposta</span>
              </label>
            </div>
          )}
          {mensagem && (
            <p className={`msg ${mensagem.tipo}`} id="accept-msg" role="status">
              {mensagem.texto}
            </p>
          )}
          <div className="actions">
            {!aceito && (
              <button type="submit" className="btn btn-primary" id="accept-confirm" disabled={enviando}>
                Confirmar aceite
              </button>
            )}
            <button type="button" className="btn btn-secondary" id="accept-cancel" onClick={fecharAceite}>
              {aceito ? 'Fechar' : 'Cancelar'}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
