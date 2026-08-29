import { useState, useEffect } from 'react';
import { auditoriaService } from '../services/api';
import { useAuthStore } from '../store';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

const OPCOES_PAGINA = [15, 25, 50, 100];

const ENTIDADES: { valor: string; rotulo: string }[] = [
  { valor: 'NF', rotulo: 'NF' },
  { valor: 'ContaPagar', rotulo: 'ContaPagar' },
  { valor: 'Colaborador', rotulo: 'Colaborador' },
  { valor: 'Bonus', rotulo: 'Comissão' },
  { valor: 'Ferias', rotulo: 'Ferias' },
  { valor: 'MetaFinanceira', rotulo: 'MetaFinanceira' },
  { valor: 'DocumentoColaborador', rotulo: 'DocumentoColaborador' },
];
const ACOES = ['criar', 'editar', 'deletar'];

function rotuloEntidade(valor: string) {
  return ENTIDADES.find((e) => e.valor === valor)?.rotulo ?? valor;
}

const acaoBadge = (acao: string) => {
  if (acao === 'criar') return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
  if (acao === 'deletar') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
};

export default function Auditoria() {
  const papel = useAuthStore((s) => s.papel);
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [itensPorPagina, setItensPorPagina] = useState(25);
  const [filtroEntidade, setFiltroEntidade] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');

  useEffect(() => { carregar(); }, [pagina, itensPorPagina, filtroEntidade, filtroAcao]);

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await auditoriaService.listar(
        pagina * itensPorPagina, itensPorPagina,
        filtroEntidade || undefined, undefined, filtroAcao || undefined,
      );
      setLogs(res.data.dados || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error('Erro ao carregar auditoria');
    } finally {
      setLoading(false);
    }
  };

  if (papel !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
        Acesso restrito a administradores.
      </div>
    );
  }

  const fmtData = (iso: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR');
  };

  const limpar = async () => {
    if (!confirm(`⚠ Limpar todo o log de auditoria (${total} registro(s))?\n\nEssa ação é irreversível.`)) return;
    try {
      const res = await auditoriaService.limpar();
      toast.success(`${res.data.deletados} registro(s) removidos`);
      setPagina(0);
      carregar();
    } catch {
      toast.error('Erro ao limpar o log');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Log de Auditoria <span className="text-gray-500 dark:text-gray-400 font-normal text-base">— Histórico de alterações no sistema — {total} registro(s)</span></h1>
        {total > 0 && (
          <button onClick={limpar} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition">
            🗑 Limpar Log
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Entidade</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm" value={filtroEntidade} onChange={(e) => { setFiltroEntidade(e.target.value); setPagina(0); }}>
            <option value="">Todas</option>
            {ENTIDADES.map((e) => <option key={e.valor} value={e.valor}>{e.rotulo}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ação</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm" value={filtroAcao} onChange={(e) => { setFiltroAcao(e.target.value); setPagina(0); }}>
            <option value="">Todas</option>
            {ACOES.map((a) => <option key={a} value={a} className="capitalize">{a}</option>)}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Exibir</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1 text-xs" value={itensPorPagina} onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPagina(0); }}>
            {OPCOES_PAGINA.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-xs text-gray-400">por página</span>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Nenhum registro encontrado</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  {['Data/Hora', 'Usuário', 'Ação', 'Entidade', 'Detalhes'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtData(l.criado_em)}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{l.usuario}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${acaoBadge(l.acao)}`}>{l.acao}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{rotuloEntidade(l.entidade)}{l.entidade_id ? ` #${l.entidade_id}` : ''}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{l.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total={total} pagina={pagina} tamanho={itensPorPagina} onChange={setPagina} />
          </>
        )}
      </div>
    </div>
  );
}
