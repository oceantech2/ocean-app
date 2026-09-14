import type { MouseEvent, ReactNode } from 'react';

export interface ModalProps {
  children: ReactNode;
  /** Cabeçalho customizado (tem precedência sobre `titulo`) */
  header?: ReactNode;
  /** Título simples no header padrão */
  titulo?: string;
  footer?: ReactNode;
  /** Classe Tailwind de largura máxima (default `max-w-md`) */
  maxWidth?: string;
  onBackdropClick?: () => void;
  panelClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  /** Classe extra no backdrop (ex.: variante de opacidade) */
  backdropClassName?: string;
}

/**
 * Shell de modal: margem ≥24px no viewport, painel com altura máxima,
 * header/footer fixos e miolo rolável.
 */
export default function Modal({
  children,
  header,
  titulo,
  footer,
  maxWidth = 'max-w-md',
  onBackdropClick,
  panelClassName = '',
  headerClassName = 'p-6 border-b dark:border-gray-700',
  bodyClassName = 'p-6',
  footerClassName = 'p-6 border-t dark:border-gray-700',
  backdropClassName = 'bg-black/50',
}: ModalProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();
  const showHeader = header != null || titulo != null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${backdropClassName}`}
      onClick={onBackdropClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${maxWidth} max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden ${panelClassName}`}
        onClick={stop}
      >
        {showHeader && (
          <div className={`shrink-0 ${headerClassName}`}>
            {header ?? (
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{titulo}</h2>
            )}
          </div>
        )}
        <div className={`flex-1 min-h-0 overflow-y-auto ${bodyClassName}`}>{children}</div>
        {footer != null && <div className={`shrink-0 ${footerClassName}`}>{footer}</div>}
      </div>
    </div>
  );
}
