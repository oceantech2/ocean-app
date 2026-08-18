import { useState, useEffect, useRef } from 'react';
import { nfsService, contasCorrentesService, impostosService } from '../services/api';
import { mensagemErro, detalheObjeto } from '../utils/erros';
import { ContaCorrente, NF } from '../types';
import { caixaInicialForm, codigoPadrao, rotuloContaOrigem } from '../utils/fluxoCaixaMovimentos';
import { anosCompetencia, mapaAliquotas, textoTooltipAliquota } from '../utils/aliquotaMes';
import { usePageFilters, useAuthStore, useNotifStore } from '../store';
import Pagination from '../components/Pagination';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const OPCOES_PAGINA = [15, 25, 50, 100];

function tipoLabel(tipo: string) {
  if (tipo === 'parcelamento') return 'Parcelamento';
  if (tipo === 'sucesso') return 'Sucesso';
  return 'Retainer';
}

function tipoColor(tipo: string) {
  if (tipo === 'parcelamento') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
  if (tipo === 'sucesso') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400';
  return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
}

function rowBg(status: string) {
  if (status === 'paga') return 'bg-green-50 dark:bg-[#15241c] hover:bg-green-100 dark:hover:bg-[#1c3328]';
  if (status === 'pendente') return 'bg-yellow-50 dark:bg-[#242015] hover:bg-yellow-100 dark:hover:bg-[#332c18]';
  if (status === 'cancelada') return 'bg-red-50 dark:bg-[#241515] hover:bg-red-100 dark:hover:bg-[#331c1c]';
  return 'bg-orange-50 dark:bg-[#241c15] hover:bg-orange-100 dark:hover:bg-[#332818]';
}

function stickyBg(status: string) {
  if (status === 'paga') return 'bg-green-50 dark:bg-[#15241c] group-hover:bg-green-100 dark:group-hover:bg-[#1c3328]';
  if (status === 'pendente') return 'bg-yellow-50 dark:bg-[#242015] group-hover:bg-yellow-100 dark:group-hover:bg-[#332c18]';
  if (status === 'cancelada') return 'bg-red-50 dark:bg-[#241515] group-hover:bg-red-100 dark:group-hover:bg-[#331c1c]';
  return 'bg-orange-50 dark:bg-[#241c15] group-hover:bg-orange-100 dark:group-hover:bg-[#332818]';
}

function statusColor(s: string) {
  if (s === 'paga') return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400';
  if (s === 'vencida') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400';
  if (s === 'cancelada') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400';
}
function statusLabel(s: string) {
  if (s === 'paga') return 'Recebida';
  if (s === 'vencida') return 'Vencida';
  if (s === 'cancelada') return 'Cancelada';
  return 'Pendente';
}

function origemLabel(origem?: string | null) {
  return origem === 'manual' ? 'Manual' : 'Maggo';
}

