import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import { registroDoModelo } from '../modelos';
import EscopoRico from '../modelos/EscopoRico';
import { formatarPagamento, formatarTaxa } from '../modelos/formatacao';
import { rotuloIdiomaMoeda } from '../modelos/idioma';
import { rotuloTipo } from '../modelos/investimentos';
import { rotuloSetor } from '../modelos/setores';
import { excluirModeloProposta, mensagemErro, ModeloProposta, obterModeloProposta } from '../services/proposalApi';
import { useProposalAuthStore } from '../store';
import { formatarDataHora } from '../utils/propostaCalculo';

const cartao = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6';
const botao = 'px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition';

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-900 break-words">{children}</dd>
    </div>
  );
}

export default function ModeloVer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = useProposalAuthStore((s) => s.papel) === 'admin';
  const [modelo, setModelo] = useState<ModeloProposta | null>(null);
  const [loading, setLoading] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setLoading(true);
    obterModeloProposta(id)
      .then((m) => ativo && setModelo(m))
      .catch((e) => {
        if (!ativo) return;
        if (e?.response?.status === 404) setNaoEncontrado(true);
        else toast.error(mensagemErro(e, 'Não foi possível carregar o modelo'));
      })
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [id]);

  const excluir = async () => {
    if (!modelo) return;
    if (!window.confirm(`Excluir o modelo "${modelo.nome}"? As propostas já criadas a partir dele não mudam.`)) return;
    setExcluindo(true);
    try {
      await excluirModeloProposta(modelo.id);
      toast.success('Modelo excluído');
      navigate('/modelos', { replace: true });
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível excluir o modelo'));
      setExcluindo(false);
    }
  };

  return (
    <ProposalLayout>
      <Link to="/modelos" className="text-sm text-ocean-700 hover:underline">
        ← Voltar para os modelos
      </Link>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : naoEncontrado || !modelo ? (
        <div className="text-center py-16 text-gray-600">Modelo não encontrado</div>
      ) : (
        <div className="mt-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{modelo.nome}</h1>
              <p className="text-sm text-gray-600">
                {modelo.divisao_nome} · {rotuloIdiomaMoeda(modelo)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/nova?modelo=${modelo.id}`}
                className="px-3 py-2 rounded-lg bg-ocean-700 text-sm text-white font-medium hover:bg-ocean-800 transition"
              >
                Usar este modelo
              </Link>
              {isAdmin && (
                <>
                  <Link to={`/modelos/${modelo.id}/editar`} className={botao}>
                    Editar
                  </Link>
                  <button
                    onClick={excluir}
                    disabled={excluindo}
                    className="px-3 py-2 rounded-lg bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {excluindo ? 'Excluindo...' : 'Excluir'}
                  </button>
                </>
              )}
            </div>
          </div>

          <section className={cartao}>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Campo label="Setor">{modelo.setor ? rotuloSetor(modelo.setor) : 'Escolhido em cada proposta'}</Campo>
              <Campo label="Shortlist">{modelo.shortlist || '—'}</Campo>
              <Campo label="SLA">{modelo.sla || '—'}</Campo>
              <Campo label="Garantia">{modelo.garantia || '—'}</Campo>
              <Campo label="Validade">
                {modelo.validade_dias === 1 ? '1 dia' : `${modelo.validade_dias} dias`}
              </Campo>
              <Campo label="Criado por">
                {modelo.criado_por_usuario}
                {modelo.criado_em && ` em ${formatarDataHora(modelo.criado_em)}`}
              </Campo>
              {modelo.atualizado_por_usuario && (
                <Campo label="Última edição">
                  {modelo.atualizado_por_usuario}
                  {modelo.atualizado_em && ` em ${formatarDataHora(modelo.atualizado_em)}`}
                </Campo>
              )}
            </dl>
          </section>

          <section className={cartao}>
            <h2 className="font-semibold text-gray-900 mb-4">{registroDoModelo(modelo.divisao).rotuloEscopo}</h2>
            {modelo.projeto_escopo ? (
              <div className="text-gray-900 break-words space-y-2 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-6 [&_ul]:pl-6 [&_ol]:space-y-2 [&_ul]:space-y-1 [&_ul]:mt-1 [&_strong]:font-semibold">
                <EscopoRico html={modelo.projeto_escopo} />
              </div>
            ) : (
              <p className="text-gray-500">Não informado</p>
            )}
          </section>

          <section className={cartao}>
            <h2 className="font-semibold text-gray-900 mb-4">Investimento</h2>
            <div className="space-y-6">
              {modelo.projetos.map((projeto, i) => (
                <div key={i}>
                  <h3 className="font-medium text-gray-900 mb-3">{projeto.nome}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projeto.investimentos.map((inv) => (
                      <div
                        key={inv.tipo}
                        className="rounded-lg border border-gray-200 border-t-4 border-t-ocean-700 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                          {rotuloTipo(inv.tipo)}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                          {formatarTaxa(inv, { moeda: modelo.moeda })}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">{formatarPagamento(inv.entrada)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </ProposalLayout>
  );
}
