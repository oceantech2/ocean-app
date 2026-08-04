import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { relatoriosService, impostosService } from '../services/api';
import { useFilterStore } from '../store';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';

const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const fmt = (v: number) =>
  v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00';

export default function Relatorios() {
  const { anoAtual } = useFilterStore();
  const [filtroAno, setFiltroAno] = useState(anoAtual);
  const [loading, setLoading] = useState(true);

  const [faturamento, setFaturamento] = useState<any[]>([]);
  const [fechamentos, setFechamentos] = useState<any>({});
  const [mostrarAnterior, setMostrarAnterior] = useState(true);
  const [bonusMensal, setBonusMensal] = useState<any[]>([]);
  const [porCliente, setPorCliente] = useState<any[]>([]);
  const [resumo, setResumo] = useState<any>({});
  const [leads, setLeads] = useState<any[]>([]);
  const [conducoes, setConducoes] = useState<any[]>([]);
  const [placementPorConsultor, setPlacementPorConsultor] = useState<any[]>([]);
  const [impostos, setImpostos] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, [filtroAno]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [fatRes, fatAntRes, fechRes, bonusRes, clienteRes, resumoRes, placRes, impostosRes] = await Promise.all([
        relatoriosService.faturamentoLiquidoMes(filtroAno),
        relatoriosService.faturamentoLiquidoMes(filtroAno - 1),
        relatoriosService.fechamentosPorTipo(filtroAno),
        relatoriosService.bonusMensal(filtroAno),
        relatoriosService.faturamentoPorCliente(filtroAno, 10),
        relatoriosService.resumoFinanceiro(filtroAno),
        relatoriosService.placementPorConsultor(filtroAno),
        impostosService.listar(filtroAno).catch(() => ({ data: [] })),
      ]);

      const fatPorMes: Record<number, number> = {};
      (fatRes.data.dados || []).forEach((d: any) => { fatPorMes[d.mes] = d.valor; });
      const fatAntPorMes: Record<number, number> = {};
      (fatAntRes.data.dados || []).forEach((d: any) => { fatAntPorMes[d.mes] = d.valor; });
      setFaturamento(
        Array.from({ length: 12 }, (_, i) => ({
          mes: MESES_NOME[i],
          valor: fatPorMes[i + 1] || 0,
          valorAnterior: fatAntPorMes[i + 1] || 0,
        }))
      );

      setFechamentos(fechRes.data || {});

      const bonusPorMes: Record<number, number> = {};
      (bonusRes.data.dados || []).forEach((d: any) => { bonusPorMes[d.mes] = d.total; });
      setBonusMensal(
        Array.from({ length: 12 }, (_, i) => ({ mes: MESES_NOME[i], total: bonusPorMes[i + 1] || 0 }))
      );

      setPorCliente(clienteRes.data.clientes || []);
      setResumo(resumoRes.data || {});
      setLeads(placRes.data.leads || []);
      setConducoes(placRes.data.conducoes || []);
      setPlacementPorConsultor(placRes.data.placements || []);
      setImpostos(impostosRes.data || []);
    } catch {
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const closureData = [
    { name: 'Retainer', value: fechamentos.retainer || 0 },
    { name: 'Sucesso', value: fechamentos.sucesso || 0 },
  ];

  return (
    <div className="space-y-6 print-area">
      {/* Cabeçalho visível apenas na impressão/PDF */}
      <div className="print-only mb-4">
        <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Ocean App — Relatório Financeiro {filtroAno}</h1>
        <p style={{ fontSize: 12, color: '#555' }}>
          Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </p>
        <hr />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Relatórios <span className="text-gray-500 dark:text-gray-400 font-normal text-base">— Análise financeira e operacional</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={mostrarAnterior} onChange={(e) => setMostrarAnterior(e.target.checked)} className="rounded" />
            Comparar {filtroAno - 1}
          </label>
          <label className="text-sm text-gray-600 dark:text-gray-400">Ano:</label>
          <input
            type="number"
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-24"
            value={filtroAno}
            onChange={(e) => setFiltroAno(parseInt(e.target.value))}
          />
          <button
            onClick={() => toast('Use as páginas NFs e Contas para importar dados', { icon: 'ℹ️' })}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition"
          >
            ↑ Importar CSV
          </button>
          <button
            onClick={() => exportarCSV(faturamento.map((d) => ({ Mês: d.mes, [`Faturamento ${filtroAno}`]: d.valor, [`Faturamento ${filtroAno - 1}`]: d.valorAnterior })), `relatorio_${filtroAno}`)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition"
          >
            ↓ Exportar CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center text-gray-500 dark:text-gray-400">
          Carregando relatórios...
        </div>
      ) : (
        <>
          {/* Cards KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Faturamento Líquido</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{fmt(resumo.faturamento_liquido_pago || 0)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{resumo.quantidade_pagas || 0} NFs pagas</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Faturamento Bruto</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{fmt(resumo.faturamento_bruto_pago || 0)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">NFs Pendentes</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{resumo.quantidade_pendentes || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Fechamentos</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {(fechamentos.retainer || 0) + (fechamentos.sucesso || 0)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{fechamentos.retainer || 0} retainer · {fechamentos.sucesso || 0} sucesso</p>
            </div>
          </div>

          {/* Gráficos linha e pizza */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Faturamento Líquido Mensal</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={faturamento}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => fmt(v)} />
                  <Legend />
                  {mostrarAnterior && (
                    <Line type="monotone" dataKey="valorAnterior" stroke="#9CA3AF" strokeDasharray="5 5" dot={{ r: 3 }} name={`${filtroAno - 1}`} />
                  )}
                  <Line type="monotone" dataKey="valor" stroke="#3B82F6" dot={{ r: 4 }} name={`${filtroAno}`} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Fechamentos por Tipo</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={closureData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {closureData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bônus Mensal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Bônus Mensal</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bonusMensal}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Bar dataKey="total" name="Total Bônus" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Faturamento por Cliente */}
          {porCliente.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Faturamento por Cliente — {filtroAno}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">Cliente</th>
                      <th className="px-4 py-2 text-center text-gray-600 dark:text-gray-300 font-medium">NFs</th>
                      <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">Bruto</th>
                      <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300 font-medium">Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {porCliente.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300 truncate max-w-xs">{c.nome}</td>
                        <td className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">{c.quantidade}</td>
                        <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{fmt(c.valor_bruto)}</td>
                        <td className="px-4 py-2 text-right font-medium text-blue-700 dark:text-blue-400">{fmt(c.valor_liquido)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <tr>
                      <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300" colSpan={2}>Total</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">{fmt(porCliente.reduce((s: number, c: any) => s + (c.valor_bruto || 0), 0))}</td>
                      <td className="px-4 py-2 text-right font-semibold text-blue-700 dark:text-blue-400">{fmt(porCliente.reduce((s: number, c: any) => s + (c.valor_liquido || 0), 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Lead, Condução e Placement por Consultor */}
          {(leads.length > 0 || conducoes.length > 0 || placementPorConsultor.length > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Lead, Condução e Placement por Consultor — {filtroAno}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { titulo: 'Lead', dados: leads, cor: 'text-blue-700 dark:text-blue-400' },
                  { titulo: 'Condução', dados: conducoes, cor: 'text-purple-700 dark:text-purple-400' },
                  { titulo: 'Placement', dados: placementPorConsultor, cor: 'text-green-700 dark:text-green-400' },
                ].map(({ titulo, dados, cor }) => (
                  <div key={titulo}>
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">{titulo}</h3>
                    {dados.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500">Sem registros</p>
                    ) : (
                      <div className="space-y-1">
                        {dados.map((p: any, i: number) => (
                          <div key={i} className="py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{p.consultor}</span>
                              <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">{p.quantidade}x</span>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-0.5">
                              <span className="text-gray-400 dark:text-gray-500">Bruto: {fmt(p.valor_bruto)}</span>
                              <span className={`font-medium ${cor}`}>Líq: {fmt(p.valor_liquido)}</span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-1 flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                          <span>Total</span>
                          <span className={cor}>{fmt(dados.reduce((s: number, p: any) => s + (p.valor_liquido || 0), 0))}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evolução de Impostos */}
          {impostos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Acompanhamento de Impostos — {filtroAno}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Evolução mês a mês do percentual, valor do imposto e faturamento</p>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={impostos}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="mes" tickFormatter={(v) => ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][v - 1] || v} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => v.toLocaleString('pt-BR')} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any, name: string) => name.includes('%') ? `${v}%` : fmt(v)} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="faturamento" name="Faturamento" fill="#3B82F6" opacity={0.7} radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="left" dataKey="valor_imposto" name="Valor Imposto" fill="#EF4444" opacity={0.8} radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="percentual_imposto" name="% Imposto" stroke="#F59E0B" dot={{ r: 4 }} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      {['Mês', 'Faturamento', '% Imposto', 'Valor Imposto'].map((h) => (
                        <th key={h} className={`px-4 py-2 text-gray-600 dark:text-gray-300 font-medium ${h === 'Mês' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {impostos.map((imp) => (
                      <tr key={imp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][imp.mes - 1]}
                        </td>
                        <td className="px-4 py-2 text-right text-blue-700 dark:text-blue-400">{fmt(imp.faturamento)}</td>
                        <td className="px-4 py-2 text-right text-yellow-700 dark:text-yellow-400">{imp.percentual_imposto}%</td>
                        <td className="px-4 py-2 text-right text-red-700 dark:text-red-400">{fmt(imp.valor_imposto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tabela resumo por mês */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Resumo Mensal — {filtroAno}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Mês</th>
                    <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Faturamento Líquido</th>
                    <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Bônus Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {faturamento.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{f.mes}</td>
                      <td className="px-4 py-3 text-right text-blue-700 dark:text-blue-400 font-medium">{fmt(f.valor)}</td>
                      <td className="px-4 py-3 text-right text-green-700 dark:text-green-400">{fmt(bonusMensal[i]?.total || 0)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-700 font-bold">
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">Total</td>
                    <td className="px-4 py-3 text-right text-blue-800 dark:text-blue-300">{fmt(faturamento.reduce((s, f) => s + f.valor, 0))}</td>
                    <td className="px-4 py-3 text-right text-green-800 dark:text-green-300">{fmt(bonusMensal.reduce((s, b) => s + b.total, 0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
