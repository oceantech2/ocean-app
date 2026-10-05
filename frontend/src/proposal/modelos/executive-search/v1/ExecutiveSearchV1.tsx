import { FormEvent, useEffect, useRef, useState } from 'react';
import { assinarPublica } from '../../../services/proposalApi';
import { dataHoraSP, EMAIL_RE, formatarDataISO, formatarDataSP, formatarTaxa } from '../../formatacao';
import { idiomaDaMoeda } from '../../idioma';
import type { ModeloPaginaProps } from '../../index';
import EscopoRico from '../../EscopoRico';
import { fotoSetor } from '../../setores';
import { textosES } from './i18n';
import { recursosDaVersao } from './versoes';
import './executive-search-v1.css';

const MSG_VERSAO_DESATUALIZADA = 'Esta proposta foi atualizada';

type Mensagem = { texto: string; tipo: 'ok' | 'err' } | null;

export default function ExecutiveSearchV1({ dados, codigo, onRecarregar }: ModeloPaginaProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [aceite, setAceite] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem>(null);
  const [enviando, setEnviando] = useState(false);
  const [aceito, setAceito] = useState(false);

  const moeda = dados.moeda ?? 'BRL';
  const idioma = idiomaDaMoeda(moeda);
  const t = textosES(idioma);
  const recursos = recursosDaVersao(dados.modelo_versao);
  const tituloServico = recursos.tituloDivisao ? t.servico.tituloDivisao : t.nav.servico;
  const escopo = recursos.escopo && dados.projeto_escopo ? dados.projeto_escopo : null;
  const consultor = dados.consultor;
  const cliente = dados.cliente_nome ?? '';
  const data = formatarDataISO(dados.data_proposta, idioma);
  const telefoneDigitos = consultor?.telefone_digitos ?? '';
  const linkWhatsApp = `https://wa.me/${telefoneDigitos}?text=` + encodeURIComponent(t.whatsapp.mensagem(cliente));

  useEffect(() => {
    const tituloAnterior = document.title;
    const langAnterior = document.documentElement.lang;
    document.title = t.pagina.titulo;
    document.documentElement.lang = t.pagina.lang;
    const restaurar = () => {
      document.title = t.pagina.titulo;
    };
    window.addEventListener('afterprint', restaurar);
    return () => {
      window.removeEventListener('afterprint', restaurar);
      document.title = tituloAnterior;
      document.documentElement.lang = langAnterior;
    };
  }, [t]);

  const baixarPdf = () => {
    document.title = t.pdf.nomeArquivo(cliente);
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
    if (nome.trim().length < 3) return setMensagem({ texto: t.aceite.erroNome, tipo: 'err' });
    if (!EMAIL_RE.test(email.trim())) return setMensagem({ texto: t.aceite.erroEmail, tipo: 'err' });
    if (!aceite) return setMensagem({ texto: t.aceite.erroAceite, tipo: 'err' });

    setEnviando(true);
    setMensagem(null);
    try {
      await assinarPublica(codigo, { nome: nome.trim(), email: email.trim(), aceite, versao: dados.versao });
      setAceito(true);
      setMensagem({ texto: t.aceite.sucesso, tipo: 'ok' });
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 409 && typeof detail === 'string' && detail.startsWith(MSG_VERSAO_DESATUALIZADA)) {
        setMensagem({ texto: t.aceite.versaoAtualizada, tipo: 'err' });
        onRecarregar();
      } else if (status === 409 || status === 404) {
        fecharAceite();
        onRecarregar();
      } else {
        setMensagem({ texto: t.aceite.erro, tipo: 'err' });
      }
    } finally {
      setEnviando(false);
    }
  };

  const assinatura = dados.status === 'assinada' && dados.assinatura ? dados.assinatura : null;
  const aceitaEm = assinatura ? dataHoraSP(assinatura.assinada_em, idioma) : null;

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
            {t.capa.titulo[0]}
            <br />
            {t.capa.titulo[1]}
          </h1>
          <div className="meta">
            <div>
              <span>{t.capa.preparadaPara}</span>
              <strong>{cliente}</strong>
            </div>
            <div>
              <span>{t.capa.data}</span>
              <strong>{data}</strong>
              {dados.atualizada_em && <small>{t.capa.atualizadaEm(formatarDataSP(dados.atualizada_em, idioma))}</small>}
            </div>
            <div>
              <span>{t.capa.consultor}</span>
              <strong>{consultor?.nome}</strong>
            </div>
            <div className="div-logo">
              <img src="/propostas/executive-search/logo-divisao.png" alt={t.capa.logoAlt} />
            </div>
          </div>
        </div>
      </header>

      <nav aria-label={t.pagina.navegacao}>
        <div className="wrap">
          <a href="#servico">{tituloServico}</a>
          <a href="#metodologia">{t.nav.metodologia}</a>
          {escopo && <a href="#escopo">{t.nav.escopo}</a>}
          <a href="#investimento">{t.nav.investimento}</a>
          <a href="#garantias">{t.nav.garantias}</a>
          <a href="#contato">{t.nav.contato}</a>
        </div>
      </nav>

      <main className="wrap">
        <section id="servico">
          <div className="head">
            <h2>{tituloServico}</h2>
          </div>
          <p className="lead">{t.servico.texto}</p>
        </section>

        <section id="metodologia">
          <div className="head">
            <h2>{t.nav.metodologia}</h2>
          </div>
          <div className="steps">
            {t.metodologia.passos.map((passo, i) => (
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

        {escopo && (
          <section id="escopo">
            <div className="head">
              <h2>{t.nav.escopo}</h2>
            </div>
            <div className="scope">
              <EscopoRico html={escopo} />
            </div>
          </section>
        )}

        <section id="investimento">
          <div className="head">
            <h2>{t.nav.investimento}</h2>
          </div>
          <div className="invest">
            <div className="pos">
              <h3>{dados.projeto_nome}</h3>
              <div className="plans">
                {(dados.investimentos ?? []).map((inv) => (
                  <article className="plan" key={inv.tipo}>
                    <h4>{t.investimento.tipos[inv.tipo]}</h4>
                    <dl>
                      <div>
                        <dt>{t.investimento.taxa}</dt>
                        <dd className="rate">{formatarTaxa(inv, { idioma, moeda })}</dd>
                      </div>
                      <div>
                        <dt>{t.investimento.pagamento}</dt>
                        <dd>
                          {inv.entrada
                            ? t.investimento.comEntrada(inv.entrada, 100 - inv.entrada)
                            : t.investimento.semEntrada}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="notes">
            <h4>{t.investimento.observacoesTitulo}</h4>
            <ul>
              {t.investimento.observacoes.map((obs) => (
                <li key={obs}>{obs}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="garantias">
          <div className="head">
            <h2>{t.nav.garantias}</h2>
          </div>
          <dl className="info">
            <div>
              <dt>{t.garantias.shortlist}</dt>
              <dd>{t.garantias.shortlistValor}</dd>
            </div>
            <div>
              <dt>{t.garantias.sla}</dt>
              <dd>{t.garantias.slaValor}</dd>
            </div>
            <div>
              <dt>{t.garantias.garantia}</dt>
              <dd>{dados.garantia_meses ? t.garantias.meses(dados.garantia_meses) : '—'}</dd>
            </div>
          </dl>
          <div className="notes">
            <h4>{t.investimento.observacoesTitulo}</h4>
            <ul>
              {t.garantias.observacoes.map((obs) => (
                <li key={obs}>{obs}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="next" id="proximos-passos">
          <div className="head">
            <h2>{t.proximos.titulo}</h2>
          </div>
          <p>{t.proximos.texto}</p>
          <p>{t.proximos.validadeAte(formatarDataISO(dados.validade, idioma))}</p>
          {assinatura && aceitaEm && (
            <p className="aceita">{t.proximos.aceitaEm(aceitaEm.data, aceitaEm.hora, assinatura.nome)}</p>
          )}
          <div className="cta">
            {dados.pode_assinar && (
              <button type="button" className="btn btn-primary js-accept" onClick={abrirAceite}>
                {t.proximos.aceitar}
              </button>
            )}
            <a className="btn btn-secondary js-consultant" href={linkWhatsApp} target="_blank" rel="noopener">
              {t.proximos.falarConsultor}
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
              <span>{t.proximos.baixarPdf}</span>
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
              <span>{t.contato.telefone}</span>
              <a href={`tel:+${telefoneDigitos}`}>{consultor?.telefone}</a>
            </li>
            <li>
              <span>{t.contato.email}</span>
              <a href={`mailto:${consultor?.email ?? ''}`}>{consultor?.email}</a>
            </li>
            <li>
              <span>{t.contato.linkedin}</span>
              <a href="https://www.linkedin.com/company/ocean-talent-solutions/">/company/ocean-talent-solutions</a>
            </li>
            <li>
              <span>{t.contato.site}</span>
              <a href="https://www.oceantalentsolutions.com">www.oceantalentsolutions.com</a>
            </li>
          </ul>
        </div>
      </main>

      <footer>
        <div className="wrap">{t.rodape.texto(data)}</div>
      </footer>

      <dialog id="accept-dialog" aria-labelledby="accept-title" ref={dialogo} onClose={aoFecharDialogo}>
        <h3 id="accept-title">{t.aceite.titulo}</h3>
        <p id="accept-text">{t.aceite.texto}</p>
        <form onSubmit={confirmar} noValidate>
          {!aceito && (
            <div className="campos">
              <div>
                <label htmlFor="accept-nome">{t.aceite.nome}</label>
                <input
                  id="accept-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  maxLength={255}
                />
              </div>
              <div>
                <label htmlFor="accept-email">{t.aceite.email}</label>
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
                <span>{t.aceite.declaracao}</span>
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
                {t.aceite.confirmar}
              </button>
            )}
            <button type="button" className="btn btn-secondary" id="accept-cancel" onClick={fecharAceite}>
              {aceito ? t.aceite.fechar : t.aceite.cancelar}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
