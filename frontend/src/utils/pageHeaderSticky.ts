/**
 * Classes canônicas do cabeçalho de página com filtros fixo no scroll.
 *
 * Offset `top-[5.5rem]` alinha ao header global do Layout (logo/busca).
 * z-20/z-30 ficam abaixo do header da app (z-50) e acima do conteúdo.
 *
 * Uso:
 * - Combinado (título+filtros+ações no mesmo card): PAGE_HEADER_COMBINED_STICKY_CLASS
 * - Dual (cards separados): PAGE_TITLE_STICKY_CLASS no título e
 *   PAGE_FILTERS_STICKY_CLASS na barra de filtros
 * - Cards de KPI / resumo / banners entre título e filtros: NÃO aplicar sticky
 *
 * O segundo offset (5.5rem + 5.5rem) aproxima a altura do card de título (p-6 + h1).
 * Se sobrar faixa vazia sistemática após o scroll, ajustar só PAGE_FILTERS_STICKY_CLASS.
 */

const OPAQUE_CARD_BG = 'bg-white dark:bg-gray-800';

/** Título + filtros (+ ações) no mesmo bloco — ex.: Fluxo de Caixa, Dashboard, Patrimônio */
export const PAGE_HEADER_COMBINED_STICKY_CLASS =
  `sticky top-[5.5rem] z-30 ${OPAQUE_CARD_BG}`;

/** Só o card de título/ações (modo dual) */
export const PAGE_TITLE_STICKY_CLASS =
  `sticky top-[5.5rem] z-30 ${OPAQUE_CARD_BG}`;

/**
 * Só a barra de filtros (modo dual), logo abaixo do título sticky.
 * top = header Layout (5.5rem) + altura aproximada do card de título (5.5rem).
 */
export const PAGE_FILTERS_STICKY_CLASS =
  `sticky top-[calc(5.5rem+5.5rem)] z-20 ${OPAQUE_CARD_BG}`;
