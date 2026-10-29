import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BOTAO } from '../classes';
import CarrosselEquipe from '../components/CarrosselEquipe';
import FormularioContato from '../components/FormularioContato';
import Revelar from '../components/Revelar';
import {
  CARDS_SOLUCAO,
  CASOS,
  CLIENTES,
  CONTATO,
  HASH_SOLUCAO,
  ICONE_DIVISAO,
  NUMEROS,
  VALORES,
} from '../dados/conteudo';
import { IconeEmail, IconeLinkedin, IconeMensagem, IconePredio, IconeSeta } from '../icones';
import { useIdioma } from '../idioma';
import { useIrParaContato } from '../navegacao';

const TEXTOS = {
  pt: {
    heroRotulo: 'Capital Humano · Executive Search',
    heroLinha1: 'Conectando pessoas',
    heroLinha2: 'para impulsionar negócios.',
    verSolucoes: 'Ver soluções',
    faleConsultor: 'Fale com um consultor',
    quemSomos: 'Quem Somos',
    quemSomosLinha1: 'Da busca ao desligamento.',
    quemSomosLinha2: 'Parceiros do início ao fim.',
    quemSomosTexto: (
      <>
        <p>
          A Ocean é uma consultoria estratégica de <strong>capital humano</strong> e{' '}
          <strong>inteligência de mercado</strong>, reconhecida nos setores de Petróleo &amp; Gás, Energia,
          Infraestrutura, Mineração, Indústria e Tecnologia.
        </p>
        <p>
          Com uma equipe de consultores sêniores, oferecemos soluções integradas de <strong>mapeamento de mercado</strong>,{' '}
          <strong>recrutamento e seleção</strong>, <strong>terceirização</strong>, <strong>treinamento</strong>,{' '}
          <strong>desenvolvimento</strong> e <strong>recolocação de profissionais</strong>. Nossos serviços são
          personalizados e partem de uma abordagem consultiva, com o objetivo de gerar valor ao negócio e impulsionar o
          resultado dos nossos clientes.
        </p>
        <p>
          Atuamos de maneira abrangente em âmbito continental, combinando expertise técnica, uma sólida rede de contatos
          e uma metodologia que garante precisão na identificação de talentos e na tomada de decisões estratégicas.
        </p>
      </>
    ),
    saibaMais: 'Saiba mais',
    valores: 'Valores',
    clientesTitulo: 'Empresas que confiam na Ocean',
    clientesTexto: 'Atendemos organizações de diferentes portes e setores, do scale-up ao enterprise.',
    resultadosTitulo: 'Resultados que falam por nós',
    resultadosTexto: 'Cada projeto é único. Alguns dos desafios que já resolvemos:',
    contatoTitulo: 'Entre em contato para nos conhecer.',
    contatoTexto: 'Seja para iniciar um projeto ou fazer parte da nossa rede de profissionais, estamos à disposição.',
    contato: 'Contato',
    social: 'Social',
    linkedin: 'Ocean no LinkedIn',
  },
  en: {
    heroRotulo: 'Human Capital · Executive Search',
    heroLinha1: 'Connecting people',
    heroLinha2: 'to drive business forward.',
    verSolucoes: 'See solutions',
    faleConsultor: 'Talk to a consultant',
    quemSomos: 'Who We Are',
    quemSomosLinha1: 'From search to offboarding.',
    quemSomosLinha2: 'Partners from start to finish.',
    quemSomosTexto: (
      <>
        <p>
          Ocean is a strategic <strong>human capital</strong> and <strong>market intelligence</strong> consultancy,
          recognized in the Oil &amp; Gas, Energy, Infrastructure, Mining, Industry and Technology sectors.
        </p>
        <p>
          With a team of senior consultants, we offer integrated solutions in <strong>market mapping</strong>,{' '}
          <strong>recruitment and selection</strong>, <strong>outsourcing</strong>, <strong>training</strong>,{' '}
          <strong>development</strong> and <strong>talent outplacement</strong>. Our services are personalized and
          based on a consultative approach, with the goal of generating value for the business and driving our
          clients' results.
        </p>
        <p>
          We operate comprehensively on a continental scale, combining technical expertise, a solid network of contacts
          and a methodology that ensures precision in identifying talent and making strategic decisions.
        </p>
      </>
    ),
    saibaMais: 'Learn more',
    valores: 'Values',
    clientesTitulo: 'Companies that trust Ocean',
    clientesTexto: 'We serve organizations of all sizes and sectors, from scale-up to enterprise.',
    resultadosTitulo: 'Results that speak for themselves',
    resultadosTexto: 'Every project is unique. Some of the challenges we have solved:',
    contatoTitulo: 'Get in touch to meet us.',
    contatoTexto: "Whether to start a project or to join our network of professionals, we're available.",
    contato: 'Contact',
    social: 'Social',
    linkedin: 'Ocean on LinkedIn',
  },
};

