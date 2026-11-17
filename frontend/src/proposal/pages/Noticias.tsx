import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import { listarNoticias, mensagemErro, StatusNoticia, Noticia, SegmentoNoticia } from '../services/proposalApi';
import { formatarDataPublicacao, SEGMENTOS_NOTICIA } from '../utils/noticias';

export function StatusNoticiaBadge({ status }: { status: StatusNoticia }) {
  const publicada = status === 'publicada';
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        publicada ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
      }`}
    >
      {publicada ? 'Publicada' : 'Não publicada'}
    </span>
  );
}

export default function Noticias() {
  const [status, setStatus] = useState<StatusNoticia | ''>('');
  const [segmento, setSegmento] = useState<SegmentoNoticia | ''>('');
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [itens, setItens] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBuscaAplicada(busca), 300);
    return () => clearTimeout(t);
  }, [busca]);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    listarNoticias({ status, segmento, busca: buscaAplicada })
      .then((r) => ativo && setItens(r))
      .catch((e) => ativo && toast.error(mensagemErro(e, 'Não foi possível carregar as notícias')))
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [status, segmento, buscaAplicada]);

  const campo =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600';

  return (
    <ProposalLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notícias</h1>
          <p className="text-sm text-gray-500">Publicadas e com data elegível aparecem na página Notícias do site.</p>
        </div>
        <Link
          to="/noticias/nova"
          className="px-4 py-2 rounded-lg bg-ocean-700 text-white text-sm font-medium hover:bg-ocean-800 transition whitespace-nowrap self-start sm:self-auto"
        >
          Nova notícia
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusNoticia | '')}
            aria-label="Filtrar por status"
            className={campo}
          >
            <option value="">Todos os status</option>
            <option value="publicada">Publicadas</option>
            <option value="nao_publicada">Não publicadas</option>
          </select>
          <select
            value={segmento}
            onChange={(e) => setSegmento(e.target.value as SegmentoNoticia | '')}
            aria-label="Filtrar por segmento"
            className={campo}
          >
            <option value="">Todos os segmentos</option>
            {(Object.keys(SEGMENTOS_NOTICIA) as SegmentoNoticia[]).map((k) => (
              <option key={k} value={k}>
                {SEGMENTOS_NOTICIA[k]}
              </option>
            ))}
          </select>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar título PT/EN"
            aria-label="Buscar notícia"
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
          <div className="text-center py-16 text-gray-500">Nenhuma notícia encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-3 font-medium">Título</th>
                  <th className="px-3 py-3 font-medium">Segmento</th>
                  <th className="px-3 py-3 font-medium">Data</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Autor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itens.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <Link to={`/noticias/${n.id}`} className="text-ocean-800 font-medium hover:underline">
                        {n.titulo_pt}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{SEGMENTOS_NOTICIA[n.segmento]}</td>
                    <td className="px-3 py-3 text-gray-700">{formatarDataPublicacao(n.data_publicacao)}</td>
                    <td className="px-3 py-3">
                      <StatusNoticiaBadge status={n.status} />
                    </td>
                    <td className="px-3 py-3 text-gray-600">{n.criado_por_usuario}</td>
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
