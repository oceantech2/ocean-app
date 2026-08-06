import { useState, useEffect, useRef } from 'react';
import { contasService, comprovantesService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { ContaPagar } from '../types';
import { usePageFilters, useAuthStore, useNotifStore } from '../store';
import { exportarCSV } from '../utils/export';
import { formatarMoedaInput, isValorMoedaValido, numberParaMoedaInput, parseMoedaInput } from '../utils/moeda';
import ImportCSV from '../components/ImportCSV';
import GerenciadorArquivos from '../components/GerenciadorArquivos';
import toast from 'react-hot-toast';

const CATEGORIAS_OPCOES = [
  { value: 'adm_financeiro', label: 'Adm/Financeiro' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'recursos_humanos', label: 'Recursos Humanos' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'impostos', label: 'Impostos' },
] as const;

const SUB_RH_OPCOES = [
  { value: 'salario', label: 'Salário' },
  { value: 'bonus', label: 'Bônus' },
  { value: 'comissao', label: 'Comissão' },
  { value: 'retirada_socios', label: 'Retirada Sócios' },
  { value: 'beneficios', label: 'Benefícios' },
] as const;

const LABELS_LEGADO: Record<string, string> = {
  administrativo: 'Administrativo (legado)',
  salario: 'Salário (legado)',
  bonus: 'Bônus (legado)',
  retirada_lucro: 'Retirada de Lucro (legado)',
  impostos: 'Impostos',
  imposto: 'Imposto (legado)',
  reembolsos: 'Reembolsos (legado)',
  evento: 'Evento (legado)',
};

const categoriaLabel = (c: ContaPagar | string, sub?: string | null, pendente?: boolean) => {
  if (typeof c === 'string') {
    const cat = c;
    if (pendente) return LABELS_LEGADO[cat] ?? cat;
    const base = CATEGORIAS_OPCOES.find((o) => o.value === cat)?.label ?? LABELS_LEGADO[cat] ?? cat;
    if (cat === 'recursos_humanos' && sub) {
      const subL = SUB_RH_OPCOES.find((o) => o.value === sub)?.label ?? sub;
      return `${base} / ${subL}`;
    }
    return base;
  }
  return categoriaLabel(c.categoria, c.subcategoria, c.categoria_pendente);
};

const FORM_INICIAL = {
  descricao: '',
  categoria: 'adm_financeiro',
  subcategoria: '',
  valor: '',
  data_vencimento: '',
  data_pagamento: '',
};

export default function Contas() {
  const papel = useAuthStore((s) => s.papel);
  const { contasCategoria, contasSubcategoria, contasPago, setContasFilters } = usePageFilters();
  const triggerNotifRefresh = useNotifStore((s) => s.triggerNotifRefresh);
  const triggerCalendarioRefresh = useNotifStore((s) => s.triggerCalendarioRefresh);

  const xlsxInputRef = useRef<HTMLInputElement>(null);
  const comprovanteInputRef = useRef<HTMLInputElement>(null);
  const [uploadingComprovante, setUploadingComprovante] = useState<number | null>(null);
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [importandoXlsx, setImportandoXlsx] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [importAberto, setImportAberto] = useState(false);
  const [comprovantesAberto, setComprovantesAberto] = useState(false);
  const [buscaDescricao, setBuscaDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [editando, setEditando] = useState<ContaPagar | null>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);
  const [sortField, setSortField] = useState<string>('data_vencimento');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => { carregarContas(); }, [contasCategoria, contasSubcategoria, contasPago]);

  const carregarContas = async () => {
    try {
      setLoading(true);
      const pago = contasPago === 'true' ? true : contasPago === 'false' ? false : undefined;
      const res = await contasService.listar(
        0,
        500,
        contasCategoria || undefined,
        pago,
        contasSubcategoria || undefined,
      );
      setContas(res.data);
    } catch { toast.error('Erro ao carregar contas'); }
    finally { setLoading(false); }
  };

  const isVencida = (c: ContaPagar) => !c.pago && !!c.data_vencimento && new Date(c.data_vencimento) < new Date();

  const contasFiltradas = contas.filter((c) => {
    if (buscaDescricao && !c.descricao.toLowerCase().includes(buscaDescricao.toLowerCase())) return false;
    if (dataInicio && c.data_vencimento && c.data_vencimento < dataInicio) return false;
    if (dataFim && c.data_vencimento && c.data_vencimento > dataFim) return false;
    return true;
  });

  const alternarOrdenacao = (campo: string) => {
    if (sortField === campo) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(campo); setSortDir('asc'); }
  };

  const statusRank = (c: ContaPagar) => c.pago ? 2 : isVencida(c) ? 0 : 1;

  const ordenar = (items: ContaPagar[]) => [...items].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
    const va = sortField === 'status' ? statusRank(a) : (a as any)[sortField] ?? '';
    const vb = sortField === 'status' ? statusRank(b) : (b as any)[sortField] ?? '';
    if (typeof va === 'number' && typeof vb === 'number') return mult * (va - vb);
    return mult * String(va).localeCompare(String(vb));
  });

  const SortIcon = ({ campo }: { campo: string }) => (
    <span className="ml-1 text-xs opacity-50">{sortField === campo ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
  );

  const grupoKey = (c: ContaPagar) =>
    c.categoria_pendente
      ? `pendente:${c.categoria}`
      : c.categoria === 'recursos_humanos'
        ? `rh:${c.subcategoria || 'all'}`
        : c.categoria;

  const chaves = [...new Set(contasFiltradas.map(grupoKey))];
  const grupos = chaves.reduce((acc, key) => {
    acc[key] = contasFiltradas.filter((c) => grupoKey(c) === key);
    return acc;
  }, {} as Record<string, ContaPagar[]>);

  const totalPendente = contas.filter((c) => !c.pago).reduce((s, c) => s + c.valor, 0);
  const totalPago = contas.filter((c) => c.pago).reduce((s, c) => s + c.valor, 0);
  const totalVencido = contas.filter((c) => isVencida(c)).reduce((s, c) => s + c.valor, 0);

  const abrirCriar = () => { setEditando(null); setForm({ ...FORM_INICIAL }); setModalAberto(true); };
  const abrirEditar = (c: ContaPagar) => {
    setEditando(c);
    setForm({
      descricao: c.descricao,
      categoria: c.categoria_pendente ? 'adm_financeiro' : (c.categoria || 'adm_financeiro'),
      subcategoria: c.categoria_pendente ? '' : (c.subcategoria || ''),
      valor: numberParaMoedaInput(c.valor),
      data_vencimento: c.data_vencimento ?? '',
      data_pagamento: c.data_pagamento || '',
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.descricao || !form.data_vencimento) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    if (!isValorMoedaValido(form.valor)) {
      toast.error('Informe um valor válido maior que zero');
      return;
    }
    if (form.categoria === 'recursos_humanos' && !form.subcategoria) {
      toast.error('Recursos Humanos exige uma subcategoria');
      return;
    }
    const valorNum = parseMoedaInput(form.valor);
    if (valorNum === null || valorNum <= 0) {
      toast.error('Informe um valor válido maior que zero');
      return;
    }
    try {
      setSalvando(true);
      const dados: {
        descricao: string;
        categoria: string;
        subcategoria: string | null;
        valor: number;
        data_vencimento: string;
        data_pagamento: string | null;
        pago?: boolean;
      } = {
        descricao: form.descricao,
        categoria: form.categoria,
        subcategoria: form.categoria === 'recursos_humanos' ? form.subcategoria : null,
        valor: valorNum,
        data_vencimento: form.data_vencimento,
        data_pagamento: form.data_pagamento || null,
      };
      if (editando) {
        dados.pago = !!form.data_pagamento;
        await contasService.atualizar(editando.id, dados);
        toast.success('Conta atualizada!');
      } else {
        await contasService.criar(dados);
        toast.success('Conta criada!');
      }
      setModalAberto(false); carregarContas(); triggerNotifRefresh(); triggerCalendarioRefresh();
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao salvar')); }
    finally { setSalvando(false); }
  };

  const marcarPago = async (conta: ContaPagar) => {
    try { await contasService.atualizar(conta.id, { pago: true, data_pagamento: new Date().toISOString().split('T')[0] }); toast.success('Marcada como paga!'); carregarContas(); triggerNotifRefresh(); triggerCalendarioRefresh(); }
    catch { toast.error('Erro ao atualizar'); }
  };

  const deletar = async (conta: ContaPagar) => {
    if (!confirm(`Deletar "${conta.descricao}"?`)) return;
    try { await contasService.deletar(conta.id); toast.success('Conta deletada'); carregarContas(); triggerNotifRefresh(); triggerCalendarioRefresh(); }
    catch { toast.error('Erro ao deletar'); }
  };

  const importarXlsx = async (arquivo: File) => {
    try {
      setImportandoXlsx(true);
      const res = await contasService.importarXlsx(arquivo);
      const { ok, erros } = res.data;
      if (ok > 0) {
        toast.success(`${ok} conta(s) importada(s) do Excel`);
        carregarContas(); triggerNotifRefresh(); triggerCalendarioRefresh();
      }
      if (erros?.length > 0) {
        toast.error(`${erros.length} aviso(s)/erro(s) na importação`);
        console.warn('Avisos importação contas:', erros);
      }
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao importar arquivo Excel'));
    } finally {
      setImportandoXlsx(false);
    }
  };

  const exportarXlsx = () => contasService.exportarXlsx();

  const abrirUploadComprovante = (conta: ContaPagar) => {
    setUploadingComprovante(conta.id);
    comprovanteInputRef.current?.click();
  };

  const handleComprovanteFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo || !uploadingComprovante) return;
    try {
      await contasService.uploadComprovante(uploadingComprovante, arquivo);
      toast.success('Comprovante anexado!');
      carregarContas();
    } catch { toast.error('Erro ao anexar comprovante'); }
    finally { setUploadingComprovante(null); }
  };

  const exportar = () => exportarCSV(contas.map((c) => ({
    Descrição: c.descricao,
    Categorias: categoriaLabel(c),
    Subcategoria: c.subcategoria || '',
    Valor: c.valor,
    Vencimento: c.data_vencimento,
    Pagamento: c.data_pagamento || '',
    Status: c.pago ? 'Pago' : isVencida(c) ? 'Vencida' : 'Pendente',
    Pendente_reclassificacao: c.categoria_pendente ? 'sim' : 'nao',
  })), 'contas_a_pagar');

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00';
  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

  const tituloGrupo = (key: string, items: ContaPagar[]) => {
    const sample = items[0];
    if (!sample) return key;
    if (sample.categoria_pendente) return `⚠ Reclassificar — ${categoriaLabel(sample)}`;
    return categoriaLabel(sample);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Contas a Pagar - <span className="text-lg font-normal text-gray-500 dark:text-gray-400">{contas.length} conta(s) registrada(s)</span></h1>
        <div className="flex gap-2 flex-wrap justify-end">
          {papel === 'admin' && (
            <button onClick={() => setImportAberto(true)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↑ Importar CSV
            </button>
          )}
          {contas.length > 0 && (
            <button onClick={exportar} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↓ Exportar CSV
            </button>
          )}
          {papel === 'admin' && (
            <>
              <input
                ref={xlsxInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) importarXlsx(f); e.target.value = ''; }}
              />
              <input
                ref={comprovanteInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleComprovanteFile}
              />
              <button
                onClick={() => xlsxInputRef.current?.click()}
                disabled={importandoXlsx}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition disabled:opacity-50"
              >
                {importandoXlsx ? 'Importando...' : '↑ Importar Excel (.xlsx)'}
              </button>
            </>
          )}
          <button onClick={exportarXlsx} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
            ↓ Exportar Excel (.xlsx)
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
            Exportar PDF
          </button>
          <button
            onClick={() => setComprovantesAberto(true)}
            className="px-4 py-2 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-sm font-medium transition"
          >
            📁 Comprovantes
          </button>
          {papel === 'admin' && (
            <button onClick={abrirCriar} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
              + Nova conta a pagar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Total a Pagar</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{fmt(totalPendente)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Vencido</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{fmt(totalVencido)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">Total Pago</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{fmt(totalPago)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Categorias</label>
          <select
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            value={contasCategoria}
            onChange={(e) => setContasFilters(e.target.value, contasPago, e.target.value === 'recursos_humanos' ? contasSubcategoria : '')}
          >
            <option value="">Todas</option>
            {CATEGORIAS_OPCOES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        {contasCategoria === 'recursos_humanos' && (
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Subcategoria RH</label>
            <select
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
              value={contasSubcategoria}
              onChange={(e) => setContasFilters(contasCategoria, contasPago, e.target.value)}
            >
              <option value="">Todas de RH</option>
              {SUB_RH_OPCOES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Status</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm" value={contasPago} onChange={(e) => setContasFilters(contasCategoria, e.target.value as any, contasSubcategoria)}>
            <option value="">Todos</option>
            <option value="false">Pendente</option>
            <option value="true">Pago</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Descrição</label>
          <input type="text" className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-44"
            value={buscaDescricao} onChange={(e) => setBuscaDescricao(e.target.value)} placeholder="Buscar..." />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Venc. de</label>
          <input type="date" className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Venc. até</label>
          <input type="date" className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        {(buscaDescricao || dataInicio || dataFim) && (
          <button onClick={() => { setBuscaDescricao(''); setDataInicio(''); setDataFim(''); }}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-4">✕ Limpar</button>
        )}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grupos).map(([key, items]) => {
            const totalGrupo = items.reduce((s, c) => s + c.valor, 0);
            return (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200">{tituloGrupo(key, items)}</h3>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total: {fmt(totalGrupo)}</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      {[
                        { label: 'Descrição', campo: 'descricao' },
                        { label: 'Valor', campo: 'valor' },
                        { label: 'Vencimento', campo: 'data_vencimento' },
                        { label: 'Pagamento', campo: 'data_pagamento' },
                        { label: 'Status', campo: 'status' },
                        { label: 'Comprovante', campo: null },
                        { label: '', campo: null },
                      ].map(({ label, campo }) => (
                        <th
                          key={label}
                          onClick={campo ? () => alternarOrdenacao(campo) : undefined}
                          className={`px-4 py-2 text-gray-500 dark:text-gray-400 font-medium text-xs ${label === 'Valor' ? 'text-right' : 'text-left'} ${campo ? 'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                        >
                          {label}{campo && <SortIcon campo={campo} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {ordenar(items).map((conta) => (
                      <tr key={conta.id} className={`transition-colors ${conta.pago ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100/80 dark:hover:bg-green-900/20' : isVencida(conta) ? 'bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100/80 dark:hover:bg-orange-900/20' : 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/20'}`}>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {conta.descricao}
                          {conta.categoria_pendente && (
                            <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              Reclassificar
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">{fmt(conta.valor)}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          Venc: {conta.data_vencimento}
                          {isVencida(conta) && <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">VENCIDA</span>}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {conta.pago && conta.data_pagamento && (
                            <span className="text-green-600 dark:text-green-400">Pago em {conta.data_pagamento}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conta.pago ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' : isVencida(conta) ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                            {conta.pago ? 'Pago' : isVencida(conta) ? 'Vencida' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {conta.comprovante_nome ? (
                            <button
                              onClick={() => contasService.downloadComprovante(conta.id, conta.comprovante_nome!)}
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                              title={conta.comprovante_nome}
                            >
                              <span>📎</span>
                              <span className="max-w-[80px] truncate">{conta.comprovante_nome}</span>
                            </button>
                          ) : conta.pago && papel === 'admin' ? (
                            <button
                              onClick={() => abrirUploadComprovante(conta)}
                              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                              title="Anexar comprovante"
                            >
                              + Anexar
                            </button>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {papel === 'admin' && (
                            <div className="flex gap-1 justify-end">
                              {!conta.pago && (
                                <button onClick={() => marcarPago(conta)} className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Pagar</button>
                              )}
                              <button onClick={() => abrirEditar(conta)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200">Editar</button>
                              <button onClick={() => deletar(conta)} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200">Deletar</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
          {Object.keys(grupos).length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-400 dark:text-gray-500">Nenhuma conta encontrada</div>
          )}
        </div>
      )}

      {importAberto && (
        <ImportCSV
          titulo="Contas a Pagar"
          colunas={['descricao', 'categoria', 'subcategoria', 'valor', 'data_vencimento']}
          exemplo={{ descricao: 'Aluguel', categoria: 'adm_financeiro', subcategoria: '', valor: '5000', data_vencimento: '2026-07-10' }}
          mapear={(l) => {
            if (!l.descricao || !l.valor || !l.data_vencimento) throw new Error('descricao, valor e data_vencimento são obrigatórios');
            if (!l.categoria) throw new Error('categoria é obrigatória (taxonomia nova)');
            const cat = l.categoria.trim().toLowerCase();
            const sub = (l.subcategoria || '').trim().toLowerCase() || null;
            if (cat === 'recursos_humanos' && !sub) throw new Error('Recursos Humanos exige subcategoria');
            return {
              descricao: l.descricao,
              categoria: cat,
              subcategoria: cat === 'recursos_humanos' ? sub : null,
              valor: parseFloat(l.valor.replace(',', '.')),
              data_vencimento: l.data_vencimento,
            };
          }}
          criar={(payload) => contasService.criar(payload)}
          onConcluido={carregarContas}
          onFechar={() => setImportAberto(false)}
        />
      )}

      <GerenciadorArquivos
        titulo="Comprovantes"
        servico={comprovantesService}
        aberto={comprovantesAberto}
        onFechar={() => setComprovantesAberto(false)}
      />

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editando ? 'Editar conta a pagar' : 'Nova conta a pagar'}</h2>
              {editando?.categoria_pendente && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Esta conta está pendente de reclassificação (legado: {editando.categoria}). Escolha uma categoria válida para limpar o aviso.
                </p>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Descrição *</label>
                <input className={INPUT} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Categorias *</label>
                <select
                  className={INPUT}
                  value={form.categoria}
                  onChange={(e) => setForm({
                    ...form,
                    categoria: e.target.value,
                    subcategoria: e.target.value === 'recursos_humanos' ? form.subcategoria : '',
                  })}
                >
                  {CATEGORIAS_OPCOES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {form.categoria === 'recursos_humanos' && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Subcategoria RH *</label>
                  <select className={INPUT} value={form.subcategoria} onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}>
                    <option value="">Selecione...</option>
                    {SUB_RH_OPCOES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={INPUT}
                  value={form.valor}
                  placeholder="R$ 0,00"
                  onChange={(e) => setForm({ ...form, valor: formatarMoedaInput(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Vencimento *</label>
                <input type="date" className={INPUT} value={form.data_vencimento} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de Pagamento</label>
                <input type="date" className={INPUT} value={form.data_pagamento} onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })} />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Preencher apenas se já foi pago</p>
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
    </div>
  );
}
