import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { saldosService, contasService, nfsService, fluxoMovimentosService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { exportarCSV } from '../utils/export';
import ImportCSV from '../components/ImportCSV';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 27 }, (_, i) => ANO_ATUAL - 2 + i);
const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const fmt = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const FORM_INICIAL = { mes: new Date().getMonth() + 1, ano: ANO_ATUAL, conta: 'corrente', saldo: '', data_registro: new Date().toISOString().split('T')[0] };
const MOV_FORM_INICIAL = { tipo: 'receita' as 'receita' | 'despesa', descricao: '', valor: '', data_movimento: new Date().toISOString().split('T')[0] };

function useOrdenacao(campoInicial: string) {
  const [campo, setCampo] = useState(campoInicial);
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');
  const alternar = (c: string) => {
    if (campo === c) { setDir((d) => d === 'asc' ? 'desc' : 'asc'); }
    else { setCampo(c); setDir('asc'); }
  };
  const Icon = ({ campo: c }: { campo: string }) => (
    <span className="ml-1 text-xs opacity-50">{campo === c ? (dir === 'asc' ? '▲' : '▼') : '⇅'}</span>
  );
  const ordenar = <T,>(items: T[], extrator: (item: T, campo: string) => any) => [...items].sort((a, b) => {
    const mult = dir === 'asc' ? 1 : -1;
    const va = extrator(a, campo) ?? '';
    const vb = extrator(b, campo) ?? '';
    if (typeof va === 'number' && typeof vb === 'number') return mult * (va - vb);
    return mult * String(va).localeCompare(String(vb));
  });
  return { campo, dir, alternar, Icon, ordenar };
}

