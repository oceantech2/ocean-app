interface PaginationProps {
  total: number;
  pagina: number;
  tamanho: number;
  onChange: (pagina: number) => void;
}

export default function Pagination({ total, pagina, tamanho, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / tamanho);
  if (totalPages <= 1) return null;

  const inicio = pagina * tamanho + 1;
  const fim = Math.min((pagina + 1) * tamanho, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {inicio}–{fim} de {total} itens
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(pagina - 1)}
          disabled={pagina === 0}
          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition"
        >
          ← Anterior
        </button>
        <span className="px-2 text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
          {pagina + 1} / {totalPages}
        </span>
        <button
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPages - 1}
          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition"
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
