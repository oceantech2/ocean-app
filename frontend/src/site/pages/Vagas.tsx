import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarVagas } from '../api';
import { SELECAO } from '../classes';
import Revelar from '../components/Revelar';
import { AREAS, NIVEIS, type Area, type Nivel, type Vaga } from '../dados/vagas';
import { IconeChevronBaixo, IconeLocal, IconeSeta } from '../icones';
import { useIdioma, type Idioma, type Txt } from '../idioma';
import { caminhoVaga } from '../rotas';

const TEXTOS = {
  pt: {
    rotulo: 'Vagas',
    titulo: 'Confira nossas vagas em andamento.',
    texto: 'Filtre por área e nível hierárquico e clique em uma vaga para ver os pré-requisitos e se candidatar.',
    area: 'Área',
    nivel: 'Nível',
    todas: 'Todas',
    todos: 'Todos',
    contagem: (n: number) => `${n} ${n === 1 ? 'vaga' : 'vagas'}`,
    verVaga: 'Ver vaga',
    nenhuma: 'Nenhuma vaga encontrada para os filtros atuais.',
    semVagas: 'No momento não há vagas abertas. Volte em breve.',
    erro: 'Não foi possível carregar as vagas. Tente novamente em instantes.',
    carregando: 'Carregando vagas',
  },
  en: {
    rotulo: 'Jobs',
    titulo: 'Check our open searches.',
    texto: 'Filter by area and seniority and click a job to see the requirements and apply.',
    area: 'Area',
    nivel: 'Level',
    todas: 'All',
    todos: 'All',
    contagem: (n: number) => `${n} ${n === 1 ? 'job' : 'jobs'}`,
    verVaga: 'View job',
    nenhuma: 'No jobs found for the current filters.',
    semVagas: 'There are no open jobs right now. Check back soon.',
    erro: 'We could not load the jobs. Please try again shortly.',
    carregando: 'Loading jobs',
  },
};

function opcoes<K extends string>(rotulos: Record<K, Txt>, idioma: Idioma, todos: string) {
  return [
    { valor: '', rotulo: todos },
    ...(Object.keys(rotulos) as K[]).map((valor) => ({ valor, rotulo: rotulos[valor][idioma] })),
  ];
}

function Filtro({ id, rotulo, valor, opcoes, onChange }: {
  id: string;
  rotulo: string;
  valor: string;
  opcoes: { valor: string; rotulo: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
        {rotulo}
      </label>
      <div className="relative w-full sm:w-56">
        <select id={id} value={valor} onChange={(e) => onChange(e.target.value)} className={SELECAO}>
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <IconeChevronBaixo className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 opacity-50" />
      </div>
    </div>
  );
}

export default function Vagas() {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const [area, setArea] = useState<Area | ''>('');
  const [nivel, setNivel] = useState<Nivel | ''>('');
  const [vagas, setVagas] = useState<Vaga[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarVagas()
      .then((r) => ativo && setVagas(r))
      .catch(() => ativo && setErro(true));
    return () => {
      ativo = false;
    };
  }, []);

  const filtradas = useMemo(
    () => (vagas ?? []).filter((v) => (!area || v.area === area) && (!nivel || v.nivel === nivel)),
    [vagas, area, nivel],
  );

  let conteudo;
  if (erro) {
    conteudo = <p className="text-sm text-muted-foreground">{t.erro}</p>;
  } else if (!vagas) {
    conteudo = (
      <div className="flex justify-center py-10 lg:col-span-2" role="status" aria-label={t.carregando}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  } else if (vagas.length === 0) {
    conteudo = <p className="text-sm text-muted-foreground">{t.semVagas}</p>;
  } else if (filtradas.length === 0) {
    conteudo = <p className="text-sm text-muted-foreground">{t.nenhuma}</p>;
  } else {
    conteudo = filtradas.map((v, i) => (
      <Revelar key={v.id} atraso={i * 0.04}>
        <Link
          to={caminhoVaga(v, idioma)}
          className="group block h-full rounded-xl border border-border bg-surface text-card-foreground shadow transition-colors hover:border-primary/40"
        >
          <div className="flex h-full flex-col p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              {AREAS[v.area][idioma]} · {NIVEIS[v.nivel][idioma]}
            </p>
            <h2 className="mt-3 font-display text-2xl text-primary">{v.titulo}</h2>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <IconeLocal className="h-3.5 w-3.5" /> {v.localidade}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">{v.resumo}</p>
            <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
              {t.verVaga} <IconeSeta className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </div>
        </Link>
      </Revelar>
    ));
  }

  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
          <Revelar>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">{t.rotulo}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl text-primary sm:text-5xl">{t.titulo}</h1>
            <p className="mt-6 max-w-2xl text-lg text-foreground/75">{t.texto}</p>
          </Revelar>
        </div>
      </section>
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Filtro
              id="filtro-area"
              rotulo={t.area}
              valor={area}
              opcoes={opcoes(AREAS, idioma, t.todas)}
              onChange={(v) => setArea(v as Area | '')}
            />
            <Filtro
              id="filtro-nivel"
              rotulo={t.nivel}
              valor={nivel}
              opcoes={opcoes(NIVEIS, idioma, t.todos)}
              onChange={(v) => setNivel(v as Nivel | '')}
            />
            {vagas && <p className="text-sm text-muted-foreground sm:ml-auto">{t.contagem(filtradas.length)}</p>}
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">{conteudo}</div>
        </div>
      </section>
    </>
  );
}
