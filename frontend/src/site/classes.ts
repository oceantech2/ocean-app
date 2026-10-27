export const BOTAO =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

export const BOTAO_PADRAO = `${BOTAO} bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2`;

export const CAMPO =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

export const AREA_TEXTO =
  'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

export const SELECAO =
  'flex h-9 w-full appearance-none items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 pr-9 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring';

export const ROTULO = 'text-sm font-medium leading-none';

export const ERRO = 'text-[0.8rem] font-medium text-destructive';
