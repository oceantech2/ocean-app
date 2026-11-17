import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ModeloForm, { FormModelo, formDeModeloProposta, formModeloInicial } from '../components/ModeloForm';
import ProposalLayout from '../components/ProposalLayout';
import {
  criarModeloProposta,
  editarModeloProposta,
  mensagemErro,
  ModeloId,
  obterModeloProposta,
  PropostaModeloPayload,
} from '../services/proposalApi';
import { useProposalAuthStore } from '../store';

const MODELO_OCEAN: ModeloId = 'ocean';
const NOME_MAX = 120;

export default function ModeloEditor() {
  const { id } = useParams();
  const editando = !!id;
  const navigate = useNavigate();
  const isAdmin = useProposalAuthStore((s) => s.papel) === 'admin';
  const [nome, setNome] = useState('');
  const [erroNome, setErroNome] = useState<string | undefined>();
  const [inicial, setInicial] = useState<FormModelo>(() => formModeloInicial(null));
  const [versaoForm, setVersaoForm] = useState(0);
  const [carregando, setCarregando] = useState(editando);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setCarregando(true);
    obterModeloProposta(id)
      .then((m) => {
        if (!ativo) return;
        setNome(m.nome);
        setInicial(formDeModeloProposta(m, null));
        setVersaoForm((v) => v + 1);
      })
      .catch((e) => {
        if (!ativo) return;
        if (e?.response?.status === 404) setNaoEncontrado(true);
        else toast.error(mensagemErro(e, 'Não foi possível carregar o modelo'));
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id]);

  const salvar = async (payload: PropostaModeloPayload) => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroNome('Informe o nome do modelo');
      return;
    }
    setSalvando(true);
    try {
      const dados = {
        divisao: MODELO_OCEAN,
        nome: nomeLimpo,
        idioma: payload.idioma,
        moeda: payload.moeda,
        setor: payload.setor,
        servicos: payload.servicos,
        projeto_escopo: payload.projeto_escopo,
        projetos: payload.projetos,
        shortlist: payload.shortlist,
        sla: payload.sla,
        garantia: payload.garantia,
        observacoes_investimento: payload.observacoes_investimento,
        observacoes_garantias: payload.observacoes_garantias,
        validade_dias: payload.validade_dias,
      };
      const m = id ? await editarModeloProposta(id, dados) : await criarModeloProposta(dados);
      toast.success(id ? 'Modelo atualizado' : 'Modelo criado');
      navigate(`/modelos/${m.id}`, { replace: true });
    } catch (e: any) {
      if (e?.response?.status === 409) setErroNome(mensagemErro(e, 'Nome já usado nesta divisão'));
      toast.error(mensagemErro(e, 'Não foi possível salvar o modelo'));
    } finally {
      setSalvando(false);
    }
  };

  const campo =
    'w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600';

  return (
    <ProposalLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{editando ? 'Editar modelo' : 'Novo modelo'}</h1>
        <Link to={id ? `/modelos/${id}` : '/modelos'} className="text-sm text-ocean-700 hover:underline">
          Voltar
        </Link>
      </div>

      {!isAdmin ? (
        <div className="text-center py-16 text-gray-600">Apenas administradores podem criar e editar modelos.</div>
      ) : carregando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : naoEncontrado ? (
        <div className="text-center py-16 text-gray-600">Modelo não encontrado</div>
      ) : (
        <>
          <div className="mb-6 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do modelo</label>
            <input
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErroNome(undefined);
              }}
              maxLength={NOME_MAX}
              placeholder="Ex.: Mapeamento com pagamento antecipado"
              className={`${campo} ${erroNome ? 'border-red-400' : 'border-gray-300'}`}
            />
            {erroNome && <p className="text-sm text-red-600 mt-1">{erroNome}</p>}
            <p className="text-xs text-gray-500 mt-1">Atalho Ocean: serviços e textos da proposta v2.</p>
          </div>
          <ModeloForm
            key={versaoForm}
            inicial={inicial}
            variante="modelo"
            modelo={MODELO_OCEAN}
            rotuloSalvar={editando ? 'Salvar modelo' : 'Criar modelo'}
            rotuloSalvando="Salvando..."
            salvando={salvando}
            onSubmit={salvar}
          />
        </>
      )}
    </ProposalLayout>
  );
}
