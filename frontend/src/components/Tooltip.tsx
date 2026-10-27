import { cloneElement, ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  texto: string;
  children: ReactElement;
}

/** Rótulo imediato ao passar o mouse (o `title` nativo demora ~1s). Portal: não é cortado por tabelas com scroll. */
export default function Tooltip({ texto, children }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const mostrar = (e: SyntheticEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top });
  };
  const esconder = () => setPos(null);

  useEffect(() => {
    if (!pos) return;
    window.addEventListener('scroll', esconder, true);
    return () => window.removeEventListener('scroll', esconder, true);
  }, [pos]);

  return (
    <>
      {cloneElement(children, {
        onMouseEnter: mostrar,
        onMouseLeave: esconder,
        onFocus: mostrar,
        onBlur: esconder,
      })}
      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ left: pos.x, top: pos.y - 6 }}
            className="fixed z-50 -translate-x-1/2 -translate-y-full px-2 py-1 rounded bg-gray-900 text-white text-xs font-medium whitespace-nowrap shadow-lg pointer-events-none"
          >
            {texto}
          </div>,
          document.body,
        )}
    </>
  );
}
