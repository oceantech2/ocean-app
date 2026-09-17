/**
 * Classes canônicas do padrão Contas a Pagar: área de scroll com altura limitada
 * e cabeçalho sticky opaco (tema claro/escuro).
 *
 * Uso em listagens de página:
 * - container: combinar com card (`bg-white dark:bg-gray-800 rounded-lg shadow-md` etc.)
 * - th: prefixar às classes de padding/alinhamento existentes
 *
 * Não usar TABLE_SCROLL_CONTAINER_CLASS em Dashboard ou modais (só TH_STICKY_CLASS
 * quando o modal/tabela já tiver scroll próprio).
 */

/** Container da grade: rolagem vertical/horizontal com altura máxima estilo Contas */
export const TABLE_SCROLL_CONTAINER_CLASS =
  'overflow-auto max-h-[calc(100vh-22rem)]';

/**
 * Célula de cabeçalho sticky: fundo opaco + sombra inferior para não misturar
 * com linhas que passam por baixo.
 */
export const TH_STICKY_CLASS =
  'sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 shadow-[0_1px_0_0_rgb(229_231_235)] dark:shadow-[0_1px_0_0_rgb(75_85_99)]';
