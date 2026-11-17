import type { ReactNode } from 'react';

export interface IconeProps {
  className?: string;
  strokeWidth?: number;
}

function lucide(nome: string, filhos: ReactNode, larguraPadrao = 2) {
  function Icone({ className = 'h-4 w-4', strokeWidth = larguraPadrao }: IconeProps) {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        {filhos}
      </svg>
    );
  }
  Icone.displayName = nome;
  return Icone;
}

export const IconeSeta = lucide('IconeSeta', <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>);
export const IconeMenu = lucide('IconeMenu', <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>);
export const IconeFechar = lucide('IconeFechar', <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
export const IconeChevronBaixo = lucide('IconeChevronBaixo', <path d="m6 9 6 6 6-6" />);
export const IconeChevronEsquerda = lucide('IconeChevronEsquerda', <path d="m15 18-6-6 6-6" />);
export const IconeChevronDireita = lucide('IconeChevronDireita', <path d="m9 18 6-6-6-6" />);
export const IconeAlvo = lucide(
  'IconeAlvo',
  <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  1.75,
);
export const IconeUsuarios = lucide(
  'IconeUsuarios',
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
  1.75,
);
export const IconeLinkedin = lucide(
  'IconeLinkedin',
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect height="12" width="4" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </>,
);
export const IconePredio = lucide(
  'IconePredio',
  <>
    <path d="M10 12h4" />
    <path d="M10 8h4" />
    <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
    <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
    <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
  </>,
);
export const IconeMensagem = lucide(
  'IconeMensagem',
  <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />,
);
export const IconeEmail = lucide(
  'IconeEmail',
  <><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect height="16" rx="2" width="20" x="2" y="4" /></>,
);
export const IconeLocal = lucide(
  'IconeLocal',
  <>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </>,
);
export const IconeBusca = lucide('IconeBusca', <><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></>);
export const IconePrancheta = lucide(
  'IconePrancheta',
  <>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </>,
);
export const IconeRecarregar = lucide(
  'IconeRecarregar',
  <>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </>,
);
export const IconeBrilho = lucide(
  'IconeBrilho',
  <>
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </>,
);

function iconePreenchido(nome: string, viewBox: string, filhos: ReactNode) {
  function Icone({ className = 'h-6 w-6' }: IconeProps) {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="currentColor"
        width="24"
        height="24"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {filhos}
      </svg>
    );
  }
  Icone.displayName = nome;
  return Icone;
}

export const IconeInteligenciaMercado = iconePreenchido(
  'IconeInteligenciaMercado',
  '0 0 24 24',
  <path
    fillRule="evenodd"
    d="M14.973 17.035 20.68 22.738c.566.567 1.484.567 2.047 0 .566-.562.566-1.48 0-2.047l-5.704-5.699A9.4 9.4 0 0 0 18.852 9.422C18.852 4.223 14.629 0 9.43 0 4.23 0 .008 4.223.008 9.422c0 5.199 4.222 9.418 9.422 9.418a9.37 9.37 0 0 0 5.543-1.805ZM9.43 2.895c3.601 0 6.523 2.925 6.523 6.527 0 3.601-2.922 6.523-6.523 6.523-3.602 0-6.528-2.922-6.528-6.523 0-3.602 2.926-6.527 6.528-6.527Z"
  />,
);

export const IconeRecrutamento = iconePreenchido(
  'IconeRecrutamento',
  '0 0 25.5 24.75',
  <path d="M12.195 24.324C5.578 24.324.188 19 .105 12.375.023 5.609 5.473.117 12.223.121c6.711.008 12.097 5.434 12.086 12.164-.004 6.641-5.446 12.047-12.114 12.039Zm.016-21.562c-5.18-.004-9.45 4.234-9.457 9.386-.012 5.282 4.191 9.516 9.445 9.536 5.192.015 9.457-4.231 9.465-9.418.004-5.254-4.219-9.496-9.453-9.504Zm6.895 9.457c0 3.859-3.079 6.906-6.977 6.906-3.754 0-6.832-3.121-6.828-6.918 0-3.832 3.105-6.89 6.98-6.89 3.75.007 6.829 3.117 6.825 6.902Zm-2.692.059c0-2.29-1.887-4.204-4.148-4.204-2.383 0-4.254 1.864-4.254 4.231 0 2.313 1.89 4.172 4.25 4.172 2.261-.004 4.152-1.91 4.152-4.2Zm-4.211-1.879c-1.004 0-1.824.821-1.824 1.829 0 1.015.82 1.828 1.844 1.824 1.011-.008 1.804-.813 1.804-1.836 0-1.016-.804-1.817-1.824-1.817Z" />,
);

