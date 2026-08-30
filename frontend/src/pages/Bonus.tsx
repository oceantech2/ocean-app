import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { bonusService, colaboradoresService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { comissaoNoRecorte } from '../utils/comissoesPeriodo';
import { Bonus, Colaborador } from '../types';
import { usePageFilters, useAuthStore } from '../store';
import Pagination from '../components/Pagination';
import ImportCSV from '../components/ImportCSV';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';
import ActionButton from '../components/ActionButton';

const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ITENS_POR_PAGINA = 20;
const SELECT = 'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

const ATIVIDADE_LABEL: Record<string, string> = {
  lead: 'Lead',
  venda: 'Venda',
  conducao: 'Condução',
  placement: 'Placement',
};

function atividadeBadges(b: Bonus) {
  const items = b.atividades?.length ? b.atividades : (b.etapa ? [b.etapa] : []);
  return items;
}

export default function BonusPage() {
  const navigate = useNavigate();
  const papel = useAuthStore((s) => s.papel);
  const isAdmin = papel === 'admin';
  const {
    bonusColaboradorId, bonusAno, bonusRecorte, bonusMes, bonusTrimestre, setBonusFilters,
  } = usePageFilters();

  const [bonus, setBonus] = useState<Bonus[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [importAberto, setImportAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [processando, setProcessando] = useState(false);

  useEffect(() => { carregarColaboradores(); }, []);
  useEffect(() => { carregarBonus(); setPagina(0); setSelecionados(new Set()); }, [bonusColaboradorId, bonusAno]);
  useEffect(() => { setPagina(0); setSelecionados(new Set()); }, [bonusRecorte, bonusMes, bonusTrimestre]);

  const carregarColaboradores = async () => {
    try {
      const res = await colaboradoresService.listar(0, 500, true);
      setColaboradores(res.data);
    } catch { /* ignore */ }
  };

  const carregarBonus = async () => {
    try {
      setLoading(true);
      const res = await bonusService.listar(0, 500, bonusColaboradorId ? Number(bonusColaboradorId) : undefined, undefined, bonusAno || undefined);
      setBonus(res.data);
    } catch {
      toast.error('Erro ao carregar comissões');
    } finally {
      setLoading(false);
    }
  };

  const bonusFiltrado = useMemo(
    () => bonus.filter((b) => comissaoNoRecorte(b.mes, bonusRecorte, bonusMes, bonusTrimestre)),
    [bonus, bonusRecorte, bonusMes, bonusTrimestre],
  );

  const porColaborador = useMemo(() => {
    const acc: Record<number, { colaborador: Colaborador; bonus: Bonus[]; liberadoTotal: number }> = {};
    for (const col of colaboradores) {
      const bonusCol = bonusFiltrado.filter((b) => b.colaborador_id === col.id);
      if (bonusCol.length === 0) continue;
      const liberadoTotal = bonusCol.filter((b) => b.liberado).reduce((s, b) => s + b.valor_bonus, 0);
      acc[col.id] = { colaborador: col, bonus: bonusCol, liberadoTotal };
    }
    for (const b of bonusFiltrado) {
      if (acc[b.colaborador_id]) continue;
      const col: Colaborador = { id: b.colaborador_id, nome: `Fornecedor #${b.colaborador_id}`, cpf: '', ativo: true };
      const bonusCol = bonusFiltrado.filter((x) => x.colaborador_id === b.colaborador_id);
      acc[b.colaborador_id] = {
        colaborador: col,
        bonus: bonusCol,
        liberadoTotal: bonusCol.filter((x) => x.liberado).reduce((s, x) => s + x.valor_bonus, 0),
      };
    }
    return acc;
  }, [colaboradores, bonusFiltrado]);

  const graficoDados = Array.from({ length: 12 }, (_, i) => ({
    mes: MESES_NOME[i],
    total: bonus.filter((b) => b.mes === i + 1 && b.ano === bonusAno).reduce((s, b) => s + b.valor_bonus, 0),
  }));

  const totalComissoes = bonusFiltrado.reduce((s, b) => s + b.valor_bonus, 0);
  const colsList = Object.values(porColaborador);
  const colsPaginados = colsList.slice(pagina * ITENS_POR_PAGINA, (pagina + 1) * ITENS_POR_PAGINA);

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGrupo = (ids: number[]) => {
    const todosMarcados = ids.every((id) => selecionados.has(id));
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosMarcados) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '-';

  const editar = (b: Bonus) => {
    if (!b.nf_id) {
      toast.error('Sem Conta a receber associada');
      return;
    }
    navigate(`/nfs?edit=${b.nf_id}`);
  };

  const liberar = async (b: Bonus) => {
    if (!confirm(`Liberar comissão de ${fmt(b.valor_bonus)}?`)) return;
    try {
      await bonusService.liberar(b.id);
      toast.success('Comissão liberada');
      carregarBonus();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao liberar'));
    }
  };

  const pagar = async (b: Bonus) => {
    if (!confirm(`Marcar como paga comissão de ${fmt(b.valor_bonus)}?`)) return;
    try {
      await bonusService.pagar(b.id);
      toast.success('Comissão paga');
      carregarBonus();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao pagar'));
    }
  };

  const liberarLote = async () => {
    const ids = Array.from(selecionados);
    if (!ids.length) return;
    if (!confirm(`Liberar ${ids.length} comissão(ões) selecionada(s)?`)) return;
    try {
      setProcessando(true);
      const res = await bonusService.liberarLote(ids);
      toast.success(`${res.data.processados} liberada(s), ${res.data.ignorados} ignorada(s)`);
      setSelecionados(new Set());
      carregarBonus();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro na liberação em massa'));
    } finally {
      setProcessando(false);
    }
  };

  const pagarLote = async () => {
    const ids = Array.from(selecionados);
    if (!ids.length) return;
    if (!confirm(`Pagar ${ids.length} comissão(ões) selecionada(s)?`)) return;
    try {
      setProcessando(true);
      const res = await bonusService.pagarLote(ids);
      toast.success(`${res.data.processados} paga(s), ${res.data.ignorados} ignorada(s)`);
      setSelecionados(new Set());
      carregarBonus();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro no pagamento em massa'));
    } finally {
      setProcessando(false);
    }
  };

  const exportar = () => exportarCSV(bonusFiltrado.map((b) => ({
    Fornecedor: colaboradores.find((c) => c.id === b.colaborador_id)?.nome || String(b.colaborador_id),
    Mês: MESES_NOME[b.mes - 1], Ano: b.ano,
    Atividade: atividadeBadges(b).join(', '),
    'Nº NF': b.numero_nf || '', Cliente: b.cliente || '', Posição: b.posicao || '',
    'Percentual (%)': b.percentual, 'Valor Comissão': b.valor_bonus,
    Liberado: b.liberado ? 'Sim' : 'Não', Pago: b.pago ? 'Sim' : 'Não',
  })), `comissoes_${bonusAno}`);

  const selecionadosCount = selecionados.size;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
          Comissões — <span className="text-lg font-normal text-gray-500 dark:text-gray-400">Total: <strong className="text-green-700 dark:text-green-400">{fmt(totalComissoes)}</strong></span>
        </h1>
        <div className="flex gap-2 flex-wrap justify-end">
          {isAdmin && (
            <ActionButton variant="importar" context="header" label="Importar CSV" onClick={() => setImportAberto(true)} />
          )}
          {bonusFiltrado.length > 0 && (
            <ActionButton variant="exportar-csv" context="header" label="Exportar CSV" onClick={exportar} />
          )}
          <ActionButton variant="exportar-pdf" context="header" label="Exportar PDF" onClick={() => window.print()} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fornecedor</label>
          <select className={SELECT} value={bonusColaboradorId} onChange={(e) => setBonusFilters(e.target.value === '' ? '' : parseInt(e.target.value), bonusAno)}>
            <option value="">Todos</option>
            {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano</label>
          <input type="number" className={`${SELECT} w-24`} value={bonusAno} onChange={(e) => setBonusFilters(bonusColaboradorId, parseInt(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Recorte</label>
          <select className={SELECT} value={bonusRecorte} onChange={(e) => setBonusFilters(bonusColaboradorId, bonusAno, e.target.value as 'ano' | 'mes' | 'trimestre')}>
            <option value="ano">Ano inteiro</option>
            <option value="mes">Mês</option>
            <option value="trimestre">Trimestre</option>
          </select>
        </div>
        {bonusRecorte === 'mes' && (
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Mês</label>
            <select className={SELECT} value={bonusMes} onChange={(e) => setBonusFilters(bonusColaboradorId, bonusAno, 'mes', parseInt(e.target.value))}>
              {MESES_NOME.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
        )}
        {bonusRecorte === 'trimestre' && (
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Trimestre</label>
            <select className={SELECT} value={bonusTrimestre} onChange={(e) => setBonusFilters(bonusColaboradorId, bonusAno, 'trimestre', undefined, parseInt(e.target.value))}>
              <option value={1}>1º (jan–mar)</option>
              <option value={2}>2º (abr–jun)</option>
              <option value={3}>3º (jul–set)</option>
              <option value={4}>4º (out–dez)</option>
            </select>
          </div>
        )}
      </div>

      {isAdmin && selecionadosCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-blue-800 dark:text-blue-300">{selecionadosCount} selecionada(s)</span>
          <button onClick={liberarLote} disabled={processando} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm disabled:opacity-50">
            Liberar em massa
          </button>
          <button onClick={pagarLote} disabled={processando} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50">
            Pagar em massa
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Evolução de Comissões por Mês — {bonusAno}</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={graficoDados}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => fmt(v)} />
            <Legend />
            <Bar dataKey="total" name="Total Comissões" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
      ) : (
        <>
          <div className="space-y-4">
            {colsPaginados.map(({ colaborador, bonus: bList, liberadoTotal }) => {
              const totalCol = bList.reduce((s, b) => s + b.valor_bonus, 0);
              const idsGrupo = bList.map((b) => b.id);
              const grupoMarcado = idsGrupo.length > 0 && idsGrupo.every((id) => selecionados.has(id));
              return (
                <div key={colaborador.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <input
                          type="checkbox"
                          checked={grupoMarcado}
                          onChange={() => toggleGrupo(idsGrupo)}
                          aria-label={`Selecionar todas de ${colaborador.nome}`}
                        />
                      )}
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200">{colaborador.nome}</h3>
                    </div>
                    <div className="text-sm text-right">
                      <div className="font-medium text-green-700 dark:text-green-400">Total: {fmt(totalCol)}</div>
                      <div className="text-xs text-amber-700 dark:text-amber-400">Liberado: {fmt(liberadoTotal)}</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                      <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                        <tr>
                          {isAdmin && <th className="px-3 py-2 w-8" />}
                          {['Mês/Ano', 'Atividade', 'Cliente / Posição', 'NF Ref.', 'Percentual', 'Valor', 'Liberado', 'Pago', ''].map((h) => (
                            <th key={h || 'acoes'} className={`px-3 py-2 text-gray-500 dark:text-gray-400 font-medium ${h === 'Percentual' || h === 'Valor' || h === 'Liberado' ? 'text-right' : 'text-left'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {bList.sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes).map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {isAdmin && (
                              <td className="px-3 py-3">
                                <input type="checkbox" checked={selecionados.has(b.id)} onChange={() => toggleSelecionado(b.id)} />
                              </td>
                            )}
                            <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{MESES_NOME[b.mes - 1]}/{b.ano}</td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1">
                                {atividadeBadges(b).map((a) => (
                                  <span key={a} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded text-xs">
                                    {ATIVIDADE_LABEL[a] || a}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">
                              <div>{b.cliente || '—'}</div>
                              {b.posicao && <div className="text-gray-400">{b.posicao}</div>}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{b.numero_nf || '—'}</td>
                            <td className="px-3 py-3 text-right text-gray-600 dark:text-gray-400">{b.percentual}%</td>
                            <td className="px-3 py-3 text-right font-medium text-green-700 dark:text-green-400">{fmt(b.valor_bonus)}</td>
                            <td className="px-3 py-3 text-right text-xs text-amber-700 dark:text-amber-400">
                              {b.liberado ? fmt(b.valor_bonus) : '—'}
                            </td>
                            <td className="px-3 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded ${b.pago ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                {b.pago ? 'Pago' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              {isAdmin && (
                                <div className="flex gap-1 justify-end flex-wrap">
                                  {!b.liberado && (
                                    <ActionButton variant="liberar" context="row" label="Liberar" onClick={() => liberar(b)} />
                                  )}
                                  {b.liberado && !b.pago && (
                                    <ActionButton variant="fluxo" context="row" label="Pagar" onClick={() => pagar(b)} />
                                  )}
                                  <ActionButton variant="editar" context="row" label="Editar" onClick={() => editar(b)} />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {colsList.length === 0 && <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-400 dark:text-gray-500">Nenhuma comissão encontrada</div>}
          </div>
          {colsList.length > ITENS_POR_PAGINA && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Pagination total={colsList.length} pagina={pagina} tamanho={ITENS_POR_PAGINA} onChange={setPagina} />
            </div>
          )}
        </>
      )}

      {importAberto && (
        <ImportCSV
          titulo="comissões"
          colunas={['colaborador_id', 'mes', 'ano', 'etapa', 'percentual', 'valor_bonus', 'cliente', 'posicao', 'numero_nf']}
          mapear={(l) => {
            if (!l.colaborador_id || !l.mes || !l.ano || !l.percentual || !l.valor_bonus) {
              throw new Error('colaborador_id, mes, ano, percentual e valor_bonus são obrigatórios');
            }
            return {
              colaborador_id: parseInt(l.colaborador_id),
              mes: parseInt(l.mes),
              ano: parseInt(l.ano),
              etapa: l.etapa || 'lead',
              percentual: parseFloat(l.percentual),
              valor_bonus: parseFloat(l.valor_bonus),
              cliente: l.cliente || null,
              posicao: l.posicao || null,
              numero_nf: l.numero_nf || null,
            };
          }}
          criar={(dados) => bonusService.criar(dados)}
          onConcluido={carregarBonus}
          onFechar={() => setImportAberto(false)}
        />
      )}
    </div>
  );
}