function useTextos() {
  const { idioma, caminho } = useIdioma();
  return { idioma, caminho, t: TEXTOS[idioma] };
}

function Hero() {
  const irParaContato = useIrParaContato();
  const { idioma, caminho, t } = useTextos();
  return (
    <section className="relative isolate z-10 overflow-hidden text-primary-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="home-hero-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/25" />
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-20 lg:px-10 lg:pb-20 lg:pt-36">
        <Revelar>
          <div className="max-w-3xl lg:max-w-[58%]">
            <span className="mb-6 block text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
              {t.heroRotulo}
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary-foreground sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              <span className="block lg:whitespace-nowrap">{t.heroLinha1}</span>
              <span className="block lg:whitespace-nowrap">{t.heroLinha2}</span>
            </h1>
            <div className="mt-8 flex flex-wrap gap-3 lg:mt-10">
              <Link to={caminho('solucoes')} className={`${BOTAO} shadow h-10 rounded-md px-8 bg-accent text-accent-foreground hover:bg-accent/90`}>
                {t.verSolucoes}
                <IconeSeta className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#contato"
                onClick={irParaContato}
                className={`${BOTAO} border shadow-sm h-10 rounded-md px-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground`}
              >
                {t.faleConsultor}
              </a>
            </div>
          </div>
        </Revelar>
        <Revelar atraso={0.1}>
          <div className="mt-12 border-t border-primary-foreground/15 pt-8 lg:mt-20 lg:pt-10">
            <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {NUMEROS.map((n) => (
                <div key={n.valor}>
                  <dt className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">{n.valor}</dt>
                  <dd className="mt-2 text-xs uppercase tracking-[0.22em] text-accent-soft">{n.rotulo[idioma]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Revelar>
      </div>
    </section>
  );
}

function QuemSomos() {
  const { idioma, caminho, t } = useTextos();
  return (
    <section className="bg-surface px-6 py-12 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Revelar className="flex flex-col justify-between lg:col-span-5">
            <div>
              <h2 className="font-display text-4xl font-bold leading-[1.05] text-primary sm:text-5xl">{t.quemSomos}</h2>
              <h3 className="mt-8 font-display text-2xl font-bold leading-[1.15] text-primary sm:text-3xl">
                {t.quemSomosLinha1}
                <br />
                {t.quemSomosLinha2}
              </h3>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground/80">{t.quemSomosTexto}</div>
            </div>
          </Revelar>
          <div className="grid gap-5 lg:col-span-6 lg:col-start-7">
            <div className="grid grid-cols-2 gap-5">
              {CARDS_SOLUCAO.map((c, i) => {
                const { icone: Icone, traco } = ICONE_DIVISAO[c.id];
                return (
                  <Revelar key={c.id} atraso={i * 0.05}>
                    <article className="group flex aspect-square flex-col rounded-md border border-gray-light bg-background px-5 pb-5 pt-6 transition-colors duration-300 hover:border-primary focus-within:border-primary">
                      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icone className="h-6 w-6" strokeWidth={traco} />
                      </span>
                      <h4 className="font-display whitespace-nowrap text-base font-bold leading-tight text-primary">{c.titulo}</h4>
                      <p className="mt-3 flex-grow text-sm leading-relaxed text-dark-gray">{c.descricao[idioma]}</p>
                      <hr className="mt-4 w-1/2 border-t border-gray-light" />
                      <Link
                        to={caminho('solucoes', HASH_SOLUCAO[c.id])}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-secondary"
                      >
                        {t.saibaMais}
                        <IconeSeta className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </article>
                  </Revelar>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-primary/10 pt-10 lg:mt-24 lg:pt-16">
          <Revelar>
            <h3 className="font-display text-2xl font-bold text-primary sm:text-3xl">{t.valores}</h3>
          </Revelar>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
            {VALORES.map((v, i) => (
              <Revelar key={v.titulo.pt} atraso={i * 0.05}>
                <div className="group relative h-full border-l border-primary/15 px-6 py-3 transition-colors hover:border-accent lg:px-5">
                  <span className="font-display text-5xl font-light text-primary/15 transition-colors group-hover:text-accent sm:text-6xl">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="mt-5 font-display text-lg font-semibold leading-snug text-primary">{v.titulo[idioma]}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-primary/70">{v.texto[idioma]}</p>
                </div>
              </Revelar>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EquipeEClientes() {
  const { t } = useTextos();
  return (
    <div className="ocean-dark-motion text-primary-foreground">
      <CarrosselEquipe />
      <section className="px-6 py-12 lg:px-10 lg:py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-primary-foreground">{t.clientesTitulo}</h2>
            <p className="mt-3 text-lg text-primary-foreground/80">{t.clientesTexto}</p>
          </div>
          <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CLIENTES.map((c) => (
              <div
                key={c.nome}
                className="flex h-24 items-center justify-center rounded-lg border border-primary/10 bg-background p-4 text-center transition-colors hover:border-accent/40"
              >
                <img
                  src={`/site/img/clientes/${c.logo}`}
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
  const { idioma, t } = useTextos();
  return (
    <section className="bg-surface px-6 py-14 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Revelar>
          <div className="mb-16 max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">{t.resultadosTitulo}</h2>
            <p className="mt-4 text-lg text-primary/80">{t.resultadosTexto}</p>
          </div>
        </Revelar>
        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {CASOS.map((c, i) => (
            <Revelar key={c.titulo.pt} atraso={i * 0.05}>
              <article className="group flex h-full flex-col">
                <div className="mb-6 h-px w-full bg-primary/30 transition-all group-hover:h-1 group-hover:bg-accent" />
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-accent">
                  <IconePredio className="h-3.5 w-3.5" /> {c.categoria[idioma]}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold text-primary">{c.titulo[idioma]}</h3>
                <p className="mt-4 whitespace-pre-line text-sm italic leading-relaxed text-primary/85">{c.texto[idioma]}</p>
              </article>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}

function LinhaContato({ icone, href, valor }: { icone: ReactNode; href: string; valor: string }) {
  const externo = href.startsWith('http');
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground">
        {icone}
      </span>
      <a
        href={href}
        target={externo ? '_blank' : undefined}
        rel={externo ? 'noreferrer' : undefined}
        className="hover:text-accent"
      >
        <span className="text-primary-foreground/80">{valor}</span>
      </a>
    </li>
  );
}

function Contato() {
  const { idioma, t } = useTextos();
  return (
    <section id="contato" className="scroll-mt-24 bg-primary/85 px-6 py-14 text-primary-foreground lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-20">
        <Revelar className="lg:col-span-5">
          <h2 className="font-display text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl">
            {t.contatoTitulo}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-primary-foreground/80">{t.contatoTexto}</p>
          <div className="mt-8 space-y-8 text-sm lg:mt-12 lg:space-y-10">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-accent">{t.contato}</p>
              <ul className="space-y-3">
                <LinhaContato
                  icone={<IconeMensagem className="h-4 w-4" />}
                  href={CONTATO.whatsapp(idioma)}
                  valor={CONTATO.telefone}
                />
                <LinhaContato icone={<IconeEmail className="h-4 w-4" />} href={`mailto:${CONTATO.email}`} valor={CONTATO.email} />
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-accent">{t.social}</p>
              <ul className="space-y-3">
                <LinhaContato icone={<IconeLinkedin className="h-4 w-4" />} href={CONTATO.linkedin} valor={t.linkedin} />
              </ul>
            </div>
          </div>
        </Revelar>
        <Revelar className="lg:col-span-7" atraso={0.1}>
          <div className="bg-surface p-8 shadow-sm sm:p-12">
            <FormularioContato />
          </div>
        </Revelar>
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