export const IconeAssessment = iconePreenchido(
  'IconeAssessment',
  '0 0 24.75 18.75',
  <path fillRule="evenodd" d="m23.797 3.102-3.102-3.102L8.715 11.91 3.148 6.414.051 9.512l8.664 8.668Z" />,
);

export const IconeOutplacement = iconePreenchido(
  'IconeOutplacement',
  '0 0 26.25 24.75',
  <>
    <path d="M23.719 16.398A12.48 12.48 0 0 1 12.5 24.195c-4.914 0-9.14-2.98-10.98-7.226L0 18.36l.535-6.078V12.227h.012v-.024l6.18.008-2.227 2.035A7.97 7.97 0 0 0 12.5 20.488c3.035 0 5.691-1.64 7.129-4.09Z" />
    <path d="M5.406 7.992A7.97 7.97 0 0 1 12.5 3.969c3.848 0 7.074 2.64 7.992 6.203l-2.207 2.02h2.477c0 .011.004.019.004.03H24.47v-.023l.538-6.16-1.539 1.414A12.48 12.48 0 0 0 12.5.258C7.391.258 3.02 3.48 1.305 7.992Z" />
  </>,
);

export const IconeSolucoesPersonalizadas = iconePreenchido(
  'IconeSolucoesPersonalizadas',
  '0 0 26.88 18.75',
  <>
    <path d="M6.59 1.691A2.58 2.58 0 0 0 4.258.035c-1.078 0-1.988.696-2.332 1.656H.117v1.657h1.809c.344.964 1.254 1.66 2.332 1.66 1.078 0 1.992-.696 2.332-1.66H26.625V1.691Zm-2.332 1.657a.828.828 0 1 1 0-1.657.828.828 0 0 1 0 1.657Z" />
    <path d="M4.258 13.289c-1.078 0-1.988.695-2.332 1.656H.117v1.656h1.809c.344.961 1.254 1.656 2.332 1.656 1.078 0 1.992-.695 2.332-1.656H26.625v-1.656H6.59c-.34-.961-1.254-1.656-2.332-1.656Zm0 3.313a.828.828 0 1 1 0-1.657.828.828 0 0 1 0 1.657Z" />
    <path d="M22.48 6.664c-1.078 0-1.988.695-2.332 1.656H.117v1.657h20.031c.344.961 1.254 1.656 2.332 1.656 1.078 0 1.992-.695 2.336-1.656h1.809V8.32h-1.809c-.344-.961-1.258-1.656-2.336-1.656Zm0 3.313a.828.828 0 1 1 0-1.657.828.828 0 0 1 0 1.657Z" />
  </>,
);

export function IconeWhatsApp({ className = 'h-7 w-7' }: IconeProps) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 32 32">
      <path d="M16 3C8.83 3 3 8.83 3 16c0 2.29.6 4.44 1.65 6.3L3 29l6.9-1.6A12.9 12.9 0 0 0 16 29c7.17 0 13-5.83 13-13S23.17 3 16 3Zm0 23.5c-1.98 0-3.84-.53-5.44-1.45l-.39-.23-4.1.95.95-3.98-.25-.4A10.4 10.4 0 0 1 5.5 16C5.5 10.2 10.2 5.5 16 5.5S26.5 10.2 26.5 16 21.8 26.5 16 26.5Zm5.86-7.77c-.32-.16-1.9-.94-2.2-1.05-.29-.1-.5-.16-.72.16-.21.32-.83 1.05-1.02 1.26-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.63-.53-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.14 3.07 1.3 3.28c.16.21 2.24 3.56 5.46 4.85 2.72 1.09 3.27.87 3.86.82.59-.05 1.9-.77 2.17-1.52.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}