function IconPagar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconEditar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconArquivar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function IconExibir({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const BTN_ICON = 'inline-flex items-center justify-center w-7 h-7 rounded transition';

const MSG_DATA_PAGAMENTO = 'Informe a data de pagamento para marcar como recebido.';
const MSG_NF_EXIGE_EMISSAO = 'Informe a data de emissão junto com o número da NF.';

const FORM_INICIAL = {
  numero: '', razao_social: '', posicao: '', candidato: '',
  valor_bruto: '', valor_imposto: '', valor_liquido: '',
  data_ent_pgto: '', data_emissao: '', data_vencimento: '',
  data_pagamento: '',
  pagamento_estado: 'pendente' as 'pendente' | 'recebido',
  caixa: '',
  tipo: 'retainer' as 'retainer' | 'sucesso' | 'parcelamento',
};

const INPUT = 'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-full';
const INPUT_RO = INPUT + ' bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 cursor-not-allowed';

const COLUNAS: { label: string; campo: string | null; className: string; width: string }[] = [
  { label: 'Projeto', campo: 'posicao', width: '8.5rem', className: 'sticky left-0 z-[2] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]' },
  { label: 'Origem', campo: 'origem', width: '5.5rem', className: '' },
  { label: 'Método de pagamento', campo: 'tipo', width: '6.5rem', className: '' },
  { label: 'Bruto', campo: 'valor_bruto', width: '6.5rem', className: '' },
  { label: 'Imposto', campo: 'valor_imposto', width: '5.5rem', className: '' },
  { label: 'Líquido', campo: 'valor_liquido', width: '6.5rem', className: '' },
  { label: 'Data de fechamento', campo: 'data_ent_pgto', width: '6.5rem', className: '' },
  { label: 'NF', campo: 'numero', width: '4.5rem', className: '' },
  { label: 'Emissão', campo: 'data_emissao', width: '5.5rem', className: '' },
  { label: 'Vencimento', campo: 'data_vencimento', width: '5.5rem', className: '' },
  { label: 'Pagamento', campo: 'data_pagamento', width: '5.5rem', className: '' },
  { label: 'Conta corrente', campo: 'caixa', width: '7rem', className: '' },
  { label: 'Status', campo: 'status', width: '5.5rem', className: '' },
  { label: 'Ações', campo: null, width: '6.5rem', className: 'sticky right-0 z-[2] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.12)]' },
];

const TABELA_CLASSE = 'w-full text-sm border-collapse table-fixed min-w-[1020px]';

export default function NFs() {
  const papel = useAuthStore((s) => s.papel);
  const { nfsMes, nfsAno, nfsStatus, nfsSemNumero, setNfsFilters } = usePageFilters();
  const triggerNotifRefresh = useNotifStore((s) => s.triggerNotifRefresh);
  const triggerCalendarioRefresh = useNotifStore((s) => s.triggerCalendarioRefresh);

  const [nfs, setNfs] = useState<NF[]>([]);
  const [aliquotaPorMes, setAliquotaPorMes] = useState<Record<string, number>>({});
  const [contasCorrentes, setContasCorrentes] = useState<ContaCorrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<any>(null);
  const [pagina, setPagina] = useState(0);
  const [itensPorPagina, setItensPorPagina] = useState(15);
  const [sortField, setSortField] = useState<string>('data_emissao');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<NF | null>(null);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
  const [conflitoNfId, setConflitoNfId] = useState<number | null>(null);

  const [pagarModal, setPagarModal] = useState<NF | null>(null);
  const [dataPagamentoForm, setDataPagamentoForm] = useState('');
  const [caixaReceberForm, setCaixaReceberForm] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const headScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const syncingScroll = useRef(false);

  useEffect(() => {
    contasCorrentesService.listar(true).then((res) => setContasCorrentes(res.data || [])).catch(() => setContasCorrentes([]));
  }, []);

  useEffect(() => { carregarNFs(); setPagina(0); }, [nfsMes, nfsAno, nfsStatus, nfsSemNumero, mostrarArquivadas]);

  const carregarNFs = async () => {
    try {
      setLoading(true);
      const semNumero = nfsSemNumero || nfsStatus === 'sem_nf';
      const [nfsRes, resumoRes] = await Promise.all([
        nfsService.listar(
          0,
          500,
          semNumero ? undefined : (nfsMes !== '' ? nfsMes : undefined),
          semNumero ? undefined : (nfsAno || undefined),
          semNumero ? undefined : (nfsStatus || undefined),
          mostrarArquivadas,
        ),
        nfsService.resumo(
          semNumero ? undefined : (nfsMes !== '' ? nfsMes : undefined),
          semNumero ? undefined : (nfsAno || undefined),
        ).catch(() => null),
      ]);
      const lista = Array.isArray(nfsRes.data) ? nfsRes.data : [];
      const visiveis = semNumero
        ? lista.filter((n: NF) => n.status !== 'cancelada' && !(n.numero ?? '').trim())
        : lista;
      setNfs(visiveis);
      setResumo(resumoRes?.data ?? null);
      const anos = anosCompetencia(visiveis);
      try {
        if (anos.length === 0) {
          setAliquotaPorMes({});
        } else {
          const respostas = await Promise.all(anos.map((ano) => impostosService.deContas(ano)));
          const itens = respostas.flatMap((r) => (Array.isArray(r.data) ? r.data : []));
          setAliquotaPorMes(mapaAliquotas(itens));
        }
      } catch {
        setAliquotaPorMes({});
      }
      const headers = nfsRes.headers || {};
      const maggoStatus = headers['x-ocean-maggo-status'];
      const ignorados = headers['x-ocean-maggo-ignorados'];
      if (maggoStatus === 'unavailable') {
        toast('Fonte Maggo indisponível — exibindo registros locais', { icon: '⚠️' });
      }
      if (ignorados) {
        toast(`Maggo ignorou número(s) manuais: ${ignorados}`, { icon: 'ℹ️' });
      }
    } catch (e: any) {
      setNfs([]);
      setAliquotaPorMes({});
      setResumo(null);
      toast.error(mensagemErro(e, 'Erro ao carregar Contas a Receber'));
    } finally {
      setLoading(false);
    }
  };

  const abrirEditar = (nf: NF) => {
    setCriando(false);
    setConflitoNfId(null);
    setEditando(nf);
    setForm({
      numero: nf.numero || '', razao_social: nf.razao_social, posicao: nf.posicao || '',
      candidato: nf.candidato || '', valor_bruto: String(nf.valor_bruto),
      valor_imposto: nf.valor_imposto == null ? '' : String(nf.valor_imposto),
      valor_liquido: String(nf.valor_liquido),
      data_ent_pgto: nf.data_ent_pgto || '',
      data_emissao: nf.data_emissao || '',
      data_vencimento: nf.data_vencimento || '', data_pagamento: nf.data_pagamento || '',
      pagamento_estado: nf.data_pagamento ? 'recebido' : 'pendente',
      caixa: caixaInicialForm(nf.caixa, contasCorrentes),
      tipo: (nf.tipo === 'sucesso' || nf.tipo === 'parcelamento' ? nf.tipo : 'retainer'),
    });
    setModalAberto(true);
  };

  const abrirCriar = () => {
    setCriando(true);
    setEditando(null);
    setConflitoNfId(null);
    setForm({ ...FORM_INICIAL, caixa: codigoPadrao(contasCorrentes) });
    setModalAberto(true);
  };

  const abrirExistentePorId = async (nfId: number) => {
    try {
      const res = await nfsService.obter(nfId);
      abrirEditar(res.data);
      setConflitoNfId(null);
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível abrir a conta existente'));
    }
  };

  const tratarConflitoNumero = (e: any): boolean => {
    const d = detalheObjeto(e);
    if (e?.response?.status === 409 && d?.code === 'NF_NUMERO_DUPLICADO' && d.nf_id) {
      const num = d.numero || form.numero;
      toast.error(d.message || `Já existe uma conta a receber com o número ${num}.`);
      setConflitoNfId(d.nf_id);
      return true;
    }
    return false;
  };

  const salvar = async () => {
    const numeroTrim = form.numero.trim();
    if (numeroTrim && !form.data_emissao) {
      toast.error(MSG_NF_EXIGE_EMISSAO);
      return;
    }
    if (criando) {
      if (!form.razao_social.trim() || !form.valor_bruto || !form.valor_liquido) {
        toast.error('Preencha empresa, método de pagamento, valor bruto e valor líquido');
        return;
      }
      const recebido = form.pagamento_estado === 'recebido';
      if (recebido && !form.data_pagamento) {
        toast.error(MSG_DATA_PAGAMENTO);
        return;
      }
      try {
        setSalvando(true);
        setConflitoNfId(null);
        await nfsService.criar({
          numero: numeroTrim || null,
          razao_social: form.razao_social.trim(),
          posicao: form.posicao.trim() || null,
          valor_bruto: parseFloat(form.valor_bruto),
          valor_imposto: form.valor_imposto === '' ? null : parseFloat(form.valor_imposto),
          valor_liquido: parseFloat(form.valor_liquido),
          data_ent_pgto: form.data_ent_pgto || null,
          data_emissao: form.data_emissao || null,
          data_vencimento: form.data_vencimento || null,
          tipo: form.tipo,
          data_pagamento: recebido ? form.data_pagamento : null,
          caixa: recebido ? (form.caixa || codigoPadrao(contasCorrentes)) : null,
        });
        toast.success('Conta a receber criada!');
        setModalAberto(false);
        setCriando(false);
        carregarNFs();
        triggerNotifRefresh();
        triggerCalendarioRefresh();
      } catch (e: any) {
        if (!tratarConflitoNumero(e)) toast.error(mensagemErro(e, 'Erro ao criar'));
      } finally { setSalvando(false); }
      return;
    }

    if (!editando) return;
    const isManual = editando.origem === 'manual';
    const recebido = form.pagamento_estado === 'recebido';
    const dataPagamento = recebido ? (form.data_pagamento || null) : null;
    try {
      setSalvando(true);
      setConflitoNfId(null);
      const dados: Record<string, unknown> = {
        numero: numeroTrim || null,
        data_emissao: form.data_emissao || null,
        data_vencimento: form.data_vencimento || null,
        data_pagamento: dataPagamento,
      };
      if (recebido && form.caixa) {
        dados.caixa = form.caixa;
      }
      if (isManual) {
        if (!form.razao_social.trim() || !form.valor_bruto || !form.valor_liquido) {
          toast.error('Preencha empresa, método de pagamento, valor bruto e valor líquido');
          setSalvando(false);
          return;
        }
        Object.assign(dados, {
          razao_social: form.razao_social.trim(),
          posicao: form.posicao || null,
          candidato: form.candidato || null,
          valor_bruto: parseFloat(form.valor_bruto),
          valor_imposto: form.valor_imposto === '' ? null : parseFloat(form.valor_imposto),
          valor_liquido: parseFloat(form.valor_liquido),
          data_ent_pgto: form.data_ent_pgto || null,
          tipo: form.tipo,
        });
      }
      await nfsService.atualizar(editando.id, dados);
      toast.success('Conta a receber atualizada!');
      setModalAberto(false);
      carregarNFs();
      triggerNotifRefresh();
      triggerCalendarioRefresh();
    } catch (e: any) {
      if (!tratarConflitoNumero(e)) toast.error(mensagemErro(e, 'Erro ao salvar'));
    } finally { setSalvando(false); }
  };

  const abrirPagar = (nf: NF) => {
    setDataPagamentoForm(new Date().toISOString().split('T')[0]);
    setCaixaReceberForm(caixaInicialForm(nf.caixa, contasCorrentes));
    setPagarModal(nf);
  };

  const confirmarPagamento = async () => {
    if (!pagarModal) return;
    if (!dataPagamentoForm) {
      toast.error(MSG_DATA_PAGAMENTO);
      return;
    }
    if (!caixaReceberForm) {
      toast.error('Selecione a conta corrente');
      return;
    }
    try {
      await nfsService.atualizar(pagarModal.id, {
        data_pagamento: dataPagamentoForm,
        caixa: caixaReceberForm,
      });
      toast.success('Marcada como recebida!');
      setPagarModal(null);
      carregarNFs(); triggerNotifRefresh(); triggerCalendarioRefresh();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao registrar recebimento'));
    }
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
      NF: n.numero || '',
      Projeto: n.posicao || '',
      Empresa: n.razao_social,
      Origem: origemLabel(n.origem),
      'Método de pagamento': tipoLabel(n.tipo),
      Bruto: n.valor_bruto,
      Imposto: n.valor_imposto ?? '',
      Líquido: n.valor_liquido,
      'Data de fechamento': n.data_ent_pgto || '',
      Emissão: n.data_emissao || '',
      Vencimento: n.data_vencimento || '',
      Pagamento: n.data_pagamento || '',
      'Conta corrente': rotuloContaOrigem(n.caixa, contasCorrentes),
      Status: statusLabel(n.status),
    })), `contas_receber_${nfsAno}`);
  };

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00';
  const dash = (v?: string | null) => v || '—';
  const fmtImposto = (v?: number | null) => (v == null ? '—' : fmt(v));

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

  const sincronizarScroll = (origem: 'head' | 'body') => {
    if (syncingScroll.current) return;
    const head = headScrollRef.current;
    const body = bodyScrollRef.current;
    if (!head || !body) return;
    syncingScroll.current = true;
    if (origem === 'head') body.scrollLeft = head.scrollLeft;
    else head.scrollLeft = body.scrollLeft;
    syncingScroll.current = false;
  };

  useEffect(() => {
    const body = bodyScrollRef.current;
    if (!body) return;
    const onWheel = (e: WheelEvent) => {
      const horizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal) return;
      const dx = e.shiftKey && Math.abs(e.deltaX) < 1 ? e.deltaY : e.deltaX;
      if (!dx) return;
      e.preventDefault();
      body.scrollLeft += dx;
      if (headScrollRef.current) headScrollRef.current.scrollLeft = body.scrollLeft;
    };
    body.addEventListener('wheel', onWheel, { passive: false });
    return () => body.removeEventListener('wheel', onWheel);
  }, [loading, nfs.length]);

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
          {papel === 'admin' && (
            <button onClick={abrirCriar} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition">
              + Nova conta a receber
            </button>
          )}
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
          <select className={INPUT} value={nfsMes} onChange={(e) => { setNfsFilters(e.target.value === '' ? '' : parseInt(e.target.value), nfsAno, nfsSemNumero ? 'sem_nf' : nfsStatus); }} disabled={nfsSemNumero}>
            <option value="">Todos</option>
            {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano</label>
          <input type="number" className={INPUT + ' !w-24'} value={nfsAno} onChange={(e) => setNfsFilters(nfsMes, parseInt(e.target.value), nfsSemNumero ? 'sem_nf' : nfsStatus)} disabled={nfsSemNumero} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Status</label>
          <select className={INPUT} value={nfsSemNumero || nfsStatus === 'sem_nf' ? 'sem_nf' : nfsStatus} onChange={(e) => {
            setNfsFilters(nfsMes, nfsAno, e.target.value);
          }}>
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="paga">Recebida</option>
            <option value="vencida">Vencida</option>
            <option value="sem_nf">Sem NF</option>
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
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block"></span>Recebida</span>
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
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Bruto Recebido</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300 mt-1">{fmt(resumo.total_bruto_pago)}</p>
            <p className="text-xs text-green-500 dark:text-green-500">{resumo.qtd_pagas} registro(s)</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Líquido Recebido</p>
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

      <div className="relative z-0 isolate bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-[36rem] flex flex-col">
        {loading ? (
          <div className="flex-1 p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Carregando...</p>
          </div>
        ) : nfs.length === 0 ? (
          <div className="flex-1 p-8 text-center text-gray-400 dark:text-gray-500 flex items-center justify-center">Nenhuma conta a receber encontrada</div>
        ) : (
          <>
            <div
              ref={headScrollRef}
              className="nfs-grade-head shrink-0"
              onScroll={() => sincronizarScroll('head')}
            >
              <table className={TABELA_CLASSE}>
                <colgroup>
                  {COLUNAS.map((c) => <col key={c.label} style={{ width: c.width }} />)}
                </colgroup>
                <thead>
                  <tr>
                    {COLUNAS.map(({ label, campo, className }) => (
                      <th
                        key={label}
                        title={label}
                        onClick={campo ? () => alternarOrdenacao(campo) : undefined}
                        className={`px-2 py-2.5 align-middle text-center text-gray-600 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-700 ${className} ${campo ? 'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                      >
                        <span className="inline-flex items-center justify-center gap-0.5 w-full min-w-0">
                          <span className="line-clamp-2 break-words leading-tight whitespace-normal text-center min-w-0">{label}</span>
                          {campo && <SortIcon campo={campo} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
            <div
              ref={bodyScrollRef}
              className="nfs-grade-body flex-1 min-h-0"
              onScroll={() => sincronizarScroll('body')}
            >
            <table className={TABELA_CLASSE}>
              <colgroup>
                {COLUNAS.map((c) => <col key={c.label} style={{ width: c.width }} />)}
              </colgroup>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginados.map((nf) => {
                  const tipImposto = textoTooltipAliquota(nf, aliquotaPorMes);
                  return (
                  <tr key={nf.id} className={`${rowBg(nf.status)} transition-colors ${nf.arquivada ? 'text-gray-400 dark:text-gray-500' : ''} group`}>
                    <td className={`px-2 py-2.5 text-gray-700 dark:text-gray-300 max-w-[8.5rem] sticky left-0 z-[1] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)] ${stickyBg(nf.status)}`}>
                      <div className="font-medium text-gray-800 dark:text-gray-100 truncate" title={nf.posicao || ''}>{dash(nf.posicao)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={nf.razao_social}>{nf.razao_social}</div>
                    </td>
                    <td className="px-2 py-2.5 text-xs whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded font-medium ${nf.origem === 'manual' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {origemLabel(nf.origem)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${tipoColor(nf.tipo)}`}>
                        {tipoLabel(nf.tipo)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap tabular-nums">{fmt(nf.valor_bruto)}</td>
                    <td className="px-2 py-2.5 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap tabular-nums">
                      <span tabIndex={0} title={tipImposto} aria-label={tipImposto} className="outline-none">
                        {fmtImposto(nf.valor_imposto)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap tabular-nums">{fmt(nf.valor_liquido)}</td>
                    <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{dash(nf.data_ent_pgto)}</td>
                    <td className="px-2 py-2.5 font-mono font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span>{nf.numero || '—'}</span>
                        {nf.arquivada && <span className="text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-1 rounded">Arq.</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{dash(nf.data_emissao)}</td>
                    <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{dash(nf.data_vencimento)}</td>
                    <td className="px-2 py-2.5 text-xs whitespace-nowrap">
                      {nf.data_pagamento
                        ? <span className="text-green-700 dark:text-green-400 font-medium">{nf.data_pagamento}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-2 py-2.5 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{rotuloContaOrigem(nf.caixa, contasCorrentes)}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${statusColor(nf.status)}`}>{statusLabel(nf.status)}</span>
                    </td>
                    <td className={`px-2 py-2.5 sticky right-0 z-[1] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.12)] ${stickyBg(nf.status)}`}>
                      {papel === 'admin' && (
                        <div className="flex gap-0.5 justify-end">
                          <button
                            type="button"
                            onClick={() => abrirPagar(nf)}
                            disabled={nf.status === 'paga' || nf.status === 'cancelada' || !!nf.arquivada}
                            className={`${BTN_ICON} ${
                              nf.status === 'paga' || nf.status === 'cancelada' || nf.arquivada
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                            }`}
                            title="Recebido"
                            aria-label="Recebido"
                          >
                            <IconPagar />
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirEditar(nf)}
                            disabled={!!nf.arquivada}
                            className={`${BTN_ICON} ${
                              nf.arquivada
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                            }`}
                            title="Editar"
                            aria-label="Editar"
                          >
                            <IconEditar />
                          </button>
                          <button
                            type="button"
                            onClick={() => arquivarNF(nf)}
                            className={`${BTN_ICON} text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`}
                            title={nf.arquivada ? 'Desarquivar / Exibir' : 'Arquivar'}
                            aria-label={nf.arquivada ? 'Exibir' : 'Arquivar'}
                          >
                            {nf.arquivada ? <IconExibir /> : <IconArquivar />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="shrink-0">
              <Pagination total={nfsFiltradas.length} pagina={pagina} tamanho={itensPorPagina} onChange={setPagina} />
            </div>
          </>
        )}
      </div>

      {modalAberto && (editando || criando) && (() => {
        const isManual = criando || editando?.origem === 'manual';
        const maggoEditavel = isManual;
        const oceanEditavel = true;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[min(90vh,720px)] flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="shrink-0 px-6 py-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {criando ? 'Nova conta a receber' : 'Editar Conta a Receber'}
              </h2>
              {!criando && (
                <p className="text-xs text-gray-500 mt-1">
                  Origem: {origemLabel(editando?.origem)}
                  {isManual ? ' — dados Maggo e Ocean editáveis' : ' — dados Maggo somente leitura; Ocean editável'}
                </p>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
              <p className="col-span-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Dados Maggo</p>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Projeto</label>
                <input
                  className={maggoEditavel ? INPUT : INPUT_RO}
                  value={form.posicao}
                  readOnly={!maggoEditavel}
                  disabled={!maggoEditavel}
                  onChange={(e) => setForm({ ...form, posicao: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Método de pagamento *</label>
                {maggoEditavel ? (
                  <select
                    className={INPUT}
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as 'retainer' | 'sucesso' | 'parcelamento' })}
                  >
                    <option value="retainer">Retainer</option>
                    <option value="sucesso">Sucesso</option>
                    <option value="parcelamento">Parcelamento</option>
                  </select>
                ) : (
                  <input className={INPUT_RO} value={tipoLabel(editando!.tipo)} readOnly disabled />
                )}
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Empresa *</label>
                <input
                  className={maggoEditavel ? INPUT : INPUT_RO}
                  value={form.razao_social}
                  readOnly={!maggoEditavel}
                  disabled={!maggoEditavel}
                  onChange={(e) => setForm({ ...form, razao_social: e.target.value })}
                />
              </div>
              {!criando && (
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Candidato</label>
                  <input
                    className={maggoEditavel ? INPUT : INPUT_RO}
                    value={form.candidato}
                    readOnly={!maggoEditavel}
                    disabled={!maggoEditavel}
                    onChange={(e) => setForm({ ...form, candidato: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor bruto *</label>
                <input
                  type="number"
                  step="0.01"
                  className={maggoEditavel ? INPUT : INPUT_RO}
                  value={form.valor_bruto}
                  readOnly={!maggoEditavel}
                  disabled={!maggoEditavel}
                  onChange={(e) => setForm({ ...form, valor_bruto: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Imposto</label>
                <input
                  type="number"
                  step="0.01"
                  className={maggoEditavel ? INPUT : INPUT_RO}
                  value={form.valor_imposto}
                  readOnly={!maggoEditavel}
                  disabled={!maggoEditavel}
                  onChange={(e) => setForm({ ...form, valor_imposto: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor líquido *</label>
                <input
                  type="number"
                  step="0.01"
                  className={maggoEditavel ? INPUT : INPUT_RO}
                  value={form.valor_liquido}
                  readOnly={!maggoEditavel}
                  disabled={!maggoEditavel}
                  onChange={(e) => setForm({ ...form, valor_liquido: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de fechamento</label>
                <input
                  type="date"
                  className={maggoEditavel ? INPUT : INPUT_RO}
                  value={form.data_ent_pgto}
                  readOnly={!maggoEditavel}
                  disabled={!maggoEditavel}
                  onChange={(e) => setForm({ ...form, data_ent_pgto: e.target.value })}
                />
              </div>

              <p className="col-span-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mt-2">Dados Ocean</p>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">NF</label>
                <input
                  className={oceanEditavel ? INPUT : INPUT_RO}
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de emissão{form.numero.trim() ? ' *' : ''}</label>
                <input
                  type="date"
                  className={oceanEditavel ? INPUT : INPUT_RO}
                  value={form.data_emissao}
                  onChange={(e) => setForm({ ...form, data_emissao: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Vencimento</label>
                <input
                  type="date"
                  className={oceanEditavel ? INPUT : INPUT_RO}
                  value={form.data_vencimento}
                  onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Pagamento</label>
                <select
                  className={INPUT}
                  value={form.pagamento_estado}
                  onChange={(e) => {
                    const v = e.target.value as 'pendente' | 'recebido';
                    setForm({
                      ...form,
                    pagamento_estado: v,
                    data_pagamento: v === 'pendente' ? '' : (form.data_pagamento || new Date().toISOString().split('T')[0]),
                    caixa: v === 'recebido' ? (form.caixa || codigoPadrao(contasCorrentes)) : form.caixa,
                    });
                  }}
                >
                  <option value="pendente">Pendente</option>
                  <option value="recebido">Recebida</option>
                </select>
              </div>
              {!criando && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Status</label>
                  <input className={INPUT_RO} value={statusLabel(editando!.status)} readOnly disabled />
                </div>
              )}
              {form.pagamento_estado === 'recebido' && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de pagamento *</label>
                  <input type="date" className={INPUT} value={form.data_pagamento} onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })} />
                </div>
              )}
              {form.pagamento_estado === 'recebido' && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Conta corrente *</label>
                  <select
                    className={INPUT}
                    value={form.caixa || codigoPadrao(contasCorrentes)}
                    onChange={(e) => setForm({ ...form, caixa: e.target.value })}
                    disabled={papel !== 'admin'}
                  >
                    {contasCorrentes.filter((c) => c.ativo).map((c) => (
                      <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              </div>
              {conflitoNfId && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => abrirExistentePorId(conflitoNfId)}
                    className="text-sm text-blue-600 dark:text-blue-400 underline hover:no-underline"
                  >
                    Abrir existente
                  </button>
                </div>
              )}
            </div>
            <div className="shrink-0 px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800">
              <button onClick={() => { setModalAberto(false); setCriando(false); setConflitoNfId(null); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={salvando} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {pagarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Marcar como recebido</h2>
              <p className="text-sm text-gray-500 mt-1">{pagarModal.posicao || '—'} — {pagarModal.razao_social}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de pagamento *</label>
                <input
                  type="date"
                  className={INPUT}
                  value={dataPagamentoForm}
                  onChange={(e) => setDataPagamentoForm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Conta corrente *</label>
                <select
                  className={INPUT}
                  value={caixaReceberForm}
                  onChange={(e) => setCaixaReceberForm(e.target.value)}
                >
                  {contasCorrentes.filter((c) => c.ativo).map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setPagarModal(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={confirmarPagamento} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Confirmar recebimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
