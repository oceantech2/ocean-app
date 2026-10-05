import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import StatusBadge from '../components/StatusBadge';
import { listarPropostas, mensagemErro, PropostaListItem, StatusProposta } from '../services/proposalApi';
import { formatarDataISO } from '../modelos/formatacao';
import { useProposalAuthStore } from '../store';
import { copiarTexto, formatarData, montarLinkPublico, STATUS_LABEL } from '../utils/propostaCalculo';

const FILTROS: Array<{ valor: StatusProposta | ''; label: string }> = [
  { valor: '', label: 'Todas' },
  ...(Object.keys(STATUS_LABEL) as StatusProposta[]).map((s) => ({ valor: s, label: STATUS_LABEL[s] })),
];

export default function Lista() {
  const papel = useProposalAuthStore((s) => s.papel);
  const isAdmin = papel === 'admin';
  const [status, setStatus] = useState<StatusProposta | ''>('');
  const [page, setPage] = useState(1);
  const [itens, setItens] = useState<PropostaListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    listarPropostas({ status, page })
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
  }, [status, page]);

  const copiarLink = async (codigo: string) => {
    if (await copiarTexto(montarLinkPublico(codigo))) toast.success('Link copiado');
    else toast.error('Não foi possível copiar o link');
  };

  const paginas = Math.max(1, Math.ceil(total / pageSize));

  return (
    <ProposalLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Propostas</h1>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusProposta | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600"
          >
            {FILTROS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.label}
              </option>
            ))}
          </select>
          <Link
            to="/nova"
            className="px-4 py-2 rounded-lg bg-ocean-700 text-white text-sm font-medium hover:bg-ocean-800 transition whitespace-nowrap"
          >
            Nova proposta
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
          </div>
        ) : itens.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            {status ? 'Nenhuma proposta com este status' : 'Nenhuma proposta ainda'}
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
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.modelo_nome}</td>
                    <td className="px-4 py-3 text-gray-600">{p.projeto_nome ?? '—'}</td>
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
