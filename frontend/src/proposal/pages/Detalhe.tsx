import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import StatusBadge from '../components/StatusBadge';
import { formatarCNPJ } from '../../utils/documento';
import { formatarDataISO, formatarGarantia, formatarPagamento, formatarTaxa } from '../modelos/formatacao';
import EscopoRico from '../modelos/EscopoRico';
import { escopoParaTexto } from '../modelos/escopo';
import { registroDoModelo } from '../modelos';
import { garantiaDaProposta, projetosDaProposta, resumoProjetos } from '../modelos/formatoProposta';
import { rotuloIdiomaMoeda } from '../modelos/idioma';
import { rotuloTipo } from '../modelos/investimentos';
import { rotuloSetor } from '../modelos/setores';
import {
  AlteracaoCampo,
  cancelarProposta,
  Investimento,
  mensagemErro,
  Moeda,
  obterProposta,
  Projeto,
  Proposta,
} from '../services/proposalApi';
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

const ROTULOS_CAMPO: Record<string, string> = {
  cliente_nome: 'Cliente',
  cnpj: 'CNPJ',
  valor: 'Valor',
  imposto_ativo: 'Imposto',
  aliquota: 'Alíquota',
  valor_imposto: 'Valor do imposto',
  total: 'Total',
  validade: 'Validade',
  data_proposta: 'Data',
  setor: 'Setor',
  consultor_nome: 'Consultor: nome',
  consultor_cargo: 'Consultor: cargo',
  consultor_telefone: 'Consultor: telefone',
  consultor_email: 'Consultor: e-mail',
  projeto_nome: 'Projeto',
  garantia_meses: 'Garantia',
  shortlist: 'Shortlist',
  sla: 'SLA',
  garantia_texto: 'Garantia',
  validade_dias: 'Validade (dias)',
};

function rotuloCampo(campo: string, p: Proposta): string {
  const porModelo = p.modelo !== 'simples';
  if (campo === 'cliente_nome' && porModelo) return 'Empresa';
  if (campo === 'projeto_escopo') return registroDoModelo(p.modelo).rotuloEscopo;
  if (campo.startsWith('projeto.')) return `Projeto ${campo.slice('projeto.'.length)}`;
  if (campo.startsWith('investimento.')) return `Investimento ${rotuloTipo(campo.slice('investimento.'.length))}`;
  return ROTULOS_CAMPO[campo] || campo;
}

const formatarInvestimento = (inv: Investimento, moeda: Moeda) =>
  `${formatarTaxa(inv, { moeda })} · ${formatarPagamento(inv.entrada)}`;

function formatarProjeto(projeto: Projeto, moeda: Moeda): string {
  const investimentos = projeto.investimentos
    .map((inv) => `${rotuloTipo(inv.tipo)} ${formatarTaxa(inv, { moeda })} (${formatarPagamento(inv.entrada)})`)
    .join('; ');
  return `${projeto.nome} — ${investimentos}`;
}

function formatarValorCampo(campo: string, valor: AlteracaoCampo['novo'], moeda: Moeda): string {
  if (valor === null || valor === '') return '—';
  if (typeof valor === 'object') {
    return 'investimentos' in valor ? formatarProjeto(valor, moeda) : formatarInvestimento(valor, moeda);
  }
  switch (campo) {
    case 'data_proposta':
      return formatarDataISO(String(valor));
    case 'setor':
      return rotuloSetor(String(valor));
    case 'garantia_meses':
      return formatarGarantia(Number(valor));
    case 'validade_dias':
      return Number(valor) === 1 ? '1 dia' : `${valor} dias`;
    case 'cnpj':
      return formatarCNPJ(String(valor));
    case 'valor':
    case 'valor_imposto':
    case 'total':
      return formatarMoeda(String(valor));
    case 'imposto_ativo':
      return valor ? 'Sim' : 'Não';
    case 'aliquota':
      return formatarAliquota(String(valor)) || '—';
    case 'validade':
      return formatarData(String(valor));
    case 'projeto_escopo':
      return escopoParaTexto(String(valor)) || '—';
    default:
      return String(valor);
  }
}

const STATUS_EDITAVEIS = ['aguardando', 'visualizada', 'expirada'];

const cartao = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6';

