import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { impostosService } from '../services/api';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';
import ActionButton from '../components/ActionButton';

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 10 }, (_, i) => ANO_ATUAL - 4 + i);
const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const fmt = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Impostos() {
  const [ano, setAno] = useState(ANO_ATUAL);
  const [anoComp, setAnoComp] = useState<number | null>(null);
  const [modoComparativo, setModoComparativo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any[]>([]);
  const [dadosComp, setDadosComp] = useState<any[]>([]);

  useEffect(() => { carregar(); }, [ano]);
  useEffect(() => {
    if (modoComparativo && anoComp) carregarComparativo();
    else setDadosComp([]);
  }, [modoComparativo, anoComp]);

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await impostosService.deContas(ano);
      setDados(res.data || []);
    } catch { toast.error('Erro ao carregar impostos'); }
    finally { setLoading(false); }
  };

  const carregarComparativo = async () => {
    if (!anoComp) return;
    try {
      const res = await impostosService.deContas(anoComp);
      setDadosComp(res.data || []);
    } catch { toast.error('Erro ao carregar ano comparativo'); }
  };

  const graficoDados = MESES_NOME.map((nome, idx) => {
    const reg = dados.find((d) => d.mes === idx + 1) || {};
    const regC = dadosComp.find((d) => d.mes === idx + 1) || {};
    const ponto: any = {
      mes: nome,
      faturamento: reg.faturamento ?? 0,
      imposto: reg.valor_imposto ?? 0,
    };
    if (modoComparativo && anoComp) {
      ponto[`fat_${anoComp}`] = regC.faturamento ?? 0;
      ponto[`imp_${anoComp}`] = regC.valor_imposto ?? 0;
    }
    return ponto;
  });

  const totFat  = dados.reduce((s, d) => s + (d.faturamento ?? 0), 0);
  const totImp  = dados.reduce((s, d) => s + (d.valor_imposto ?? 0), 0);
  const totFatC = dadosComp.reduce((s, d) => s + (d.faturamento ?? 0), 0);
  const totImpC = dadosComp.reduce((s, d) => s + (d.valor_imposto ?? 0), 0);
  const pctMedio = totFat > 0 ? ((totImp / totFat) * 100).toFixed(2) : '0';

  const mesesComDados = dados.filter((d) => d.valor_imposto > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Impostos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Calculado automaticamente das Contas a Pagar (centro: Imposto)
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">Ano:</label>
            <select
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded"
              checked={modoComparativo}
              onChange={(e) => {
                setModoComparativo(e.target.checked);
                if (e.target.checked && !anoComp) setAnoComp(ano - 1);
              }}
            />
            Comparar com:
          </label>
          {modoComparativo && (
            <select
              value={anoComp ?? ano - 1}
              onChange={(e) => setAnoComp(parseInt(e.target.value))}
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {ANOS.filter((a) => a !== ano).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          )}

          {mesesComDados.length > 0 && (
            <ActionButton
              variant="exportar-csv"
              context="header"
              label="Exportar CSV"
              onClick={() => exportarCSV(mesesComDados.map((d) => ({
                Mês: MESES_NOME[d.mes - 1], Ano: d.ano,
                Faturamento: d.faturamento, '% Imposto': d.percentual_imposto,
                'Valor Imposto': d.valor_imposto,
              })), `impostos_${ano}`)}
            />
          )}
          <ActionButton variant="exportar-pdf" context="header" label="Exportar PDF" onClick={() => window.print()} />
        </div>
      </div>

      {/* Cards */}
      <div className={`grid gap-4 ${modoComparativo && anoComp ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Faturamento — {ano}</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{fmt(totFat)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Total Impostos — {ano}</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{fmt(totImp)}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">% Médio — {ano}</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{pctMedio}%</p>
        </div>
        {modoComparativo && anoComp && (
          <>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-5">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Impostos — {anoComp}</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{fmt(totImpC)}</p>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                Faturamento: {fmt(totFatC)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          {modoComparativo && anoComp ? `Evolução Mensal — ${ano} vs ${anoComp}` : `Evolução Mensal — ${ano}`}
        </h2>
        {modoComparativo && anoComp ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={graficoDados}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="imposto" name={`Imposto ${ano}`} stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey={`imp_${anoComp}`} name={`Imposto ${anoComp}`} stroke="#818CF8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="faturamento" name={`Faturamento ${ano}`} stroke="#3B82F6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey={`fat_${anoComp}`} name={`Faturamento ${anoComp}`} stroke="#93C5FD" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={graficoDados} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Bar dataKey="faturamento" name="Faturamento" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="imposto" name="Imposto" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : mesesComDados.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">
            <p>Nenhum lançamento de imposto encontrado em {ano}.</p>
            <p className="text-xs mt-2">Adicione contas a pagar com a categoria <strong>Impostos</strong> para que apareçam aqui.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                {['Mês', 'Faturamento (NFs)', '% Imposto', 'Valor Imposto', modoComparativo && anoComp ? `Imposto ${anoComp}` : null]
                  .filter(Boolean)
                  .map((h) => (
                    <th key={h as string} className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${h === 'Mês' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {dados.map((d) => {
                const dC = dadosComp.find((x) => x.mes === d.mes);
                if (d.valor_imposto === 0 && (!dC || dC.valor_imposto === 0)) return null;
                return (
                  <tr key={d.mes} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{MESES_NOME[d.mes - 1]}/{d.ano}</td>
                    <td className="px-4 py-3 text-right text-blue-700 dark:text-blue-400">{fmt(d.faturamento)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-yellow-700 dark:text-yellow-400">
                        {d.percentual_imposto > 0 ? `${d.percentual_imposto}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-red-700 dark:text-red-400 font-medium">{fmt(d.valor_imposto)}</td>
                    {modoComparativo && anoComp && (
                      <td className="px-4 py-3 text-right text-indigo-700 dark:text-indigo-400">
                        {dC ? fmt(dC.valor_imposto) : '—'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 font-bold">
              <tr>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">Total</td>
                <td className="px-4 py-3 text-right text-blue-800 dark:text-blue-300">{fmt(totFat)}</td>
                <td className="px-4 py-3 text-right text-yellow-800 dark:text-yellow-300">{pctMedio}% (médio)</td>
                <td className="px-4 py-3 text-right text-red-800 dark:text-red-300">{fmt(totImp)}</td>
                {modoComparativo && anoComp && (
                  <td className="px-4 py-3 text-right text-indigo-800 dark:text-indigo-300">{fmt(totImpC)}</td>
                )}
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
