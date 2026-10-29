import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BOTAO } from '../classes';
import Revelar from '../components/Revelar';
import {
  CONTATO,
  DIFERENCIAIS,
  ESTILO_SOLUCAO,
  HASH_SOLUCAO,
  ICONE_DIVISAO,
  METODOLOGIA,
  SETORES,
  SOLUCOES,
  type Grupo,
  type IdSolucao,
  type Solucao,
} from '../dados/conteudo';
import { IconeEmail, IconeMensagem, IconeSeta } from '../icones';
import { useIdioma } from '../idioma';

const TEXTOS = {
  pt: {
    servicos: 'Principais serviços',
    metodologia: 'Metodologia',
    areasCargos: 'Áreas e cargos',
    beneficios: 'Benefícios',
    navegacaoSolucoes: 'Navegação entre soluções',
    setoresRotulo: 'Ecossistemas estratégicos',
    setoresTitulo: 'Setores que atendemos',
    setorImagem: 'Panorama de operações de energia, infraestrutura e mineração',
    heroImagem: 'Executivos conversando em um escritório moderno',
    heroRotulo: 'Soluções',
    heroTitulo: 'Soluções para toda a cadeia de capital humano.',
    heroTexto:
      'Atração, desenvolvimento e desligamento: a Ocean atua em cada etapa do ciclo de pessoas para entregar resultado concreto ao seu negócio.',
    porQue: 'Por que escolher a Ocean',
    ctaTitulo: 'Pronto para iniciar um projeto?',
    ctaTexto: 'Fale com um dos nossos consultores e entenda como a Ocean pode ajudar a impulsionar o seu negócio.',
    falarConsultor: 'Falar com um consultor',
    verVagas: 'Ver nossas vagas',
  },
  en: {
    servicos: 'Key services',
    metodologia: 'Methodology',
    areasCargos: 'Areas and roles',
    beneficios: 'Benefits',
    navegacaoSolucoes: 'Solutions navigation',
    setoresRotulo: 'Strategic ecosystems',
    setoresTitulo: 'Sectors we serve',
    setorImagem: 'Panorama of energy, infrastructure and mining operations',
    heroImagem: 'Executives talking in a modern office',
    heroRotulo: 'Solutions',
    heroTitulo: 'Solutions for the entire human capital chain.',
    heroTexto:
      'Attraction, development and offboarding: Ocean operates at every stage of the people cycle to deliver concrete results for your business.',
    porQue: 'Why choose Ocean',
    ctaTitulo: 'Ready to start a project?',
    ctaTexto: 'Talk to one of our consultants and discover how Ocean can help boost your business.',
    falarConsultor: 'Talk to a consultant',
    verVagas: 'View our jobs',
  },
};

const SOLUCAO_POR_HASH: Record<string, IdSolucao> = {
  'executive-search': 'executive-search',
  offshore: 'offshore-talent',
  'offshore-talent': 'offshore-talent',
  outsourcing: 'outsourcing',
  development: 'development-outplacement',
  'development-outplacement': 'development-outplacement',
};

const BOTAO_NAVEGACAO =
  'inline-flex h-auto min-w-0 items-center gap-2 whitespace-normal rounded-md px-0 py-2 text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

function rolarAte(elemento: HTMLElement | null) {
  window.requestAnimationFrame(() => {
    if (!elemento) return;
    const cabecalho = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    const topo = elemento.getBoundingClientRect().top + window.scrollY - cabecalho - 16;
    window.scrollTo({ top: topo, behavior: 'smooth' });
  });
}

function Grupos({ grupos, borda, titulo, traco }: { grupos: Grupo[]; borda: string; titulo: string; traco: string }) {
  const { idioma } = useIdioma();
  return (
    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {grupos.map((g, i) => (
        <Revelar key={g.titulo.pt} atraso={i * 0.05}>
          <div className={`flex h-full flex-col border-t-2 ${borda} pt-5`}>
            <span className="font-display text-xl font-medium leading-none text-gray-light">{String(i + 1).padStart(2, '0')}</span>
            <h3 className={`mt-4 font-display text-[19px] font-semibold leading-[1.25] tracking-[-0.01em] ${titulo}`}>
              {g.titulo[idioma]}
            </h3>
            <ul className="mt-3 text-sm text-body-gray">
              {g.itens[idioma].map((item, j, itens) => (
                <li key={item} className="py-2.5">
                  {item}
                  {j < itens.length - 1 && <span aria-hidden="true" className={`mt-2.5 block h-px w-6 ${traco}`} />}
                </li>
              ))}
            </ul>
          </div>
        </Revelar>
      ))}
    </div>
  );
}

