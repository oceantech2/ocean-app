import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { contasService } from '../services/api';
import { exportarCSV } from '../utils/export';
import ImportCSV from '../components/ImportCSV';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import ActionButton from '../components/ActionButton';

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 27 }, (_, i) => ANO_ATUAL - 2 + i);
const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const fmt = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Retiradas() {
  const papel = useAuthStore((s) => s.papel);
  const [ano, setAno] = useState(ANO_ATUAL);
  const [loading, setLoading] = useState(true);
  const [retiradas, setRetiradas] = useState<any[]>([]);
  const [importAberto, setImportAberto] = useState(false);

  useEffect(() => { carregar(); }, [ano]);

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await contasService.listar(0, 500, 'recursos_humanos', undefined, 'retirada_socios');
      const filtradas = (res.data || []).filter((c: any) =>
        new Date(c.data_vencimento).getFullYear() === ano
      );
      setRetiradas(filtradas.sort((a: any, b: any) => a.data_vencimento.localeCompare(b.data_vencimento)));
    } catch { toast.error('Erro ao carregar retiradas'); }
    finally { setLoading(false); }
  };

  const graficoDados = MESES_NOME.map((nome, idx) => ({
    mes: nome,
    valor: retiradas
      .filter((c) => new Date(c.data_vencimento).getMonth() === idx)
      .reduce((s: number, c: any) => s + c.valor, 0),
  }));

  const totalAnual = retiradas.reduce((s, c) => s + c.valor, 0);
  const totalPago = retiradas.filter((c) => c.pago).reduce((s, c) => s + c.valor, 0);
  const totalPendente = retiradas.filter((c) => !c.pago).reduce((s, c) => s + c.valor, 0);

  const exportar = () => exportarCSV(
    retiradas.map((c) => ({
      Data: c.data_vencimento,
      Descrição: c.descricao,
      Valor: c.valor,
      'Data Pagamento': c.data_pagamento || '',
      Status: c.pago ? 'Pago' : 'Pendente',
    })),
    `retiradas_${ano}`
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Retiradas (Sócios) <span className="text-gray-500 dark:text-gray-400 font-normal text-base">— Retiradas de lucro registradas em Contas a Pagar</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500 dark:text-gray-400">Ano:</label>
          <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {papel === 'admin' && (
            <ActionButton variant="importar" context="header" label="Importar CSV" onClick={() => setImportAberto(true)} />
          )}
          {retiradas.length > 0 && (
            <ActionButton variant="exportar-csv" context="header" label="Exportar CSV" onClick={exportar} />
          )}
          <ActionButton variant="exportar-pdf" context="header" label="Exportar PDF" onClick={() => window.print()} />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-5">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Total Anual — {ano}</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{fmt(totalAnual)}</p>
          <p className="text-xs text-purple-500 mt-1">{retiradas.length} lançamento(s)</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Pago</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{fmt(totalPago)}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Total Pendente</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{fmt(totalPendente)}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Retiradas por Mês — {ano}</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={graficoDados}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => fmt(v)} />
            <Bar dataKey="valor" name="Retirada" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : retiradas.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">
            Nenhuma retirada em {ano}. Lance em <strong>Contas a Pagar</strong> com categoria <em>Recursos Humanos / Retirada Sócios</em>.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                {['Data', 'Descrição', 'Data Pagamento', 'Valor', 'Status'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${h === 'Valor' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {retiradas.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{c.data_vencimento}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{c.descricao}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.data_pagamento
                      ? <span className="text-green-700 dark:text-green-400">{c.data_pagamento}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-purple-700 dark:text-purple-400">{fmt(c.valor)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.pago ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                      {c.pago ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 font-bold">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-gray-700 dark:text-gray-300">Total</td>
                <td className="px-4 py-3 text-right text-purple-700 dark:text-purple-400">{fmt(totalAnual)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {importAberto && (
        <ImportCSV
          titulo="Importar Retiradas via CSV"
          colunas={['descricao', 'valor', 'data_vencimento']}
          exemplo={{ descricao: 'Retirada sócio', valor: '10000', data_vencimento: '2026-07-10' }}
          mapear={(l) => {
            if (!l.descricao || !l.valor || !l.data_vencimento) throw new Error('descricao, valor e data_vencimento são obrigatórios');
            return {
              descricao: l.descricao,
              categoria: 'recursos_humanos',
              subcategoria: 'retirada_socios',
              valor: parseFloat(l.valor.replace(',', '.')),
              data_vencimento: l.data_vencimento,
            };
          }}
          criar={(payload) => contasService.criar(payload)}
          onConcluido={carregar}
          onFechar={() => setImportAberto(false)}
        />
      )}
    </div>
  );
}
