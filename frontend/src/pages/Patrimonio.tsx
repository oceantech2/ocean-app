import { useState, useEffect } from 'react';
import { patrimonioService, colaboradoresService } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import ActionButton from '../components/ActionButton';
import { mensagemErro } from '../utils/erros';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const TIPOS = ['Notebook', 'Monitor', 'Desktop', 'Teclado', 'Mouse', 'Headset', 'Cadeira', 'Mesa', 'Celular', 'Tablet', 'Impressora', 'Câmera', 'Outro'];
const STATUS_OPTS = [
  { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  { value: 'em_manutencao', label: 'Em manutenção', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' },
  { value: 'descartado', label: 'Descartado', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
];

const FORM_INICIAL = {
  colaborador_id: '',
  descricao: '',
  tipo: 'Notebook',
  numero_serie: '',
  marca: '',
  modelo: '',
  valor_aquisicao: '',
  data_aquisicao: '',
  status: 'ativo',
  observacao: '',
};

function statusInfo(s: string) {
  return STATUS_OPTS.find((o) => o.value === s) || STATUS_OPTS[0];
}

export default function Patrimonio() {
  const papel = useAuthStore((s) => s.papel);
  const [items, setItems] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroColab, setFiltroColab] = useState('');
  const [busca, setBusca] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
    colaboradoresService.listar(0, 500, true, { elegivel_equipe: true }).then((r) => setColaboradores(r.data || []));
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await patrimonioService.listar();
      setItems(res.data || []);
    } catch {
      toast.error('Erro ao carregar patrimônio');
    } finally {
      setLoading(false);
    }
  };

  const abrirCriar = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL });
    setModalAberto(true);
  };

  const abrirEditar = (item: any) => {
    setEditando(item);
    setForm({
      colaborador_id: item.colaborador_id ? String(item.colaborador_id) : '',
      descricao: item.descricao || '',
      tipo: item.tipo || 'Notebook',
      numero_serie: item.numero_serie || '',
      marca: item.marca || '',
      modelo: item.modelo || '',
      valor_aquisicao: item.valor_aquisicao != null ? String(item.valor_aquisicao) : '',
      data_aquisicao: item.data_aquisicao || '',
      status: item.status || 'ativo',
      observacao: item.observacao || '',
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.descricao || !form.tipo) {
      toast.error('Preencha descrição e tipo');
      return;
    }
    try {
      setSalvando(true);
      const payload = {
        ...form,
        colaborador_id: form.colaborador_id ? parseInt(form.colaborador_id) : null,
        valor_aquisicao: form.valor_aquisicao ? parseFloat(form.valor_aquisicao) : null,
        data_aquisicao: form.data_aquisicao || null,
      };
      if (editando) {
        await patrimonioService.atualizar(editando.id, payload);
        toast.success('Atualizado!');
      } else {
        await patrimonioService.criar(payload);
        toast.success('Criado!');
      }
      setModalAberto(false);
      carregarDados();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao salvar'));
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (item: any) => {
    if (!confirm(`Remover "${item.descricao}"?`)) return;
    try {
      await patrimonioService.deletar(item.id);
      toast.success('Removido');
      carregarDados();
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const alterarStatus = async (item: any, novoStatus: string) => {
    try {
      await patrimonioService.atualizar(item.id, { status: novoStatus });
      toast.success('Status atualizado');
      carregarDados();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const filtrado = items.filter((it) => {
    if (filtroStatus && it.status !== filtroStatus) return false;
    if (filtroTipo && it.tipo !== filtroTipo) return false;
    if (filtroColab && String(it.colaborador_id) !== filtroColab) return false;
    if (busca) {
      const b = busca.toLowerCase();
      if (!(it.descricao?.toLowerCase().includes(b) || it.marca?.toLowerCase().includes(b) || it.modelo?.toLowerCase().includes(b) || it.numero_serie?.toLowerCase().includes(b) || it.colaborador_nome?.toLowerCase().includes(b))) return false;
    }
    return true;
  });

  const totais = {
    total: filtrado.length,
    ativo: filtrado.filter((i) => i.status === 'ativo').length,
    manutencao: filtrado.filter((i) => i.status === 'em_manutencao').length,
    descartado: filtrado.filter((i) => i.status === 'descartado').length,
    valorTotal: filtrado.filter((i) => i.status !== 'descartado').reduce((s: number, i: any) => s + (i.valor_aquisicao || 0), 0),
  };

  const INPUT = 'border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-full';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Patrimônio</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 w-44"
          />
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <option value="">Todos os tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <option value="">Todos os status</option>
            {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filtroColab} onChange={(e) => setFiltroColab(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <option value="">Todos os colaboradores</option>
            <option value="null">Sem colaborador</option>
            {colaboradores.map((c) => <option key={c.id} value={String(c.id)}>{c.nome}</option>)}
          </select>
          {papel === 'admin' && (
            <ActionButton variant="criar" context="header" label="Novo item" onClick={abrirCriar} />
          )}
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totais.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <p className="text-xs text-green-600 dark:text-green-400">Ativos</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totais.ativo}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Em manutenção</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{totais.manutencao}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-xs text-red-600 dark:text-red-400">Descartados</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{totais.descartado}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400">Valor total (ativos)</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{fmt(totais.valorTotal)}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Itens de Patrimônio ({filtrado.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            Carregando...
          </div>
        ) : filtrado.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">
            Nenhum item encontrado
            {papel === 'admin' && <div className="mt-2"><button onClick={abrirCriar} className="text-blue-600 hover:underline text-sm">+ Adicionar primeiro item</button></div>}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Descrição</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Marca / Modelo</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Nº Série</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Colaborador</th>
                <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-medium">Valor</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtrado.map((item) => {
                const st = statusInfo(item.status);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.descricao}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.tipo}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {[item.marca, item.modelo].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{item.numero_serie || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {item.colaborador_nome ? (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded text-xs">{item.colaborador_nome}</span>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      {item.valor_aquisicao != null ? fmt(item.valor_aquisicao) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {papel === 'admin' ? (
                        <select
                          value={item.status}
                          onChange={(e) => alterarStatus(item, e.target.value)}
                          className={`px-2 py-0.5 rounded text-xs font-medium border-0 cursor-pointer ${st.color}`}
                        >
                          {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {papel === 'admin' && (
                        <div className="flex gap-1 justify-end flex-wrap">
                          <ActionButton variant="editar" context="row" label="Editar" onClick={() => abrirEditar(item)} />
                          <ActionButton variant="excluir" context="row" label="Excluir" onClick={() => deletar(item)} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editando ? 'Editar item' : 'Novo item de patrimônio'}</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Descrição *</label>
                <input type="text" className={INPUT} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Notebook Dell Latitude 5420" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipo *</label>
                <select className={INPUT} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Status</label>
                <select className={INPUT} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Marca</label>
                <input type="text" className={INPUT} value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Dell, Apple, LG..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Modelo</label>
                <input type="text" className={INPUT} value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Latitude 5420..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Número de Série</label>
                <input type="text" className={INPUT} value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} placeholder="SN-XXXX" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Colaborador responsável</label>
                <select className={INPUT} value={form.colaborador_id} onChange={(e) => setForm({ ...form, colaborador_id: e.target.value })}>
                  <option value="">Nenhum</option>
                  {colaboradores.map((c) => <option key={c.id} value={String(c.id)}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor de aquisição (R$)</label>
                <input type="number" step="0.01" min="0" className={INPUT} value={form.valor_aquisicao} onChange={(e) => setForm({ ...form, valor_aquisicao: e.target.value })} placeholder="0,00" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de aquisição</label>
                <input type="date" className={INPUT} value={form.data_aquisicao} onChange={(e) => setForm({ ...form, data_aquisicao: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Observação</label>
                <textarea rows={3} className={INPUT} value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Condição, localização, etc." />
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
