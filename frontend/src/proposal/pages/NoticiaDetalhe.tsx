import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import {
  excluirNoticia,
  mensagemErro,
  mudarStatusNoticia,
  obterNoticia,
  Noticia,
} from '../services/proposalApi';
import { formatarDataPublicacao, linkNoticiaNoSite, SEGMENTOS_NOTICIA } from '../utils/noticias';
import { StatusNoticiaBadge } from './Noticias';

const cartao = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6';
const botao = 'px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition';

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-900 break-words whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

export default function NoticiaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [acao, setAcao] = useState(false);

  const carregar = useCallback(() => {
    if (!id) return;
    let ativo = true;
    setCarregando(true);
    obterNoticia(id)
      .then((n) => ativo && setNoticia(n))
      .catch((e) => {
        if (!ativo) return;
        if (e?.response?.status === 404) setNaoEncontrada(true);
        else toast.error(mensagemErro(e, 'Não foi possível carregar a notícia'));
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id]);

  useEffect(() => carregar(), [carregar]);

  const publicar = async () => {
    if (!noticia) return;
    setAcao(true);
    try {
      setNoticia(await mudarStatusNoticia(noticia.id, 'publicar'));
      toast.success('Notícia publicada');
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível publicar'));
    } finally {
      setAcao(false);
    }
  };

  const despublicar = async () => {
    if (!noticia) return;
    if (!window.confirm('Despublicar esta notícia? Ela sairá do site.')) return;
    setAcao(true);
    try {
      setNoticia(await mudarStatusNoticia(noticia.id, 'despublicar'));
      toast.success('Notícia despublicada');
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível despublicar'));
    } finally {
      setAcao(false);
    }
  };

  const excluir = async () => {
    if (!noticia) return;
    if (!window.confirm('Excluir esta notícia? Esta ação não pode ser desfeita.')) return;
    setAcao(true);
    try {
      await excluirNoticia(noticia.id);
      toast.success('Notícia excluída');
      navigate('/noticias', { replace: true });
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível excluir'));
      setAcao(false);
    }
  };

  return (
    <ProposalLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <Link to="/noticias" className="text-sm text-ocean-700 hover:underline">
            ← Notícias
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">
            {carregando ? 'Carregando…' : noticia?.titulo_pt ?? 'Notícia'}
          </h1>
        </div>
        {noticia?.pode_editar && (
          <div className="flex flex-wrap gap-2">
            <Link to={`/noticias/${noticia.id}/editar`} className={botao}>
              Editar
            </Link>
            {noticia.status === 'publicada' ? (
              <button type="button" onClick={despublicar} disabled={acao} className={botao}>
                Despublicar
              </button>
            ) : (
              <button type="button" onClick={publicar} disabled={acao} className={botao}>
                Publicar
              </button>
            )}
            <button type="button" onClick={excluir} disabled={acao} className={`${botao} text-red-700 border-red-200`}>
              Excluir
            </button>
          </div>
        )}
      </div>

      {carregando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : naoEncontrada || !noticia ? (
        <div className="text-center py-16 text-gray-600">Notícia não encontrada</div>
      ) : (
        <div className="space-y-6">
          <section className={cartao}>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Status">
                <StatusNoticiaBadge status={noticia.status} />
              </Campo>
              <Campo label="Segmento">{SEGMENTOS_NOTICIA[noticia.segmento]}</Campo>
              <Campo label="Data de publicação">{formatarDataPublicacao(noticia.data_publicacao)}</Campo>
              <Campo label="Autor">{noticia.criado_por_usuario}</Campo>
              <Campo label="No site">
                <a href={linkNoticiaNoSite(noticia)} target="_blank" rel="noreferrer" className="text-ocean-700 hover:underline">
                  Abrir página pública
                </a>
              </Campo>
            </dl>
          </section>

          <section className={cartao}>
            <h2 className="font-semibold text-gray-900 mb-3">Português</h2>
            <dl className="space-y-4">
              <Campo label="Título">{noticia.titulo_pt}</Campo>
              <Campo label="Resumo">{noticia.resumo_pt}</Campo>
              <Campo label="Conteúdo">{noticia.conteudo_pt}</Campo>
            </dl>
          </section>

          <section className={cartao}>
            <h2 className="font-semibold text-gray-900 mb-3">English</h2>
            <dl className="space-y-4">
              <Campo label="Title">{noticia.titulo_en}</Campo>
              <Campo label="Summary">{noticia.resumo_en}</Campo>
              <Campo label="Body">{noticia.conteudo_en}</Campo>
            </dl>
          </section>
        </div>
      )}
    </ProposalLayout>
  );
}
