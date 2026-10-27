import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BOTAO } from '../classes';
import {
  CONTATO,
  DIFERENCIAIS,
  ESTILO_CARDS,
  ESTILO_SOLUCAO,
  HASH_SOLUCAO,
  METODOLOGIA,
  SETORES,
  SOLUCOES,
  type IdSolucao,
  type Solucao,
} from '../dados/conteudo';
import { IconeEmail, IconeMensagem, IconeSeta } from '../icones';

const SOLUCAO_POR_HASH: Record<string, IdSolucao> = {
  'executive-search': 'executive-search',
  offshore: 'offshore-talent',
  'offshore-talent': 'offshore-talent',
  outsourcing: 'outsourcing',
  development: 'development-outplacement',
  'development-outplacement': 'development-outplacement',
};

function rolarAte(elemento: HTMLElement | null) {
  window.requestAnimationFrame(() => {
    if (!elemento) return;
    const cabecalho = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    const topo = elemento.getBoundingClientRect().top + window.scrollY - cabecalho - 16;
    window.scrollTo({ top: topo, behavior: 'smooth' });
  });
}

const BOTAO_NAVEGACAO =
  'inline-flex h-auto min-w-0 items-center gap-2 whitespace-normal rounded-md px-0 py-2 text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

function Grupos({
  grupos,
  borda,
  titulo,
  traco,
  colunas,
}: {
  grupos: { titulo: string; itens: string[] }[];
  borda: string;
  titulo: string;
  traco: string;
  colunas: string;
}) {
  return (
    <div className={`mt-10 grid grid-cols-1 gap-x-6 gap-y-12 ${colunas}`}>
      {grupos.map((g, i) => (
        <div key={g.titulo} className={`flex h-full flex-col border-t-2 ${borda} pt-5`}>
          <span className="font-display text-xl font-medium leading-none text-gray-light">{String(i + 1).padStart(2, '0')}</span>
          <h3 className={`mt-4 font-display text-[19px] font-semibold leading-[1.25] tracking-[-0.01em] ${titulo}`}>{g.titulo}</h3>
          <ul className="mt-3 text-sm text-body-gray">
            {g.itens.map((item, j) => (
              <li key={item} className="py-2.5">
                {item}
                {j < g.itens.length - 1 && <span aria-hidden="true" className={`mt-2.5 block h-px w-6 ${traco}`} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Metodologia({ borda, traco }: { borda: string; traco: string }) {
  return (
    <section className="bg-background px-6 pb-14 pt-8 lg:px-10 lg:pb-24 lg:pt-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">Metodologia</h2>
        <ol className="mt-10 grid list-none grid-cols-1 gap-x-6 gap-y-14 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:mt-16 xl:grid-cols-6">
          {METODOLOGIA.map((etapa, i) => (
            <li key={etapa.titulo} className={`flex h-full flex-col border-t-2 ${borda} pt-5`}>
              <span className="font-display text-xl font-medium leading-none text-gray-light">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 min-h-[2.5em] font-display text-[19px] font-semibold leading-[1.25] tracking-[-0.01em] text-primary">
                {etapa.titulo}
              </h3>
              <ul className="text-sm leading-normal text-body-gray">
                {etapa.itens.map((item, j) => (
                  <li key={item} className="py-2.5">
                    {item}
                    {j < etapa.itens.length - 1 && <span aria-hidden="true" className={`mt-2.5 block h-px w-6 ${traco}`} />}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Painel({
  solucao,
  indice,
  onIr,
}: {
  solucao: Solucao;
  indice: number;
  onIr: (id: IdSolucao) => void;
}) {
  const estilo = ESTILO_SOLUCAO[solucao.id];
  const estiloCards = ESTILO_CARDS[solucao.id];
  const anterior = SOLUCOES[indice - 1];
  const proxima = SOLUCOES[indice + 1];
  return (
    <div id={`solution-panel-${solucao.id}`} role="tabpanel" aria-labelledby={`solution-tab-${solucao.id}`}>
      <section className={`bg-background px-6 lg:px-10 ${indice === 0 ? 'pt-14 pb-6 lg:pt-24 lg:pb-2' : 'py-14 lg:py-24'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start gap-4">
            <solucao.icone className={`h-12 w-12 shrink-0 ${estilo.cor}`} strokeWidth={1.8} />
            <span className={`h-12 w-1 shrink-0 ${estilo.barra}`} aria-hidden="true" />
            <h2 className={`scroll-mt-28 font-display text-4xl font-bold sm:text-5xl ${estilo.cor}`}>{solucao.titulo}</h2>
          </div>
          <p className="mt-2 font-display text-lg italic text-muted-foreground sm:text-xl">{solucao.subtitulo}</p>
          <p className="mt-10 max-w-4xl text-base leading-8 text-body-gray">{solucao.paragrafo}</p>

          {solucao.cards && estiloCards && (
            <div className={`mt-8 grid gap-5 ${solucao.cards.length === 2 ? 'max-w-3xl md:grid-cols-2' : 'lg:grid-cols-3'}`}>
              {solucao.cards.map((c) => (
                <article
                  key={c.titulo}
                  className={`group flex h-full flex-col rounded-lg bg-card px-6 pb-6 pt-6 ring-1 ring-border/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${estiloCards.hoverFundo} ${estiloCards.hoverSombra}`}
                >
                  <span
                    className={`mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${estiloCards.iconeFundo} ${estilo.cor} transition-colors group-hover:bg-primary-foreground/10 group-hover:text-primary-foreground`}
                  >
                    <c.icone className="h-4.5 w-4.5" strokeWidth={1.7} />
                  </span>
                  <h3 className={`font-display text-lg font-bold leading-tight ${estilo.cor} transition-colors group-hover:text-primary-foreground`}>
                    {c.titulo}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-body-gray transition-colors group-hover:text-primary-foreground/80">
                    {c.descricao}
                  </p>
                </article>
              ))}
            </div>
          )}

          {solucao.cargos && (
            <div className="mt-14">
              <h2 className={`font-display text-3xl font-bold leading-tight sm:text-4xl ${estilo.cor}`}>Áreas e cargos</h2>
              <Grupos grupos={solucao.cargos} borda={estilo.borda} titulo={estilo.cor} traco={estilo.barra} colunas="sm:grid-cols-3" />
            </div>
          )}

          {solucao.beneficios && (
            <div className="mt-14">
              <h2 className={`font-display text-3xl font-bold leading-tight sm:text-4xl ${estilo.cor}`}>Principais benefícios</h2>
              <Grupos
                grupos={solucao.beneficios}
                borda={estilo.borda}
                titulo={estilo.cor}
                traco={estilo.barra}
                colunas="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              />
            </div>
          )}
        </div>
      </section>

      {indice === 0 && <Metodologia borda={estilo.borda} traco={estilo.barra} />}

      <nav className="bg-background px-6 pb-14 lg:px-10 lg:pb-24" aria-label="Navegação entre soluções">
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
  );
}

function Setores() {
  const cards = (duplicado: boolean) =>
    SETORES.map((s) => (
      <article key={`${duplicado ? 'dup-' : ''}${s.nome}`} aria-hidden={duplicado || undefined} className="sector-card group shrink-0 rounded-[18px]">
        <div className="relative flex h-[260px] items-center justify-center">
          <img
            src={`/site/img/setores/${s.imagem}.webp`}
            alt={`Panorama de operações de energia, infraestrutura e mineração: ${s.nome}`}
            loading="lazy"
            draggable={false}
            width={200}
            height={200}
            className="relative h-[200px] w-[200px] object-contain transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        </div>
        <div className="px-7 pt-2 pb-8">
          <h3 className="font-display text-2xl font-semibold text-primary-foreground">{s.nome}</h3>
          <p className="mt-3 font-sans text-[15px] leading-[1.6] text-sector-text">{s.descricao}</p>
        </div>
      </article>
    ));

  return (
    <section className="sector-deep-bg py-14 text-primary-foreground lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-sector-kicker">Ecossistemas estratégicos</p>
        <h2 className="mt-4 font-display text-3xl font-semibold text-primary-foreground sm:text-4xl lg:text-5xl">Setores que atendemos</h2>
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
  const { hash } = useLocation();
  const navigate = useNavigate();
  const abasRef = useRef<HTMLDivElement>(null);
  const botoesRef = useRef<Partial<Record<IdSolucao, HTMLButtonElement | null>>>({});
  const ativa = SOLUCAO_POR_HASH[hash.slice(1)] ?? 'executive-search';
  const indiceAtiva = SOLUCOES.findIndex((s) => s.id === ativa);

  useEffect(() => {
    if (SOLUCAO_POR_HASH[window.location.hash.slice(1)]) rolarAte(abasRef.current);
  }, []);

  const irPara = (id: IdSolucao, rolar = true) => {
    navigate(`/solucoes#${HASH_SOLUCAO[id]}`);
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
    <>
      <section className="relative isolate overflow-hidden bg-surface text-primary lg:flex lg:min-h-[659px] lg:flex-col">
        <img
          src="/site/img/solucoes-hero.jpg"
          alt="Executivos conversando em um escritório moderno"
          width={1920}
          height={1080}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_22%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-surface from-35% via-surface/90 to-surface/30" />
        <div className="mx-auto max-w-7xl px-6 pt-20 lg:w-full lg:px-10 lg:pt-36">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Soluções</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl text-primary sm:text-5xl">
            Soluções para toda a cadeia de capital humano.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary/70">
            Atração, desenvolvimento e desligamento: a Ocean atua em cada etapa do ciclo de pessoas para entregar resultado
            real ao seu negócio.
          </p>
        </div>
        <div className="lg:flex lg:flex-col lg:grow">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 lg:flex lg:flex-col lg:grow">
            <div className="mt-12 border-t border-primary/15 lg:mt-[94px]" />
            <div className="mt-8 lg:mt-auto">
              <div ref={abasRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="Soluções">
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
                      onKeyDown={(e) => aoTeclar(e, i)}
                      className={`flex cursor-pointer items-center justify-center rounded-t-xl px-5 py-[19px] text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selecionada ? estilo.aba : 'bg-background text-tab-foreground'
                      }`}
                    >
                      <span className={`font-display text-lg font-semibold leading-tight ${selecionada ? '' : estilo.tituloAba}`}>
                        {s.titulo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={`h-1 w-full transition-colors duration-200 ${ESTILO_SOLUCAO[ativa].barraAba}`} />
        </div>
      </section>

      <Painel solucao={SOLUCOES[indiceAtiva]} indice={indiceAtiva} onIr={irPara} />

      <Setores />

      <section className="bg-background px-6 pb-0 pt-14 lg:px-10 lg:pb-4 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-3xl font-display text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">Por que escolher a Ocean</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {DIFERENCIAIS.map((d, i) => (
              <article key={d.titulo} className="flex h-full flex-col bg-surface p-8 ring-1 ring-primary/5">
                <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-display text-xl font-bold leading-snug text-primary">{d.titulo}</h3>
                <p className="mt-3 text-sm leading-7 text-body-gray">{d.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background text-primary">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center lg:px-10 lg:py-24">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">Pronto para iniciar um projeto?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-body-gray">
            Fale com um dos nossos consultores e entenda como a Ocean pode ajudar a sua empresa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/#contato" className={`${BOTAO} shadow h-10 rounded-md px-8 bg-accent text-accent-foreground hover:bg-accent/90`}>
              Falar com um consultor
            </Link>
            <Link
              to="/vagas"
              className={`${BOTAO} border shadow-sm h-10 rounded-md px-8 border-primary/30 bg-transparent text-primary hover:bg-primary/5 hover:text-primary`}
            >
              Ver nossas vagas
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
        </div>
      </section>
    </>
  );
}
