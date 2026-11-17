import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BOTAO } from '../classes';
import Revelar from '../components/Revelar';
import {
  CONTATO,
  DIFERENCIAIS,
  FRENTES,
  HASH_LISTA_SOLUCOES,
  HASH_SOLUCAO,
  HASH_SOLUCAO_LEGADO,
  ICONE_SOLUCAO,
  INTRO_SOLUCOES,
  SETORES,
  SOLUCOES,
  type IdSolucao,
  type Solucao,
} from '../dados/conteudo';
import { IconeEmail, IconeMensagem, IconeSeta } from '../icones';
import { useIdioma } from '../idioma';

const TEXTOS = {
  pt: {
    heroRotulo: 'Portfólio',
    heroTitulo: 'Soluções para toda a cadeia de capital humano.',
    heroTexto: 'Entregamos soluções personalizadas, com agilidade, visão estratégica e compromisso com a qualidade.',
    heroImagem: 'Executivos conversando em um escritório moderno',
    verDetalhes: 'Ver detalhes →',
    fechar: '← Fechar',
    frentes: 'Atuamos com excelência nas seguintes frentes',
    setoresRotulo: 'Ecossistemas estratégicos',
    setoresTitulo: 'Setores que atendemos',
    setorImagem: 'Panorama de operações de energia, infraestrutura e mineração',
    porQue: 'Por que escolher a Ocean',
    ctaTitulo: 'Pronto para iniciar um projeto?',
    ctaTexto: 'Fale com um dos nossos consultores e entenda como a Ocean pode ajudar a impulsionar o seu negócio.',
    falarConsultor: 'Falar com um consultor',
    verVagas: 'Ver nossas vagas',
    listaSolucoes: 'Soluções',
  },
  en: {
    heroRotulo: 'Portfolio',
    heroTitulo: 'Solutions for the entire human capital chain.',
    heroTexto: 'We deliver tailored solutions with agility, strategic vision and a commitment to quality.',
    heroImagem: 'Executives talking in a modern office',
    verDetalhes: 'See details →',
    fechar: '← Close',
    frentes: 'We excel in the following areas',
    setoresRotulo: 'Strategic ecosystems',
    setoresTitulo: 'Sectors we serve',
    setorImagem: 'Panorama of energy, infrastructure and mining operations',
    porQue: 'Why choose Ocean',
    ctaTitulo: 'Ready to start a project?',
    ctaTexto: 'Talk to one of our consultants and discover how Ocean can help boost your business.',
    falarConsultor: 'Talk to a consultant',
    verVagas: 'View our jobs',
    listaSolucoes: 'Solutions',
  },
};

