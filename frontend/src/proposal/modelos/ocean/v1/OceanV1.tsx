import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { urlSite } from '../../../dominios';
import { assinarPublica } from '../../../services/proposalApi';
import type { PropostaPublicaData, ServicoId } from '../../../services/proposalApi';
import { dataHoraSP, EMAIL_RE, formatarDataISO, formatarPercentual, formatarTaxa } from '../../formatacao';
import { projetosDaProposta } from '../../formatoProposta';
import { idiomaDaProposta } from '../../idioma';
import EscopoRico from '../../EscopoRico';
import { textosPagina } from '../../pagina/i18n';
import { fotoSetor } from '../../setores';
import type { ModeloPaginaProps } from '../../index';
import { LogoOcean, SimboloOcean } from './brand';
import { observacoesPadrao, ordenarServicos, preencherImposto, preencherTexto, SERVICOS, UI } from './conteudo';
import './pagina-ocean.css';

const MSG_VERSAO_DESATUALIZADA = 'Esta proposta foi atualizada';

type Mensagem = { texto: string; tipo: 'ok' | 'err' } | null;

// Propostas emitidas antes do modelo Ocean não gravam serviços: vale o serviço da divisão antiga
const SERVICOS_DO_MODELO_LEGADO: Record<string, ServicoId[]> = {
  'executive-search': ['recrutamento-e-selecao'],
  outsourcing: ['recrutamento-e-selecao'],
  'offshore-talent': ['recrutamento-e-selecao'],
  'outplacement-development': ['outplacement'],
};

function servicosDaProposta(dados: PropostaPublicaData): ServicoId[] {
  const escolhidos = ordenarServicos(dados.servicos);
  if (escolhidos.length > 0) return escolhidos;
  return SERVICOS_DO_MODELO_LEGADO[dados.modelo ?? ''] ?? [];
}

// Observação em branco some; {imposto} vira o percentual gravado na proposta (ex.: "18,75%")
function limparObservacoes(lista: string[] | null | undefined, imposto: string): string[] {
  return (lista ?? []).map((s) => preencherImposto(String(s).trim(), imposto)).filter(Boolean);
}

