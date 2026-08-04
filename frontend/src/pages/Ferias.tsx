import { useState, useEffect, useMemo } from 'react';
import { feriasService, colaboradoresService } from '../services/api';
import { mensagemErro } from '../utils/erros';
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

// Timezone-safe date parsing — avoids off-by-one with UTC midnight
function parseDateLocal(s: string): Date {
  return new Date(s + 'T00:00:00');
}

function diffDias(inicio: string, fim: string): number {
  if (!inicio || !fim) return 0;
  const d =
    Math.round(
      (parseDateLocal(fim).getTime() - parseDateLocal(inicio).getTime()) / 86400000
    ) + 1;
  return d > 0 ? d : 0;
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

  // Per-collaborator-year totals derived once from the loaded list
  const resumoPorAno = useMemo(() => {
    const map = new Map<string, { direito: number; tirado: number }>();
    ferias.forEach((f) => {
      const k = `${f.colaborador_id}:${f.ano}`;
      const cur = map.get(k) ?? { direito: 0, tirado: 0 };
      map.set(k, { direito: cur.direito + f.dias_direito, tirado: cur.tirado + f.dias_tirados });
    });
    return map;
  }, [ferias]);

  const saldoColab = (colaboradorId: number, ano: number): number => {
    const r = resumoPorAno.get(`${colaboradorId}:${ano}`);
    return r ? r.direito - r.tirado : 0;
  };

  // Modal saldo — excludes the record being edited so validation is accurate
  const infoModal = useMemo(() => {
    if (!form.colaborador_id || !form.ano) return null;
    const colabId = parseInt(form.colaborador_id);
    const ano = parseInt(form.ano);
    const outros = ferias.filter(
      (f) => f.colaborador_id === colabId && f.ano === ano && f.id !== editando?.id,
    );
    const totalDireito = outros.reduce((s, f) => s + f.dias_direito, 0);
    const totalTirado = outros.reduce((s, f) => s + f.dias_tirados, 0);
    const ehBase = outros.length === 0 && !editando;
    const saldoLivre = totalDireito - totalTirado + (editando?.dias_tirados ?? 0);
    return { totalDireito, totalTirado, saldoLivre, ehBase };
  }, [form.colaborador_id, form.ano, ferias, editando]);

  // When changing colab or year, auto-set dias_direito (only on create)
  const handleColabAnoChange = (colabId: string, ano: string) => {
    if (editando) return;
    const id = parseInt(colabId);
    const a = parseInt(ano);
    if (!id || !a) return;
    const existente = ferias.some((f) => f.colaborador_id === id && f.ano === a);
    setForm((prev) => ({ ...prev, dias_direito: existente ? '0' : '30' }));
  };

  const feriasComAviso = useMemo(() => {
    const seen = new Set<string>();
    return ferias.filter((f) => {
      const k = `${f.colaborador_id}:${f.ano}`;
      if (!f.aprovado && saldoColab(f.colaborador_id, f.ano) > 0 && !seen.has(k)) {
        seen.add(k);
        return true;
      }
      return false;
    });
  }, [ferias, resumoPorAno]);

  const paginados = ferias.slice(pagina * ITENS_POR_PAGINA, (pagina + 1) * ITENS_POR_PAGINA);

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

  const salvar = async () => {
    if (!form.colaborador_id || !form.ano) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const diasTirados = parseInt(form.dias_tirados) || 0;

    try {
      setSalvando(true);
      const payload = {
        ano: parseInt(form.ano),
        dias_direito: parseInt(form.dias_direito) || 0,
        dias_tirados: diasTirados,
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
      'Dias Direito': f.dias_direito,
      'Dias Tirados': f.dias_tirados,
      Saldo: saldoColab(f.colaborador_id, f.ano),
      'Data Início': f.data_inicio || '',
      'Data Fim': f.data_fim || '',
      Status: f.aprovado ? 'Aprovado' : 'Pendente',
    })),
    `ferias_${feriasAno}`,
  );

  const diasCalc = diffDias(form.data_inicio, form.data_fim);
  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Aviso pendentes */}
      {feriasComAviso.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-4">
          <p className="text-orange-800 dark:text-orange-400 font-medium text-sm">
            ⚠ {feriasComAviso.length} colaborador(es) com saldo de férias pendente de aprovação — verifique antes de 31 de janeiro.
          </p>
        </div>
      )}

      {/* Filtros */}
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

      {/* Tabela */}
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
                  {['Colaborador', 'Ano', 'Direito', 'Tirados', 'Saldo', 'Período', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${['Direito', 'Tirados', 'Saldo'].includes(h) ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginados.map((f) => {
                  const saldo = saldoColab(f.colaborador_id, f.ano);
                  return (
                    <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{nomeColaborador(f.colaborador_id)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.ano}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{f.dias_direito}d</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{f.dias_tirados}d</td>
                      <td className={`px-4 py-3 text-right font-medium ${saldo > 0 ? 'text-blue-700 dark:text-blue-400' : saldo < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {saldo}d
                      </td>
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
                  );
                })}
              </tbody>
            </table>
            <Pagination total={ferias.length} pagina={pagina} tamanho={ITENS_POR_PAGINA} onChange={setPagina} />
          </>
        )}
      </div>

      {/* Modal */}
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
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((prev) => { const next = { ...prev, colaborador_id: v }; handleColabAnoChange(v, prev.ano); return next; });
                      handleColabAnoChange(v, form.ano);
                    }}
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
                      setForm((prev) => ({ ...prev, ano: v }));
                      handleColabAnoChange(form.colaborador_id, v);
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

              {/* Info saldo do período */}
              {infoModal && form.colaborador_id && form.ano && (
                <div className={`text-xs rounded-lg px-3 py-2 ${
                  infoModal.ehBase
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : infoModal.saldoLivre > 0
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {infoModal.ehBase ? (
                    <>Primeiro registro do ano — direito padrão CLT: <strong>30 dias</strong></>
                  ) : (
                    <>
                      Fracionamento — saldo disponível:{' '}
                      <strong>{infoModal.saldoLivre}d</strong>
                      {' '}({infoModal.totalDireito}d direito − {infoModal.totalTirado}d já tomado
                      {editando ? ` + ${editando.dias_tirados}d deste registro` : ''})
                    </>
                  )}
                </div>
              )}

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Início</label>
                  <input
                    type="date"
                    className={INPUT}
                    value={form.data_inicio}
                    onChange={(e) => {
                      const inicio = e.target.value;
                      const d = diffDias(inicio, form.data_fim);
                      setForm({ ...form, data_inicio: inicio, ...(d > 0 ? { dias_tirados: String(d) } : {}) });
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Fim</label>
                  <input
                    type="date"
                    className={INPUT}
                    value={form.data_fim}
                    onChange={(e) => {
                      const fim = e.target.value;
                      const d = diffDias(form.data_inicio, fim);
                      setForm({ ...form, data_fim: fim, ...(d > 0 ? { dias_tirados: String(d) } : {}) });
                    }}
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

              {diasCalc > 0 && form.data_inicio && form.data_fim && (
                <div className={`text-xs rounded-lg px-3 py-2 flex items-center gap-2 ${
                  infoModal && diasCalc > infoModal.saldoLivre
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                }`}>
                  <span>Calculado das datas: <strong>{diasCalc} dias</strong></span>
                  {infoModal && diasCalc > infoModal.saldoLivre && (
                    <span>⚠ excede o saldo disponível ({infoModal.saldoLivre}d)</span>
                  )}
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
                disabled={salvando}
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
