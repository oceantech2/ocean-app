import { ReactNode, Suspense, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { componenteDoModelo } from '../modelos';
import { assinarPublica, consultarPublica, mensagemErro, PropostaPublicaData } from '../services/proposalApi';
import { formatarAliquota, formatarData, formatarDataHora, formatarMoeda } from '../utils/propostaCalculo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Moldura({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-white">
      <div className="bg-ocean-900">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <img src="/logo.png" alt="Ocean" className="h-9 w-auto bg-white rounded-md p-1" />
          <span className="text-white font-semibold">Proposta comercial</span>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">{children}</div>
    </div>
  );
}

function Mensagem({ texto }: { texto: string }) {
  return (
    <Moldura>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-700">{texto}</div>
    </Moldura>
  );
}

function Linha({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-2 ${destaque ? 'text-lg font-semibold text-ocean-900' : 'text-gray-700'}`}>
      <span>{label}</span>
      <span className="text-right">{valor}</span>
    </div>
  );
}

export default function PropostaPublica() {
  const { codigo = '' } = useParams();
  const [dados, setDados] = useState<PropostaPublicaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erroRede, setErroRede] = useState(false);
  const [abrirForm, setAbrirForm] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<{ nome?: string; email?: string; aceite?: string }>({});
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    setErroRede(false);
    try {
      setDados(await consultarPublica(codigo));
      setNaoEncontrada(false);
    } catch (e: any) {
      if (e?.response?.status === 404) setNaoEncontrada(true);
      else setErroRede(true);
    } finally {
      setLoading(false);
    }
  }, [codigo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const recarregarSilencioso = useCallback(() => {
    carregar(true);
  }, [carregar]);

  const assinar = async (e: React.FormEvent) => {
    e.preventDefault();
    const encontrados: typeof erros = {};
    if (nome.trim().length < 3) encontrados.nome = 'Informe o nome completo';
    if (!EMAIL_RE.test(email.trim())) encontrados.email = 'E-mail inválido';
    if (!aceite) encontrados.aceite = 'É necessário aceitar os termos da proposta';
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      setDados(await assinarPublica(codigo, { nome: nome.trim(), email: email.trim(), aceite, versao: dados?.versao }));
      setAbrirForm(false);
      toast.success('Proposta assinada');
    } catch (err: any) {
      toast.error(mensagemErro(err, 'Não foi possível assinar. Tente novamente.'));
      if (err?.response?.status === 409 || err?.response?.status === 404) {
        setAbrirForm(false);
        carregar();
      }
    } finally {
      setEnviando(false);
    }
  };

  const carregando = (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ocean-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-700" />
      <p className="text-ocean-900">Carregando proposta…</p>
    </div>
  );

  if (loading) return carregando;

  if (naoEncontrada) return <Mensagem texto="Proposta não encontrada" />;

  if (erroRede || !dados) {
    return (
      <Moldura>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-4">
          <p className="text-gray-700">Não foi possível carregar a proposta.</p>
          <button onClick={() => carregar()} className="px-4 py-2 rounded-lg bg-ocean-700 text-white hover:bg-ocean-800 transition">
            Tentar novamente
          </button>
        </div>
      </Moldura>
    );
  }

  if (dados.status === 'cancelada' || dados.status === 'expirada') {
    return <Mensagem texto={dados.mensagem || 'Esta proposta não está mais disponível.'} />;
  }

  if (dados.modelo && dados.modelo !== 'simples') {
    const Pagina = componenteDoModelo(dados.modelo, dados.modelo_versao);
    if (!Pagina) return <Mensagem texto="Não foi possível exibir esta proposta" />;
    return (
      <Suspense fallback={carregando}>
        <Pagina dados={dados} codigo={codigo} onRecarregar={recarregarSilencioso} />
      </Suspense>
    );
  }

  const inputCls = (erro?: string) =>
    `w-full px-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-600 ${
      erro ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <Moldura>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-8 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Cliente</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 break-words">{dados.cliente_nome}</h1>
          <p className="text-gray-600 mt-1">CNPJ {dados.cnpj}</p>
        </div>

        <div className="divide-y divide-gray-100 border-y border-gray-100">
          <Linha label="Valor" valor={formatarMoeda(dados.valor)} />
          {dados.imposto_ativo && (
            <Linha label={`Imposto (${formatarAliquota(dados.aliquota)})`} valor={formatarMoeda(dados.valor_imposto)} />
          )}
          <Linha label="Total" valor={formatarMoeda(dados.total)} destaque />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Emissão</p>
            <p className="text-gray-900">{formatarData(dados.emitida_em)}</p>
            {dados.atualizada_em && (
              <p className="text-gray-500 mt-1">Atualizada em {formatarData(dados.atualizada_em)}</p>
            )}
          </div>
          <div>
            <p className="text-gray-500">Válida até</p>
            <p className="text-gray-900">{formatarData(dados.validade)}</p>
          </div>
        </div>

        {dados.status === 'assinada' && dados.assinatura && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
            Assinada em {formatarDataHora(dados.assinatura.assinada_em)} por <strong>{dados.assinatura.nome}</strong>
          </div>
        )}

        {dados.pode_assinar && !abrirForm && (
          <button
            onClick={() => setAbrirForm(true)}
            className="w-full py-3 rounded-lg bg-ocean-700 text-white text-lg font-semibold hover:bg-ocean-800 transition"
          >
            Assinar
          </button>
        )}

        {dados.pode_assinar && abrirForm && (
          <form onSubmit={assinar} noValidate className="space-y-4 border-t border-gray-100 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErros((prev) => ({ ...prev, nome: undefined }));
                }}
                className={inputCls(erros.nome)}
                autoComplete="name"
                maxLength={255}
                autoFocus
              />
              {erros.nome && <p className="text-sm text-red-600 mt-1">{erros.nome}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErros((prev) => ({ ...prev, email: undefined }));
                }}
                className={inputCls(erros.email)}
                autoComplete="email"
                inputMode="email"
                maxLength={255}
              />
              {erros.email && <p className="text-sm text-red-600 mt-1">{erros.email}</p>}
            </div>
            <label className="flex items-start gap-3 text-gray-700">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => {
                  setAceite(e.target.checked);
                  setErros((prev) => ({ ...prev, aceite: undefined }));
                }}
                className="mt-1 h-5 w-5 accent-ocean-700"
              />
              <span>Li e aceito os termos desta proposta</span>
            </label>
            {erros.aceite && <p className="text-sm text-red-600 -mt-2">{erros.aceite}</p>}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setAbrirForm(false)}
                className="sm:flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="sm:flex-1 py-3 rounded-lg bg-ocean-700 text-white font-semibold hover:bg-ocean-800 disabled:bg-gray-400 transition"
              >
                {enviando ? 'Assinando...' : 'Confirmar assinatura'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Moldura>
  );
}
