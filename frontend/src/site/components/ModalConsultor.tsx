import { useEffect, useRef } from 'react';
import type { Consultor } from '../dados/conteudo';
import { IconeFechar, IconeLinkedin } from '../icones';
import { useIdioma } from '../idioma';

const FECHAR = { pt: 'Fechar', en: 'Close' };

export default function ModalConsultor({ consultor, onFechar }: { consultor: Consultor; onFechar: () => void }) {
  const { idioma } = useIdioma();
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    fechar.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflow;
      anterior?.focus();
    };
  }, [onFechar]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={onFechar} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultor-nome"
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-surface p-6 text-foreground shadow-lg sm:rounded-lg"
      >
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
          <img
            src={`/site/img/equipe/${consultor.foto}.jpg`}
            alt={consultor.nome}
            width={128}
            height={128}
            className="h-32 w-32 shrink-0 rounded-full object-cover ring-2 ring-primary/10"
          />
          <div className="mt-4 sm:mt-0">
            <h2 id="consultor-nome" className="font-display text-2xl font-bold text-primary">
              {consultor.nome}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent">{consultor.cargo[idioma]}</p>
            <p className="mt-4 text-sm leading-relaxed text-dark-gray">{consultor.bio[idioma]}</p>
            <div className="mt-5">
              <a
                href={consultor.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label={`LinkedIn — ${consultor.nome}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <IconeLinkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <button
          ref={fechar}
          type="button"
          onClick={onFechar}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <IconeFechar className="h-4 w-4" />
          <span className="sr-only">{FECHAR[idioma]}</span>
        </button>
      </div>
    </>
  );
}
