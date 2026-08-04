import { useState, useEffect } from 'react';
import { nfsService, colaboradoresService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { NF, Colaborador } from '../types';
import { usePageFilters, useAuthStore, useNotifStore } from '../store';
import Pagination from '../components/Pagination';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const OPCOES_PAGINA = [15, 25, 50, 100];

function tipoLabel(tipo: string, tipoAb?: string) {
  if (tipo === 'sucesso') return 'Sucesso';
  if (tipoAb === 'abertura') return 'Retainer - Abertura';
  if (tipoAb === 'fechamento') return 'Retainer - Fechamento';
  return 'Retainer';
}

function tipoColor(tipo: string, tipoAb?: string) {
  if (tipo === 'sucesso') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
  if (tipoAb === 'abertura') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
  return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400';
}

function rowBg(status: string) {
  if (status === 'paga') return 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100/80 dark:hover:bg-green-900/20';
  if (status === 'pendente') return 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/20';
  if (status === 'cancelada') return 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100/80 dark:hover:bg-red-900/20 opacity-60';
  return 'bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100/60 dark:hover:bg-orange-900/20';
}

function statusColor(s: string) {
  if (s === 'paga') return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400';
  if (s === 'vencida') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400';
  if (s === 'cancelada') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400';
}
function statusLabel(s: string) {
  if (s === 'paga') return 'Paga';
  if (s === 'vencida') return 'Vencida';
  if (s === 'cancelada') return 'Cancelada';
  return 'Pendente';
}

function caixaLabel(caixa?: string | null) {
  if (caixa === 'corrente') return 'Corrente';
  if (caixa === 'investimento') return 'Investimento';
  return 'Não definido';
}

function tipoToCombined(tipo: string, tipoAb?: string): string {
  if (tipo === 'retainer' && tipoAb === 'abertura') return 'retainer|abertura';
  if (tipo === 'retainer' && tipoAb === 'fechamento') return 'retainer|fechamento';
  if (tipo === 'retainer') return 'retainer|abertura';
  return 'sucesso';
}

const FORM_INICIAL = {
  numero: '', razao_social: '', posicao: '', candidato: '',
  valor_bruto: '', valor_liquido: '', data_emissao: '', data_vencimento: '',
  data_pagamento: '',
  tipo_combined: 'sucesso',
  colaborador_lead_id: '', colaborador_conducao_id: '', colaborador_placement_id: '',
  caixa: '' as '' | 'corrente' | 'investimento',
};

const INPUT = 'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-full';
const INPUT_RO = INPUT + ' bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 cursor-not-allowed';

export default function NFs() {
  const papel = useAuthStore((s) => s.papel);
  const { nfsMes, nfsAno, nfsStatus, setNfsFilters } = usePageFilters();
  const triggerNotifRefresh = useNotifStore((s) => s.triggerNotifRefresh);
  const triggerCalendarioRefresh = useNotifStore((s) => s.triggerCalendarioRefresh);

  const [nfs, setNfs] = useState<NF[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<any>(null);
  const [pagina, setPagina] = useState(0);
  const [itensPorPagina, setItensPorPagina] = useState(15);
  const [sortField, setSortField] = useState<string>('data_emissao');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<NF | null>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);

  const [pagarModal, setPagarModal] = useState<NF | null>(null);
  const [dataPagamentoForm, setDataPagamentoForm] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');

  useEffect(() => { carregarColaboradores(); }, []);
  useEffect(() => { carregarNFs(); setPagina(0); }, [nfsMes, nfsAno, nfsStatus, mostrarArquivadas]);

  const carregarColaboradores = async () => {
    try {
      const res = await colaboradoresService.listar(0, 200, true);
      setColaboradores(res.data);
    } catch { /* silencioso */ }
  };

  const carregarNFs = async () => {
    try {
      setLoading(true);
      const [nfsRes, resumoRes] = await Promise.all([
        nfsService.listar(0, 500, nfsMes !== '' ? nfsMes : undefined, nfsAno || undefined, nfsStatus || undefined, mostrarArquivadas),
        nfsService.resumo(nfsMes !== '' ? nfsMes : undefined, nfsAno || undefined),
      ]);
      setNfs(nfsRes.data);
      setResumo(resumoRes.data);
    } catch (e: any) {
      setNfs([]);
      setResumo(null);
      toast.error(mensagemErro(e, 'Erro ao carregar Contas a Receber'));
    } finally {
      setLoading(false);
    }
  };

  const abrirEditar = (nf: NF) => {
    setEditando(nf);
    setForm({
      numero: nf.numero, razao_social: nf.razao_social, posicao: nf.posicao || '',
      candidato: nf.candidato || '', valor_bruto: String(nf.valor_bruto),
      valor_liquido: String(nf.valor_liquido), data_emissao: nf.data_emissao,
      data_vencimento: nf.data_vencimento, data_pagamento: nf.data_pagamento || '',
      tipo_combined: tipoToCombined(nf.tipo, nf.tipo_abertura_fechamento),
      colaborador_lead_id: String(nf.colaborador_lead_id || ''),
      colaborador_conducao_id: String(nf.colaborador_conducao_id || ''),
      colaborador_placement_id: String(nf.colaborador_placement_id || ''),
      caixa: (nf.caixa === 'corrente' || nf.caixa === 'investimento') ? nf.caixa : '',
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!editando) return;
    try {
      setSalvando(true);
      const dados = {
        data_pagamento: form.data_pagamento || null,
        colaborador_lead_id: form.colaborador_lead_id ? parseInt(form.colaborador_lead_id) : null,
        colaborador_conducao_id: form.colaborador_conducao_id ? parseInt(form.colaborador_conducao_id) : null,
        colaborador_placement_id: form.colaborador_placement_id ? parseInt(form.colaborador_placement_id) : null,
        caixa: form.caixa === '' ? null : form.caixa,
      };
      await nfsService.atualizar(editando.id, dados);
      toast.success('Conta a receber atualizada!');
      setModalAberto(false);
      carregarNFs();
      triggerNotifRefresh();
      triggerCalendarioRefresh();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao salvar'));
    } finally { setSalvando(false); }
  };

  const abrirPagar = (nf: NF) => {
    setDataPagamentoForm(new Date().toISOString().split('T')[0]);
    setPagarModal(nf);
  };

  const confirmarPagamento = async () => {
    if (!pagarModal) return;
    try {
      await nfsService.atualizar(pagarModal.id, {
        data_pagamento: dataPagamentoForm || new Date().toISOString().split('T')[0],
      });
      toast.success('Marcada como recebida!');
      setPagarModal(null);
      carregarNFs(); triggerNotifRefresh(); triggerCalendarioRefresh();
    } catch { toast.error('Erro ao registrar pagamento'); }
  };

  const arquivarNF = async (nf: NF) => {
    const acao = nf.arquivada ? 'desarquivar' : 'arquivar';
    try {
      await nfsService.arquivar(nf.id, !nf.arquivada);
      toast.success(`Registro ${acao}do`);
      carregarNFs();
    } catch { toast.error(`Erro ao ${acao}`); }
  };

  const alternarOrdenacao = (campo: string) => {
    if (sortField === campo) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(campo); setSortDir('asc'); }
    setPagina(0);
  };

  const exportarXlsx = () => {
    nfsService.exportarXlsx({ mes: nfsMes !== '' ? nfsMes : undefined, ano: nfsAno || undefined });
  };

  const exportar = () => {
    exportarCSV(nfs.map((n) => ({
      Número: n.numero, Cliente: n.razao_social, Posição: n.posicao || '',
      Candidato: n.candidato || '',
      Tipo: tipoLabel(n.tipo, n.tipo_abertura_fechamento),
      Bruto: n.valor_bruto, Líquido: n.valor_liquido,
      Emissão: n.data_emissao, Vencimento: n.data_vencimento,
      Pagamento: n.data_pagamento || '', Status: n.status,
      Caixa: caixaLabel(n.caixa),
    })), `contas_receber_${nfsAno}`);
  };

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00';

  const nfsFiltradas = (() => {
    const base = filtroCliente
      ? nfs.filter((n) => n.razao_social.toLowerCase().includes(filtroCliente.toLowerCase()))
      : nfs;
    return [...base].sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      const va = (a as any)[sortField] ?? '';
      const vb = (b as any)[sortField] ?? '';
      if (typeof va === 'number' && typeof vb === 'number') return mult * (va - vb);
      return mult * String(va).localeCompare(String(vb));
    });
  })();

  const paginados = nfsFiltradas.slice(pagina * itensPorPagina, (pagina + 1) * itensPorPagina);

  const SortIcon = ({ campo }: { campo: string }) => (
    <span className="ml-1 text-xs opacity-50">{sortField === campo ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
          Contas a Receber — <span className="text-lg font-normal text-gray-500 dark:text-gray-400">{nfs.length} registro(s)</span>
        </h1>
        <div className="flex gap-2 flex-wrap">
          {nfs.length > 0 && (
            <button onClick={exportar} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↓ Exportar CSV
            </button>
          )}
          <button onClick={exportarXlsx} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
            ↓ Exportar Excel (.xlsx)
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Mês</label>
          <select className={INPUT} value={nfsMes} onChange={(e) => { setNfsFilters(e.target.value === '' ? '' : parseInt(e.target.value), nfsAno, nfsStatus); }}>
            <option value="">Todos</option>
            {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano</label>
          <input type="number" className={INPUT + ' !w-24'} value={nfsAno} onChange={(e) => setNfsFilters(nfsMes, parseInt(e.target.value), nfsStatus)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Status</label>
          <select className={INPUT} value={nfsStatus} onChange={(e) => setNfsFilters(nfsMes, nfsAno, e.target.value)}>
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="paga">Paga</option>
            <option value="vencida">Vencida</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Cliente</label>
          <input
            type="text"
            className={INPUT + ' !w-48'}
            value={filtroCliente}
            onChange={(e) => { setFiltroCliente(e.target.value); setPagina(0); }}
            placeholder="Buscar por cliente..."
          />
        </div>
        <div className="flex gap-3 text-xs ml-2 items-center">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block"></span>Paga</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200 inline-block"></span>Pendente</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 inline-block"></span>Vencida</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer ml-2">
          <input type="checkbox" checked={mostrarArquivadas} onChange={(e) => setMostrarArquivadas(e.target.checked)} className="rounded" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Mostrar arquivadas</span>
        </label>
        <div className="ml-auto flex items-center gap-2">
          {nfsFiltradas.length !== nfs.length && (
            <span className="text-xs text-blue-600 dark:text-blue-400">{nfsFiltradas.length} de {nfs.length}</span>
          )}
          <label className="text-xs text-gray-500 dark:text-gray-400">Exibir</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1 text-xs" value={itensPorPagina} onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPagina(0); }}>
            {OPCOES_PAGINA.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-xs text-gray-400">por página</span>
        </div>
      </div>

      {resumo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Bruto Pago</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300 mt-1">{fmt(resumo.total_bruto_pago)}</p>
            <p className="text-xs text-green-500 dark:text-green-500">{resumo.qtd_pagas} registro(s)</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Líquido Pago</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">{fmt(resumo.total_liquido_pago)}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Pendente</p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{fmt(resumo.total_bruto_pendente)}</p>
            <p className="text-xs text-yellow-500">{resumo.qtd_pendentes} registro(s)</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Vencido</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300 mt-1">{fmt(resumo.total_bruto_vencido)}</p>
            <p className="text-xs text-red-500">{resumo.qtd_vencidas} registro(s)</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Carregando...</p>
          </div>
        ) : nfs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Nenhuma conta a receber encontrada</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  {[
                    { label: 'Nº', campo: 'numero' },
                    { label: 'Cliente', campo: 'razao_social' },
                    { label: 'Posição / Candidato', campo: null },
                    { label: 'Tipo', campo: 'tipo' },
                    { label: 'Bruto', campo: 'valor_bruto' },
                    { label: 'Líquido', campo: 'valor_liquido' },
                    { label: 'Emissão', campo: 'data_emissao' },
                    { label: 'Vencimento', campo: 'data_vencimento' },
                    { label: 'Pagamento', campo: 'data_pagamento' },
                    { label: 'Caixa', campo: 'caixa' },
                    { label: 'Status', campo: 'status' },
                    { label: '', campo: null },
                  ].map(({ label, campo }) => (
                    <th
                      key={label || 'acoes'}
                      onClick={campo ? () => alternarOrdenacao(campo) : undefined}
                      className={`px-3 py-3 text-gray-600 dark:text-gray-300 font-medium ${['Bruto', 'Líquido'].includes(label) ? 'text-right' : 'text-left'} ${campo ? 'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                    >
                      {label}{campo && <SortIcon campo={campo} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginados.map((nf) => (
                  <tr key={nf.id} className={`${rowBg(nf.status)} transition-colors ${nf.arquivada ? 'opacity-50' : ''}`}>
                    <td className="px-3 py-3 font-mono font-medium text-gray-800 dark:text-gray-200">
                      {nf.numero}
                      {nf.arquivada && <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-1 rounded">Arq.</span>}
                    </td>
                    <td className="px-3 py-3 text-gray-700 dark:text-gray-300 max-w-[160px] truncate">{nf.razao_social}</td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      <div>{nf.posicao || '-'}</div>
                      {nf.candidato && <div className="text-gray-400">{nf.candidato}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${tipoColor(nf.tipo, nf.tipo_abertura_fechamento)}`}>
                        {tipoLabel(nf.tipo, nf.tipo_abertura_fechamento)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">{fmt(nf.valor_bruto)}</td>
                    <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">{fmt(nf.valor_liquido)}</td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">{nf.data_emissao}</td>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">{nf.data_vencimento}</td>
                    <td className="px-3 py-3 text-xs">
                      {nf.data_pagamento
                        ? <span className="text-green-700 dark:text-green-400 font-medium">{nf.data_pagamento}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-300">
                      {nf.caixa
                        ? <span className="font-medium">{caixaLabel(nf.caixa)}</span>
                        : <span className="text-gray-400 italic">Não definido</span>}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(nf.status)}`}>{statusLabel(nf.status)}</span>
                    </td>
                    <td className="px-3 py-3">
                      {papel === 'admin' && (
                        <div className="flex gap-1 justify-end flex-wrap">
                          {nf.status !== 'paga' && nf.status !== 'cancelada' && !nf.arquivada && (
                            <button onClick={() => abrirPagar(nf)} className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap">Pagar</button>
                          )}
                          {!nf.arquivada && <button onClick={() => abrirEditar(nf)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60">Editar</button>}
                          <button onClick={() => arquivarNF(nf)} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title={nf.arquivada ? 'Desarquivar' : 'Arquivar'}>
                            {nf.arquivada ? '↩ Exibir' : '↓ Arquivar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total={nfsFiltradas.length} pagina={pagina} tamanho={itensPorPagina} onChange={setPagina} />
          </>
        )}
      </div>

      {modalAberto && editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Editar Conta a Receber</h2>
              <p className="text-xs text-gray-500 mt-1">Campos da Maggo são somente leitura</p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Número</label>
                <input className={INPUT_RO} value={form.numero} readOnly disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipo</label>
                <input className={INPUT_RO} value={tipoLabel(editando.tipo, editando.tipo_abertura_fechamento)} readOnly disabled />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Razão Social</label>
                <input className={INPUT_RO} value={form.razao_social} readOnly disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Posição</label>
                <input className={INPUT_RO} value={form.posicao} readOnly disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Candidato</label>
                <input className={INPUT_RO} value={form.candidato} readOnly disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor Bruto</label>
                <input className={INPUT_RO} value={form.valor_bruto} readOnly disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor Líquido</label>
                <input className={INPUT_RO} value={form.valor_liquido} readOnly disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Emissão</label>
                <input type="date" className={INPUT_RO} value={form.data_emissao} readOnly disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Vencimento</label>
                <input type="date" className={INPUT_RO} value={form.data_vencimento} readOnly disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Pagamento</label>
                <input type="date" className={INPUT} value={form.data_pagamento} onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Caixa</label>
                <select
                  className={INPUT}
                  value={form.caixa}
                  onChange={(e) => setForm({ ...form, caixa: e.target.value as '' | 'corrente' | 'investimento' })}
                >
                  <option value="">Não definido</option>
                  <option value="corrente">Corrente</option>
                  <option value="investimento">Investimento</option>
                </select>
              </div>
              {[
                { label: 'Lead', key: 'colaborador_lead_id' },
                { label: 'Condução', key: 'colaborador_conducao_id' },
                { label: 'Placement', key: 'colaborador_placement_id' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
                  <select className={INPUT} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                    <option value="">Nenhum</option>
                    {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              ))}
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

      {pagarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Registrar Pagamento</h2>
              <p className="text-sm text-gray-500 mt-1">{pagarModal.numero} — {pagarModal.razao_social}</p>
            </div>
            <div className="p-6">
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de Pagamento *</label>
              <input
                type="date"
                className={INPUT}
                value={dataPagamentoForm}
                onChange={(e) => setDataPagamentoForm(e.target.value)}
              />
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setPagarModal(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={confirmarPagamento} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
