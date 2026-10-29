import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { EQUIPE, type Consultor } from '../dados/conteudo';
import { IconeChevronDireita, IconeChevronEsquerda, IconeLinkedin } from '../icones';
import { useIdioma } from '../idioma';
import ModalConsultor from './ModalConsultor';

const TEXTOS = {
  pt: {
    titulo: 'Equipe',
    subtitulo: 'Consultores que conversam diariamente com o mercado',
    anterior: 'Anterior',
    proximo: 'Próximo',
    carrossel: 'carrossel',
    slide: 'slide',
    posicao: (n: number, total: number) => `${n} de ${total}`,
    irPara: (nome: string) => `Ir para ${nome}`,
  },
  en: {
    titulo: 'Team',
    subtitulo: 'Consultants who talk to the market every day',
    anterior: 'Previous',
    proximo: 'Next',
    carrossel: 'carousel',
    slide: 'slide',
    posicao: (n: number, total: number) => `${n} of ${total}`,
    irPara: (nome: string) => `Go to ${nome}`,
  },
};

const TOTAL = EQUIPE.length;
// Três cópias da lista: o índice fica no bloco do meio e volta para ele após cada transição (giro infinito).
const TRILHO = [...EQUIPE, ...EQUIPE, ...EQUIPE];
const INTERVALO_MS = 6000;
const DURACAO_MS = 500;
const DESLIZE_MINIMO_PX = 40;

const CONSULTA_LG = '(min-width: 1024px)';
const CONSULTA_SM = '(min-width: 640px)';
const CONSULTA_MENOS_MOVIMENTO = '(prefers-reduced-motion: reduce)';

const BOTAO_SETA =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/40 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground';

function noBlocoDoMeio(i: number) {
  return TOTAL + (((i - TOTAL) % TOTAL) + TOTAL) % TOTAL;
}

const NO_NAVEGADOR = typeof window !== 'undefined';

function calcularPorVez() {
  if (!NO_NAVEGADOR || window.matchMedia(CONSULTA_LG).matches) return 3;
  if (window.matchMedia(CONSULTA_SM).matches) return 2;
  return 1;
}

function usePorVez() {
  const [porVez, setPorVez] = useState(calcularPorVez);
  useEffect(() => {
    const consultas = [CONSULTA_LG, CONSULTA_SM].map((q) => window.matchMedia(q));
    const atualizar = () => setPorVez(calcularPorVez());
    consultas.forEach((c) => c.addEventListener('change', atualizar));
    return () => consultas.forEach((c) => c.removeEventListener('change', atualizar));
  }, []);
  return porVez;
}

function useMenosMovimento() {
  const [menos, setMenos] = useState(() => NO_NAVEGADOR && window.matchMedia(CONSULTA_MENOS_MOVIMENTO).matches);
  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA_MENOS_MOVIMENTO);
    const atualizar = () => setMenos(consulta.matches);
    consulta.addEventListener('change', atualizar);
    return () => consulta.removeEventListener('change', atualizar);
  }, []);
  return menos;
}

