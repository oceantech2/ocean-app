import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { saldosService, contasService, nfsService, fluxoMovimentosService, contasCorrentesService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { exportarCSV } from '../utils/export';
import {
  CODIGO_INVESTIMENTO,
  codigoPadrao,
  destinoInicialTransferencia,
  mapearMovimentos,
  movimentosSinalizadosDaConta,
  saldoVisivel,
} from '../utils/fluxoCaixaMovimentos';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import type { ContaCorrente, ContaPagar, FluxoConta, NF } from '../types';

const LIMITE_PAGINA = 1000;
const HOJE = new Date().toISOString().split('T')[0];

function paginaLista<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : [];
}

async function listarTodas<T>(
  buscar: (skip: number, limit: number) => Promise<{ data: unknown }>,
): Promise<T[]> {
  const todos: T[] = [];
  let skip = 0;
  for (let i = 0; i < 50; i += 1) {
    const res = await buscar(skip, LIMITE_PAGINA);
    const pagina = paginaLista<T>(res.data);
    todos.push(...pagina);
    if (pagina.length < LIMITE_PAGINA) break;
    skip += LIMITE_PAGINA;
  }
  return todos;
}

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 27 }, (_, i) => ANO_ATUAL - 2 + i);
const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const fmt = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const FORM_CONTA_VAZIO = { nome: '', banco: '', agencia: '', numero: '' };

function rotuloFluxo(fluxo: FluxoConta, contas: ContaCorrente[]) {
  if (fluxo === CODIGO_INVESTIMENTO) return 'Conta investimento';
  return contas.find((c) => c.codigo === fluxo)?.nome || fluxo;
}

function caixasOpcoes(contas: ContaCorrente[]): { codigo: string; nome: string }[] {
  return [
    ...contas.filter((c) => c.ativo).map((c) => ({ codigo: c.codigo, nome: c.nome })),
    { codigo: CODIGO_INVESTIMENTO, nome: 'Conta investimento' },
  ];
}

