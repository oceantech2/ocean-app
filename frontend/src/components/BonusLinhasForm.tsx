import { BonusLinhaForm, Colaborador } from '../types';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const SELECT = 'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-full';
const INPUT = SELECT;

export function linhaBonusVazia(): BonusLinhaForm {
  const hoje = new Date();
  return {
    colaborador_id: 0,
    mes: hoje.getMonth() + 1,
    ano: hoje.getFullYear(),
    valor: 0,
  };
}

interface Props {
  linhas: BonusLinhaForm[];
  onChange: (linhas: BonusLinhaForm[]) => void;
  fornecedores: Colaborador[];
  readOnly?: boolean;
}

export default function BonusLinhasForm({ linhas, onChange, fornecedores, readOnly }: Props) {
  const atualizar = (idx: number, patch: Partial<BonusLinhaForm>) => {
    onChange(linhas.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const adicionar = () => onChange([...linhas, linhaBonusVazia()]);
  const remover = (idx: number) => onChange(linhas.filter((_, i) => i !== idx));

  return (
    <div className="border-t dark:border-gray-700 pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Bônus</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={adicionar}
            className="text-xs px-3 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded hover:bg-green-200"
          >
            + Adicionar bônus
          </button>
        )}
      </div>

      {linhas.length === 0 && (
        <p className="text-xs text-gray-400">Nenhum bônus vinculado. Opcional.</p>
      )}

      {linhas.map((linha, idx) => {
        const bloqueada = linha.liberado || readOnly;
        return (
          <div key={linha.id ?? `bonus-nova-${idx}`} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/20">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-500">Linha {idx + 1}</span>
              <div className="flex items-center gap-2">
                {linha.liberado && (
                  <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded">
                    {linha.pago ? 'Pago' : 'Liberado'}
                  </span>
                )}
                {!bloqueada && (
                  <button type="button" onClick={() => remover(idx)} className="text-xs text-red-600 dark:text-red-400 hover:underline">
                    Remover
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Fornecedor *</label>
                <select
                  className={SELECT}
                  value={linha.colaborador_id || ''}
                  disabled={bloqueada}
                  onChange={(e) => atualizar(idx, { colaborador_id: parseInt(e.target.value, 10) })}
                >
                  <option value="">Selecione...</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Mês *</label>
                  <select
                    className={SELECT}
                    value={linha.mes}
                    disabled={bloqueada}
                    onChange={(e) => atualizar(idx, { mes: parseInt(e.target.value, 10) })}
                  >
                    {MESES.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Ano *</label>
                  <input
                    type="number"
                    className={INPUT}
                    value={linha.ano}
                    disabled={bloqueada}
                    onChange={(e) => atualizar(idx, { ano: parseInt(e.target.value, 10) || linha.ano })}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className={INPUT}
                value={linha.valor || ''}
                disabled={bloqueada}
                onChange={(e) => atualizar(idx, { valor: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
