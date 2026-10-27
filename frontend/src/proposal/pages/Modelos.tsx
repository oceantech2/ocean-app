import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import { IconEditar, IconExcluir, IconExibir } from '../../components/actionIcons';
import Tooltip from '../../components/Tooltip';
import { modelosDisponiveis } from '../modelos';
import { rotuloIdiomaMoeda } from '../modelos/idioma';
import { resumoProjetos } from '../modelos/formatoProposta';
import {
  excluirModeloProposta,
  listarModelosProposta,
  mensagemErro,
  ModeloId,
  ModeloProposta,
} from '../services/proposalApi';
import { useProposalAuthStore } from '../store';

const DIVISOES = modelosDisponiveis();

const botaoIcone =
  'inline-flex items-center justify-center p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed';

export default function Modelos() {
  const isAdmin = useProposalAuthStore((s) => s.papel) === 'admin';
  const [divisao, setDivisao] = useState<ModeloId | ''>('');
  const [nome, setNome] = useState('');
  const [nomeAplicado, setNomeAplicado] = useState('');
  const [page, setPage] = useState(1);
  const [recarga, setRecarga] = useState(0);
  const [itens, setItens] = useState<ModeloProposta[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState<number | null>(null);

  const temFiltro = divisao !== '' || nome.trim() !== '';

  useEffect(() => {
    const t = setTimeout(() => {
      setNomeAplicado(nome);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [nome]);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    listarModelosProposta({ divisao, nome: nomeAplicado, page })
      .then((r) => {
        if (!ativo) return;
        setItens(r.items);
        setTotal(r.total);
        setPageSize(r.page_size);
      })
      .catch((e) => ativo && toast.error(mensagemErro(e, 'Não foi possível carregar os modelos')))
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [divisao, nomeAplicado, page, recarga]);

  const excluir = async (m: ModeloProposta) => {
    if (!window.confirm(`Excluir o modelo "${m.nome}"? As propostas já criadas a partir dele não mudam.`)) return;
    setExcluindo(m.id);
    try {
      await excluirModeloProposta(m.id);
      toast.success('Modelo excluído');
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível excluir o modelo'));
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
        <h1 className="text-2xl font-semibold text-gray-900">Modelos</h1>
        {isAdmin && (
          <Link
            to="/modelos/novo"
            className="px-4 py-2 rounded-lg bg-ocean-700 text-white text-sm font-medium hover:bg-ocean-800 transition whitespace-nowrap self-start sm:self-auto"
          >
            Novo modelo
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={divisao}
            onChange={(e) => {
              setDivisao(e.target.value as ModeloId | '');
              setPage(1);
            }}
            aria-label="Filtrar por divisão"
            className={campo}
          >
            <option value="">Todas as divisões</option>
            {DIVISOES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do modelo"
            aria-label="Filtrar por nome"
            className={campo}
          />
          {temFiltro && (
            <button
              type="button"
              onClick={() => {
                setDivisao('');
                setNome('');
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition sm:justify-self-start"
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
            {temFiltro ? 'Nenhum modelo encontrado com esses filtros' : 'Nenhum modelo cadastrado ainda'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-3 font-medium">Nome</th>
                  <th className="px-3 py-3 font-medium">Divisão</th>
                  <th className="px-3 py-3 font-medium">Projetos</th>
                  <th className="px-3 py-3 font-medium">Validade</th>
                  <th className="px-3 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itens.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-gray-900 break-words">
                      <Link to={`/modelos/${m.id}`} className="hover:underline">
                        {m.nome}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {m.divisao_nome}
                      <div className="text-xs text-gray-500">{rotuloIdiomaMoeda(m)}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 break-words">
                      {resumoProjetos(m.projetos[0]?.nome ?? null, m.projetos.length)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {m.validade_dias === 1 ? '1 dia' : `${m.validade_dias} dias`}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip texto="Ver modelo">
                          <Link
                            to={`/modelos/${m.id}`}
                            aria-label="Ver modelo"
                            className={`${botaoIcone} bg-gray-100 text-gray-700 hover:bg-gray-200`}
                          >
                            <IconExibir className="w-4 h-4" />
                          </Link>
                        </Tooltip>
                        {isAdmin && (
                          <>
                            <Tooltip texto="Editar modelo">
                              <Link
                                to={`/modelos/${m.id}/editar`}
                                aria-label="Editar modelo"
                                className={`${botaoIcone} bg-blue-50 text-blue-700 hover:bg-blue-100`}
                              >
                                <IconEditar className="w-4 h-4" />
                              </Link>
                            </Tooltip>
                            <Tooltip texto="Excluir modelo">
                              <button
                                type="button"
                                onClick={() => excluir(m)}
                                disabled={excluindo === m.id}
                                aria-label="Excluir modelo"
                                className={`${botaoIcone} bg-red-50 text-red-600 hover:bg-red-100`}
                              >
                                {excluindo === m.id ? (
                                  <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-red-600" />
                                ) : (
                                  <IconExcluir className="w-4 h-4" />
                                )}
                              </button>
                            </Tooltip>
                          </>
                        )}
                      </div>
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
