import { ReactNode, SVGProps } from 'react';
import type { ActionVariant } from '../utils/actionButtonStyles';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function IconBase({ className = 'w-4 h-4', children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconImportar(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </IconBase>
  );
}

export function IconExportar(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 21V9" />
      <path d="m7 14 5-5 5 5" />
      <path d="M5 3h14" />
    </IconBase>
  );
}

export function IconCriar(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function IconFluxo(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M20 6 9 17l-5-5" />
    </IconBase>
  );
}

export function IconEditar(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </IconBase>
  );
}

export function IconArquivar(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <path d="M10 12h4" />
    </IconBase>
  );
}

export function IconExibir(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function IconExcluir(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </IconBase>
  );
}

export function IconDocs(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </IconBase>
  );
}

export function IconHistorico(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </IconBase>
  );
}

export function IconAnexar(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </IconBase>
  );
}

export function IconRejeitar(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </IconBase>
  );
}

export function IconLiberar(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </IconBase>
  );
}

export function IconDesativar(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93l14.14 14.14" />
    </IconBase>
  );
}

export function IconReativar(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M3 12a9 9 0 1 0 9-9" />
      <path d="M3 3v6h6" />
    </IconBase>
  );
}

export function IconPdf(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h2M8 17h8M8 9h1" />
    </IconBase>
  );
}

const ICON_MAP: Record<ActionVariant, (p: IconProps) => JSX.Element> = {
  importar: IconImportar,
  'exportar-csv': IconExportar,
  'exportar-xlsx': IconExportar,
  'exportar-pdf': IconPdf,
  criar: IconCriar,
  auxiliar: IconDocs,
  docs: IconDocs,
  historico: IconHistorico,
  anexar: IconAnexar,
  fluxo: IconFluxo,
  liberar: IconLiberar,
  rejeitar: IconRejeitar,
  editar: IconEditar,
  arquivar: IconArquivar,
  exibir: IconExibir,
  desativar: IconDesativar,
  reativar: IconReativar,
  excluir: IconExcluir,
};

export function getActionIcon(variant: ActionVariant) {
  return ICON_MAP[variant];
}
