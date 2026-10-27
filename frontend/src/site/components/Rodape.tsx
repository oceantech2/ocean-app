import { Link } from 'react-router-dom';
import { CONTATO } from '../dados/conteudo';
import { IconeEmail, IconeLinkedin, IconeSetaCima } from '../icones';

export function VoltarAoTopo() {
  return (
    <div className="flex justify-center bg-background pb-10 pt-2">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="group flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:text-accent"
      >
        <IconeSetaCima className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
        Voltar ao topo
      </button>
    </div>
  );
}

export default function Rodape({ parallax }: { parallax: boolean }) {
  return (
    <footer className={parallax ? 'bg-surface' : 'border-t border-border/60 bg-surface'}>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2">
          <p className="font-display text-xl font-semibold text-primary">Ocean Talent Solutions</p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Consultoria boutique de capital humano. Do recrutamento executivo ao desenvolvimento, recolocação e
            terceirização de profissionais.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Navegação</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li>
              <Link to="/solucoes" className="hover:text-primary">
                Soluções
              </Link>
            </li>
            <li>
              <Link to="/vagas" className="hover:text-primary">
                Vagas
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Contato</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li>
              <a href={`mailto:${CONTATO.email}`} className="inline-flex items-center gap-2 hover:text-primary">
                <IconeEmail className="h-4 w-4" />
                <span>{CONTATO.email}</span>
              </a>
            </li>
            <li>
              <a href={CONTATO.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                <IconeLinkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-5 text-xs sm:flex-row sm:items-center lg:px-10 text-muted-foreground">
          <p>© {new Date().getFullYear()} Ocean Talent Solutions. Todos os direitos reservados.</p>
          <p>Executive Search · Offshore Talent · Outsourcing · Development &amp; Outplacement</p>
        </div>
      </div>
    </footer>
  );
}
