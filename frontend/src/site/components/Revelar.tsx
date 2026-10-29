import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Surge de baixo para cima quando entra na tela, uma única vez (o SectionReveal do Lovable). */
export default function Revelar({
  children,
  className = '',
  atraso = 0,
}: {
  children: ReactNode;
  className?: string;
  atraso?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    if (typeof IntersectionObserver === 'undefined') {
      setRevelado(true);
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setRevelado(true);
          observador.disconnect();
        }
      },
      { rootMargin: '-80px 0px' },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`revelar${revelado ? ' revelado' : ''}${className ? ` ${className}` : ''}`}
      style={atraso ? { transitionDelay: `${atraso}s` } : undefined}
    >
      {children}
    </div>
  );
}
