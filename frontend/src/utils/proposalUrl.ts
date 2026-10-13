// Endereço do Proposal visto a partir do ERP (outro domínio). Sem VITE_PROPOSAL_PUBLIC_URL,
// app.<domínio> vira proposal.<domínio> e localhost vira proposal.localhost (ver vite.config.ts).
export function urlBaseProposal(): string {
  const configurada = import.meta.env.VITE_PROPOSAL_PUBLIC_URL as string | undefined;
  if (configurada) return configurada.replace(/\/+$/, '');
  const { protocol, hostname, port } = window.location;
  const porta = port ? `:${port}` : '';
  if (hostname === 'localhost' || hostname === '127.0.0.1') return `${protocol}//proposal.localhost${porta}`;
  if (hostname.startsWith('app.')) return `${protocol}//proposal.${hostname.slice(4)}${porta}`;
  return window.location.origin;
}

export function urlEntradaProposal(codigo: string): string {
  return `${urlBaseProposal()}/entrar#c=${encodeURIComponent(codigo)}`;
}

export function urlConviteProposal(token: string): string {
  return `${urlBaseProposal()}/convite#t=${encodeURIComponent(token)}`;
}
