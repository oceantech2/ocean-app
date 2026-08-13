import { useState, useEffect } from 'react';
import { dhService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { DH } from '../types';
import { usePageFilters, useAuthStore } from '../store';
import Pagination from '../components/Pagination';
import { exportarCSV } from '../utils/export';
import ImportCSV from '../components/ImportCSV';
import toast from 'react-hot-toast';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ITENS_POR_PAGINA = 15;

// Fundo por trimestre conforme solicitado
function trimestreBg(mes: number) {
  const trimestre = Math.ceil(mes / 3);
  return trimestre === 2 || trimestre === 4
    ? 'bg-blue-50 dark:bg-blue-900/10'
    : 'bg-white dark:bg-gray-800';
}

const TIPOS_DH = [
  { value: 'retainer', label: 'Retainer' },
  { value: 'sucesso', label: 'Sucesso' },
  { value: 'parcelamento', label: 'Parcelamento' },
] as const;

function tipoLabel(tipo_fechamento: string): string {
  if (tipo_fechamento === 'parcelamento') return 'Parcelamento';
  if (tipo_fechamento === 'sucesso') return 'Sucesso';
  return 'Retainer';
}

function tipoColor(tipo_fechamento: string): string {
  if (tipo_fechamento === 'parcelamento') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
  if (tipo_fechamento === 'sucesso') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400';
  return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
}

function gerarAssunto(tipo: string, empresa: string, posicao: string): string {
  return `DH :: ${empresa} :: ${posicao} :: ${tipoLabel(tipo)}`;
}

function mapTipoImport(raw: string): 'retainer' | 'sucesso' | 'parcelamento' {
  const t = (raw || '').trim().toLowerCase();
  if (t === 'parcelamento' || t.includes('parcelamento')) return 'parcelamento';
  if (t.includes('fechamento')) return 'sucesso';
  if (t === 'retainer' || t.includes('abertura')) return 'retainer';
  if (t === 'sucesso') return 'sucesso';
  return 'retainer';
}

const FORM_INICIAL = { empresa: '', posicao: '', tipo_fechamento: 'retainer' as 'retainer' | 'sucesso' | 'parcelamento', colaborador_preencheu: '' };

export default function DHPage() {
  const papel = useAuthStore((s) => s.papel);
  const usuario = useAuthStore((s) => s.usuario);
  const { dhMes, dhAno, dhColaborador, setDhFilters } = usePageFilters();

  const [dhs, setDhs] = useState<DH[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [importAberto, setImportAberto] = useState(false);
  const [form, setForm] = useState({ ...FORM_INICIAL, colaborador_preencheu: usuario || '' });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregarDHs(); setPagina(0); }, [dhMes, dhAno, dhColaborador]);

  const carregarDHs = async () => {
    try {
      setLoading(true);
      const res = await dhService.listar(0, 200, dhMes !== '' ? dhMes : undefined, dhAno || undefined, dhColaborador || undefined);
      setDhs(res.data);
    } catch { toast.error('Erro ao carregar DHs'); }
    finally { setLoading(false); }
  };

  const tipoSelecionado = form.tipo_fechamento;
  const assuntoPreview = form.empresa && form.posicao
    ? gerarAssunto(tipoSelecionado, form.empresa, form.posicao)
    : '';

  const salvar = async () => {
    if (!form.empresa || !form.posicao || !form.colaborador_preencheu) { toast.error('Preencha os campos obrigatórios'); return; }
    try {
      setSalvando(true);
      await dhService.criar({
        empresa: form.empresa,
        posicao: form.posicao,
        tipo_fechamento: form.tipo_fechamento,
        colaborador_preencheu: form.colaborador_preencheu,
      });
      toast.success('DH criado!');
      setModalAberto(false);
      setForm({ ...FORM_INICIAL, colaborador_preencheu: usuario || '' });
      carregarDHs();
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao criar DH')); }
    finally { setSalvando(false); }
  };

  const exportar = () => exportarCSV(dhs.map((d) => ({
    Empresa: d.empresa, Posição: d.posicao, Tipo: tipoLabel(d.tipo_fechamento),
    'Colaborador Preencheu': d.colaborador_preencheu,
    'Enviado Financeiro': d.enviado_financeiro ? 'Sim' : 'Não',
    'Enviado CEO': d.enviado_ceo ? 'Sim' : 'Não',
  })), `dh_${dhAno}`);

  const marcarEnviado = async (dh: DH, para: 'financeiro' | 'ceo') => {
    try {
      await dhService.marcarEnviado(dh.id, para);
      toast.success(`Marcado como enviado ao ${para === 'financeiro' ? 'Financeiro' : 'CEO'}`);
      carregarDHs();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const deletar = async (dh: DH) => {
    if (!confirm(`Deletar DH "${dh.assunto}"?`)) return;
    try { await dhService.deletar(dh.id); toast.success('DH deletado'); carregarDHs(); }
    catch { toast.error('Erro ao deletar'); }
  };

  const colaboradoresUnicos = [...new Set(dhs.map((d) => d.colaborador_preencheu))];
  const paginados = dhs.slice(pagina * ITENS_POR_PAGINA, (pagina + 1) * ITENS_POR_PAGINA);

  const totalDhs = dhs.length;
  const totalRetainer = dhs.filter((d) => d.tipo_fechamento === 'retainer').length;
  const totalSucesso = dhs.filter((d) => d.tipo_fechamento === 'sucesso').length;
  const totalParcelamento = dhs.filter((d) => d.tipo_fechamento === 'parcelamento').length;
  const totalPendentes = dhs.filter((d) => !d.enviado_financeiro || !d.enviado_ceo).length;

  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

  // Agrupar por mês para visualização trimestral
  const dhsPorMes = dhAno
    ? Array.from({ length: 12 }, (_, i) => ({
        mes: i + 1,
        nome: MESES[i],
        dhs: dhs.filter((d) => {
          const data = new Date(d.data_envio);
          return data.getMonth() + 1 === i + 1 && data.getFullYear() === (dhAno || new Date().getFullYear());
        }),
      }))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">DH — Demonstrativo de Honorários <span className="text-gray-500 dark:text-gray-400 font-normal text-base">— {dhs.length} DH(s) no período</span></h1>
        </div>
        <div className="flex gap-2">
          {papel === 'admin' && (
            <button onClick={() => setImportAberto(true)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↑ Importar CSV
            </button>
          )}
          {dhs.length > 0 && (
            <button onClick={exportar} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↓ Exportar CSV
            </button>
          )}
          <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
            Exportar PDF
          </button>
          {papel === 'admin' && (
            <button onClick={() => setModalAberto(true)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
              + Novo DH
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total DHs</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalDhs}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Retainer</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{totalRetainer}</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Sucesso</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{totalSucesso}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Parcelamento</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{totalParcelamento}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Pendentes de Envio</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{totalPendentes}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Mês</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm" value={dhMes} onChange={(e) => setDhFilters(e.target.value === '' ? '' : parseInt(e.target.value), dhAno, dhColaborador)}>
            <option value="">Todos</option>
            {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ano</label>
          <input type="number" className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-24" value={dhAno} onChange={(e) => setDhFilters(dhMes, parseInt(e.target.value), dhColaborador)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Colaborador</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm" value={dhColaborador} onChange={(e) => setDhFilters(dhMes, dhAno, e.target.value)}>
            <option value="">Todos</option>
            {colaboradoresUnicos.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Visualização trimestral (quando filtra por ano sem mês específico) */}
      {dhsPorMes && dhMes === '' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { trimestre: 1, meses: [0, 1, 2], label: '1º Trimestre', cor: '' },
            { trimestre: 2, meses: [3, 4, 5], label: '2º Trimestre', cor: 'bg-blue-50 dark:bg-blue-900/10' },
            { trimestre: 3, meses: [6, 7, 8], label: '3º Trimestre', cor: '' },
            { trimestre: 4, meses: [9, 10, 11], label: '4º Trimestre', cor: 'bg-blue-50 dark:bg-blue-900/10' },
          ].map(({ trimestre, meses, label, cor }) => {
            const dhsTri = meses.flatMap((m) => dhsPorMes[m].dhs);
            return (
              <div key={trimestre} className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${cor || 'bg-white dark:bg-gray-800'}`}>
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{label}</span>
                  <span className="text-xs text-gray-500">{dhsTri.length} DH(s)</span>
                </div>
                <div className="p-3 space-y-1">
                  {meses.map((mi) => {
                    const md = dhsPorMes[mi];
                    return (
                      <div key={mi} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-gray-500 dark:text-gray-400 font-medium">{md.nome}</span>
                        <div className="flex-1 flex flex-wrap gap-1">
                          {md.dhs.length === 0
                            ? <span className="text-gray-300 dark:text-gray-600">—</span>
                            : md.dhs.map((d) => (
                              <span key={d.id} className={`px-1.5 py-0.5 rounded text-xs ${tipoColor(d.tipo_fechamento)}`}>
                                {d.empresa}
                              </span>
                            ))}
                        </div>
                        {md.dhs.length > 0 && <span className="text-gray-400 font-medium">{md.dhs.length}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : dhs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Nenhum DH encontrado</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  {['Assunto', 'Tipo', 'Preenchido por', 'Data', 'Enviado', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginados.map((dh) => {
                  const dataDh = new Date(dh.data_envio);
                  const mes = dataDh.getMonth() + 1;
                  return (
                    <tr key={dh.id} className={`${trimestreBg(mes)} hover:brightness-95 transition-all`}>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-xs">
                        <div className="font-medium truncate">{dh.assunto || `${dh.empresa} — ${dh.posicao}`}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{dh.empresa}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${tipoColor(dh.tipo_fechamento)}`}>
                          {tipoLabel(dh.tipo_fechamento)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{dh.colaborador_preencheu}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{dh.data_envio?.split('T')[0]}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(['financeiro', 'ceo'] as const).map((para) => {
                            const enviado = para === 'financeiro' ? dh.enviado_financeiro : dh.enviado_ceo;
                            return (
                              <span
                                key={para}
                                onClick={() => !enviado && papel === 'admin' && marcarEnviado(dh, para)}
                                className={`px-2 py-0.5 rounded text-xs font-medium transition ${enviado ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'} ${!enviado && papel === 'admin' ? 'cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20' : ''}`}
                              >
                                {enviado ? `✓ ${para === 'financeiro' ? 'Fin.' : 'CEO'}` : `○ ${para === 'financeiro' ? 'Fin.' : 'CEO'}`}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {papel === 'admin' && (
                          <button onClick={() => deletar(dh)} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/60">Deletar</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination total={dhs.length} pagina={pagina} tamanho={ITENS_POR_PAGINA} onChange={setPagina} />
          </>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Novo DH</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Empresa *</label>
                <input className={INPUT} value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Posição *</label>
                <input className={INPUT} value={form.posicao} onChange={(e) => setForm({ ...form, posicao: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipo de Fechamento *</label>
                <select className={INPUT} value={form.tipo_fechamento} onChange={(e) => setForm({ ...form, tipo_fechamento: e.target.value as 'retainer' | 'sucesso' | 'parcelamento' })}>
                  {TIPOS_DH.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Preenchido por *</label>
                <input className={INPUT} value={form.colaborador_preencheu} onChange={(e) => setForm({ ...form, colaborador_preencheu: e.target.value })} />
              </div>
              {assuntoPreview && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Assunto gerado:</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-mono">{assuntoPreview}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={salvando} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Criar DH'}
              </button>
            </div>
          </div>
        </div>
      )}

      {importAberto && (
        <ImportCSV
          titulo="Importar DH via CSV"
          colunas={['empresa', 'posicao', 'tipo', 'mes', 'ano', 'colaborador_preencheu']}
          onImportar={async (linhas) => {
            for (const l of linhas) {
              await dhService.criar({
                empresa: l.empresa,
                posicao: l.posicao,
                tipo_fechamento: mapTipoImport(l.tipo || l.tipo_fechamento || ''),
                colaborador_preencheu: l.colaborador_preencheu || '',
              });
            }
            carregarDHs();
          }}
          onFechar={() => setImportAberto(false)}
        />
      )}
    </div>
  );
}
