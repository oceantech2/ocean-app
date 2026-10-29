import { useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { BOTAO } from '../classes';
import Revelar from '../components/Revelar';
import { IconeSeta } from '../icones';
import { useIdioma, type Txt } from '../idioma';
import { emailValido } from '../validacao';

type Segmento = 'oil-gas' | 'offshore' | 'energia' | 'infraestrutura' | 'mineracao' | 'industria' | 'tecnologia';

const SEGMENTOS: Record<Segmento, Txt> = {
  'oil-gas': { pt: 'Petróleo & Gás', en: 'Oil & Gas' },
  offshore: { pt: 'Offshore', en: 'Offshore' },
  energia: { pt: 'Energia', en: 'Energy' },
  infraestrutura: { pt: 'Infraestrutura', en: 'Infrastructure' },
  mineracao: { pt: 'Mineração', en: 'Mining' },
  industria: { pt: 'Indústria', en: 'Industry' },
  tecnologia: { pt: 'Tecnologia', en: 'Technology' },
};

const RESUMO_PROVISORIO: Txt = {
  pt: 'Placeholder — resumo da notícia. O conteúdo real será publicado semanalmente pela curadoria da Ocean.',
  en: "Placeholder summary. Real content will be published weekly by Ocean's editorial curation.",
};

const POSTS: { segmento: Segmento; titulo: Txt; data: Txt }[] = [
  {
    segmento: 'tecnologia',
    titulo: { pt: 'Como a disputa por talentos de dados mudou em 2026', en: 'How the race for data talent changed in 2026' },
    data: { pt: '10 set 2026', en: 'Sep 10, 2026' },
  },
  {
    segmento: 'oil-gas',
    titulo: {
      pt: 'Liderança técnica: o novo perfil dos executivos de petróleo e gás',
      en: 'Technical leadership: the new profile of oil and gas executives',
    },
    data: { pt: '08 set 2026', en: 'Sep 8, 2026' },
  },
  {
    segmento: 'mineracao',
    titulo: { pt: 'Mineração e tecnologia: o que mudou nas contratações', en: 'Mining and technology: what changed in hiring' },
    data: { pt: '05 set 2026', en: 'Sep 5, 2026' },
  },
];

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
  },
};

export default function Noticias() {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const [segmento, setSegmento] = useState<Segmento | ''>('');
  const [email, setEmail] = useState('');

  const filtradas = useMemo(() => (segmento ? POSTS.filter((p) => p.segmento === segmento) : POSTS), [segmento]);

  const assinar = (e: FormEvent) => {
    e.preventDefault();
    if (!emailValido(email.trim())) {
      toast.error(t.emailInvalido);
      return;
    }
    toast.success(t.assinado);
    setEmail('');
  };

  const opcoes: { valor: Segmento | ''; rotulo: string }[] = [
    { valor: '', rotulo: t.todos },
    ...(Object.keys(SEGMENTOS) as Segmento[]).map((valor) => ({ valor, rotulo: SEGMENTOS[valor][idioma] })),
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

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((p, i) => (
              <Revelar key={p.titulo.pt} atraso={i * 0.05}>
                <article className="flex h-full flex-col rounded-lg bg-surface p-8 ring-1 ring-primary/5 transition-shadow hover:shadow-md">
                  <span className="w-fit rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                    {SEGMENTOS[p.segmento][idioma]}
                  </span>
                  <h2 className="mt-5 font-display text-xl font-bold leading-snug text-primary">{p.titulo[idioma]}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/75">{RESUMO_PROVISORIO[idioma]}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                    <span className="text-xs text-muted-foreground">{p.data[idioma]}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      {t.lerMais} <IconeSeta className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </article>
              </Revelar>
            ))}
            {filtradas.length === 0 && <p className="text-sm text-muted-foreground">{t.nenhuma}</p>}
          </div>
        </div>
      </section>
    </>
  );
}
