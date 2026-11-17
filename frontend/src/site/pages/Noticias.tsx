import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ErroApi, listarNoticias } from '../api';
import { BOTAO } from '../classes';
import Revelar from '../components/Revelar';
import {
  formatarDataNoticia,
  resumoNoticia,
  SEGMENTOS,
  tituloNoticia,
  type Noticia,
  type SegmentoNoticia,
} from '../dados/noticias';
import { IconeSeta } from '../icones';
import { useIdioma } from '../idioma';
import { caminhoNoticia } from '../rotas';
import { emailValido } from '../validacao';

const CAMPO_ESCURO =
  'flex h-9 w-full rounded-md border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-base text-primary-foreground shadow-sm transition-colors placeholder:text-primary-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm';

const TEXTOS = {
  pt: {
    rotulo: 'Notícias',
    titulo: 'Acompanhe as principais notícias de mercado.',
    texto: 'Curadoria semanal das principais movimentações em RH, liderança, mercado de trabalho e tendências por setor.',
    emailPlaceholder: 'seu@email.com',
    email: 'E-mail',
    assinar: 'Quero receber',
    emailInvalido: 'Informe um e-mail válido.',
    assinado: 'Pronto! Você receberá nossas notícias.',
    todos: 'Todos',
    lerMais: 'Ler mais',
    nenhuma: 'Nenhuma notícia neste segmento por enquanto.',
    erro: 'Não foi possível carregar as notícias. Tente novamente em instantes.',
    carregando: 'Carregando notícias',
  },
  en: {
    rotulo: 'News',
    titulo: 'Follow the main market news.',
    texto: 'Weekly curation of the main moves in HR, leadership, labour market and sector trends.',
    emailPlaceholder: 'you@email.com',
    email: 'Email',
    assinar: 'Subscribe',
    emailInvalido: 'Please enter a valid email.',
    assinado: "All set! You'll receive our news.",
    todos: 'All',
    lerMais: 'Read more',
    nenhuma: 'No news in this segment yet.',
    erro: 'We could not load the news. Please try again shortly.',
    carregando: 'Loading news',
  },
};

export default function Noticias() {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const [segmento, setSegmento] = useState<SegmentoNoticia | ''>('');
  const [email, setEmail] = useState('');
  const [itens, setItens] = useState<Noticia[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'erro'>('carregando');

  useEffect(() => {
    let ativo = true;
    setEstado('carregando');
    listarNoticias(segmento || undefined)
      .then((lista) => {
        if (!ativo) return;
        setItens(lista);
        setEstado('ok');
      })
      .catch((e) => {
        if (!ativo) return;
        setEstado('erro');
        if (!(e instanceof ErroApi)) toast.error(t.erro);
      });
    return () => {
      ativo = false;
    };
  }, [segmento, t.erro]);

  const assinar = (e: FormEvent) => {
    e.preventDefault();
    if (!emailValido(email.trim())) {
      toast.error(t.emailInvalido);
      return;
    }
    toast.success(t.assinado);
    setEmail('');
  };

  const opcoes: { valor: SegmentoNoticia | ''; rotulo: string }[] = [
    { valor: '', rotulo: t.todos },
    ...(Object.keys(SEGMENTOS) as SegmentoNoticia[]).map((valor) => ({ valor, rotulo: SEGMENTOS[valor][idioma] })),
  ];

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-28">
          <Revelar>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">{t.rotulo}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl text-primary-foreground sm:text-5xl">{t.titulo}</h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80">{t.texto}</p>
            <form onSubmit={assinar} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                aria-label={t.email}
                className={CAMPO_ESCURO}
              />
              <button type="submit" className={`${BOTAO} shadow h-9 px-4 py-2 bg-accent text-accent-foreground hover:bg-accent/90`}>
                {t.assinar}
              </button>
            </form>
          </Revelar>
        </div>
      </section>

      <section className="bg-background px-6 py-12 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2">
            {opcoes.map((o) => (
              <button
                key={o.valor || 'todos'}
                type="button"
                onClick={() => setSegmento(o.valor)}
                aria-pressed={segmento === o.valor}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  segmento === o.valor ? 'bg-primary text-primary-foreground' : 'bg-surface text-foreground/70 hover:bg-muted'
                }`}
              >
                {o.rotulo}
              </button>
            ))}
          </div>

          {estado === 'carregando' ? (
            <div className="mt-16 flex justify-center" role="status" aria-label={t.carregando}>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
          ) : estado === 'erro' ? (
            <p className="mt-10 text-sm text-muted-foreground">{t.erro}</p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {itens.map((n, i) => (
                <Revelar key={n.id} atraso={i * 0.05}>
                  <Link
                    to={caminhoNoticia(n, idioma)}
                    className="flex h-full flex-col rounded-lg bg-surface p-8 ring-1 ring-primary/5 transition-shadow hover:shadow-md"
                  >
                    <span className="w-fit rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                      {SEGMENTOS[n.segmento][idioma]}
                    </span>
                    <h2 className="mt-5 font-display text-xl font-bold leading-snug text-primary">{tituloNoticia(n, idioma)}</h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/75">{resumoNoticia(n, idioma)}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                      <span className="text-xs text-muted-foreground">{formatarDataNoticia(n.data_publicacao, idioma)}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                        {t.lerMais} <IconeSeta className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </Revelar>
              ))}
              {itens.length === 0 && <p className="text-sm text-muted-foreground">{t.nenhuma}</p>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