function Metodologia({ borda, traco }: { borda: string; traco: string }) {
  const { idioma } = useIdioma();
  return (
    <section className="bg-surface px-6 pb-14 pt-8 lg:px-10 lg:pb-24 lg:pt-12">
      <div className="mx-auto max-w-7xl">
        <Revelar>
          <h2 className="font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">{TEXTOS[idioma].metodologia}</h2>
        </Revelar>
        <ol className="mt-10 grid list-none grid-cols-1 gap-x-6 gap-y-14 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:mt-16 xl:grid-cols-6">
          {METODOLOGIA.map((etapa, i) => (
            <Revelar key={etapa.titulo.pt} atraso={i * 0.05}>
              <li className={`flex h-full flex-col border-t-2 ${borda} pt-5`}>
                <span className="font-display text-xl font-medium leading-none text-gray-light">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 min-h-[2.5em] font-display text-[19px] font-semibold leading-[1.25] tracking-[-0.01em] text-primary">
                  {etapa.titulo[idioma]}
                </h3>
                <ul className="text-sm leading-normal text-body-gray">
                  {etapa.itens[idioma].map((item, j, itens) => (
                    <li key={item} className="py-2.5">
                      {item}
                      {j < itens.length - 1 && <span aria-hidden="true" className={`mt-2.5 block h-px w-6 ${traco}`} />}
                    </li>
                  ))}
                </ul>
              </li>
            </Revelar>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Painel({
  solucao,
  indice,
  ativo,
  onIr,
}: {
  solucao: Solucao;
  indice: number;
  ativo: boolean;
  onIr: (id: IdSolucao) => void;
}) {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const estilo = ESTILO_SOLUCAO[solucao.id];
  const { icone: Icone, traco } = ICONE_DIVISAO[solucao.id];
  const anterior = SOLUCOES[indice - 1];
  const proxima = SOLUCOES[indice + 1];
  return (
    <div
      id={`solution-panel-${solucao.id}`}
      role="tabpanel"
      aria-labelledby={`solution-tab-${solucao.id}`}
      aria-hidden={!ativo}
      {...(ativo ? {} : { inert: '' })}
      className={`grid bg-surface transition-[grid-template-rows,opacity] duration-200 ease-out ${
        ativo ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="min-h-0 overflow-hidden bg-surface">
        <section className={`bg-surface px-6 lg:px-10 ${indice === 0 ? 'pt-14 pb-6 lg:pt-24 lg:pb-2' : 'py-14 lg:py-24'}`}>
          <div className="mx-auto max-w-7xl">
            <Revelar>
              <div className="flex items-start gap-4">
                <Icone className="h-10 w-10 shrink-0 self-center text-primary" strokeWidth={traco} />
                <span className={`h-12 w-1 shrink-0 ${estilo.barra}`} aria-hidden="true" />
                <h2 className={`scroll-mt-28 font-display text-4xl font-bold sm:text-5xl ${estilo.cor}`}>{solucao.titulo}</h2>
              </div>
              <p className="mt-2 font-display text-lg italic text-muted-foreground sm:text-xl">{solucao.subtitulo[idioma]}</p>
              <p className="mt-10 max-w-4xl whitespace-pre-line text-base leading-8 text-body-gray">{solucao.paragrafo[idioma]}</p>
            </Revelar>

            {solucao.id === 'development-outplacement' && (
              <Revelar>
                <h2 className={`mt-14 font-display text-3xl font-bold leading-tight sm:text-4xl ${estilo.cor}`}>{t.servicos}</h2>
              </Revelar>
            )}

            {solucao.cards && (
              <div className={`mt-8 grid gap-5 ${solucao.cards.length === 2 ? 'max-w-3xl md:grid-cols-2' : 'lg:grid-cols-3'}`}>
                {solucao.cards.map((c, i) => (
                  <Revelar key={c.titulo.pt} atraso={i * 0.05}>
                    <article className="group flex h-full flex-col rounded-md border border-gray-light bg-tint px-6 pb-6 pt-6 transition-colors duration-300 hover:border-primary focus-within:border-primary">
                      <span className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <c.icone className="h-4.5 w-4.5" strokeWidth={1.7} />
                      </span>
                      <h3 className="font-display text-lg font-bold leading-tight text-primary">{c.titulo[idioma]}</h3>
                      <p className="mt-2.5 text-sm leading-6 text-dark-gray">{c.descricao[idioma]}</p>
                    </article>
                  </Revelar>
                ))}
              </div>
            )}

            {solucao.cargos && (
              <div className="mt-14">
                <Revelar>
                  <h2 className={`font-display text-3xl font-bold leading-tight sm:text-4xl ${estilo.cor}`}>{t.areasCargos}</h2>
                </Revelar>
                <Grupos grupos={solucao.cargos} borda={estilo.borda} titulo={estilo.cor} traco={estilo.barra} />
              </div>
            )}

            {solucao.beneficios && (
              <div className="mt-14">
                <Revelar>
                  <h2 className={`font-display text-3xl font-bold leading-tight sm:text-4xl ${estilo.cor}`}>{t.beneficios}</h2>
                </Revelar>
                <Grupos grupos={solucao.beneficios} borda={estilo.borda} titulo={estilo.cor} traco={estilo.barra} />
              </div>
            )}
          </div>
        </section>

        {indice === 0 && <Metodologia borda={estilo.borda} traco={estilo.barra} />}

        <nav className="bg-surface px-6 pb-14 lg:px-10 lg:pb-24" aria-label={t.navegacaoSolucoes}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 border-t border-border pt-6">
            {anterior ? (
              <button type="button" className={`${BOTAO_NAVEGACAO} justify-start text-left`} onClick={() => onIr(anterior.id)}>
                ← {anterior.titulo}
              </button>
            ) : (
              <span />
            )}
            {proxima && (
              <button type="button" className={`${BOTAO_NAVEGACAO} justify-end text-right`} onClick={() => onIr(proxima.id)}>
                {proxima.titulo} →
              </button>
            )}
          </div>
        </nav>
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
  const abasRef = useRef<HTMLDivElement>(null);
  const botoesRef = useRef<Partial<Record<IdSolucao, HTMLButtonElement | null>>>({});
  const ativa = SOLUCAO_POR_HASH[hash.slice(1)] ?? 'executive-search';

  useEffect(() => {
    if (!SOLUCAO_POR_HASH[window.location.hash.slice(1)]) return;
    rolarAte(abasRef.current);
    const t = window.setTimeout(() => rolarAte(abasRef.current), 700);
    return () => window.clearTimeout(t);
  }, []);

  const irPara = (id: IdSolucao, rolar = true) => {
    if (id !== ativa) navigate(caminho('solucoes', HASH_SOLUCAO[id]), { replace: !rolar });
    if (rolar) rolarAte(abasRef.current);
  };

  const aoTeclar = (e: KeyboardEvent, indice: number) => {
    const total = SOLUCOES.length;
    const destino = { ArrowLeft: (indice - 1 + total) % total, ArrowRight: (indice + 1) % total, Home: 0, End: total - 1 }[
      e.key as 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'
    ];
    if (destino === undefined) return;
    e.preventDefault();
    const id = SOLUCOES[destino].id;
    irPara(id, false);
    botoesRef.current[id]?.focus();
  };

  return (
    <div className="bg-surface">
      <section className="relative isolate overflow-hidden bg-surface text-primary lg:flex lg:min-h-[610px] lg:flex-col">
        <img
          src="/site/img/solucoes-hero.jpg"
          alt={t.heroImagem}
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_22%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-surface from-35% via-surface/90 to-surface/30" />
        <div className="mx-auto max-w-7xl px-6 pt-20 lg:w-full lg:px-10 lg:pt-36">
          <Revelar>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">{t.heroRotulo}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl text-primary sm:text-5xl">{t.heroTitulo}</h1>
            <p className="mt-6 max-w-2xl text-lg text-primary/70">{t.heroTexto}</p>
          </Revelar>
        </div>
        <Revelar atraso={0.1} className="lg:flex lg:flex-col lg:grow">
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:flex-col lg:grow lg:px-10">
            <div className="mt-8 pb-14 lg:mt-auto">
              <div
                ref={abasRef}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
                role="tablist"
                aria-label={t.heroRotulo}
              >
                {SOLUCOES.map((s, i) => {
                  const selecionada = s.id === ativa;
                  const estilo = ESTILO_SOLUCAO[s.id];
                  return (
                    <button
                      key={s.id}
                      ref={(el) => {
                        botoesRef.current[s.id] = el;
                      }}
                      id={`solution-tab-${s.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selecionada}
                      aria-controls={`solution-panel-${s.id}`}
                      tabIndex={selecionada ? 0 : -1}
                      onClick={() => irPara(s.id)}
                      onMouseEnter={() => irPara(s.id, false)}
                      onKeyDown={(e) => aoTeclar(e, i)}
                      className="flex cursor-pointer flex-col items-start text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        aria-hidden="true"
                        className={`block h-1 w-full transition-opacity duration-200 ${estilo.barraAba}${selecionada ? '' : ' opacity-30'}`}
                      />
                      <span className={`mt-3 font-display text-lg font-semibold leading-tight ${estilo.titulo}`}>{s.titulo}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={`h-1 w-full transition-colors duration-200 ${ESTILO_SOLUCAO[ativa].barraAba}`} />
        </Revelar>
      </section>

      {SOLUCOES.map((s, i) => (
        <Painel key={s.id} solucao={s} indice={i} ativo={s.id === ativa} onIr={irPara} />
      ))}

      <Setores />

      <section className="bg-surface px-6 pb-0 pt-14 lg:px-10 lg:pb-4 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <Revelar>
            <h2 className="max-w-3xl font-display text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">{t.porQue}</h2>
          </Revelar>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {DIFERENCIAIS.map((d, i) => (
              <Revelar key={d.titulo.pt} atraso={i * 0.05}>
                <article className="flex h-full flex-col bg-surface p-8 ring-1 ring-primary/5">
                  <span className="font-display text-sm font-bold uppercase tracking-[0.06em] text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-6 font-display text-xl font-bold leading-snug text-primary">{d.titulo[idioma]}</h3>
                  <p className="mt-3 text-sm leading-7 text-body-gray">{d.texto[idioma]}</p>
                </article>
              </Revelar>
            ))}
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
