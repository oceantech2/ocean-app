import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import { listarVagas, mensagemErro, StatusVaga, Vaga } from '../services/proposalApi';
import { formatarData } from '../utils/propostaCalculo';
import { AREAS_VAGA, NIVEIS_VAGA } from '../utils/vagas';

export function StatusVagaBadge({ status }: { status: StatusVaga }) {
  const aberta = status === 'aberta';
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        aberta ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
      }`}
    >
      {aberta ? 'Aberta' : 'Encerrada'}
    </span>
  );
}

export default function Vagas() {
  const [status, setStatus] = useState<StatusVaga | ''>('aberta');
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [itens, setItens] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBuscaAplicada(busca), 300);
    return () => clearTimeout(t);
  }, [busca]);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    listarVagas({ status, busca: buscaAplicada })
      .then((r) => ativo && setItens(r))
      .catch((e) => ativo && toast.error(mensagemErro(e, 'Não foi possível carregar as vagas')))
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [status, buscaAplicada]);

  const campo =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600';

  return (
    <ProposalLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vagas</h1>
          <p className="text-sm text-gray-500">Vagas abertas aparecem na página Vagas do site.</p>
        </div>
        <Link
          to="/vagas/nova"
          className="px-4 py-2 rounded-lg bg-ocean-700 text-white text-sm font-medium hover:bg-ocean-800 transition whitespace-nowrap self-start sm:self-auto"
        >
          Nova vaga
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusVaga | '')}
            aria-label="Filtrar por status"
            className={campo}
          >
            <option value="aberta">Abertas</option>
            <option value="encerrada">Encerradas</option>
            <option value="">Todas</option>
          </select>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Título, cliente ou código na planilha"
            aria-label="Buscar vaga"
            className={`${campo} sm:col-span-2`}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
          </div>
        ) : itens.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Nenhuma vaga encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-3 font-medium">Vaga</th>
                  <th className="px-3 py-3 font-medium">Cliente</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium text-right">Candidaturas</th>
                  <th className="px-3 py-3 font-medium">Criada por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itens.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 break-words">
                      <Link to={`/vagas/${v.id}`} className="font-medium text-gray-900 hover:underline">
                        {v.titulo}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {AREAS_VAGA[v.area]} · {NIVEIS_VAGA[v.nivel]} · {v.localidade}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 break-words">
                      {v.cliente || '—'}
                      {v.codigo_planilha && <div className="text-xs text-gray-500">{v.codigo_planilha}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <StatusVagaBadge status={v.status} />
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {v.candidaturas_total}
                      {v.candidaturas_pendentes > 0 && (
                        <div className="text-xs text-amber-700">{v.candidaturas_pendentes} pendente(s) na planilha</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {v.criado_por_usuario}
                      <div className="text-xs text-gray-500">{formatarData(v.criado_em)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProposalLayout>
  );
}
