import { useState, type ReactNode } from 'react';
import { PAGE_FILTERS_STICKY_CLASS } from '../utils/pageHeaderSticky';
import type { IntervaloData, IntervaloValor } from '../utils/filtrosAvancados';

export const FILTRO_INPUT =
  'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm disabled:opacity-50';

export function CampoFiltro({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
      {children}
    </div>
  );
}

/** Grupo rotulado dentro do painel "Mais filtros". */
export function SecaoFiltros({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">{titulo}</legend>
      <div className="flex flex-wrap gap-3 items-end">{children}</div>
    </fieldset>
  );
}

export function FiltroIntervaloData({
  id,
  campos,
  valor,
  onChange,
}: {
  id: string;
  campos: { valor: string; rotulo: string }[];
  valor: IntervaloData;
  onChange: (v: IntervaloData) => void;
}) {
  return (
    <>
      <CampoFiltro label="Data de" htmlFor={`${id}-campo`}>
        <select
          id={`${id}-campo`}
          className={FILTRO_INPUT}
          value={valor.campo}
          onChange={(e) => onChange({ ...valor, campo: e.target.value })}
        >
          {campos.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
        </select>
      </CampoFiltro>
      <CampoFiltro label="De" htmlFor={`${id}-de`}>
        <input
          id={`${id}-de`}
          type="date"
          className={FILTRO_INPUT}
          value={valor.de}
          max={valor.ate || undefined}
          onChange={(e) => onChange({ ...valor, de: e.target.value })}
        />
      </CampoFiltro>
      <CampoFiltro label="Até" htmlFor={`${id}-ate`}>
        <input
          id={`${id}-ate`}
          type="date"
          className={FILTRO_INPUT}
          value={valor.ate}
          min={valor.de || undefined}
          onChange={(e) => onChange({ ...valor, ate: e.target.value })}
        />
      </CampoFiltro>
    </>
  );
}

export function FiltroIntervaloValor({
  id,
  rotulo = 'Valor',
  valor,
  onChange,
}: {
  id: string;
  rotulo?: string;
  valor: IntervaloValor;
  onChange: (v: IntervaloValor) => void;
}) {
  const classe = `${FILTRO_INPUT} w-28`;
  return (
    <>
      <CampoFiltro label={`${rotulo} mín. (R$)`} htmlFor={`${id}-min`}>
        <input
          id={`${id}-min`}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          className={classe}
          value={valor.min}
          onChange={(e) => onChange({ ...valor, min: e.target.value })}
          placeholder="0,00"
        />
      </CampoFiltro>
      <CampoFiltro label={`${rotulo} máx. (R$)`} htmlFor={`${id}-max`}>
        <input
          id={`${id}-max`}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          className={classe}
          value={valor.max}
          onChange={(e) => onChange({ ...valor, max: e.target.value })}
          placeholder="sem limite"
        />
      </CampoFiltro>
    </>
  );
}

export type ChipFiltro = { chave: string; rotulo: string; onRemover: () => void };

type BarraFiltrosProps = {
  children: ReactNode;
  maisFiltros?: ReactNode;
  /** Filtros avançados ativos: definem o contador e aparecem como chips com o painel fechado. */
  chips?: ChipFiltro[];
  podeLimpar: boolean;
  onLimpar: () => void;
  resumo?: ReactNode;
  className?: string;
};

/** Barra de filtros padrão de Contas a Pagar/Receber: linha principal + "Mais filtros" recolhível + "Limpar filtros". */
export default function BarraFiltros({
  children,
  maisFiltros,
  chips = [],
  podeLimpar,
  onLimpar,
  resumo,
  className = '',
}: BarraFiltrosProps) {
  const [aberto, setAberto] = useState(false);
  const qtdAtivos = chips.length;
  return (
    <div className={`${PAGE_FILTERS_STICKY_CLASS} rounded-lg shadow-md ${className}`}>
      <div className="p-4 flex flex-wrap gap-3 items-end">
        {children}
        <div className="flex items-center gap-2">
          {maisFiltros && (
            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                aberto || qtdAtivos > 0
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {aberto ? '▴' : '▾'} Mais filtros{qtdAtivos > 0 ? ` (${qtdAtivos})` : ''}
            </button>
          )}
          {podeLimpar && (
            <button
              type="button"
              onClick={onLimpar}
              className="px-3 py-2 text-sm rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              ✕ Limpar filtros
            </button>
          )}
        </div>
        {resumo && <div className="ml-auto self-center text-xs text-blue-600 dark:text-blue-400">{resumo}</div>}
      </div>
      {!aberto && qtdAtivos > 0 && (
        <div className="px-4 pb-3 -mt-1 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c.chave}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 pl-3 pr-1 py-0.5 text-xs text-blue-700 dark:text-blue-300"
            >
              {c.rotulo}
              <button
                type="button"
                onClick={c.onRemover}
                aria-label={`Remover filtro ${c.rotulo}`}
                className="rounded-full w-5 h-5 leading-none hover:bg-blue-100 dark:hover:bg-blue-800/60"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {maisFiltros && aberto && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700 grid gap-x-8 gap-y-4 md:grid-cols-[auto_auto] xl:grid-cols-[auto_auto_1fr] items-start">
          {maisFiltros}
        </div>
      )}
    </div>
  );
}
