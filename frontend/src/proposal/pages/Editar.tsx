import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import ModeloForm, { formDeModelo } from '../components/ModeloForm';
import PropostaForm, { formDeProposta } from '../components/PropostaForm';
import {
  editarProposta,
  mensagemErro,
  obterProposta,
  Proposta,
  PropostaModeloPayload,
  PropostaPayload,
} from '../services/proposalApi';

export default function Editar() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [loading, setLoading] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setLoading(true);
    obterProposta(id)
      .then((p) => {
        setProposta(p);
        setNaoEncontrada(false);
      })
      .catch((e) => {
        if (e?.response?.status === 404) setNaoEncontrada(true);
        else toast.error(mensagemErro(e, 'Não foi possível carregar a proposta'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const voltarAoDetalhe = () => navigate(`/propostas/${id}`);

  const salvar = async (payload: PropostaPayload | PropostaModeloPayload) => {
    setSalvando(true);
    try {
      const p = await editarProposta(id, payload);
      toast.success(p.alterada ? 'Proposta atualizada' : 'Nenhuma alteração para salvar');
      voltarAoDetalhe();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível salvar a proposta'));
      if (e?.response?.status === 409 || e?.response?.status === 404) voltarAoDetalhe();
    } finally {
      setSalvando(false);
    }
  };

  const editavel = proposta && proposta.status !== 'assinada' && proposta.status !== 'cancelada';

  const aviso = (
    <div className="mb-6 space-y-2">
      {proposta?.status === 'expirada' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Esta proposta está expirada. Defina uma nova validade para que o cliente possa assinar.
        </div>
      )}
      <div className="rounded-lg border border-gray-200 bg-ocean-50 p-4 text-sm text-ocean-900">
        O cliente verá as alterações no mesmo link. Se ele já tiver visualizado, a proposta volta para Aguardando
        assinatura.
      </div>
    </div>
  );

  return (
    <ProposalLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Editar proposta</h1>
        <Link to={`/propostas/${id}`} className="text-sm text-ocean-700 hover:underline">
          Cancelar
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : naoEncontrada || !proposta ? (
        <div className="text-center py-16 text-gray-600 space-y-3">
          <p>Proposta não encontrada</p>
          <Link to="/" className="text-ocean-700 hover:underline">
            Voltar para a lista
          </Link>
        </div>
      ) : !editavel ? (
        <div className="text-center py-16 text-gray-600 space-y-3">
          <p>Esta proposta não pode mais ser editada.</p>
          <Link to={`/propostas/${id}`} className="text-ocean-700 hover:underline">
            Voltar para a proposta
          </Link>
        </div>
      ) : proposta.modelo === 'simples' ? (
        <PropostaForm
          inicial={formDeProposta(proposta, proposta.validade)}
          rotuloSalvar="Salvar alterações"
          rotuloSalvando="Salvando..."
          salvando={salvando}
          onSubmit={salvar}
          aviso={aviso}
        />
      ) : (
        <ModeloForm
          inicial={formDeModelo(proposta)}
          rotuloSalvar="Salvar alterações"
          rotuloSalvando="Salvando..."
          salvando={salvando}
          onSubmit={salvar}
          aviso={aviso}
        />
      )}
    </ProposalLayout>
  );
}
