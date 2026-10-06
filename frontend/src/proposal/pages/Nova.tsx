import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ModeloForm, { FormModelo, formDeModelo, formModeloInicial } from '../components/ModeloForm';
import ProposalLayout from '../components/ProposalLayout';
import { modelosDisponiveis } from '../modelos';
import { resumoProjetos } from '../modelos/formatoProposta';
import {
  criarProposta,
  mensagemErro,
  ModeloId,
  obterPerfil,
  obterProposta,
  PerfilConsultor,
  Proposta,
  PropostaModeloPayload,
} from '../services/proposalApi';
import { copiarTexto, formatarData, montarLinkPublico } from '../utils/propostaCalculo';

const MODELOS = modelosDisponiveis();
const MODELO_PADRAO: ModeloId = MODELOS[0]?.id ?? 'executive-search';

const perfilIncompleto = (perfil: PerfilConsultor | null) =>
  !perfil || !perfil.nome || !perfil.cargo || !perfil.telefone || !perfil.email;

export default function Nova() {
  const [params, setParams] = useSearchParams();
  const copiarId = params.get('copiar');
  const [modelo, setModelo] = useState<ModeloId>(MODELO_PADRAO);
  const [perfil, setPerfil] = useState<PerfilConsultor | null>(null);
  const [copiando, setCopiando] = useState(false);
  const [inicial, setInicial] = useState<FormModelo>(() => formModeloInicial(null));
  const [versaoForm, setVersaoForm] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [criada, setCriada] = useState<Proposta | null>(null);

  const reiniciarForm = (form: FormModelo) => {
    setInicial(form);
    setVersaoForm((v) => v + 1);
  };

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    (async () => {
      const perfilAtual = await obterPerfil().catch(() => null);
      if (!ativo) return;
      setPerfil(perfilAtual);
      if (copiarId) {
        try {
          const origem = await obterProposta(copiarId);
          if (!ativo) return;
          if (origem.modelo !== 'simples') {
            setModelo(origem.modelo);
            setCopiando(true);
            reiniciarForm(formDeModelo(origem, { copia: true }));
            return;
          }
          toast.error('Esta proposta não pode ser copiada');
        } catch (e) {
          if (ativo) toast.error(mensagemErro(e, 'Não foi possível carregar a proposta de origem'));
        }
      }
      if (!ativo) return;
      setModelo(MODELO_PADRAO);
      setCopiando(false);
      reiniciarForm(formModeloInicial(perfilAtual));
    })().finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [copiarId]);

  const salvar = async (payload: PropostaModeloPayload) => {
    setSalvando(true);
    try {
      const p = await criarProposta(payload);
      setCriada(p);
      toast.success('Proposta criada');
    } catch (err) {
      toast.error(mensagemErro(err, 'Não foi possível criar a proposta'));
    } finally {
      setSalvando(false);
    }
  };

  const novaProposta = () => {
    setCriada(null);
    setCopiando(false);
    reiniciarForm(formModeloInicial(perfil));
    if (copiarId) setParams({});
  };

  const copiarLink = async (codigo: string) => {
    if (await copiarTexto(montarLinkPublico(codigo))) toast.success('Link copiado');
    else toast.error('Não foi possível copiar o link');
  };

  if (criada) {
    const link = montarLinkPublico(criada.codigo);
    return (
      <ProposalLayout>
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Proposta criada</h1>
            <p className="text-sm text-gray-600 mt-1">
              {criada.cliente_nome} · {resumoProjetos(criada.projeto_nome, criada.projetos_total)} · válida até{' '}
              {formatarData(criada.validade)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link para o cliente</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => copiarLink(criada.codigo)}
                className="px-4 py-2 rounded-lg bg-ocean-700 text-white font-medium hover:bg-ocean-800 transition"
              >
                Copiar link
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/propostas/${criada.id}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Ver proposta
            </Link>
            <button
              onClick={novaProposta}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Nova proposta
            </button>
          </div>
        </div>
      </ProposalLayout>
    );
  }

  const aviso =
    !copiando && perfilIncompleto(perfil) ? (
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Preencha seu perfil para não precisar digitar seus dados de contato em cada proposta.{' '}
        <Link to="/perfil" className="font-medium underline">
          Ir para Meu perfil
        </Link>
      </div>
    ) : undefined;

  return (
    <ProposalLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nova proposta</h1>
        <Link to="/" className="text-sm text-ocean-700 hover:underline">
          Voltar para a lista
        </Link>
      </div>

      <div className="mb-6 max-w-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo (divisão)</label>
        <select
          value={modelo}
          onChange={(e) => setModelo(e.target.value as ModeloId)}
          disabled={carregando}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 disabled:bg-gray-50"
        >
          {MODELOS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : (
        <ModeloForm
          key={versaoForm}
          inicial={inicial}
          modelo={modelo}
          rotuloSalvar="Gerar proposta"
          rotuloSalvando="Gerando..."
          salvando={salvando}
          onSubmit={salvar}
          aviso={aviso}
        />
      )}
    </ProposalLayout>
  );
}
