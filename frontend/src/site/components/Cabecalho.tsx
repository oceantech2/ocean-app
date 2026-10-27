import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { IconeFechar, IconeMenu } from '../icones';
import { useIrParaContato } from '../navegacao';

const LINKS = [
  { para: '/', rotulo: 'Home', exato: true },
  { para: '/solucoes', rotulo: 'Soluções', exato: false },
  { para: '/vagas', rotulo: 'Vagas', exato: false },
];

export function Logo() {
  return (
    <span className="inline-flex items-center gap-3">
      <img
        src="/site/img/ocean-logo-wordmark.png"
        alt="Ocean"
        className="h-7 w-auto shrink-0 select-none -translate-y-[1px]"
        draggable={false}
      />
      <span className="h-7 w-px bg-primary/25" aria-hidden="true" />
      <span className="font-display text-[10px] font-medium uppercase leading-tight tracking-[0.26em] translate-y-[1px] text-primary/65">
        talent
        <br />
        solutions
      </span>
    </span>
  );
}

export default function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const irParaContato = useIrParaContato();

  const contato = (e: React.MouseEvent) => {
    setAberto(false);
    irParaContato(e);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-surface">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to="/" aria-label="Ocean Talent Solutions" className="flex items-center" onClick={() => setAberto(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.para}
              to={l.para}
              end={l.exato}
              className={({ isActive }) =>
                `text-sm text-foreground/80 transition-colors hover:text-primary${isActive ? ' text-primary font-medium' : ''}`
              }
            >
              {l.rotulo}
            </NavLink>
          ))}
          <a
            href="/#contato"
            onClick={contato}
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-secondary"
          >
            Contato
          </a>
        </nav>
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={aberto}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-primary"
            onClick={() => setAberto((v) => !v)}
          >
            {aberto ? <IconeFechar className="h-5 w-5" /> : <IconeMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {aberto && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <NavLink
                key={l.para}
                to={l.para}
                end={l.exato}
                onClick={() => setAberto(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-surface${isActive ? ' text-primary font-medium' : ''}`
                }
              >
                {l.rotulo}
              </NavLink>
            ))}
            <a
              href="/#contato"
              onClick={contato}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
            >
              Contato
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