function idDoHash(hash: string): IdSolucao | undefined {
  const raw = hash.replace(/^#/, '');
  if (!raw || raw === HASH_LISTA_SOLUCOES) return undefined;
  const direto = SOLUCOES.find((s) => HASH_SOLUCAO[s.id] === raw || s.id === raw);
  if (direto) return direto.id;
  return HASH_SOLUCAO_LEGADO[raw];
}

function Gaveta({ solucao, aberta, onFechar }: { solucao: Solucao; aberta: boolean; onFechar: () => void }) {
  const { idioma, caminho } = useIdioma();
  const t = TEXTOS[idioma];

  useEffect(() => {
    if (!aberta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberta]);

  if (!aberta) return null;

  return (
    <section
      id={HASH_SOLUCAO[solucao.id]}
      className="drw"
      style={{ display: 'block' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`titulo-${solucao.id}`}
    >
      <Link to={caminho('solucoes', HASH_LISTA_SOLUCOES)} className="bg" aria-label={t.fechar} onClick={onFechar} replace />
      <div className="bx">
        <Link to={caminho('solucoes', HASH_LISTA_SOLUCOES)} className="x" onClick={onFechar} replace>
          {t.fechar}
        </Link>
        <div className="v2">
          <h2 id={`titulo-${solucao.id}`}>{solucao.titulo[idioma]}</h2>
          <p className="sub">{solucao.lead[idioma]}</p>
          <div className="txt">
            <p>{solucao.texto[idioma]}</p>
          </div>
          {solucao.rotuloEtapas && <p className="rot">{solucao.rotuloEtapas[idioma]}</p>}
          <div className="tl tl-v">
            <ol className="tl-rail">
              {solucao.etapas.map((etapa) => (
                <li key={etapa.titulo.pt}>
                  <div className="tl-st">
                    {etapa.numero && <span className="tl-n">{etapa.numero}</span>}
                    <span className="tl-t">{etapa.titulo[idioma]}</span>
                  </div>
                  <ul className="tl-sub">
                    {etapa.itens[idioma].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function SeletorSolucoes() {
  const { idioma, caminho } = useIdioma();
  const navigate = useNavigate();
  const t = TEXTOS[idioma];
  const [ativa, setAtiva] = useState(0);

  return (
    <div className="se js">
      <nav aria-label={t.listaSolucoes}>
        {SOLUCOES.map((s, i) => {
          const Icone = ICONE_SOLUCAO[s.id];
          return (
            <a
              key={s.id}
              href={`#${HASH_SOLUCAO[s.id]}`}
              className={i === ativa ? 'on' : undefined}
              onMouseEnter={() => setAtiva(i)}
              onFocus={() => setAtiva(i)}
              onClick={(e) => {
                e.preventDefault();
                setAtiva(i);
                navigate(caminho('solucoes', HASH_SOLUCAO[s.id]));
              }}
            >
              <span className="ic" aria-hidden="true">
                <Icone />
              </span>
              <span>{s.titulo[idioma]}</span>
            </a>
          );
        })}
      </nav>
      <div>
        {SOLUCOES.map((s, i) => {
          const Icone = ICONE_SOLUCAO[s.id];
          return (
            <div key={s.id} className={`pv${i === ativa ? ' on' : ''}`}>
              <span className="ic" aria-hidden="true">
                <Icone />
              </span>
              <h3>{s.titulo[idioma]}</h3>
              <p className="lead">{s.lead[idioma]}</p>
              <p className="short">{s.short[idioma]}</p>
              <Link className="go" to={caminho('solucoes', HASH_SOLUCAO[s.id])}>
                {t.verDetalhes}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Setores() {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const cards = (duplicado: boolean) =>
    SETORES.map((s) => (
      <article key={`${duplicado ? 'dup-' : ''}${s.imagem}`} aria-hidden={duplicado || undefined} className="sector-card group shrink-0 rounded-[18px]">
        <div className="relative flex h-[260px] items-center justify-center">
          <img
            src={`/site/img/setores/${s.imagem}.webp`}
            alt={`${t.setorImagem}: ${s.nome[idioma]}`}
            loading="lazy"
            draggable={false}
            width={200}
            height={200}
            className="relative h-[200px] w-[200px] object-contain transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        </div>
        <div className="px-7 pt-2 pb-8">
          <h3 className="font-display text-2xl font-semibold text-primary-foreground">{s.nome[idioma]}</h3>
          <p className="mt-3 font-sans text-[15px] leading-[1.6] text-sector-text">{s.descricao[idioma]}</p>
        </div>
      </article>
    ));

  return (
    <section className="sector-deep-bg py-14 text-primary-foreground lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Revelar>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-sector-kicker">{t.setoresRotulo}</p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-primary-foreground sm:text-4xl lg:text-5xl">{t.setoresTitulo}</h2>
        </Revelar>
        <div className="sector-marquee mt-14">
          <div className="sector-marquee-track flex w-max">
            {cards(false)}
            {cards(true)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Solucoes() {
  const { idioma, caminho } = useIdioma();
  const t = TEXTOS[idioma];
  const { hash } = useLocation();
  const navigate = useNavigate();
  const aberta = idDoHash(hash);

  useEffect(() => {
    const legado = HASH_SOLUCAO_LEGADO[hash.slice(1)];
    if (!legado) return;
    navigate(caminho('solucoes', HASH_SOLUCAO[legado]), { replace: true });
  }, [hash, caminho, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberta) navigate(caminho('solucoes', HASH_LISTA_SOLUCOES), { replace: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberta, caminho, navigate]);

  return (
    <div className="bg-surface">
      <section className="relative isolate overflow-hidden bg-surface text-primary">
        <img
          src="/site/img/solucoes-hero.jpg"
          alt={t.heroImagem}
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_22%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-surface from-35% via-surface/90 to-surface/30" />
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
          <Revelar>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">{t.heroRotulo}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl text-primary sm:text-5xl">{t.heroTitulo}</h1>
            <p className="mt-6 max-w-2xl text-lg text-primary/70">{t.heroTexto}</p>
          </Revelar>
        </div>
      </section>

      <div className="v2 vb">
        <div id={HASH_LISTA_SOLUCOES} className="in">
          <div className="lede">
            <p className="i1">{INTRO_SOLUCOES.i1[idioma]}</p>
            <p className="i2">{INTRO_SOLUCOES.i2[idioma]}</p>
          </div>
          <SeletorSolucoes />
          <div className="fr">
            <h2>{t.frentes}</h2>
            <ul>
              {FRENTES.map((f) => (
                <li key={f.pt}>{f[idioma]}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {SOLUCOES.map((s) => (
        <Gaveta
          key={s.id}
          solucao={s}
          aberta={aberta === s.id}
          onFechar={() => navigate(caminho('solucoes', HASH_LISTA_SOLUCOES), { replace: true })}
        />
      ))}

      <Setores />

      <section className="bg-surface px-6 pb-0 pt-14 lg:px-10 lg:pb-4 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <Revelar>
            <h2 className="max-w-3xl font-display text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">{t.porQue}</h2>
          </Revelar>
          <div className="pq-tl">
            <ol>
              {DIFERENCIAIS.map((d, i) => (
                <li key={d.titulo.pt}>
                  <Revelar atraso={i * 0.05}>
                    <span className="pn">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{d.titulo[idioma]}</h3>
                    <p>{d.texto[idioma]}</p>
                  </Revelar>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-surface text-primary">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center lg:px-10 lg:py-24">
          <Revelar>
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">{t.ctaTitulo}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-body-gray">{t.ctaTexto}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={caminho('home', 'contato')} className={`${BOTAO} shadow h-10 rounded-md px-8 bg-accent text-accent-foreground hover:bg-accent/90`}>
                {t.falarConsultor}
              </Link>
              <Link
                to={caminho('vagas')}
                className={`${BOTAO} border shadow-sm h-10 rounded-md px-8 border-primary/30 bg-transparent text-primary hover:bg-primary/5 hover:text-primary`}
              >
                {t.verVagas}
                <IconeSeta className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-col items-center gap-3 text-sm text-body-gray">
              <a className="inline-flex items-center gap-3 hover:text-primary" href={CONTATO.telefoneLink}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                  <IconeMensagem className="h-4 w-4" />
                </span>
                <span>{CONTATO.telefone}</span>
              </a>
              <a className="inline-flex items-center gap-3 hover:text-primary" href={`mailto:${CONTATO.email}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                  <IconeEmail className="h-4 w-4" />
                </span>
                <span>{CONTATO.email}</span>
              </a>
            </div>
          </Revelar>
        </div>
      </section>
    </div>
  );
}
