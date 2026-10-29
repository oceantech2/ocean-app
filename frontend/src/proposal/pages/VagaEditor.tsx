import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import VagaForm, { formDaVaga } from '../components/VagaForm';
import { criarVaga, editarVaga, mensagemErro, obterVaga, Vaga, VagaPayload } from '../services/proposalApi';

export default function VagaEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [carregando, setCarregando] = useState(!!id);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setCarregando(true);
    obterVaga(id)
      .then((v) => ativo && setVaga(v))
      .catch((e) => {
        if (!ativo) return;
        if (e?.response?.status === 404) setNaoEncontrada(true);
        else toast.error(mensagemErro(e, 'Não foi possível carregar a vaga'));
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id]);

  const salvar = async (payload: VagaPayload) => {
    setSalvando(true);
    try {
      const v = id ? await editarVaga(id, payload) : await criarVaga(payload);
      toast.success(id ? 'Vaga atualizada' : 'Vaga publicada no site');
      navigate(`/vagas/${v.id}`, { replace: true });
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível salvar a vaga'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ProposalLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{id ? 'Editar vaga' : 'Nova vaga'}</h1>
        <Link to={id ? `/vagas/${id}` : '/vagas'} className="text-sm text-ocean-700 hover:underline">
          Voltar
        </Link>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : naoEncontrada ? (
        <div className="text-center py-16 text-gray-600">Vaga não encontrada</div>
      ) : vaga && !vaga.pode_editar ? (
        <div className="text-center py-16 text-gray-600">Apenas o autor da vaga ou administradores podem editá-la.</div>
      ) : (
        <VagaForm
          key={vaga?.id ?? 'nova'}
          inicial={formDaVaga(vaga)}
          salvando={salvando}
          rotuloSalvar={id ? 'Salvar vaga' : 'Publicar vaga'}
          onSubmit={salvar}
        />
      )}
    </ProposalLayout>
  );
}
