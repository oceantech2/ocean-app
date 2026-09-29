import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import StatusBadge from '../components/StatusBadge';
import { cancelarProposta, mensagemErro, obterProposta, Proposta } from '../services/proposalApi';
import {
  copiarTexto,
  formatarAliquota,
  formatarData,
  formatarDataHora,
  formatarMoeda,
  montarLinkPublico,
} from '../utils/propostaCalculo';

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-900 break-words">{children}</dd>
    </div>
  );
}

export default function Detalhe() {
  const { id } = useParams();
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [loading, setLoading] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setProposta(await obterProposta(id));
      setNaoEncontrada(false);
    } catch (e: any) {
      if (e?.response?.status === 404) setNaoEncontrada(true);
      else toast.error(mensagemErro(e, 'Não foi possível carregar a proposta'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const copiarLink = async () => {
    if (!proposta) return;
    if (await copiarTexto(montarLinkPublico(proposta.codigo))) toast.success('Link copiado');
    else toast.error('Não foi possível copiar o link');
  };

  const cancelar = async () => {
    if (!proposta) return;
    if (!window.confirm(`Cancelar a proposta de ${proposta.cliente_nome}? O cliente não poderá mais assinar.`)) return;
    setCancelando(true);
    try {
      setProposta(await cancelarProposta(proposta.id));
      toast.success('Proposta cancelada');
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível cancelar a proposta'));
      carregar();
    } finally {
      setCancelando(false);
    }
  };

  const botao = 'px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition';

  return (
    <ProposalLayout>
      <Link to="/" className="text-sm text-ocean-700 hover:underline">
        ← Voltar para a lista
      </Link>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : naoEncontrada || !proposta ? (
        <div className="text-center py-16 text-gray-600">Proposta não encontrada</div>
      ) : (
        <div className="mt-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{proposta.cliente_nome}</h1>
              <div className="mt-1">
                <StatusBadge status={proposta.status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={copiarLink} className={botao}>
                Copiar link
              </button>
              <a href={montarLinkPublico(proposta.codigo)} target="_blank" rel="noopener noreferrer" className={botao}>
                Abrir página do cliente
              </a>
              <Link to={`/nova?copiar=${proposta.id}`} className={botao}>
                Criar cópia
              </Link>
              {(proposta.status === 'aguardando' || proposta.status === 'visualizada') && (
                <button
                  onClick={cancelar}
                  disabled={cancelando}
                  className="px-3 py-2 rounded-lg border border-red-300 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
                >
                  {cancelando ? 'Cancelando...' : 'Cancelar'}
                </button>
              )}
            </div>
          </div>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Campo label="CNPJ">{proposta.cnpj}</Campo>
              <Campo label="Valor">{formatarMoeda(proposta.valor)}</Campo>
              {proposta.imposto_ativo && (
                <Campo label={`Imposto (${formatarAliquota(proposta.aliquota)})`}>
                  {formatarMoeda(proposta.valor_imposto)}
                </Campo>
              )}
              <Campo label="Total">
                <span className="font-semibold">{formatarMoeda(proposta.total)}</span>
              </Campo>
              <Campo label="Emissão">{formatarDataHora(proposta.emitida_em)}</Campo>
              <Campo label="Validade">{formatarData(proposta.validade)}</Campo>
              <Campo label="1ª visualização">{formatarDataHora(proposta.visualizada_em)}</Campo>
              {proposta.cancelada_em && <Campo label="Cancelada em">{formatarDataHora(proposta.cancelada_em)}</Campo>}
              {proposta.criado_por_usuario && <Campo label="Criado por">{proposta.criado_por_usuario}</Campo>}
            </dl>
          </section>

          {proposta.assinatura && (
            <section className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
              <h2 className="font-semibold text-green-800 mb-4">Assinatura</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Campo label="Nome">{proposta.assinatura.nome}</Campo>
                <Campo label="E-mail">{proposta.assinatura.email}</Campo>
                <Campo label="Data e hora">{formatarDataHora(proposta.assinatura.assinada_em)}</Campo>
                <Campo label="IP">{proposta.assinatura.ip}</Campo>
                <Campo label="Navegador">
                  <span className="text-sm">{proposta.assinatura.user_agent || '—'}</span>
                </Campo>
                <Campo label="Impressão digital (SHA-256)">
                  <span className="font-mono text-xs">{proposta.assinatura.conteudo_hash}</span>
                </Campo>
              </dl>
            </section>
          )}
        </div>
      )}
    </ProposalLayout>
  );
}
