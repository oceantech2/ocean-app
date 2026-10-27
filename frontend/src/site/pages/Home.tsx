import { Link } from 'react-router-dom';
import { BOTAO } from '../classes';
import FormularioContato from '../components/FormularioContato';
import {
  CARDS_SOLUCAO,
  CASOS,
  CLIENTES,
  CONTATO,
  EQUIPE,
  HASH_SOLUCAO,
  NUMEROS,
  VALORES,
} from '../dados/conteudo';
import { IconeEmail, IconeLinkedin, IconeMensagem, IconePredio, IconeSeta } from '../icones';
import { useIrParaContato } from '../navegacao';

function Hero() {
  const irParaContato = useIrParaContato();
  return (
    <section className="relative isolate z-10 overflow-hidden text-primary-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="home-hero-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/25" />
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-20 lg:px-10 lg:pb-20 lg:pt-36">
        <div className="max-w-3xl lg:max-w-[58%]">
          <span className="mb-6 block text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Capital Humano · Executive Search
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary-foreground sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
            <span className="block lg:whitespace-nowrap">Conectando pessoas</span>
            <span className="block lg:whitespace-nowrap">para impulsionar negócios.</span>
          </h1>
          <div className="mt-8 flex flex-wrap gap-3 lg:mt-10">
            <Link to="/solucoes" className={`${BOTAO} shadow h-10 rounded-md px-8 bg-accent text-accent-foreground hover:bg-accent/90`}>
              Ver soluções
              <IconeSeta className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#contato"
              onClick={irParaContato}
              className={`${BOTAO} border shadow-sm h-10 rounded-md px-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground`}
            >
              Fale com um consultor
            </a>
          </div>
        </div>
        <div className="mt-12 border-t border-primary-foreground/15 pt-8 lg:mt-20 lg:pt-10">
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {NUMEROS.map((n) => (
              <div key={n.rotulo}>
                <dt className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">{n.valor}</dt>
                <dd className="mt-2 text-xs uppercase tracking-[0.22em] text-accent-soft">{n.rotulo}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function QuemSomos() {
  return (
    <section className="bg-surface px-6 py-12 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <h2 className="font-display text-4xl font-bold leading-[1.05] text-primary sm:text-5xl">Quem Somos</h2>
              <h3 className="mt-8 font-display text-2xl font-bold leading-[1.15] text-primary sm:text-3xl">
                Da busca ao desligamento.
                <br />
                Parceiros do início ao fim.
              </h3>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground/80">
                <p>
                  A Ocean é uma consultoria estratégica de <strong>capital humano</strong> e{' '}
                  <strong>inteligência de mercado</strong>, reconhecida nos setores de Petróleo &amp; Gás, Energia,
                  Infraestrutura, Mineração, Indústria e Tecnologia.
                </p>
                <p>
                  Com uma equipe de consultores sêniores, oferecemos soluções integradas de{' '}
                  <strong>mapeamento de mercado</strong>, <strong>recrutamento e seleção</strong>,{' '}
                  <strong>terceirização</strong>, <strong>treinamento</strong>, <strong>desenvolvimento</strong> e{' '}
                  <strong>recolocação de profissionais</strong>. Nossos serviços são personalizados e partem de uma
                  abordagem consultiva, com o objetivo de gerar valor ao negócio e impulsionar o resultado dos nossos
                  clientes.
                </p>
                <p>
                  Atuamos de maneira abrangente em âmbito continental, combinando expertise técnica, uma sólida rede de
                  contatos e uma metodologia que garante precisão na identificação de talentos e na tomada de decisões
                  estratégicas.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-5 lg:col-span-6 lg:col-start-7">
            <div className="grid grid-cols-2 gap-5">
              {CARDS_SOLUCAO.map((c) => (
                <article
                  key={c.id}
                  className="group flex aspect-square flex-col rounded-md border border-gray-light bg-background px-5 pb-5 pt-6 transition-colors duration-300 hover:border-primary focus-within:border-primary"
                >
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <c.icone className="h-6 w-6" />
                  </span>
                  <h4 className="font-display whitespace-nowrap text-base font-bold leading-tight text-primary">{c.titulo}</h4>
                  <p className="mt-3 flex-grow text-sm leading-relaxed text-dark-gray">{c.descricao}</p>
                  <hr className="mt-4 w-1/2 border-t border-gray-light" />
                  <Link
                    to={`/solucoes#${HASH_SOLUCAO[c.id]}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-secondary"
                  >
                    Saiba mais
                    <IconeSeta className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-primary/10 pt-10 lg:mt-24 lg:pt-16">
          <h3 className="font-display text-2xl font-bold text-primary sm:text-3xl">Valores</h3>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
            {VALORES.map((v, i) => (
              <div
                key={v.titulo}
                className="group relative h-full border-l border-primary/15 px-6 py-3 transition-colors hover:border-accent lg:px-5"
              >
                <span className="font-display text-5xl font-light text-primary/15 transition-colors group-hover:text-accent sm:text-6xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h4 className="mt-5 font-display text-lg font-semibold leading-snug text-primary">{v.titulo}</h4>
                <p className="mt-2 text-sm leading-relaxed text-primary/70">{v.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EquipeEClientes() {
  return (
    <div className="ocean-dark-motion text-primary-foreground">
      <section className="text-primary-foreground px-6 pt-14 lg:px-10 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl text-primary-foreground">Equipe</h2>
            <p className="mt-3 text-lg text-primary-foreground/75">Consultores que conversam diariamente com o mercado</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EQUIPE.map((p) => (
              <article
                key={p.nome}
                className="flex flex-col items-center rounded-lg bg-surface p-8 text-center ring-1 ring-primary/5 transition-shadow hover:shadow-md"
              >
                <img
                  src={`/site/img/equipe/${p.foto}.jpg`}
                  alt={p.nome}
                  width={112}
                  height={112}
                  loading="lazy"
                  className="h-28 w-28 rounded-full object-cover ring-2 ring-primary/10"
                />
                <h3 className="mt-5 font-display text-lg font-bold text-primary">{p.nome}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent">{p.cargo}</p>
                <div className="mt-4">
                  <a
                    href={p.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`LinkedIn — ${p.nome}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <IconeLinkedin className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-12 lg:px-10 lg:py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-primary-foreground">Empresas que confiam na Ocean</h2>
            <p className="mt-3 text-lg text-primary-foreground/80">
              Atendemos organizações de diferentes portes e setores, do scale-up ao enterprise.
            </p>
          </div>
          <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CLIENTES.map((c) => (
              <div
                key={c.nome}
                className="flex h-24 items-center justify-center rounded-lg border border-primary/10 bg-background p-4 text-center transition-colors hover:border-accent/40"
              >
                <img
                  src={`/site/img/clientes/${c.logo}.png`}
                  alt={c.nome}
                  width={148}
                  height={90}
                  loading="lazy"
                  className="h-full w-full max-w-36 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Resultados() {
  return (
    <section className="bg-surface px-6 py-14 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">Resultados que falam por nós</h2>
          <p className="mt-4 text-lg text-primary/80">Cada projeto é único. Alguns dos desafios que já resolvemos:</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {CASOS.map((c) => (
            <article key={c.titulo} className="group flex h-full flex-col">
              <div className="mb-6 h-px w-full bg-primary/30 transition-all group-hover:h-1 group-hover:bg-accent" />
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-accent">
                <IconePredio className="h-3.5 w-3.5" /> {c.categoria}
              </p>
              <h3 className="mt-4 font-display text-2xl font-bold text-primary">{c.titulo}</h3>
              <p className="mt-4 whitespace-pre-line text-sm italic leading-relaxed text-primary/85">{c.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contato() {
  return (
    <section id="contato" className="scroll-mt-24 bg-primary/85 px-6 py-14 text-primary-foreground lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <h2 className="font-display text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl">
            Entre em contato para nos conhecer.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-primary-foreground/80">
            Seja para iniciar um projeto ou fazer parte da nossa rede de profissionais, estamos à disposição.
          </p>
          <div className="mt-8 space-y-8 text-sm lg:mt-12 lg:space-y-10">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-accent">Contato</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground">
                    <IconeMensagem className="h-4 w-4" />
                  </span>
                  <a href={CONTATO.whatsapp} target="_blank" rel="noreferrer" className="hover:text-accent">
                    <span className="text-primary-foreground/80">{CONTATO.telefone}</span>
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground">
                    <IconeEmail className="h-4 w-4" />
                  </span>
                  <a href={`mailto:${CONTATO.email}`} className="hover:text-accent">
                    <span className="text-primary-foreground/80">{CONTATO.email}</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-accent">Social</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground">
                    <IconeLinkedin className="h-4 w-4" />
                  </span>
                  <a href={CONTATO.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent">
                    <span className="text-primary-foreground/80">Ocean no LinkedIn</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="bg-surface p-8 shadow-sm sm:p-12">
            <FormularioContato />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <Hero />
      <div>
        <QuemSomos />
        <EquipeEClientes />
        <Resultados />
        <Contato />
      </div>
    </div>
  );
}
