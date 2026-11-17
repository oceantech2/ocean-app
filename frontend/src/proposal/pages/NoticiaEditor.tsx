import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import NoticiaForm, { formDaNoticia } from '../components/NoticiaForm';
import {
  criarNoticia,
  editarNoticia,
  mensagemErro,
  obterNoticia,
  Noticia,
  NoticiaPayload,
} from '../services/proposalApi';

export default function NoticiaEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [carregando, setCarregando] = useState(!!id);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
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

  const salvar = async (payload: NoticiaPayload) => {
    setSalvando(true);
    try {
      const n = id ? await editarNoticia(id, payload) : await criarNoticia(payload);
      toast.success(id ? 'Notícia atualizada' : 'Notícia criada');
      navigate(`/noticias/${n.id}`, { replace: true });
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível salvar a notícia'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ProposalLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{id ? 'Editar notícia' : 'Nova notícia'}</h1>
        <Link to={id ? `/noticias/${id}` : '/noticias'} className="text-sm text-ocean-700 hover:underline">
          Voltar
        </Link>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : naoEncontrada ? (
        <div className="text-center py-16 text-gray-600">Notícia não encontrada</div>
      ) : noticia && !noticia.pode_editar ? (
        <div className="text-center py-16 text-gray-600">Apenas o autor da notícia ou administradores podem editá-la.</div>
      ) : (
        <NoticiaForm
          key={noticia?.id ?? 'nova'}
          inicial={formDaNoticia(noticia)}
          salvando={salvando}
          rotuloSalvar={id ? 'Salvar notícia' : 'Criar notícia'}
          mostrarStatus={!id}
          onSubmit={salvar}
        />
      )}
    </ProposalLayout>
  );
}
