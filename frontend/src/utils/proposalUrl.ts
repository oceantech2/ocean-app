// Endereço do painel do consultor (Consultant Panel) visto a partir do ERP (outro domínio).
// Ordem: VITE_CONSULTANT_PANEL_URL → VITE_PROPOSAL_PUBLIC_URL (que redireciona para o painel quando a
// separação está ativa) → localhost vira consultantpanel.localhost e app.<domínio> vira proposal.<domínio>.
export function urlBaseProposal(): string {
  const painel = import.meta.env.VITE_CONSULTANT_PANEL_URL as string | undefined;
  if (painel) return painel.replace(/\/+$/, '');
  const configurada = import.meta.env.VITE_PROPOSAL_PUBLIC_URL as string | undefined;
  if (configurada) return configurada.replace(/\/+$/, '');
  const { protocol, hostname, port } = window.location;
  const porta = port ? `:${port}` : '';
  if (hostname === 'localhost' || hostname === '127.0.0.1') return `${protocol}//consultantpanel.localhost${porta}`;
  if (hostname.startsWith('app.')) return `${protocol}//proposal.${hostname.slice(4)}${porta}`;
  return window.location.origin;
}

export function urlEntradaProposal(codigo: string): string {
  return `${urlBaseProposal()}/entrar#c=${encodeURIComponent(codigo)}`;
}

export function urlConviteProposal(token: string): string {
  return `${urlBaseProposal()}/convite#t=${encodeURIComponent(token)}`;
}