export default function OceanV1({ dados, codigo, onRecarregar }: ModeloPaginaProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [aceite, setAceite] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem>(null);
  const [enviando, setEnviando] = useState(false);
  const [aceito, setAceito] = useState(false);
  const [fotoFalhou, setFotoFalhou] = useState(false);

  const moeda = dados.moeda ?? 'BRL';
  const idioma = idiomaDaProposta(dados);
  const t = UI[idioma];
  const p = textosPagina(idioma);
  const cliente = dados.cliente_nome ?? '';
  const consultor = dados.consultor;
  const data = formatarDataISO(dados.data_proposta, idioma);
  const telefoneDigitos = consultor?.telefone_digitos ?? '';
  const tituloDocumento = `${t.docTitle}${cliente ? ` - ${cliente}` : ''}`;

  const servicos = useMemo(() => servicosDaProposta(dados), [dados]);
  const projetos = projetosDaProposta(dados).filter((pr) => pr.nome || pr.investimentos.length > 0);

  // Foto do setor, exceto "outros" (e setor ausente): capa lisa com o símbolo como marca d'água
  const foto = dados.setor && !fotoFalhou ? fotoSetor(dados.setor) : '';

  // {imposto}: percentual da proposta (imposto_percentual; nulo = 19,55% das propostas antigas) + "%"
  const imposto = `${formatarPercentual(dados.imposto_percentual, idioma)}%`;
  const observacoes = useMemo(() => {
    const padrao = observacoesPadrao(servicos, idioma);
    return {
      investimento: limparObservacoes(dados.observacoes_investimento ?? padrao.investimento, imposto),
      garantias: limparObservacoes(dados.observacoes_garantias ?? padrao.garantias, imposto),
    };
  }, [dados.observacoes_investimento, dados.observacoes_garantias, servicos, idioma, imposto]);

  const escopo = (dados.projeto_escopo ?? '').trim();
  const temEscopo = escopo.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() !== '';

  const linhasGarantias = [
    { rotulo: t.shortlist, valor: dados.shortlist ?? '' },
    { rotulo: t.sla, valor: dados.sla ?? '' },
    { rotulo: t.guarantee, valor: dados.garantia ?? '' },
  ].filter((linha) => linha.valor.trim());
  const temGarantias = linhasGarantias.length > 0 || observacoes.garantias.length > 0;

  const pagamento = (entrada: number | null | undefined) => {
    const e = entrada ?? 0;
    if (e >= 100) return t.payUpfront;
    if (e <= 0) return t.payEnd;
    const num = (n: number) => n.toLocaleString(idioma, { maximumFractionDigits: 2 });
    return preencherTexto(t.paySplit, { a: num(e), b: num(100 - e) });
  };

  const linkWhatsApp = `https://wa.me/${telefoneDigitos}?text=` + encodeURIComponent(preencherTexto(t.whats, { c: cliente }));
  const [validadeAntes, validadeDepois] = t.validUntil.split('{d}');

  useEffect(() => {
    const tituloAnterior = document.title;
    const langAnterior = document.documentElement.lang;
    document.title = tituloDocumento;
    document.documentElement.lang = p.pagina.lang;
    const restaurar = () => {
      document.title = tituloDocumento;
    };
    window.addEventListener('afterprint', restaurar);
    return () => {
      window.removeEventListener('afterprint', restaurar);
      document.title = tituloAnterior;
      document.documentElement.lang = langAnterior;
    };
  }, [tituloDocumento, p]);

  const baixarPdf = () => {
    document.title = tituloDocumento;
    window.print();
  };

  // Link "Baixar PDF" do e-mail de aceite: imprime uma vez e tira o parâmetro para recarregar não repetir
  const pdfPendente = useRef(new URLSearchParams(window.location.search).get('pdf') === '1');
  const baixarPdfRef = useRef(baixarPdf);
  baixarPdfRef.current = baixarPdf;
  useEffect(() => {
    if (!pdfPendente.current) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('pdf');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    const timer = window.setTimeout(() => {
      pdfPendente.current = false;
      baixarPdfRef.current();
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

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
    if (nome.trim().length < 3) return setMensagem({ texto: p.aceite.erroNome, tipo: 'err' });
    if (!EMAIL_RE.test(email.trim())) return setMensagem({ texto: p.aceite.erroEmail, tipo: 'err' });
    if (!aceite) return setMensagem({ texto: p.aceite.erroAceite, tipo: 'err' });

    setEnviando(true);
    setMensagem(null);
    try {
      await assinarPublica(codigo, { nome: nome.trim(), email: email.trim(), aceite, versao: dados.versao });
      setAceito(true);
      setMensagem({ texto: p.aceite.sucesso, tipo: 'ok' });
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 409 && typeof detail === 'string' && detail.startsWith(MSG_VERSAO_DESATUALIZADA)) {
        setMensagem({ texto: p.aceite.versaoAtualizada, tipo: 'err' });
        onRecarregar();
      } else if (status === 409 || status === 404) {
        fecharAceite();
        onRecarregar();
      } else {
        setMensagem({ texto: p.aceite.erro, tipo: 'err' });
      }
    } finally {
      setEnviando(false);
    }
  };

  const assinatura = dados.status === 'assinada' && dados.assinatura ? dados.assinatura : null;
  const aceitaEm = assinatura ? dataHoraSP(assinatura.assinada_em, idioma) : null;

  return (
    <div className="tpl-ocean">
      {/* A tabela .pf repete thead/tfoot em toda página impressa: são as margens do PDF (@page{margin:0}) */}
      <table className="pf">
        <thead>
          <tr>
            <td>
              <div className="pf__sp" />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <header className={`cover${foto ? '' : ' cover--plain'}`}>
                {foto ? (
                  <>
                    <img
                      className="cover__bg"
                      alt=""
                      aria-hidden="true"
                      src={foto}
                      onError={() => setFotoFalhou(true)}
                    />
                    <span className="cover__tint" />
                  </>
                ) : (
                  <SimboloOcean className="cover__wm" />
                )}
                <div className="wrap cover__in">
                  <div className="cover__logo">
                    <LogoOcean variante="negative" altura={30} />
                  </div>
                  <h1>
                    {t.title[0]}
                    <br />
                    {t.title[1]}
                  </h1>
                  <div className="meta">
                    <div>
                      <span>{t.for}</span>
                      <strong>{cliente}</strong>
                    </div>
                    <div>
                      <span>{t.date}</span>
                      <strong>{data}</strong>
                    </div>
                    <div>
                      <span>{t.consultant}</span>
                      <strong>{consultor?.nome}</strong>
                    </div>
                  </div>
                </div>
              </header>

              <nav className="nav no-print" aria-label={p.pagina.navegacao}>
                <div className="wrap">
                  {servicos.map((id) => (
                    <a key={id} href={`#${id}`}>
                      {SERVICOS[id].textos[idioma].title}
                    </a>
                  ))}
                  {temEscopo && <a href="#escopo">{t.scope}</a>}
                  <a href="#investimento">{t.invest}</a>
                  {temGarantias && <a href="#garantias">{t.terms}</a>}
                  <a href="#contato">{t.contact}</a>
                </div>
              </nav>

              <main className="wrap">
                {servicos.map((id) => {
                  const servico = SERVICOS[id];
                  const c = servico.textos[idioma];
                  const passos = c.steps ?? [];
                  return (
                    <section className="svc" id={id} key={id}>
                      <div className="svc__head">
                        <h2>{c.title}</h2>
                        <p className="tagline">{c.tagline}</p>
                      </div>
                      <p className="lead">{c.text}</p>
                      {servico.layout === 'steps' ? (
                        <>
                          <div className="eyebrow">{t.method}</div>
                          <ol className={`steps steps--${passos.length}`}>
                            {passos.map((passo, i) => (
                              <li className="step" key={passo.title}>
                                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                                <h4>{passo.title}</h4>
                                <ul>
                                  {passo.items.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ol>
                        </>
                      ) : (
                        <div className="cols">
                          {(c.cols ?? []).map((coluna) => (
                            <div className="col" key={coluna.title}>
                              <h4>{coluna.title}</h4>
                              <ul>
                                {coluna.items.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}

                {temEscopo && (
                  <section className="block" id="escopo">
                    <h2 className="h2">{t.scope}</h2>
                    <div className="scope">
                      <EscopoRico html={escopo} />
                    </div>
                  </section>
                )}

                <section className="block" id="investimento">
                  <h2 className="h2">{t.invest}</h2>
                  <div className="invest">
                    {projetos.map((projeto, i) => {
                      const planos = projeto.investimentos;
                      const colunas = Math.min(Math.max(planos.length, 1), 3);
                      return (
                        <div className={`pos pos--${colunas}`} key={i}>
                          <h3>{projeto.nome}</h3>
                          <div className={`plans plans--${Math.max(planos.length, 1)}`}>
                            {planos.map((inv) => (
                              <article className="plan" key={inv.tipo}>
                                <h4>{t.types[inv.tipo] ?? inv.tipo}</h4>
                                <dl>
                                  <div>
                                    <dt>{t.rate}</dt>
                                    <dd className="rate">{formatarTaxa(inv, { idioma, moeda })}</dd>
                                    {inv.taxa_tipo === 'percentual' && <dd className="rate-sub">{t.rateSub}</dd>}
                                  </div>
                                  <div>
                                    <dt>{t.payment}</dt>
                                    <dd>{pagamento(inv.entrada)}</dd>
                                  </div>
                                </dl>
                              </article>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {observacoes.investimento.length > 0 && (
                    <div className="notes">
                      <h4>{t.notes}</h4>
                      <ul>
                        {observacoes.investimento.map((obs) => (
                          <li key={obs}>{obs}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                {temGarantias && (
                  <section className="block" id="garantias">
                    <h2 className="h2">{t.terms}</h2>
                    <div
                      className={`terms${linhasGarantias.length > 0 && observacoes.garantias.length > 0 ? ' terms--2' : ''}`}
                    >
                      {linhasGarantias.length > 0 && (
                        <dl className="info">
                          {linhasGarantias.map((linha) => (
                            <div key={linha.rotulo}>
                              <dt>{linha.rotulo}</dt>
                              <dd>{linha.valor}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      {observacoes.garantias.length > 0 && (
                        <div className="notes">
                          <h4>{t.notes}</h4>
                          <ul>
                            {observacoes.garantias.map((obs) => (
                              <li key={obs}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <section className="block close" id="contato">
                  <h2 className="h2">{t.next}</h2>
                  <p>{t.nextText}</p>
                  <p className="validity">
                    {validadeAntes}
                    <strong>{formatarDataISO(dados.validade, idioma)}</strong>
                    {validadeDepois}
                  </p>
                  {assinatura && aceitaEm && (
                    <p className="aceita">{p.proximos.aceitaEm(aceitaEm.data, aceitaEm.hora, assinatura.nome)}</p>
                  )}
                  <div className="cta no-print">
                    {dados.pode_assinar && (
                      <button type="button" className="btn btn-primary js-accept" onClick={abrirAceite}>
                        {t.accept}
                      </button>
                    )}
                    {telefoneDigitos && (
                      <a className="btn btn-secondary js-consultant" href={linkWhatsApp} target="_blank" rel="noopener">
                        {t.talk}
                      </a>
                    )}
                    <button type="button" className="btn btn-secondary js-pdf" onClick={baixarPdf}>
                      {t.pdf}
                    </button>
                  </div>
                  <div className="contact">
                    <SimboloOcean className="contact__wm" />
                    <div className="contact__who">
                      <h3>{consultor?.nome}</h3>
                      <p>{consultor?.cargo}</p>
                    </div>
                    <ul className="contact__list">
                      {consultor?.telefone && (
                        <li>
                          <span>{t.phone}</span>
                          <a href={`tel:+${telefoneDigitos}`}>{consultor.telefone}</a>
                        </li>
                      )}
                      {consultor?.email && (
                        <li>
                          <span>{t.email}</span>
                          <a href={`mailto:${consultor.email}`}>{consultor.email}</a>
                        </li>
                      )}
                      <li>
                        <span>{t.linkedin}</span>
                        <a href="https://www.linkedin.com/company/ocean-talent-solutions/">/company/ocean-talent-solutions</a>
                      </li>
                      <li>
                        <span>{t.site}</span>
                        <a href={urlSite()}>{new URL(urlSite()).host}</a>
                      </li>
                    </ul>
                  </div>
                </section>

                <footer className="foot">
                  <span>
                    <LogoOcean variante="positive" altura={13} />
                  </span>
                  <span>
                    Ocean Talent Solutions · {t.footer} · {data}
                  </span>
                </footer>
              </main>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
              <div className="pf__sp" />
            </td>
          </tr>
        </tfoot>
      </table>

      <dialog id="accept-dialog" aria-labelledby="accept-title" ref={dialogo} onClose={aoFecharDialogo}>
        <h3 id="accept-title">{t.acceptTitle}</h3>
        <p id="accept-text">{t.acceptText}</p>
        <form onSubmit={confirmar} noValidate>
          {!aceito && (
            <div className="campos">
              <div>
                <label htmlFor="accept-nome">{p.aceite.nome}</label>
                <input
                  id="accept-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  maxLength={255}
                />
              </div>
              <div>
                <label htmlFor="accept-email">{p.aceite.email}</label>
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
                <span>{p.aceite.declaracao}</span>
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
                {t.acceptConfirm}
              </button>
            )}
            <button type="button" className="btn btn-secondary" id="accept-cancel" onClick={fecharAceite}>
              {aceito ? p.aceite.fechar : t.cancel}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