function useAbaVisivel() {
  const [visivel, setVisivel] = useState(() => NO_NAVEGADOR && document.visibilityState === 'visible');
  useEffect(() => {
    const atualizar = () => setVisivel(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', atualizar);
    return () => document.removeEventListener('visibilitychange', atualizar);
  }, []);
  return visivel;
}

export default function CarrosselEquipe() {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const porVez = usePorVez();
  const menosMovimento = useMenosMovimento();
  const abaVisivel = useAbaVisivel();
  const [indice, setIndice] = useState(TOTAL);
  const [animar, setAnimar] = useState(false);
  const [mouseSobre, setMouseSobre] = useState(false);
  const [focoDentro, setFocoDentro] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [aberto, setAberto] = useState<Consultor | null>(null);
  const inicioToque = useRef<number | null>(null);
  const fecharModal = useCallback(() => setAberto(null), []);

  const automatico = !menosMovimento && abaVisivel && !mouseSobre && !focoDentro && !tocando && !aberto;

  const mover = useCallback(
    (passo: number) => {
      if (menosMovimento) {
        setAnimar(false);
        setIndice((i) => noBlocoDoMeio(i + passo));
        return;
      }
      setAnimar(true);
      setIndice((i) => {
        const proximo = i + passo;
        return proximo < 0 || proximo + porVez > TRILHO.length ? i : proximo;
      });
    },
    [menosMovimento, porVez],
  );

  const irPara = (consultor: number) => {
    setAnimar(!menosMovimento);
    setIndice(TOTAL + consultor);
  };

  useEffect(() => {
    if (!automatico) return;
    const t = window.setTimeout(() => mover(1), INTERVALO_MS);
    return () => window.clearTimeout(t);
  }, [automatico, indice, mover]);

  const aoTerminarTransicao = () => {
    const normalizado = noBlocoDoMeio(indice);
    if (normalizado === indice) return;
    setAnimar(false);
    setIndice(normalizado);
  };

  const aoEntrarPonteiro = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setMouseSobre(true);
  };
  const aoSairPonteiro = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setMouseSobre(false);
  };
  const aoEntrarFoco = (e: FocusEvent) => {
    if ((e.target as Element).matches(':focus-visible')) setFocoDentro(true);
  };
  const aoSairFoco = (e: FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocoDentro(false);
  };
  const aoIniciarToque = (e: TouchEvent) => {
    inicioToque.current = e.touches[0].clientX;
    setTocando(true);
  };
  const aoTerminarToque = (e: TouchEvent) => {
    const inicio = inicioToque.current;
    inicioToque.current = null;
    setTocando(false);
    if (inicio === null) return;
    const deslocamento = e.changedTouches[0].clientX - inicio;
    if (Math.abs(deslocamento) >= DESLIZE_MINIMO_PX) mover(deslocamento < 0 ? 1 : -1);
  };

  const ativo = indice % TOTAL;

  return (
    <section
      className="text-primary-foreground px-6 pt-14 lg:px-10 lg:pt-24"
      onPointerEnter={aoEntrarPonteiro}
      onPointerLeave={aoSairPonteiro}
      onFocus={aoEntrarFoco}
      onBlur={aoSairFoco}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl text-primary-foreground">{t.titulo}</h2>
            <p className="mt-3 text-lg text-primary-foreground/75">{t.subtitulo}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label={t.anterior} onClick={() => mover(-1)} className={BOTAO_SETA}>
              <IconeChevronEsquerda className="h-5 w-5" />
            </button>
            <button type="button" aria-label={t.proximo} onClick={() => mover(1)} className={BOTAO_SETA}>
              <IconeChevronDireita className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          role="region"
          aria-roledescription={t.carrossel}
          aria-label={t.titulo}
          className="mt-10 overflow-hidden py-2"
          style={{ touchAction: 'pan-y' }}
          onTouchStart={aoIniciarToque}
          onTouchEnd={aoTerminarToque}
          onTouchCancel={() => {
            inicioToque.current = null;
            setTocando(false);
          }}
        >
          <div
            aria-live={automatico ? 'off' : 'polite'}
            className="flex"
            style={{
              margin: '0 -12px',
              transform: `translateX(-${(indice * 100) / porVez}%)`,
              transition: animar ? `transform ${DURACAO_MS}ms ease-out` : 'none',
            }}
            onTransitionEnd={(e) => {
              if (e.target === e.currentTarget && e.propertyName === 'transform') aoTerminarTransicao();
            }}
          >
            {TRILHO.map((p, posicao) => {
              const visivel = posicao >= indice && posicao < indice + porVez;
              const foco = visivel ? undefined : -1;
              return (
                <div
                  key={`${p.foto}-${posicao}`}
                  role="group"
                  aria-roledescription={t.slide}
                  aria-label={t.posicao((posicao % TOTAL) + 1, TOTAL)}
                  aria-hidden={!visivel}
                  className="shrink-0 px-3"
                  style={{ width: `${100 / porVez}%` }}
                >
                  <article className="flex h-full flex-col items-center rounded-lg bg-surface p-8 text-center ring-1 ring-primary/5 transition-shadow hover:shadow-md">
                    <button
                      type="button"
                      onClick={() => setAberto(p)}
                      tabIndex={foco}
                      className="group flex cursor-pointer flex-col items-center"
                    >
                      <img
                        src={`/site/img/equipe/${p.foto}.jpg`}
                        alt={p.nome}
                        width={112}
                        height={112}
                        loading="lazy"
                        draggable={false}
                        className="h-28 w-28 rounded-full object-cover ring-2 ring-primary/10 transition-transform group-hover:scale-105"
                      />
                      <h3 className="mt-5 font-display text-lg font-bold text-primary group-hover:underline">{p.nome}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent">{p.cargo[idioma]}</p>
                    </button>
                    <div className="mt-4">
                      <a
                        href={p.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        tabIndex={foco}
                        aria-label={`LinkedIn — ${p.nome}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <IconeLinkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {EQUIPE.map((p, i) => (
            <button
              key={p.foto}
              type="button"
              aria-label={t.irPara(p.nome)}
              aria-current={i === ativo ? 'true' : undefined}
              onClick={() => irPara(i)}
              className={`h-2 rounded-full transition-all ${i === ativo ? 'w-8 bg-accent' : 'w-2 !bg-primary-foreground/30'}`}
            />
          ))}
        </div>
      </div>
      {aberto && createPortal(<ModalConsultor consultor={aberto} onFechar={fecharModal} />, document.body)}
    </section>
  );
}