export default function FluxoCaixa() {
  const papel = useAuthStore((s) => s.papel);
  const [ano, setAno] = useState(ANO_ATUAL);
  const [mes, setMes] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saldos, setSaldos] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [nfsPagas, setNfsPagas] = useState<any[]>([]);
  const [contasPagas, setContasPagas] = useState<any[]>([]);
  const [movimentos, setMovimentos] = useState<any[]>([]);

  // Modal saldo
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);
  const [importAberto, setImportAberto] = useState(false);

  // Modal movimento manual
  const [movModalAberto, setMovModalAberto] = useState(false);
  const [movForm, setMovForm] = useState({ ...MOV_FORM_INICIAL });
  const [salvandoMov, setSalvandoMov] = useState(false);

  const sortSaldos = useOrdenacao('mes');
  const sortMovimentos = useOrdenacao('data');

  useEffect(() => { carregarDados(); }, [ano, mes]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [saldosRes, nfsPagasRes, contasPagasRes, movRes] = await Promise.all([
        saldosService.listar(mes || undefined, ano),
        // Sem filtro de ano: queremos filtrar por data_pagamento, não data_emissao
        nfsService.listar(0, 1000, undefined, undefined, 'paga'),
        contasService.listar(0, 1000, undefined, true),
        fluxoMovimentosService.listar(mes || undefined, ano),
      ]);

      const lista: any[] = saldosRes.data || [];
      setSaldos(lista);
      setMovimentos(movRes.data || []);

      const nfsAno = (nfsPagasRes.data || []).filter((nf: any) => {
        if (!nf.data_pagamento) return false;
        const d = new Date(nf.data_pagamento + 'T00:00:00');
        if (d.getFullYear() !== ano) return false;
        if (mes !== '' && d.getMonth() + 1 !== mes) return false;
        return true;
      });
      setNfsPagas(nfsAno);

      const contasAno = (contasPagasRes.data || []).filter((c: any) => {
        if (!c.data_pagamento) return false;
        const d = new Date(c.data_pagamento + 'T00:00:00');
        if (d.getFullYear() !== ano) return false;
        if (mes !== '' && d.getMonth() + 1 !== mes) return false;
        return true;
      });
      setContasPagas(contasAno);

      const chart = MESES_NOME.map((nome, i) => {
        const m = i + 1;
        const corrente = lista.find((s: any) => s.mes === m && s.conta === 'corrente');
        const investimento = lista.find((s: any) => s.mes === m && s.conta === 'investimento');
        return {
          mes: nome,
          corrente: corrente?.saldo ?? null,
          investimento: investimento?.saldo ?? null,
        };
      });
      setChartData(chart);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const abrirCriar = () => { setEditando(null); setForm({ ...FORM_INICIAL }); setModalAberto(true); };
  const abrirEditar = (s: any) => {
    setEditando(s);
    setForm({ mes: s.mes, ano: s.ano, conta: s.conta, saldo: String(s.saldo), data_registro: s.data_registro });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.saldo || !form.data_registro) { toast.error('Preencha saldo e data'); return; }
    try {
      setSalvando(true);
      const dados = { mes: Number(form.mes), ano: Number(form.ano), conta: form.conta, saldo: parseFloat(form.saldo), data_registro: form.data_registro };
      if (editando) { await saldosService.atualizar(editando.id, dados); toast.success('Saldo atualizado!'); }
      else { await saldosService.criar(dados); toast.success('Saldo registrado!'); }
      setModalAberto(false);
      carregarDados();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao salvar saldo'));
    } finally { setSalvando(false); }
  };

  const deletar = async (s: any) => {
    if (!confirm(`Deletar saldo de ${MESES_NOME[s.mes - 1]}/${s.ano} (${s.conta})?`)) return;
    try { await saldosService.deletar(s.id); toast.success('Removido'); carregarDados(); }
    catch { toast.error('Erro ao remover'); }
  };

  const abrirIncluirReceita = () => {
    setMovForm({ ...MOV_FORM_INICIAL, tipo: 'receita' });
    setMovModalAberto(true);
  };

  const abrirIncluirDespesa = () => {
    setMovForm({ ...MOV_FORM_INICIAL, tipo: 'despesa' });
    setMovModalAberto(true);
  };

  const salvarMovimento = async () => {
    if (!movForm.descricao || !movForm.valor || !movForm.data_movimento) {
      toast.error('Preencha descrição, valor e data');
      return;
    }
    try {
      setSalvandoMov(true);
      await fluxoMovimentosService.criar({
        tipo: movForm.tipo,
        descricao: movForm.descricao,
        valor: parseFloat(movForm.valor),
        data_movimento: movForm.data_movimento,
      });
      toast.success(movForm.tipo === 'receita' ? 'Receita incluída!' : 'Despesa incluída!');
      setMovModalAberto(false);
      carregarDados();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao salvar'));
    } finally { setSalvandoMov(false); }
  };

  const deletarMovimento = async (mov: any) => {
    if (!confirm(`Remover "${mov.descricao}"?`)) return;
    try {
      await fluxoMovimentosService.deletar(mov.id);
      toast.success('Removido');
      carregarDados();
    } catch { toast.error('Erro ao remover'); }
  };

  const ultimoCorrente = [...saldos].filter((s) => s.conta === 'corrente').sort((a, b) => b.mes - a.mes)[0];
  const ultimoInvestimento = [...saldos].filter((s) => s.conta === 'investimento').sort((a, b) => b.mes - a.mes)[0];

  // Montar lista de movimentos combinada (NFs + Contas + Manuais)
  const movimentosAutoEntrada = nfsPagas.map((nf) => ({ id: `nf-${nf.id}`, data: nf.data_pagamento, tipo: 'entrada', desc: `NF ${nf.numero} — ${nf.razao_social}`, valor: nf.valor_liquido, manual: false }));
  const movimentosAutoSaida = contasPagas.map((c) => ({ id: `conta-${c.id}`, data: c.data_pagamento, tipo: 'saida', desc: c.descricao, valor: -c.valor, manual: false }));
  const movimentosManuais = movimentos.map((m) => ({ id: `mov-${m.id}`, data: m.data_movimento, tipo: m.tipo === 'receita' ? 'entrada' : 'saida', desc: `${m.descricao} ✦`, valor: m.tipo === 'receita' ? m.valor : -m.valor, manual: true, movId: m.id }));
  const todosMovimentos = [...movimentosAutoEntrada, ...movimentosAutoSaida, ...movimentosManuais];

  const totalEntradas = todosMovimentos.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + Math.abs(m.valor), 0);
  const totalSaidas = todosMovimentos.filter((m) => m.tipo === 'saida').reduce((s, m) => s + Math.abs(m.valor), 0);

  const INPUT = 'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-full';

  return (
    <div className="space-y-6">
      {/* Header — sticky para não pular com mudança de conteúdo */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
          Fluxo de Caixa <span className="text-lg font-normal text-gray-500 dark:text-gray-400">— Saldo corrente e conta investimento</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap mt-3">
          <label className="text-sm text-gray-500 dark:text-gray-400">Mês:</label>
          <select value={mes} onChange={(e) => setMes(e.target.value === '' ? '' : parseInt(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <option value="">Todos</option>
            {MESES_NOME.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <label className="text-sm text-gray-500 dark:text-gray-400">Ano:</label>
          <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {papel === 'admin' && (
            <button onClick={() => setImportAberto(true)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
              ↑ Importar CSV
            </button>
          )}
          <button
            onClick={() => exportarCSV(todosMovimentos.map((m) => ({
              Data: m.data,
              Tipo: m.tipo === 'entrada' ? 'Entrada' : 'Saída',
              Descrição: m.desc,
              Valor: m.valor,
            })).sort((a, b) => a.Data.localeCompare(b.Data)), `fluxo_caixa_${ano}`)}
            disabled={todosMovimentos.length === 0}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↓ Exportar CSV
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            Exportar PDF
          </button>
          {papel === 'admin' && (
            <>
              <button onClick={abrirIncluirReceita} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition">
                + Incluir receita
              </button>
              <button onClick={abrirIncluirDespesa} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition">
                − Incluir despesa
              </button>
              <button onClick={abrirCriar} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                + Registrar Saldo
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Saldo Corrente (último)</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{ultimoCorrente ? fmt(ultimoCorrente.saldo) : '—'}</p>
          {ultimoCorrente && <p className="text-xs text-blue-500 mt-1">{MESES_NOME[ultimoCorrente.mes - 1]}/{ultimoCorrente.ano}</p>}
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Conta Investimento (último)</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{ultimoInvestimento ? fmt(ultimoInvestimento.saldo) : '—'}</p>
          {ultimoInvestimento && <p className="text-xs text-green-500 mt-1">{MESES_NOME[ultimoInvestimento.mes - 1]}/{ultimoInvestimento.ano}</p>}
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-5">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Entradas — {mes !== '' ? MESES_NOME[Number(mes) - 1] : 'Ano'} {ano}</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{fmt(totalEntradas)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Total Saídas — {mes !== '' ? MESES_NOME[Number(mes) - 1] : 'Ano'} {ano}</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{fmt(totalSaidas)}</p>
        </div>
      </div>

      {/* Gráfico */}
      {!loading && chartData.some((d) => d.corrente !== null || d.investimento !== null) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Evolução de Saldo — {ano}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="corrente" name="Conta Corrente" stroke="#3B82F6" dot={{ r: 4 }} connectNulls />
              <Line type="monotone" dataKey="investimento" name="Conta Investimento" stroke="#10B981" dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabela de saldos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Registros de Saldo</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : saldos.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Nenhum saldo registrado para {ano}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                {[
                  { label: 'Mês/Ano', campo: 'mes' },
                  { label: 'Conta', campo: 'conta' },
                  { label: 'Saldo', campo: 'saldo' },
                  { label: 'Data Registro', campo: 'data_registro' },
                  { label: '', campo: null },
                ].map(({ label, campo }) => (
                  <th
                    key={label}
                    onClick={campo ? () => sortSaldos.alternar(campo) : undefined}
                    className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${label === 'Saldo' ? 'text-right' : 'text-left'} ${campo ? 'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                  >
                    {label}{campo && <sortSaldos.Icon campo={campo} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortSaldos.ordenar(saldos, (s, campo) => (s as any)[campo]).map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{MESES_NOME[s.mes - 1]}/{s.ano}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.conta === 'corrente' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>
                      {s.conta === 'corrente' ? 'Conta Corrente' : 'Conta Investimento'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">{fmt(s.saldo)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{s.data_registro}</td>
                  <td className="px-4 py-3">
                    {papel === 'admin' && (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => abrirEditar(s)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200">Editar</button>
                        <button onClick={() => deletar(s)} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200">Deletar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Movimentos do Caixa */}
      {todosMovimentos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Movimentos do Caixa — {mes !== '' ? `${MESES_NOME[Number(mes) - 1]}/` : ''}{ano}</h2>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">✦ = lançamento manual</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">Entradas: {fmt(totalEntradas)}</span>
              <span className="text-red-600 dark:text-red-400 font-medium">Saídas: {fmt(totalSaidas)}</span>
              <span className={`font-bold ${totalEntradas - totalSaidas >= 0 ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400'}`}>
                Resultado: {fmt(totalEntradas - totalSaidas)}
              </span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                {[
                  { label: 'Data', campo: 'data' },
                  { label: 'Tipo', campo: 'tipo' },
                  { label: 'Descrição', campo: 'desc' },
                  { label: 'Valor', campo: 'valor' },
                  { label: '', campo: null },
                ].map(({ label, campo }) => (
                  <th
                    key={label}
                    onClick={campo ? () => sortMovimentos.alternar(campo) : undefined}
                    className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${campo ? 'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400' : ''} ${label === 'Valor' ? 'text-right' : 'text-left'}`}
                  >
                    {label}{campo && <sortMovimentos.Icon campo={campo} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortMovimentos.ordenar(todosMovimentos, (mov: any, campo) => mov[campo]).map((mov) => (
                <tr key={mov.id} className={`transition-colors ${mov.tipo === 'entrada' ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100/80 dark:hover:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100/80 dark:hover:bg-red-900/20'}`}>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{mov.data}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${mov.tipo === 'entrada' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                      {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{mov.desc}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${mov.tipo === 'entrada' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {mov.tipo === 'entrada' ? '+' : ''}{fmt(Math.abs(mov.valor))}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {mov.manual && papel === 'admin' && (
                      <button onClick={() => deletarMovimento({ id: mov.movId, descricao: mov.desc })} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200">
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Saldo */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editando ? 'Editar Saldo' : 'Registrar Saldo'}</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Mês *</label>
                <select className={INPUT} value={form.mes} onChange={(e) => setForm({ ...form, mes: parseInt(e.target.value) })}>
                  {MESES_NOME.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano *</label>
                <select className={INPUT} value={form.ano} onChange={(e) => setForm({ ...form, ano: parseInt(e.target.value) })}>
                  {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Conta *</label>
                <select className={INPUT} value={form.conta} onChange={(e) => setForm({ ...form, conta: e.target.value })}>
                  <option value="corrente">Conta Corrente</option>
                  <option value="investimento">Conta Investimento</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Saldo (R$) *</label>
                <input type="number" step="0.01" className={INPUT} value={form.saldo} onChange={(e) => setForm({ ...form, saldo: e.target.value })} placeholder="0,00" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de Registro *</label>
                <input type="date" className={INPUT} value={form.data_registro} onChange={(e) => setForm({ ...form, data_registro: e.target.value })} />
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={salvando} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Movimento Manual */}
      {movModalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className={`p-6 border-b dark:border-gray-700 ${movForm.tipo === 'receita' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {movForm.tipo === 'receita' ? '+ Incluir Receita' : '− Incluir Despesa'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lançamento manual no fluxo de caixa</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipo</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMovForm({ ...movForm, tipo: 'receita' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${movForm.tipo === 'receita' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                  >
                    Receita
                  </button>
                  <button
                    onClick={() => setMovForm({ ...movForm, tipo: 'despesa' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${movForm.tipo === 'despesa' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                  >
                    Despesa
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Descrição *</label>
                <input
                  type="text"
                  className={INPUT}
                  value={movForm.descricao}
                  onChange={(e) => setMovForm({ ...movForm, descricao: e.target.value })}
                  placeholder="Ex: Transferência bancária, Aporte, etc."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={INPUT}
                  value={movForm.valor}
                  onChange={(e) => setMovForm({ ...movForm, valor: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data *</label>
                <input
                  type="date"
                  className={INPUT}
                  value={movForm.data_movimento}
                  onChange={(e) => setMovForm({ ...movForm, data_movimento: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setMovModalAberto(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button
                onClick={salvarMovimento}
                disabled={salvandoMov}
                className={`px-5 py-2 text-white rounded-lg disabled:opacity-50 font-medium ${movForm.tipo === 'receita' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {salvandoMov ? 'Salvando...' : `Incluir ${movForm.tipo === 'receita' ? 'receita' : 'despesa'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {importAberto && (
        <ImportCSV
          titulo="Saldos via CSV"
          colunas={['conta', 'mes', 'ano', 'saldo']}
          mapear={(l) => ({
            conta: l.conta || 'corrente',
            mes: parseInt(l.mes),
            ano: parseInt(l.ano),
            saldo: parseFloat(l.saldo),
            data_registro: new Date().toISOString().split('T')[0],
          })}
          criar={(payload) => saldosService.criar(payload)}
          onConcluido={() => { setImportAberto(false); carregarDados(); }}
          onFechar={() => setImportAberto(false)}
        />
      )}
    </div>
  );
}
