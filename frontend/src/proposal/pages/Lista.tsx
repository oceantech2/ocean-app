import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import StatusBadge from '../components/StatusBadge';
import {
  excluirProposta,
  FiltrosPropostas,
  listarAutores,
  listarPropostas,
  mensagemErro,
  ModeloId,
  PropostaListItem,
  StatusProposta,
} from '../services/proposalApi';
import { MODELOS } from '../modelos';
import { formatarDataISO } from '../modelos/formatacao';
import { resumoProjetos } from '../modelos/formatoProposta';
import { rotuloIdiomaMoeda } from '../modelos/idioma';
import { useProposalAuthStore } from '../store';
import {
  copiarTexto,
  formatarData,
  mensagemConfirmacaoExclusao,
  montarLinkPublico,
  STATUS_LABEL,
} from '../utils/propostaCalculo';

const FILTROS_STATUS: Array<{ valor: StatusProposta | ''; label: string }> = [
  { valor: '', label: 'Todos os status' },
  ...(Object.keys(STATUS_LABEL) as StatusProposta[]).map((s) => ({ valor: s, label: STATUS_LABEL[s] })),
];

const FILTROS_MODELO: Array<{ valor: FiltrosPropostas['modelo']; label: string }> = [
  { valor: '', label: 'Todos os modelos' },
  ...(Object.keys(MODELOS) as ModeloId[]).map((id) => ({ valor: id, label: MODELOS[id].nome })),
  { valor: 'simples', label: 'Proposta simples' },
];

const FILTROS_VAZIOS: FiltrosPropostas = {
  status: '',
  empresa: '',
  modelo: '',
  projeto: '',
  data_de: '',
  data_ate: '',
  criado_por: '',
};

export default function Lista() {
  const papel = useProposalAuthStore((s) => s.papel);
  const isAdmin = papel === 'admin';
  const [filtros, setFiltros] = useState<FiltrosPropostas>(FILTROS_VAZIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosPropostas>(FILTROS_VAZIOS);
  const [autores, setAutores] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [recarga, setRecarga] = useState(0);
  const [itens, setItens] = useState<PropostaListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState<number | null>(null);

  const temFiltro = Object.values(filtros).some((v) => v.trim() !== '');

  useEffect(() => {
    const t = setTimeout(() => {
      setFiltrosAplicados(filtros);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [filtros]);

  useEffect(() => {
    if (!isAdmin) return;
    listarAutores()
      .then(setAutores)
      .catch(() => setAutores([]));
  }, [isAdmin]);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    listarPropostas({ ...filtrosAplicados, criado_por: isAdmin ? filtrosAplicados.criado_por : '', page })
      .then((r) => {
        if (!ativo) return;
        setItens(r.items);
        setTotal(r.total);
        setPageSize(r.page_size);
      })
      .catch((e) => ativo && toast.error(mensagemErro(e, 'Não foi possível carregar as propostas')))
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [filtrosAplicados, page, recarga, isAdmin]);

  const alterarFiltro = (campo: keyof FiltrosPropostas, valor: string) => {
    setFiltros((f) => ({ ...f, [campo]: valor }));
  };

  const copiarLink = async (codigo: string) => {
    if (await copiarTexto(montarLinkPublico(codigo))) toast.success('Link copiado');
    else toast.error('Não foi possível copiar o link');
  };

  const excluir = async (p: PropostaListItem) => {
    if (!window.confirm(mensagemConfirmacaoExclusao(p.cliente_nome, p.status))) return;
    setExcluindo(p.id);
    try {
      await excluirProposta(p.id);
      toast.success('Proposta excluída');
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível excluir a proposta'));
    } finally {
      setExcluindo(null);
      setRecarga((n) => n + 1);
    }
  };

  const paginas = Math.max(1, Math.ceil(total / pageSize));
  const campo =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600';

  return (
    <ProposalLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Propostas</h1>
        <Link
          to="/nova"
          className="px-4 py-2 rounded-lg bg-ocean-700 text-white text-sm font-medium hover:bg-ocean-800 transition whitespace-nowrap self-start sm:self-auto"
        >
          Nova proposta
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={filtros.empresa}
            onChange={(e) => alterarFiltro('empresa', e.target.value)}
            placeholder="Empresa"
            aria-label="Filtrar por empresa"
            className={campo}
          />
          <select
            value={filtros.modelo}
            onChange={(e) => alterarFiltro('modelo', e.target.value)}
            aria-label="Filtrar por modelo"
            className={campo}
          >
            {FILTROS_MODELO.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            value={filtros.projeto}
            onChange={(e) => alterarFiltro('projeto', e.target.value)}
            placeholder="Projeto"
            aria-label="Filtrar por projeto"
            className={campo}
          />
          <select
            value={filtros.status}
            onChange={(e) => alterarFiltro('status', e.target.value)}
            aria-label="Filtrar por status"
            className={campo}
          >
            {FILTROS_STATUS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">Data de</span>
            <input
              type="date"
              value={filtros.data_de}
              onChange={(e) => alterarFiltro('data_de', e.target.value)}
              className={`${campo} flex-1 min-w-0`}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>até</span>
            <input
              type="date"
              value={filtros.data_ate}
              onChange={(e) => alterarFiltro('data_ate', e.target.value)}
              className={`${campo} flex-1 min-w-0`}
            />
          </label>
          {isAdmin && (
            <select
              value={filtros.criado_por}
              onChange={(e) => alterarFiltro('criado_por', e.target.value)}
              aria-label="Filtrar por quem criou"
              className={campo}
            >
              <option value="">Criado por: todos</option>
              {autores.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}
          {temFiltro && (
            <button
              type="button"
              onClick={() => setFiltros(FILTROS_VAZIOS)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
          </div>
        ) : itens.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {temFiltro ? 'Nenhuma proposta encontrada com esses filtros' : 'Nenhuma proposta ainda'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Modelo</th>
                  <th className="px-4 py-3 font-medium">Projeto</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Validade</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {isAdmin && <th className="px-4 py-3 font-medium">Criado por</th>}
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itens.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{p.cliente_nome}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {p.modelo_nome}
                      {p.moeda && <div className="text-xs text-gray-500">{rotuloIdiomaMoeda(p)}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{resumoProjetos(p.projeto_nome, p.projetos_total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.data_proposta ? formatarDataISO(p.data_proposta) : formatarData(p.emitida_em)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatarData(p.validade)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    {isAdmin && <td className="px-4 py-3 text-gray-600">{p.criado_por_usuario || '—'}</td>}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => copiarLink(p.codigo)} className="text-ocean-700 hover:underline mr-4">
                        Copiar link
                      </button>
                      <Link to={`/propostas/${p.id}`} className="text-ocean-700 hover:underline">
                        Ver
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => excluir(p)}
                          disabled={excluindo === p.id}
                          className="text-red-600 hover:underline ml-4 disabled:opacity-50"
                        >
                          {excluindo === p.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paginas > 1 && (
        <div className="flex items-center justify-end gap-3 mt-4 text-sm">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-gray-600">
            Página {page} de {paginas}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= paginas}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </ProposalLayout>
  );
}
