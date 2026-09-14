import { useState, useEffect, useMemo } from 'react';
import { feriasService, fornecedoresService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import {
  agruparResumos,
  diasCorridos,
  intervaloInvertido,
  pendenciasUnicas,
  saldoDisponivelForm,
  sugerirAnoAquisitivo,
  temDireitoAdquirido,
  temSobreposicaoComOutros,
  totalFolhaFixo,
} from '../utils/feriasCalculo';
import { Ferias, Colaborador } from '../types';
import { usePageFilters, useAuthStore, useNotifStore } from '../store';
import Pagination from '../components/Pagination';
import ImportCSV from '../components/ImportCSV';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';

const ITENS_POR_PAGINA = 15;
const FORM_INICIAL = {
  colaborador_id: '',
  ano: String(new Date().getFullYear()),
  dias_direito: '30',
  dias_tirados: '0',
  data_inicio: '',
  data_fim: '',
};

function formatBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function rotuloSalario(valor?: number | null) {
  if (valor == null) return '—';
  return formatBRL(valor);
}

function rotuloPeriodo(inicio?: string | null, fim?: string | null) {
  if (inicio && fim) return `${inicio} → ${fim}`;
  if (inicio) return inicio;
  if (fim) return fim;
  return '-';
}

function corSaldo(n: number) {
  if (n > 0) return 'text-blue-700 dark:text-blue-400';
  if (n < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-400 dark:text-gray-500';
}

export default function FeriasPage() {
  const papel = useAuthStore((s) => s.papel);
  const { feriasColaboradorId, feriasAno, setFeriasFilters } = usePageFilters();
  const triggerNotifRefresh = useNotifStore((s) => s.triggerNotifRefresh);

  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [fornecedores, setFornecedores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [importAberto, setImportAberto] = useState(false);
  const [editando, setEditando] = useState<Ferias | null>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);

  const nomeFornecedor = (id: number) =>
    fornecedores.find((c) => c.id === id)?.nome ?? `ID ${id}`;

  const fornecedorForm = useMemo(
    () => fornecedores.find((c) => c.id === parseInt(form.colaborador_id, 10)),
    [fornecedores, form.colaborador_id],
  );

  const totalFolha = useMemo(
    () => totalFolhaFixo(fornecedores, feriasColaboradorId === '' ? undefined : Number(feriasColaboradorId)),
    [fornecedores, feriasColaboradorId],
  );

  useEffect(() => { carregarFornecedores(); }, []);
  useEffect(() => { carregarFerias(); setPagina(0); }, [feriasColaboradorId, feriasAno]);

  const carregarFornecedores = async () => {
    try {
      const res = await fornecedoresService.listar(0, 1000, true);
      setFornecedores(res.data);
    } catch {
      toast.error('Erro ao carregar fornecedores');
    }
  };

  const carregarFerias = async () => {
    try {
      setLoading(true);
      const res = await feriasService.listar(
        0, 200,
        feriasColaboradorId ? Number(feriasColaboradorId) : undefined,
        feriasAno || undefined,
      );
      setFerias(res.data);
    } catch { toast.error('Erro ao carregar férias'); }
    finally { setLoading(false); }
  };

  const resumos = useMemo(() => agruparResumos(ferias), [ferias]);

  const infoModal = useMemo(() => {
    if (!form.colaborador_id || !form.ano) return null;
    return saldoDisponivelForm({
      periodos: ferias,
      colaboradorId: parseInt(form.colaborador_id),
      ano: parseInt(form.ano),
      editandoId: editando?.id,
      diasDireitoForm: parseInt(form.dias_direito) || 0,
    });
  }, [form.colaborador_id, form.ano, form.dias_direito, ferias, editando]);

  const handleFornecedorChange = (colabId: string) => {
    if (editando) return;
    const id = parseInt(colabId, 10);
    if (!id) {
      setForm((prev) => ({ ...prev, colaborador_id: '' }));
      return;
    }
    const f = fornecedores.find((c) => c.id === id);
    const anoSugerido = sugerirAnoAquisitivo(f?.data_admissao);
    const existente = ferias.some((x) => x.colaborador_id === id && x.ano === anoSugerido);
    setForm((prev) => ({
      ...prev,
      colaborador_id: colabId,
      ano: String(anoSugerido),
      dias_direito: existente ? '0' : '30',
    }));
  };

  const handleAnoChange = (ano: string) => {
    if (editando) {
      setForm((prev) => ({ ...prev, ano }));
      return;
    }
    const id = parseInt(form.colaborador_id, 10);
    const a = parseInt(ano, 10);
    if (!id || !a) {
      setForm((prev) => ({ ...prev, ano }));
      return;
    }
    const existente = ferias.some((x) => x.colaborador_id === id && x.ano === a);
    setForm((prev) => ({ ...prev, ano, dias_direito: existente ? '0' : '30' }));
  };

  const feriasComAviso = useMemo(() => pendenciasUnicas(ferias), [ferias]);

  const paginados = ferias.slice(pagina * ITENS_POR_PAGINA, (pagina + 1) * ITENS_POR_PAGINA);
  const mostrarFornecedor = feriasColaboradorId === '' || feriasColaboradorId === undefined;

  const abrirCriar = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, ano: String(feriasAno) });
    setModalAberto(true);
  };

  const abrirEditar = (f: Ferias) => {
    setEditando(f);
    setForm({
      colaborador_id: String(f.colaborador_id),
      ano: String(f.ano),
      dias_direito: String(f.dias_direito),
      dias_tirados: String(f.dias_tirados),
      data_inicio: f.data_inicio || '',
      data_fim: f.data_fim || '',
    });
    setModalAberto(true);
  };

  const datasInvertidas = intervaloInvertido(form.data_inicio, form.data_fim);
  const diasCalc = diasCorridos(form.data_inicio, form.data_fim);
  const diasTiradosNum = parseInt(form.dias_tirados) || 0;
  const excedeSaldo = infoModal !== null && diasTiradosNum > infoModal.disponivel;
  const sobrepoe = !!(
    form.colaborador_id &&
    form.ano &&
    form.data_inicio &&
    form.data_fim &&
    !datasInvertidas &&
    temSobreposicaoComOutros(
      ferias,
      parseInt(form.colaborador_id),
      parseInt(form.ano),
      form.data_inicio,
      form.data_fim,
      editando?.id,
    )
  );

  const salvar = async () => {
    if (!form.colaborador_id || !form.ano) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    if (datasInvertidas) {
      toast.error('A data fim não pode ser anterior à data início');
      return;
    }

    if (!editando) {
      const f = fornecedores.find((c) => c.id === parseInt(form.colaborador_id, 10));
      if (!temDireitoAdquirido(f?.data_admissao)) {
        const ok = window.confirm(
          'Este fornecedor ainda não completou 1 ano desde a data de entrada (ou está sem data cadastrada). Deseja registrar o período mesmo assim, com direito normal?',
        );
        if (!ok) return;
      }
    }

    try {
      setSalvando(true);
      const payload = {
        ano: parseInt(form.ano),
        dias_direito: parseInt(form.dias_direito) || 0,
        dias_tirados: diasTiradosNum,
        data_inicio: form.data_inicio || null,
        data_fim: form.data_fim || null,
      };
      if (editando) {
        await feriasService.atualizar(editando.id, payload);
        toast.success('Férias atualizadas!');
      } else {
        await feriasService.criar({ colaborador_id: parseInt(form.colaborador_id), ...payload });
        toast.success('Período registrado!');
      }
      setModalAberto(false);
      carregarFerias();
      triggerNotifRefresh();
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao salvar')); }
    finally { setSalvando(false); }
  };

  const aplicarDatas = (inicio: string, fim: string) => {
    const invertido = intervaloInvertido(inicio, fim);
    const d = diasCorridos(inicio, fim);
    setForm((prev) => ({
      ...prev,
      data_inicio: inicio,
      data_fim: fim,
      ...(invertido || !inicio || !fim ? {} : { dias_tirados: String(d) }),
    }));
  };

  const aprovar = async (f: Ferias) => {
    try { await feriasService.atualizar(f.id, { aprovado: true }); toast.success('Aprovado!'); carregarFerias(); triggerNotifRefresh(); }
    catch { toast.error('Erro ao aprovar'); }
  };

  const rejeitar = async (f: Ferias) => {
    try { await feriasService.atualizar(f.id, { aprovado: false }); toast.success('Rejeitado'); carregarFerias(); triggerNotifRefresh(); }
    catch { toast.error('Erro ao rejeitar'); }
  };

  const deletar = async (f: Ferias) => {
    if (!confirm('Excluir este registro?')) return;
    try { await feriasService.deletar(f.id); toast.success('Excluído'); carregarFerias(); triggerNotifRefresh(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const exportar = () => exportarCSV(
    ferias.map((f) => ({
      Fornecedor: nomeFornecedor(f.colaborador_id),
      Ano: f.ano,
      Salário: rotuloSalario(fornecedores.find((c) => c.id === f.colaborador_id)?.salario),
      'Dias Tirados': f.dias_tirados,
      'Data Início': f.data_inicio || '',
      'Data Fim': f.data_fim || '',
      Status: f.aprovado ? 'Aprovado' : 'Pendente',
    })),
    `ferias_${feriasAno}`,
  );

  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';
  const cabecalhos = [
    ...(mostrarFornecedor ? ['Fornecedor'] : []),
    'Salário',
    'Ano',
    'Tirados',
    'Período',
    'Status',
    '',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Férias{' '}
            <span className="text-gray-500 dark:text-gray-400 font-normal text-base">
              — Controle de férias por fornecedor
            </span>
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            CLT: 30 dias por período aquisitivo (12 meses). Pode fracionar em até 3 partes — mín. 5 dias por parcela; uma deve ter ≥ 14 dias.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {papel === 'admin' && (
            <ActionButton variant="importar" context="header" label="Importar CSV" onClick={() => setImportAberto(true)} />
          )}
          {ferias.length > 0 && (
            <ActionButton variant="exportar-csv" context="header" label="Exportar CSV" onClick={exportar} />
          )}
          <ActionButton variant="exportar-pdf" context="header" label="Exportar PDF" onClick={() => window.print()} />
          {papel === 'admin' && (
            <ActionButton variant="criar" context="header" label="Novo Período" onClick={abrirCriar} />
          )}
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3">
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Total da Folha</p>
        <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 tabular-nums">{formatBRL(totalFolha)}</p>
      </div>

      {feriasComAviso.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-4">
          <p className="text-orange-800 dark:text-orange-400 font-medium text-sm">
            ⚠ {feriasComAviso.length} fornecedor(es) com período de férias pendente de aprovação — verifique antes de 31 de janeiro.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fornecedor</label>
          <select
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            value={feriasColaboradorId}
            onChange={(e) => setFeriasFilters(e.target.value === '' ? '' : parseInt(e.target.value), feriasAno)}
          >
            <option value="">Todos</option>
            {fornecedores.map((c) => <option key={c.id} value={c.id}>{c.nome || `ID ${c.id}`}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano</label>
          <input
            type="number"
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-24"
            value={feriasAno}
            onChange={(e) => setFeriasFilters(feriasColaboradorId, parseInt(e.target.value))}
          />
        </div>
      </div>

      {ferias.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Resumo do ano</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resumos.map((r) => (
              <div key={`${r.colaborador_id}:${r.ano}`} className="border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2 text-sm">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{nomeFornecedor(r.colaborador_id)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Direito {r.direito_anual}d · Tirados {r.total_tirado}d ·{' '}
                  <span className={`font-medium ${corSaldo(r.saldo_anual)}`}>Saldo {r.saldo_anual}d</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
            Carregando...
          </div>
        ) : ferias.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Nenhum registro encontrado</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  {cabecalhos.map((h) => (
                    <th
                      key={h || 'acoes'}
                      className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${h === 'Tirados' || h === 'Salário' ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginados.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {mostrarFornecedor && (
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{nomeFornecedor(f.colaborador_id)}</td>
                    )}
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 tabular-nums">
                      {rotuloSalario(fornecedores.find((c) => c.id === f.colaborador_id)?.salario)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.ano}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{f.dias_tirados}d</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {rotuloPeriodo(f.data_inicio, f.data_fim)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.aprovado ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                        {f.aprovado ? 'Aprovado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {papel === 'admin' && (
                        <div className="flex gap-1 items-center justify-end flex-nowrap">
                          {!f.aprovado && (
                            <ActionButton variant="fluxo" context="row" label="Aprovar" onClick={() => aprovar(f)} />
                          )}
                          {f.aprovado && (
                            <ActionButton variant="rejeitar" context="row" label="Rejeitar" onClick={() => rejeitar(f)} />
                          )}
                          <ActionButton variant="editar" context="row" label="Editar" onClick={() => abrirEditar(f)} />
                          <ActionButton variant="excluir" context="row" label="Excluir" onClick={() => deletar(f)} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total={ferias.length} pagina={pagina} tamanho={ITENS_POR_PAGINA} onChange={setPagina} />
          </>
        )}
      </div>

      {modalAberto && (
        <Modal
          maxWidth="max-w-md"
          titulo={editando ? 'Editar Período de Férias' : 'Novo Período de Férias'}
          bodyClassName="p-6 space-y-4"
          footer={
            <div className="flex justify-end gap-3 text-sm">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando || datasInvertidas}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          }
        >
              {!editando && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fornecedor *</label>
                  <select
                    className={INPUT}
                    value={form.colaborador_id}
                    onChange={(e) => handleFornecedorChange(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {fornecedores.map((c) => <option key={c.id} value={c.id}>{c.nome || `ID ${c.id}`}</option>)}
                  </select>
                </div>
              )}

              {form.colaborador_id && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Salário</label>
                  <input
                    className={`${INPUT} bg-gray-50 dark:bg-gray-700/60`}
                    value={rotuloSalario(fornecedorForm?.salario)}
                    readOnly
                    tabIndex={-1}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano aquisitivo *</label>
                  <input
                    type="number"
                    className={INPUT}
                    value={form.ano}
                    onChange={(e) => handleAnoChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Dias de Direito</label>
                  <input
                    type="number"
                    className={`${INPUT} ${!editando && infoModal && !infoModal.ehBase ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={form.dias_direito}
                    onChange={(e) => setForm({ ...form, dias_direito: e.target.value })}
                    disabled={!editando && infoModal !== null && !infoModal.ehBase}
                    title={!editando && infoModal && !infoModal.ehBase ? 'Fracionamento: dias de direito já definidos no primeiro registro deste ano' : undefined}
                  />
                </div>
              </div>

              {infoModal && form.colaborador_id && form.ano && (
                <div className={`text-xs rounded-lg px-3 py-2 ${
                  infoModal.ehBase
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : infoModal.disponivel > 0
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {infoModal.ehBase ? (
                    <>Primeiro registro do ano — saldo disponível: <strong>{infoModal.disponivel}d</strong> (direito {infoModal.direito}d)</>
                  ) : (
                    <>
                      Saldo disponível: <strong>{infoModal.disponivel}d</strong>
                      {' '}({infoModal.direito}d direito − {infoModal.totalTiradoOutros}d já tomado)
                    </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Início</label>
                  <input
                    type="date"
                    className={INPUT}
                    value={form.data_inicio}
                    onChange={(e) => aplicarDatas(e.target.value, form.data_fim)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Fim</label>
                  <input
                    type="date"
                    className={INPUT}
                    value={form.data_fim}
                    onChange={(e) => aplicarDatas(form.data_inicio, e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Dias Tirados</label>
                <input
                  type="number"
                  className={INPUT}
                  value={form.dias_tirados}
                  onChange={(e) => setForm({ ...form, dias_tirados: e.target.value })}
                />
              </div>

              {datasInvertidas && (
                <div className="text-xs rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                  Intervalo inválido: a data fim não pode ser anterior à data início. Corrija as datas para salvar.
                </div>
              )}

              {diasCalc > 0 && !datasInvertidas && (
                <div className={`text-xs rounded-lg px-3 py-2 ${
                  excedeSaldo
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                }`}>
                  Calculado das datas: <strong>{diasCalc} dias</strong>
                  {excedeSaldo && infoModal && (
                    <span> — ⚠ excede o saldo disponível ({infoModal.disponivel}d)</span>
                  )}
                </div>
              )}

              {excedeSaldo && diasCalc === 0 && !datasInvertidas && infoModal && (
                <div className="text-xs rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                  ⚠ Dias tirados excedem o saldo disponível ({infoModal.disponivel}d)
                </div>
              )}

              {sobrepoe && (
                <div className="text-xs rounded-lg px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">
                  ⚠ Este intervalo se sobrepõe a outro período do mesmo fornecedor neste ano. É possível salvar; o saldo soma os dias de cada parcela.
                </div>
              )}
        </Modal>
      )}

      {importAberto && (
        <ImportCSV
          titulo="Férias"
          colunas={['fornecedor_id', 'ano', 'dias_direito', 'dias_tirados']}
          exemplo={{ fornecedor_id: '1', ano: '2026', dias_direito: '30', dias_tirados: '0' }}
          mapear={(l) => {
            const fid = l.fornecedor_id || l.colaborador_id;
            if (!fid || !l.ano) throw new Error('fornecedor_id e ano são obrigatórios');
            return {
              colaborador_id: parseInt(fid),
              ano: parseInt(l.ano),
              dias_direito: parseInt(l.dias_direito || '30'),
              dias_tirados: parseInt(l.dias_tirados || '0'),
            };
          }}
          criar={(payload) => feriasService.criar(payload)}
          onConcluido={carregarFerias}
          onFechar={() => setImportAberto(false)}
        />
      )}
    </div>
  );
}
