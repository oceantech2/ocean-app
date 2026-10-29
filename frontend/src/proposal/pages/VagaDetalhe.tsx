import { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import {
  baixarCurriculo,
  Candidatura,
  excluirVaga,
  listarCandidaturas,
  mensagemErro,
  mudarStatusVaga,
  obterVaga,
  reenviarPlanilha,
  Vaga,
} from '../services/proposalApi';
import { formatarDataHora } from '../utils/propostaCalculo';
import {
  AREAS_VAGA,
  DISPONIBILIDADE,
  formatarReais,
  INGLES,
  itensDaLista,
  linkVagaNoSite,
  MOBILIDADE,
  NIVEIS_VAGA,
} from '../utils/vagas';
import { StatusVagaBadge } from './Vagas';

const cartao = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6';
const botao = 'px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition';

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-900 break-words">{children}</dd>
    </div>
  );
}

function Lista({ titulo, texto }: { titulo: string; texto: string | null }) {
  const itens = itensDaLista(texto);
  if (!itens.length) return null;
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">{titulo}</h3>
      <ul className="list-disc pl-6 space-y-1 text-gray-800">
        {itens.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** `janela` deve ser aberta no clique, antes do download, para o navegador não bloquear o pop-up. */
export async function abrirCurriculo(c: Pick<Candidatura, 'id' | 'curriculo_nome'>, janela: Window | null) {
  try {
    const blob = await baixarCurriculo(c.id);
    const url = URL.createObjectURL(blob);
    // PDF abre no navegador; Word só pode ser baixado
    if (blob.type === 'application/pdf') {
      if (janela) janela.location.href = url;
      else window.location.replace(url);
    } else {
      janela?.close();
      const a = document.createElement('a');
      a.href = url;
      a.download = c.curriculo_nome || `curriculo_${c.id}`;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    janela?.close();
    throw e;
  }
}

function Candidaturas({ vaga, onAtualizar }: { vaga: Vaga; onAtualizar: () => void }) {
  const [itens, setItens] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [reenviando, setReenviando] = useState(false);
  const [abrindo, setAbrindo] = useState<number | null>(null);
  const [aberta, setAberta] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    listarCandidaturas(vaga.id)
      .then((r) => ativo && setItens(r))
      .catch((e) => ativo && toast.error(mensagemErro(e, 'Não foi possível carregar as candidaturas')))
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [vaga.id, recarga]);

  const pendentes = itens.filter((c) => c.planilha_status === 'pendente').length;

  const reenviar = async () => {
    setReenviando(true);
    try {
      const r = await reenviarPlanilha(vaga.id);
      if (r.pendentes === 0) toast.success(`${r.enviadas} candidatura(s) enviada(s) à planilha`);
      else toast.error(`${r.enviadas} enviada(s); ${r.pendentes} continua(m) pendente(s)`);
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível reenviar à planilha'));
    } finally {
      setReenviando(false);
      setRecarga((n) => n + 1);
      onAtualizar();
    }
  };

  const curriculo = async (c: Candidatura) => {
    const janela = /\.pdf$/i.test(c.curriculo_nome ?? '') ? window.open('', '_blank') : null;
    setAbrindo(c.id);
    try {
      await abrirCurriculo(c, janela);
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível abrir o currículo'));
    } finally {
      setAbrindo(null);
    }
  };

  return (
    <section className={cartao}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="font-semibold text-gray-900">Candidaturas ({itens.length})</h2>
        {pendentes > 0 && (
          <button onClick={reenviar} disabled={reenviando} className={botao}>
            {reenviando ? 'Reenviando...' : `Reenviar à planilha (${pendentes})`}
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-700" />
        </div>
      ) : itens.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma candidatura recebida ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2 font-medium">Candidato</th>
                <th className="px-3 py-2 font-medium">Atual</th>
                <th className="px-3 py-2 font-medium">Pretensão</th>
                <th className="px-3 py-2 font-medium">Planilha</th>
                <th className="px-3 py-2 font-medium text-right">Currículo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {itens.map((c) => (
                <Fragment key={c.id}>
                  <tr className="hover:bg-gray-50 align-top">
                    <td className="px-3 py-2 break-words">
                      <button
                        type="button"
                        onClick={() => setAberta(aberta === c.id ? null : c.id)}
                        className="font-medium text-gray-900 hover:underline text-left"
                      >
                        {c.nome}
                      </button>
                      <div className="text-xs text-gray-500">
                        {c.email} · {c.telefone}
                      </div>
                      <div className="text-xs text-gray-500">
                        {c.localidade} · {formatarDataHora(c.criada_em)}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 break-words">
                      {c.cargo_atual}
                      <div className="text-xs text-gray-500">{c.empresa_atual}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {formatarReais(c.pretensao_min)}
                      <div className="text-xs text-gray-500">até {formatarReais(c.pretensao_max)}</div>
                    </td>
                    <td className="px-3 py-2">
                      {c.planilha_status === 'enviada' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Enviada
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pendente
                          </span>
                          {c.planilha_erro && <div className="text-xs text-gray-500 mt-1 max-w-[220px]">{c.planilha_erro}</div>}
                        </>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => curriculo(c)}
                        disabled={abrindo === c.id || !c.curriculo_nome}
                        className="text-ocean-700 hover:underline disabled:opacity-50"
                      >
                        {abrindo === c.id ? 'Abrindo...' : 'Currículo'}
                      </button>
                    </td>
                  </tr>
                  {aberta === c.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-3 py-3">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <Campo label="LinkedIn">
                            {c.linkedin ? (
                              <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-ocean-700 hover:underline">
                                {c.linkedin}
                              </a>
                            ) : (
                              '—'
                            )}
                          </Campo>
                          <Campo label="Formação">{c.formacao || '—'}</Campo>
                          <Campo label="Inglês">{c.ingles ? INGLES[c.ingles] ?? c.ingles : '—'}</Campo>
                          <Campo label="Outros idiomas">{c.outros_idiomas || '—'}</Campo>
                          <Campo label="Disponibilidade">
                            {c.disponibilidade ? DISPONIBILIDADE[c.disponibilidade] ?? c.disponibilidade : '—'}
                          </Campo>
                          <Campo label="Mobilidade">{c.mobilidade ? MOBILIDADE[c.mobilidade] ?? c.mobilidade : '—'}</Campo>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <Campo label="Experiência">
                              <span className="whitespace-pre-line">{c.experiencia || '—'}</span>
                            </Campo>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function VagaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(() => {
    if (!id) return;
    obterVaga(id)
      .then(setVaga)
      .catch((e) => {
        if (e?.response?.status === 404) setNaoEncontrada(true);
        else toast.error(mensagemErro(e, 'Não foi possível carregar a vaga'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    carregar();
  }, [carregar]);

  const mudarStatus = async (acao: 'encerrar' | 'reabrir') => {
    if (!vaga) return;
    if (acao === 'encerrar' && !window.confirm(`Encerrar a vaga "${vaga.titulo}"? Ela sai do site.`)) return;
    setOcupado(true);
    try {
      setVaga(await mudarStatusVaga(vaga.id, acao));
      toast.success(acao === 'encerrar' ? 'Vaga encerrada' : 'Vaga reaberta e publicada no site');
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível alterar a vaga'));
    } finally {
      setOcupado(false);
    }
  };

  const excluir = async () => {
    if (!vaga) return;
    if (!window.confirm(`Excluir a vaga "${vaga.titulo}"? Esta ação não pode ser desfeita.`)) return;
    setOcupado(true);
    try {
      await excluirVaga(vaga.id);
      toast.success('Vaga excluída');
      navigate('/vagas', { replace: true });
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível excluir a vaga'));
      setOcupado(false);
    }
  };

  const paragrafos = (vaga?.descricao ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <ProposalLayout>
      <Link to="/vagas" className="text-sm text-ocean-700 hover:underline">
        ← Voltar para as vagas
      </Link>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : naoEncontrada || !vaga ? (
        <div className="text-center py-16 text-gray-600">Vaga não encontrada</div>
      ) : (
        <div className="mt-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{vaga.titulo}</h1>
                <StatusVagaBadge status={vaga.status} />
              </div>
              <p className="text-sm text-gray-600">
                {AREAS_VAGA[vaga.area]} · {NIVEIS_VAGA[vaga.nivel]} · {vaga.localidade}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {vaga.status === 'aberta' && (
                <a href={linkVagaNoSite(vaga)} target="_blank" rel="noopener noreferrer" className={botao}>
                  Ver no site
                </a>
              )}
              {vaga.pode_editar && (
                <>
                  <Link to={`/vagas/${vaga.id}/editar`} className={botao}>
                    Editar
                  </Link>
                  <button onClick={() => mudarStatus(vaga.status === 'aberta' ? 'encerrar' : 'reabrir')} disabled={ocupado} className={botao}>
                    {vaga.status === 'aberta' ? 'Encerrar' : 'Reabrir'}
                  </button>
                  <button
                    onClick={excluir}
                    disabled={ocupado}
                    className="px-3 py-2 rounded-lg bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    Excluir
                  </button>
                </>
              )}
            </div>
          </div>

          <section className={cartao}>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Campo label="Cliente">{vaga.cliente || '—'}</Campo>
              <Campo label="Código na planilha">{vaga.codigo_planilha || '—'}</Campo>
              <Campo label="Criada por">
                {vaga.criado_por_usuario}
                {vaga.criado_em && ` em ${formatarDataHora(vaga.criado_em)}`}
              </Campo>
              {vaga.atualizado_por_usuario && (
                <Campo label="Última alteração">
                  {vaga.atualizado_por_usuario}
                  {vaga.atualizado_em && ` em ${formatarDataHora(vaga.atualizado_em)}`}
                </Campo>
              )}
            </dl>
          </section>

          <section className={`${cartao} space-y-5`}>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Resumo</h3>
              <p className="text-gray-800">{vaga.resumo}</p>
            </div>
            {paragrafos.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Descrição</h3>
                <div className="space-y-2 text-gray-800">
                  {paragrafos.map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <Lista titulo="Responsabilidades" texto={vaga.responsabilidades} />
            <Lista titulo="Pré-requisitos" texto={vaga.requisitos} />
            <Lista titulo="Diferenciais" texto={vaga.diferenciais} />
          </section>

          <Candidaturas vaga={vaga} onAtualizar={carregar} />
        </div>
      )}
    </ProposalLayout>
  );
}