function SecoesModelo({ p }: { p: Proposta }) {
  const moeda = p.moeda ?? 'BRL';
  const projetos = projetosDaProposta(p);
  const dias = p.validade_dias ?? null;
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className={cartao}>
          <h2 className="font-semibold text-gray-900 mb-4">Cliente</h2>
          <dl className="space-y-4">
            <Campo label="Empresa">{p.cliente_nome}</Campo>
            <Campo label="Data">{formatarDataISO(p.data_proposta)}</Campo>
            <Campo label="Setor">{rotuloSetor(p.setor)}</Campo>
          </dl>
        </section>
        <section className={cartao}>
          <h2 className="font-semibold text-gray-900 mb-4">Consultor</h2>
          <dl className="space-y-4">
            <Campo label="Nome">{p.consultor_nome}</Campo>
            <Campo label="Cargo">{p.consultor_cargo}</Campo>
            <Campo label="Telefone">{p.consultor_telefone}</Campo>
            <Campo label="E-mail">{p.consultor_email}</Campo>
          </dl>
        </section>
        <section className={cartao}>
          <h2 className="font-semibold text-gray-900 mb-4">Condições</h2>
          <dl className="space-y-4">
            <Campo label="Shortlist">{p.shortlist || '—'}</Campo>
            <Campo label="SLA">{p.sla || '—'}</Campo>
            <Campo label="Garantia">{garantiaDaProposta(p) ?? '—'}</Campo>
            <Campo label="Validade">
              {formatarData(p.validade)}
              {dias !== null && ` (${dias === 1 ? '1 dia' : `${dias} dias`})`}
            </Campo>
          </dl>
        </section>
      </div>
      <section className={cartao}>
        <h2 className="font-semibold text-gray-900 mb-4">{registroDoModelo(p.modelo).rotuloEscopo}</h2>
        {p.projeto_escopo ? (
          <div className="text-gray-900 break-words space-y-2 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-6 [&_ul]:pl-6 [&_ol]:space-y-2 [&_ul]:space-y-1 [&_ul]:mt-1 [&_strong]:font-semibold">
            <EscopoRico html={p.projeto_escopo} />
          </div>
        ) : (
          <p className="text-gray-500">Não informado</p>
        )}
      </section>
      <section className={cartao}>
        <h2 className="font-semibold text-gray-900 mb-4">Investimento</h2>
        <div className="space-y-6">
          {projetos.map((projeto, i) => (
            <div key={i}>
              <h3 className="font-medium text-gray-900 mb-3">{projeto.nome}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projeto.investimentos.map((inv) => (
                  <div key={inv.tipo} className="rounded-lg border border-gray-200 border-t-4 border-t-ocean-700 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{rotuloTipo(inv.tipo)}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{formatarTaxa(inv, { moeda })}</p>
                    <p className="mt-1 text-sm text-gray-600">{formatarPagamento(inv.entrada)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
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
  const porModelo = !!proposta && proposta.modelo !== 'simples';

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
              <p className="text-sm text-gray-600">
                {proposta.modelo_nome}
                {porModelo && proposta.moeda && ` · ${rotuloIdiomaMoeda(proposta)}`}
                {porModelo &&
                  proposta.projeto_nome &&
                  ` · ${resumoProjetos(proposta.projeto_nome, proposta.projetos_total)}`}
              </p>
              <div className="mt-1">
                <StatusBadge status={proposta.status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_EDITAVEIS.includes(proposta.status) && (
                <Link to={`/propostas/${proposta.id}/editar`} className={botao}>
                  Editar
                </Link>
              )}
              <button onClick={copiarLink} className={botao}>
                Copiar link
              </button>
              <a href={montarLinkPublico(proposta.codigo)} target="_blank" rel="noopener noreferrer" className={botao}>
                Abrir página do cliente
              </a>
              {porModelo && (
                <Link to={`/nova?copiar=${proposta.id}`} className={botao}>
                  Criar cópia
                </Link>
              )}
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

          {porModelo && <SecoesModelo p={proposta} />}

          <section className={cartao}>
            {porModelo && <h2 className="font-semibold text-gray-900 mb-4">Acompanhamento</h2>}
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {!porModelo && (
                <>
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
                </>
              )}
              <Campo label="Emissão">{formatarDataHora(proposta.emitida_em)}</Campo>
              {!porModelo && <Campo label="Validade">{formatarData(proposta.validade)}</Campo>}
              <Campo label="1ª visualização do link">{formatarDataHora(proposta.visualizada_em)}</Campo>
              {proposta.versao > 1 && (
                <Campo label="Visualização da versão atual">
                  {proposta.versao_visualizada_em
                    ? formatarDataHora(proposta.versao_visualizada_em)
                    : 'Ainda não visualizada'}
                </Campo>
              )}
              {proposta.atualizada_em && (
                <Campo label="Última edição">
                  {formatarDataHora(proposta.atualizada_em)}
                  {proposta.edicoes[0] && ` · ${proposta.edicoes[0].editado_por_usuario}`}
                </Campo>
              )}
              {proposta.cancelada_em && <Campo label="Cancelada em">{formatarDataHora(proposta.cancelada_em)}</Campo>}
              {proposta.criado_por_usuario && <Campo label="Criado por">{proposta.criado_por_usuario}</Campo>}
            </dl>
          </section>

          {proposta.edicoes.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Histórico de edições</h2>
              <ol className="space-y-4">
                {proposta.edicoes.map((edicao) => (
                  <li key={edicao.versao} className="border-l-2 border-ocean-600 pl-4">
                    <p className="text-sm text-gray-500">
                      {formatarDataHora(edicao.editada_em)} · {edicao.editado_por_usuario}
                    </p>
                    <ul className="mt-1 space-y-0.5 text-sm text-gray-800">
                      {edicao.alteracoes.map((a) =>
                        a.campo === 'projeto_escopo' ? (
                          <li key={a.campo}>
                            <span className="font-medium">{rotuloCampo(a.campo, proposta)}:</span>
                            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-gray-500 line-through">
                                {formatarValorCampo(a.campo, a.anterior, proposta.moeda ?? 'BRL')}
                              </p>
                              <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-2">
                                {formatarValorCampo(a.campo, a.novo, proposta.moeda ?? 'BRL')}
                              </p>
                            </div>
                          </li>
                        ) : (
                          <li key={a.campo}>
                            <span className="font-medium">{rotuloCampo(a.campo, proposta)}:</span>{' '}
                            <span className="text-gray-500 line-through">
                              {formatarValorCampo(a.campo, a.anterior, proposta.moeda ?? 'BRL')}
                            </span>
                            {' → '}
                            <span>{formatarValorCampo(a.campo, a.novo, proposta.moeda ?? 'BRL')}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>
          )}

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