const TRANSF_INICIAL = {
  origem: 'corrente' as FluxoConta,
  destino: CODIGO_INVESTIMENTO as FluxoConta,
  valor: '',
  data_movimento: HOJE,
  observacao: '',
};

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
  const [fluxoAtivo, setFluxoAtivo] = useState<FluxoConta>('corrente');
  const [loading, setLoading] = useState(true);
  const [saldos, setSaldos] = useState<any[]>([]);
  const [saldosHistorico, setSaldosHistorico] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [nfsPagas, setNfsPagas] = useState<any[]>([]);
  const [contasPagas, setContasPagas] = useState<any[]>([]);
  const [movimentos, setMovimentos] = useState<any[]>([]);
  const [manuaisTodasContas, setManuaisTodasContas] = useState<any[]>([]);
  const [contasCorrentes, setContasCorrentes] = useState<ContaCorrente[]>([]);
  const [fluxoPronto, setFluxoPronto] = useState(false);

  const [transfAberto, setTransfAberto] = useState(false);
  const [transfForm, setTransfForm] = useState({ ...TRANSF_INICIAL });
  const [salvandoTransf, setSalvandoTransf] = useState(false);
  const [gerenciarAberto, setGerenciarAberto] = useState(false);
  const [contaEditando, setContaEditando] = useState<ContaCorrente | null>(null);
  const [contaForm, setContaForm] = useState({ ...FORM_CONTA_VAZIO });
  const [salvandoConta, setSalvandoConta] = useState(false);

  const padraoCodigo = codigoPadrao(contasCorrentes);
  const rotuloAtivo = rotuloFluxo(fluxoAtivo, contasCorrentes);
  const ehInvestimento = fluxoAtivo === CODIGO_INVESTIMENTO;

  const sortSaldos = useOrdenacao('mes');
  const sortMovimentos = useOrdenacao('data');

  useEffect(() => {
    contasCorrentesService.listar(true).then((res) => {
      const lista: ContaCorrente[] = res.data || [];
      setContasCorrentes(lista);
      setFluxoAtivo(codigoPadrao(lista));
      setFluxoPronto(true);
    }).catch(() => {
      toast.error('Erro ao carregar contas correntes');
      setFluxoPronto(true);
    });
  }, []);

  useEffect(() => { if (fluxoPronto) carregarDados(); }, [ano, mes, fluxoAtivo, fluxoPronto]);

  const carregarDados = async () => {
    setLoading(true);
    let lista: any[] = [];
    try {
      const [saldosRes, historicoRes] = await Promise.all([
        saldosService.listar(mes || undefined, ano, fluxoAtivo),
        saldosService.listar(undefined, undefined),
      ]);
      lista = saldosRes.data || [];
      setSaldos(lista);
      setSaldosHistorico(historicoRes.data || []);
    } catch {
      toast.error('Erro ao carregar dados');
      setSaldos([]);
      setSaldosHistorico([]);
    }

    let nfsOk = false;
    let contasOk = false;
    try {
      const nfs = await listarTodas<NF>((skip, limit) =>
        nfsService.listar(skip, limit, undefined, undefined, 'paga', false),
      );
      setNfsPagas(nfs);
      nfsOk = true;
    } catch {
      setNfsPagas([]);
    }
    try {
      const contas = await listarTodas<ContaPagar>((skip, limit) =>
        contasService.listar(skip, limit, undefined, true),
      );
      setContasPagas(contas);
      contasOk = true;
    } catch {
      setContasPagas([]);
    }
    if (!nfsOk || !contasOk) {
      toast.error('Erro ao carregar dados');
    }

    try {
      const [movRes, todosManuais] = await Promise.all([
        fluxoMovimentosService.listar(mes || undefined, ano, fluxoAtivo),
        fluxoMovimentosService.listar(),
      ]);
      setMovimentos(movRes.data || []);
      setManuaisTodasContas(todosManuais.data || []);
    } catch {
      setMovimentos([]);
      setManuaisTodasContas([]);
      toast.error('Erro ao carregar dados');
    }

    setChartData(MESES_NOME.map((nome, i) => {
      const m = i + 1;
      const registro = lista.find((s: any) => s.mes === m && s.conta === fluxoAtivo);
      return { mes: nome, saldo: registro?.saldo ?? null };
    }));
    setLoading(false);
  };

  const recarregarContas = async () => {
    const res = await contasCorrentesService.listar(true);
    const lista: ContaCorrente[] = res.data || [];
    setContasCorrentes(lista);
    if (!lista.some((c) => c.codigo === fluxoAtivo) && fluxoAtivo !== CODIGO_INVESTIMENTO) {
      setFluxoAtivo(codigoPadrao(lista));
    }
    return lista;
  };

  const abrirTransferencia = () => {
    const origem = fluxoAtivo;
    setTransfForm({
      origem,
      destino: destinoInicialTransferencia(origem, contasCorrentes),
      valor: '',
      data_movimento: HOJE,
      observacao: '',
    });
    setTransfAberto(true);
  };

  const saldoDaOrigem = (origem: FluxoConta) => saldoVisivel(
    origem,
    saldosHistorico,
    movimentosSinalizadosDaConta(nfsPagas, contasPagas, manuaisTodasContas, origem, padraoCodigo),
  );

  const salvarTransferencia = async () => {
    const { origem, destino, valor, data_movimento, observacao } = transfForm;
    if (origem === destino) {
      toast.error('Origem e destino devem ser caixas distintos');
      return;
    }
    const montante = parseFloat(valor);
    if (!valor || Number.isNaN(montante) || montante <= 0) {
      toast.error('Informe um valor maior que zero');
      return;
    }
    if (!data_movimento) {
      toast.error('Informe a data');
      return;
    }
    const teto = saldoDaOrigem(origem);
    if (montante > teto) {
      toast.error(`Valor não pode ultrapassar o saldo visível da origem (${fmt(teto)})`);
      return;
    }
    try {
      setSalvandoTransf(true);
      await fluxoMovimentosService.transferir({
        origem,
        destino,
        valor: montante,
        data_movimento,
        observacao: observacao.trim() || undefined,
      });
      toast.success('Transferência registrada');
      setTransfAberto(false);
      carregarDados();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao transferir'));
    } finally {
      setSalvandoTransf(false);
    }
  };

  const deletarMovimento = async (mov: { id: number; descricao: string }) => {
    if (!confirm(`Remover "${mov.descricao}"?`)) return;
    try {
      await fluxoMovimentosService.deletar(mov.id);
      toast.success('Removido');
      carregarDados();
    } catch { toast.error('Erro ao remover'); }
  };

  const desfazerTransferencia = async (parId: string, descricao: string) => {
    if (!confirm(`Desfazer a transferência "${descricao}" nos dois caixas?`)) return;
    try {
      await fluxoMovimentosService.desfazerTransferencia(parId);
      toast.success('Transferência desfeita');
      carregarDados();
    } catch { toast.error('Erro ao desfazer'); }
  };

  const abrirEditarConta = (c: ContaCorrente) => {
    setContaEditando(c);
    setContaForm({
      nome: c.nome,
      banco: c.banco,
      agencia: c.agencia || '',
      numero: c.numero || '',
    });
  };

  const salvarConta = async () => {
    if (!contaForm.nome.trim() || !contaForm.banco.trim()) {
      toast.error('Nome e banco são obrigatórios');
      return;
    }
    try {
      setSalvandoConta(true);
      const payload = {
        nome: contaForm.nome.trim(),
        banco: contaForm.banco.trim(),
        agencia: contaForm.agencia.trim() || undefined,
        numero: contaForm.numero.trim() || undefined,
      };
      if (contaEditando) {
        await contasCorrentesService.atualizar(contaEditando.id, payload);
        toast.success('Conta atualizada');
      } else {
        await contasCorrentesService.criar(payload);
        toast.success('Conta corrente criada');
      }
      setContaEditando(null);
      setContaForm({ ...FORM_CONTA_VAZIO });
      await recarregarContas();
      carregarDados();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao salvar conta'));
    } finally {
      setSalvandoConta(false);
    }
  };

  const tornarPadrao = async (c: ContaCorrente) => {
    try {
      await contasCorrentesService.atualizar(c.id, { padrao: true });
      toast.success(`${c.nome} é a conta padrão`);
      await recarregarContas();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao definir padrão'));
    }
  };

  const desativarConta = async (c: ContaCorrente) => {
    if (!confirm(`Desativar "${c.nome}"? O histórico permanece consultável.`)) return;
    try {
      await contasCorrentesService.atualizar(c.id, { ativo: false });
      toast.success('Conta desativada');
      await recarregarContas();
      carregarDados();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível desativar'));
    }
  };

  const valorCard = saldoVisivel(
    fluxoAtivo,
    saldosHistorico,
    movimentosSinalizadosDaConta(nfsPagas, contasPagas, manuaisTodasContas, fluxoAtivo, padraoCodigo),
  );
  const todosMovimentos = mapearMovimentos(nfsPagas, contasPagas, movimentos, mes, ano, fluxoAtivo, padraoCodigo);
  const totalEntradas = todosMovimentos.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + Math.abs(m.valor), 0);
  const totalSaidas = todosMovimentos.filter((m) => m.tipo === 'saida').reduce((s, m) => s + Math.abs(m.valor), 0);

  const SELECT = 'border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100';
  const INPUT = 'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-full';
  const strokeGrafico = ehInvestimento ? '#10B981' : '#3B82F6';

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
          Fluxo de Caixa <span className="text-lg font-normal text-gray-500 dark:text-gray-400">— {rotuloAtivo}</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap mt-3">
          <label className="text-sm text-gray-500 dark:text-gray-400">Fluxo:</label>
          <select
            value={fluxoAtivo}
            onChange={(e) => setFluxoAtivo(e.target.value as FluxoConta)}
            className={SELECT}
          >
            {caixasOpcoes(contasCorrentes).map((c) => (
              <option key={c.codigo} value={c.codigo}>{c.nome}</option>
            ))}
          </select>
          <label className="text-sm text-gray-500 dark:text-gray-400">Mês:</label>
          <select value={mes} onChange={(e) => setMes(e.target.value === '' ? '' : parseInt(e.target.value))}
            className={SELECT}>
            <option value="">Todos</option>
            {MESES_NOME.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <label className="text-sm text-gray-500 dark:text-gray-400">Ano:</label>
          <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}
            className={SELECT}>
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            onClick={() => exportarCSV(todosMovimentos.map((m) => ({
              Data: m.data,
              Tipo: m.tipo === 'entrada' ? 'Entrada' : 'Saída',
              Origem: m.origem_rotulo,
              Descrição: m.desc,
              Valor: m.valor,
            })).sort((a, b) => a.Data.localeCompare(b.Data)), `fluxo_caixa_${fluxoAtivo}_${ano}`)}
            disabled={todosMovimentos.length === 0}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↓ Exportar CSV
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            Exportar PDF
          </button>
          {papel === 'admin' && (
            <button onClick={abrirTransferencia} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
              Transferência
            </button>
          )}
          <button
            onClick={() => { setContaEditando(null); setContaForm({ ...FORM_CONTA_VAZIO }); setGerenciarAberto(true); }}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            Gerenciar contas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={ehInvestimento ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5'}>
          <p className={`text-xs font-medium ${ehInvestimento ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
            Saldo {rotuloAtivo}
          </p>
          <p className={`text-2xl font-bold mt-1 ${ehInvestimento ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
            {fmt(valorCard)}
          </p>
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

      {!loading && chartData.some((d) => d.saldo !== null) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Evolução de Saldo — {rotuloAtivo} {ano}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="saldo" name={rotuloAtivo} stroke={strokeGrafico} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Registros de Saldo — {rotuloAtivo}</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : saldos.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Nenhum saldo registrado para {rotuloAtivo} em {ano}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                {[
                  { label: 'Mês/Ano', campo: 'mes' },
                  { label: 'Saldo', campo: 'saldo' },
                  { label: 'Data Registro', campo: 'data_registro' },
                ].map(({ label, campo }) => (
                  <th
                    key={label}
                    onClick={() => sortSaldos.alternar(campo)}
                    className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${label === 'Saldo' ? 'text-right' : 'text-left'} cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400`}
                  >
                    {label}<sortSaldos.Icon campo={campo} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sortSaldos.ordenar(saldos, (s, campo) => (s as any)[campo]).map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{MESES_NOME[s.mes - 1]}/{s.ano}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">{fmt(s.saldo)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{s.data_registro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Movimentos — {rotuloAtivo} {mes !== '' ? `${MESES_NOME[Number(mes) - 1]}/` : ''}{ano}
          </h2>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">Entradas: {fmt(totalEntradas)}</span>
            <span className="text-red-600 dark:text-red-400 font-medium">Saídas: {fmt(totalSaidas)}</span>
            <span className={`font-bold ${totalEntradas - totalSaidas >= 0 ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400'}`}>
              Resultado: {fmt(totalEntradas - totalSaidas)}
            </span>
          </div>
        </div>
        {todosMovimentos.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">
            Nenhum movimento em {rotuloAtivo} neste período
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                {[
                  { label: 'Data', campo: 'data' },
                  { label: 'Tipo', campo: 'tipo' },
                  { label: 'Origem', campo: 'origem_rotulo' },
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
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{mov.origem_rotulo}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{mov.desc}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${mov.tipo === 'entrada' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {mov.tipo === 'entrada' ? '+' : ''}{fmt(Math.abs(mov.valor))}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {papel === 'admin' && mov.origem === 'transferencia' && mov.parId && (
                      <button
                        onClick={() => desfazerTransferencia(mov.parId as string, mov.desc)}
                        className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200"
                      >
                        Desfazer
                      </button>
                    )}
                    {papel === 'admin' && mov.manual && mov.movId && (
                      <button
                        onClick={() => deletarMovimento({ id: mov.movId as number, descricao: mov.desc })}
                        className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200"
                      >
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {transfAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Transferência</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Saldo visível da origem: {fmt(saldoDaOrigem(transfForm.origem))}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Origem</label>
                <select
                  className={SELECT + ' w-full'}
                  value={transfForm.origem}
                  onChange={(e) => {
                    const origem = e.target.value;
                    setTransfForm((atual) => ({
                      ...atual,
                      origem,
                      destino: atual.destino === origem
                        ? destinoInicialTransferencia(origem, contasCorrentes)
                        : atual.destino,
                    }));
                  }}
                >
                  {caixasOpcoes(contasCorrentes).map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Destino</label>
                <select
                  className={SELECT + ' w-full'}
                  value={transfForm.destino}
                  onChange={(e) => setTransfForm({ ...transfForm, destino: e.target.value })}
                >
                  {caixasOpcoes(contasCorrentes).map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={INPUT}
                  value={transfForm.valor}
                  onChange={(e) => setTransfForm({ ...transfForm, valor: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data *</label>
                <input
                  type="date"
                  className={INPUT}
                  value={transfForm.data_movimento}
                  onChange={(e) => setTransfForm({ ...transfForm, data_movimento: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Observação</label>
                <input
                  type="text"
                  className={INPUT}
                  value={transfForm.observacao}
                  onChange={(e) => setTransfForm({ ...transfForm, observacao: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setTransfAberto(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button
                onClick={salvarTransferencia}
                disabled={salvandoTransf}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {salvandoTransf ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {gerenciarAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gerenciar contas correntes</h2>
              <button onClick={() => setGerenciarAberto(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">Fechar</button>
            </div>
            <div className="p-6 space-y-4">
              {contasCorrentes.map((c) => (
                <div key={c.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex flex-wrap gap-3 justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {c.nome}{c.padrao ? ' · padrão' : ''}
                    </p>
                    <p className="text-sm text-gray-500">{c.banco}{c.agencia ? ` · ag. ${c.agencia}` : ''}{c.numero ? ` · ${c.numero}` : ''}</p>
                  </div>
                  {papel === 'admin' && (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => abrirEditarConta(c)} className="text-xs px-2 py-1 border rounded-lg">Editar</button>
                      {!c.padrao && (
                        <button onClick={() => tornarPadrao(c)} className="text-xs px-2 py-1 border rounded-lg">Tornar padrão</button>
                      )}
                      <button onClick={() => desativarConta(c)} className="text-xs px-2 py-1 border border-red-200 text-red-700 rounded-lg">Desativar</button>
                    </div>
                  )}
                </div>
              ))}
              {papel === 'admin' && (
                <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">{contaEditando ? 'Editar conta' : 'Nova conta corrente'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className={INPUT} placeholder="Nome *" value={contaForm.nome} onChange={(e) => setContaForm({ ...contaForm, nome: e.target.value })} />
                    <input className={INPUT} placeholder="Banco *" value={contaForm.banco} onChange={(e) => setContaForm({ ...contaForm, banco: e.target.value })} />
                    <input className={INPUT} placeholder="Agência" value={contaForm.agencia} onChange={(e) => setContaForm({ ...contaForm, agencia: e.target.value })} />
                    <input className={INPUT} placeholder="Número" value={contaForm.numero} onChange={(e) => setContaForm({ ...contaForm, numero: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={salvarConta} disabled={salvandoConta} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {salvandoConta ? 'Salvando...' : 'Salvar'}
                    </button>
                    {contaEditando && (
                      <button onClick={() => { setContaEditando(null); setContaForm({ ...FORM_CONTA_VAZIO }); }} className="px-4 py-2 text-gray-600">Cancelar edição</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
