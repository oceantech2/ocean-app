import { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function IconBase({ className = 'w-5 h-5', children, ...rest }: IconProps & { children: ReactNode }) {
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

export function DashboardIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </IconBase>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </IconBase>
  );
}

export function NfIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </IconBase>
  );
}

export function ContasIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </IconBase>
  );
}

export function FluxoCaixaIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </IconBase>
  );
}

export function ImpostosIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </IconBase>
  );
}

export function RetiradasIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M17 8l4 4-4 4M3 12h18M7 16l-4-4 4-4" />
    </IconBase>
  );
}

export function BonusIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </IconBase>
  );
}

export function DhIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </IconBase>
  );
}

export function ColaboradoresIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function FeriasIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </IconBase>
  );
}

export function PatrimonioIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </IconBase>
  );
}

export function AuditoriaIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M12 18v-6M9 15h6" />
    </IconBase>
  );
}

export function SegurancaIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </IconBase>
  );
}

export function ConfiguracoesIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </IconBase>
  );
}

export function ChevronLeftIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M15 18l-6-6 6-6" />
    </IconBase>
  );
}

export function ChevronRightIcon(p: IconProps) {
  return (
    <IconBase {...p}>
      <path d="M9 18l6-6-6-6" />
    </IconBase>
  );
}

const NAV_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  '/dashboard': DashboardIcon,
  '/calendario': CalendarIcon,
  '/nfs': NfIcon,
  '/contas': ContasIcon,
  '/fluxo-caixa': FluxoCaixaIcon,
  '/impostos': ImpostosIcon,
  '/retiradas': RetiradasIcon,
  '/comissoes': BonusIcon,
  '/dh': DhIcon,
  '/colaboradores': ColaboradoresIcon,
  '/ferias': FeriasIcon,
  '/patrimonio': PatrimonioIcon,
  '/auditoria': AuditoriaIcon,
  '/seguranca': SegurancaIcon,
  '/configuracoes': ConfiguracoesIcon,
};

export function getNavIcon(path: string): (p: IconProps) => ReactNode {
  return NAV_ICONS[path] ?? DashboardIcon;
}
