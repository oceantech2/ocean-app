import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { bonusService, colaboradoresService, nfsService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { comissaoNoRecorte } from '../utils/comissoesPeriodo';
import { Bonus, Colaborador } from '../types';
import { usePageFilters, useAuthStore } from '../store';
import Pagination from '../components/Pagination';
import ImportCSV from '../components/ImportCSV';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';

const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ITENS_POR_PAGINA = 20;
const SELECT = 'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

const FORM_INICIAL = {
  colaborador_id: '', mes: String(new Date().getMonth() + 1),
  ano: String(new Date().getFullYear()), etapa: 'lead', percentual: '', valor_bonus: '',
  cliente: '', posicao: '', numero_nf: '',
};

export default function BonusPage() {
  const papel = useAuthStore((s) => s.papel);
  const {
    bonusColaboradorId, bonusAno, bonusRecorte, bonusMes, bonusTrimestre, setBonusFilters,
  } = usePageFilters();

  const [bonus, setBonus] = useState<Bonus[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [importAberto, setImportAberto] = useState(false);
  const [editando, setEditando] = useState<Bonus | null>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);
  const [nfsCache, setNfsCache] = useState<any[]>([]);

  useEffect(() => { carregarColaboradores(); }, []);
  useEffect(() => { carregarBonus(); setPagina(0); }, [bonusColaboradorId, bonusAno]);
  useEffect(() => { setPagina(0); }, [bonusRecorte, bonusMes, bonusTrimestre]);

  const carregarColaboradores = async () => {
    try { const res = await colaboradoresService.listar(0, 200, true, { elegivel_equipe: true }); setColaboradores(res.data); } catch {}
  };

  const carregarBonus = async () => {
    try {
      setLoading(true);
      const res = await bonusService.listar(0, 500, bonusColaboradorId ? Number(bonusColaboradorId) : undefined, undefined, bonusAno || undefined);
      setBonus(res.data);
    } catch { toast.error('Erro ao carregar comissões'); }
    finally { setLoading(false); }
  };

  const bonusFiltrado = useMemo(
    () => bonus.filter((b) => comissaoNoRecorte(b.mes, bonusRecorte, bonusMes, bonusTrimestre)),
    [bonus, bonusRecorte, bonusMes, bonusTrimestre],
  );

  const porColaborador = colaboradores.reduce((acc, col) => {
    const bonusCol = bonusFiltrado.filter((b) => b.colaborador_id === col.id);
    if (bonusCol.length > 0) acc[col.id] = { colaborador: col, bonus: bonusCol };
    return acc;
  }, {} as Record<number, { colaborador: Colaborador; bonus: Bonus[] }>);

  const graficoDados = Array.from({ length: 12 }, (_, i) => ({
    mes: MESES_NOME[i],
    total: bonus.filter((b) => b.mes === i + 1 && b.ano === bonusAno).reduce((s, b) => s + b.valor_bonus, 0),
  }));

  const totalComissoes = bonusFiltrado.reduce((s, b) => s + b.valor_bonus, 0);
  const colsList = Object.values(porColaborador);
  const colsPaginados = colsList.slice(pagina * ITENS_POR_PAGINA, (pagina + 1) * ITENS_POR_PAGINA);

  const carregarNfs = async () => {
    if (nfsCache.length > 0) return;
    try { const res = await nfsService.listar(0, 500); setNfsCache(res.data || []); } catch {}
  };

  const calcularBonusPorNf = (numero_nf: string, percentual: string, formAtual: typeof FORM_INICIAL) => {
    const nf = nfsCache.find((n) => n.numero === numero_nf);
    if (!nf || !percentual) return formAtual;
    const pct = parseFloat(percentual) || 0;
    const novoForm = { ...formAtual, valor_bonus: ((nf.valor_liquido * pct) / 100).toFixed(2) };
    if (!novoForm.cliente && nf.razao_social) novoForm.cliente = nf.razao_social;
    if (!novoForm.posicao && nf.posicao) novoForm.posicao = nf.posicao;
    return novoForm;
  };

  const abrirEditar = (b: Bonus) => {
    setEditando(b);
    setForm({ colaborador_id: String(b.colaborador_id), mes: String(b.mes), ano: String(b.ano), etapa: b.etapa, percentual: String(b.percentual), valor_bonus: String(b.valor_bonus), cliente: b.cliente || '', posicao: b.posicao || '', numero_nf: b.numero_nf || '' });
    carregarNfs();
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!editando) return;
    if (!form.percentual || !form.valor_bonus) { toast.error('Preencha os campos obrigatórios'); return; }
    try {
      setSalvando(true);
      await bonusService.atualizar(editando.id, {
        percentual: parseFloat(form.percentual),
        valor_bonus: parseFloat(form.valor_bonus),
        cliente: form.cliente || null,
        posicao: form.posicao || null,
        numero_nf: form.numero_nf || null,
      });
      toast.success('Comissão atualizada!');
      setModalAberto(false);
      setEditando(null);
      carregarBonus();
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao salvar')); }
    finally { setSalvando(false); }
  };

  const deletar = async (b: Bonus) => {
    if (!confirm('Deletar esta comissão?')) return;
    try { await bonusService.deletar(b.id); toast.success('Comissão deletada'); carregarBonus(); }
    catch { toast.error('Erro ao deletar'); }
  };

  const exportar = () => exportarCSV(bonusFiltrado.map((b) => ({
    Colaborador: colaboradores.find((c) => c.id === b.colaborador_id)?.nome || String(b.colaborador_id),
    Mês: MESES_NOME[b.mes - 1], Ano: b.ano, Etapa: b.etapa,
    'Nº NF': b.numero_nf || '', Cliente: b.cliente || '', Posição: b.posicao || '',
    'Percentual (%)': b.percentual, 'Valor Comissão': b.valor_bonus,
  })), `comissoes_${bonusAno}`);

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '-';
  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Comissões - <span className="text-lg font-normal text-gray-500 dark:text-gray-400">Total: <strong className="text-green-700 dark:text-green-400">{fmt(totalComissoes)}</strong></span></h1>
        <div className="flex gap-2">
          {papel === 'admin' && (
            <button onClick={() => setImportAberto(true)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↑ Importar CSV
            </button>
          )}
          {bonusFiltrado.length > 0 && (
            <button onClick={exportar} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↓ Exportar CSV
            </button>
          )}
          <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Pessoa da equipe</label>
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
          <select
            className={SELECT}
            value={bonusRecorte}
            onChange={(e) => setBonusFilters(bonusColaboradorId, bonusAno, e.target.value as 'ano' | 'mes' | 'trimestre')}
          >
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
            {colsPaginados.map(({ colaborador, bonus: bList }) => {
              const totalCol = bList.reduce((s, b) => s + b.valor_bonus, 0);
              return (
                <div key={colaborador.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">{colaborador.nome}</h3>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Total: {fmt(totalCol)}</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                      <tr>
                        {['Mês/Ano', 'Etapa', 'Cliente / Posição', 'NF Ref.', 'Percentual', 'Valor', ''].map((h) => (
                          <th key={h} className={`px-4 py-2 text-gray-500 dark:text-gray-400 font-medium ${h === 'Percentual' || h === 'Valor' ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {bList.sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes).map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{MESES_NOME[b.mes - 1]}/{b.ano}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded text-xs capitalize">{b.etapa}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            <div>{b.cliente || '—'}</div>
                            {b.posicao && <div className="text-gray-400">{b.posicao}</div>}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{b.numero_nf || '—'}</td>
                          <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{b.percentual}%</td>
                          <td className="px-4 py-3 text-right font-medium text-green-700 dark:text-green-400">{fmt(b.valor_bonus)}</td>
                          <td className="px-4 py-3">
                            {papel === 'admin' && (
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => abrirEditar(b)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200">Editar</button>
                                <button onClick={() => deletar(b)} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200">Deletar</button>
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
            {colsList.length === 0 && <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-400 dark:text-gray-500">Nenhuma comissão encontrada</div>}
          </div>
          {colsList.length > ITENS_POR_PAGINA && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Pagination total={colsList.length} pagina={pagina} tamanho={ITENS_POR_PAGINA} onChange={setPagina} />
            </div>
          )}
        </>
      )}

      {modalAberto && editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Editar comissão</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Mês *</label>
                  <select className={INPUT} value={form.mes} disabled>
                    {MESES_NOME.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano *</label>
                  <input type="number" className={INPUT} value={form.ano} disabled />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor Líquido NF</label>
                <input
                  type="text"
                  readOnly
                  className={INPUT + ' bg-gray-50 dark:bg-gray-600 cursor-default'}
                  value={nfsCache.find((n) => n.numero === form.numero_nf)
                    ? fmt(nfsCache.find((n) => n.numero === form.numero_nf)!.valor_liquido)
                    : ''}
                  placeholder="Preenchido ao informar o Nº da NF"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Percentual (%) *</label>
                <input type="number" step="0.01" className={INPUT} value={form.percentual} onChange={(e) => {
                  const novoForm = calcularBonusPorNf(form.numero_nf, e.target.value, { ...form, percentual: e.target.value });
                  setForm(novoForm as any);
                }} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor da comissão (R$) *</label>
                <input type="number" step="0.01" className={INPUT} value={form.valor_bonus} onChange={(e) => setForm({ ...form, valor_bonus: e.target.value })} />
              </div>
              <div className="border-t dark:border-gray-700 pt-3 col-span-1">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium uppercase tracking-wide">Referência</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Cliente</label>
                <input className={INPUT} value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Empresa cliente" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Posição</label>
                <input className={INPUT} value={form.posicao} onChange={(e) => setForm({ ...form, posicao: e.target.value })} placeholder="Cargo da vaga" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Nº da NF
                  {nfsCache.find((n) => n.numero === form.numero_nf) && (
                    <span className="ml-2 text-green-600 dark:text-green-400 text-xs">✓ Líquido: {fmt(nfsCache.find((n) => n.numero === form.numero_nf)!.valor_liquido)}</span>
                  )}
                </label>
                <input className={INPUT} value={form.numero_nf} placeholder="Ex: NF-001"
                  onChange={(e) => {
                    const novoForm = calcularBonusPorNf(e.target.value, form.percentual, { ...form, numero_nf: e.target.value });
                    setForm(novoForm as any);
                  }}
                />
                {form.numero_nf && !nfsCache.find((n) => n.numero === form.numero_nf) && (
                  <p className="text-xs text-gray-400 mt-1">NF não encontrada no sistema</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setModalAberto(false); setEditando(null); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={salvando} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
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
