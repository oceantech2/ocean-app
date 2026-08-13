import { useState, useEffect, useMemo } from 'react';
import { feriasService, colaboradoresService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import {
  agruparResumos,
  diasCorridos,
  intervaloInvertido,
  pendenciasUnicas,
  saldoDisponivelForm,
  temSobreposicaoComOutros,
} from '../utils/feriasCalculo';
import { Ferias, Colaborador } from '../types';
import { usePageFilters, useAuthStore, useNotifStore } from '../store';
import Pagination from '../components/Pagination';
import ImportCSV from '../components/ImportCSV';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';

const ITENS_POR_PAGINA = 15;
const FORM_INICIAL = {
  colaborador_id: '',
  ano: String(new Date().getFullYear()),
  dias_direito: '30',
  dias_tirados: '0',
  data_inicio: '',
  data_fim: '',
};

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
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [importAberto, setImportAberto] = useState(false);
  const [editando, setEditando] = useState<Ferias | null>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);

  const nomeColaborador = (id: number) =>
    colaboradores.find((c) => c.id === id)?.nome ?? `ID ${id}`;

  useEffect(() => { carregarColaboradores(); }, []);
  useEffect(() => { carregarFerias(); setPagina(0); }, [feriasColaboradorId, feriasAno]);

  const carregarColaboradores = async () => {
    try {
      const res = await colaboradoresService.listar(0, 200, true);
      setColaboradores(res.data);
    } catch {}
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

  const handleColabAnoChange = (colabId: string, ano: string) => {
    if (editando) return;
    const id = parseInt(colabId);
    const a = parseInt(ano);
    if (!id || !a) return;
    const existente = ferias.some((f) => f.colaborador_id === id && f.ano === a);
    setForm((prev) => ({ ...prev, colaborador_id: colabId, ano, dias_direito: existente ? '0' : '30' }));
  };

  const feriasComAviso = useMemo(() => pendenciasUnicas(ferias), [ferias]);

  const paginados = ferias.slice(pagina * ITENS_POR_PAGINA, (pagina + 1) * ITENS_POR_PAGINA);
  const mostrarColaborador = feriasColaboradorId === '' || feriasColaboradorId === undefined;

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
    if (!confirm('Deletar este registro?')) return;
    try { await feriasService.deletar(f.id); toast.success('Deletado'); carregarFerias(); triggerNotifRefresh(); }
    catch { toast.error('Erro ao deletar'); }
  };

  const exportar = () => exportarCSV(
    ferias.map((f) => ({
      Colaborador: nomeColaborador(f.colaborador_id),
      Ano: f.ano,
      'Dias Tirados': f.dias_tirados,
      'Data Início': f.data_inicio || '',
      'Data Fim': f.data_fim || '',
      Status: f.aprovado ? 'Aprovado' : 'Pendente',
    })),
    `ferias_${feriasAno}`,
  );

  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';
  const cabecalhos = [
    ...(mostrarColaborador ? ['Colaborador'] : []),
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
              — Controle de férias por colaborador
            </span>
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            CLT: 30 dias por período aquisitivo (12 meses). Pode fracionar em até 3 partes — mín. 5 dias por parcela; uma deve ter ≥ 14 dias.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {papel === 'admin' && (
            <button
              onClick={() => setImportAberto(true)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              ↑ Importar CSV
            </button>
          )}
          {ferias.length > 0 && (
            <button
              onClick={exportar}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              ↓ Exportar CSV
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            Exportar PDF
          </button>
          {papel === 'admin' && (
            <button
              onClick={abrirCriar}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              + Novo Período
            </button>
          )}
        </div>
      </div>

      {feriasComAviso.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-4">
          <p className="text-orange-800 dark:text-orange-400 font-medium text-sm">
            ⚠ {feriasComAviso.length} colaborador(es) com período de férias pendente de aprovação — verifique antes de 31 de janeiro.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Colaborador</label>
          <select
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            value={feriasColaboradorId}
            onChange={(e) => setFeriasFilters(e.target.value === '' ? '' : parseInt(e.target.value), feriasAno)}
          >
            <option value="">Todos</option>
            {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
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
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{nomeColaborador(r.colaborador_id)}</p>
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
                      className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${h === 'Tirados' ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginados.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {mostrarColaborador && (
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{nomeColaborador(f.colaborador_id)}</td>
                    )}
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.ano}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{f.dias_tirados}d</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {f.data_inicio && f.data_fim ? `${f.data_inicio} → ${f.data_fim}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.aprovado ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                        {f.aprovado ? 'Aprovado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {papel === 'admin' && (
                        <div className="flex gap-1 justify-end">
                          {!f.aprovado && (
                            <button onClick={() => aprovar(f)} className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded hover:bg-green-200">
                              Aprovar
                            </button>
                          )}
                          {f.aprovado && (
                            <button onClick={() => rejeitar(f)} className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 rounded hover:bg-yellow-200">
                              Rejeitar
                            </button>
                          )}
                          <button onClick={() => abrirEditar(f)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200">
                            Editar
                          </button>
                          <button onClick={() => deletar(f)} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200">
                            Deletar
                          </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {editando ? 'Editar Período de Férias' : 'Novo Período de Férias'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {!editando && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Colaborador *</label>
                  <select
                    className={INPUT}
                    value={form.colaborador_id}
                    onChange={(e) => handleColabAnoChange(e.target.value, form.ano)}
                  >
                    <option value="">Selecione...</option>
                    {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano aquisitivo *</label>
                  <input
                    type="number"
                    className={INPUT}
                    value={form.ano}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (editando) setForm((prev) => ({ ...prev, ano: v }));
                      else handleColabAnoChange(form.colaborador_id, v);
                    }}
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
                  ⚠ Este intervalo se sobrepõe a outro período do mesmo colaborador neste ano. É possível salvar; o saldo soma os dias de cada parcela.
                </div>
              )}
            </div>

            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
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
          </div>
        </div>
      )}

      {importAberto && (
        <ImportCSV
          titulo="Férias"
          colunas={['colaborador_id', 'ano', 'dias_direito', 'dias_tirados']}
          exemplo={{ colaborador_id: '1', ano: '2026', dias_direito: '30', dias_tirados: '0' }}
          mapear={(l) => {
            if (!l.colaborador_id || !l.ano) throw new Error('colaborador_id e ano são obrigatórios');
            return {
              colaborador_id: parseInt(l.colaborador_id),
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
