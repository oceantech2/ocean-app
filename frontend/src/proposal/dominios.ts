// O mesmo bundle atende dois hosts: proposal.* (só a página do cliente, /p/<código>) e
// consultantpanel.* (painel do consultor). Em produção a separação só vale com
// VITE_CONSULTANT_PANEL_URL definida, para o painel não sair do ar antes do DNS do domínio novo.

const semBarra = (url: string) => url.replace(/\/+$/, '');

const PREFIXO_CLIENTE = 'proposal.';
const PREFIXO_PAINEL = 'consultantpanel.';

function trocarPrefixoHost(de: string, para: string): string | null {
  const { protocol, hostname, port } = window.location;
  if (!hostname.startsWith(de)) return null;
  return `${protocol}//${para}${hostname.slice(de.length)}${port ? `:${port}` : ''}`;
}

/** Base do painel do consultor; null quando a separação de domínios não está ativa. */
export function urlPainel(): string | null {
  const configurada = import.meta.env.VITE_CONSULTANT_PANEL_URL as string | undefined;
  if (configurada) return semBarra(configurada);
  const { hostname } = window.location;
  if (hostname === `${PREFIXO_CLIENTE}localhost`) return trocarPrefixoHost(PREFIXO_CLIENTE, PREFIXO_PAINEL);
  if (hostname === `${PREFIXO_PAINEL}localhost`) return window.location.origin;
  return null;
}

/** Base dos links que o cliente recebe (/p/<código>). */
export function urlCliente(): string {
  const configurada = import.meta.env.VITE_PROPOSAL_PUBLIC_URL as string | undefined;
  if (configurada) return semBarra(configurada);
  return trocarPrefixoHost(PREFIXO_PAINEL, PREFIXO_CLIENTE) ?? window.location.origin;
}

/** Base do site institucional, para o link "Ver no site" das vagas. */
export function urlSite(): string {
  const configurada = import.meta.env.VITE_SITE_URL as string | undefined;
  if (configurada) return semBarra(configurada);
  const { protocol, hostname, port } = window.location;
  if (hostname.endsWith('localhost')) return `${protocol}//site.localhost${port ? `:${port}` : ''}`;
  return 'https://www.oceantalentsolutions.com';
}

/** Host do cliente com a separação ativa: só /p/<código> é atendido aqui. */
export function ehHostCliente(): boolean {
  const painel = urlPainel();
  return !!painel && new URL(painel).origin !== window.location.origin;
}

/** Leva qualquer rota do painel aberta no host do cliente para o mesmo endereço no painel. */
export function redirecionarParaPainelSeNecessario(): boolean {
  const painel = urlPainel();
  const { pathname, search, hash } = window.location;
  if (!painel || !ehHostCliente() || pathname.startsWith('/p/')) return false;
  window.location.replace(`${painel}${pathname}${search}${hash}`);
  return true;
}
