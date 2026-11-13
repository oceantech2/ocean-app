import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { mensagemErro, obterPedidoClaude, PedidoClaude, responderPedidoClaude } from '../services/proposalApi';

const PERMISSOES = [
  'Ver propostas, modelos de proposta, vagas e candidaturas',
  'Criar e editar propostas e vagas em seu nome',
  'Somente o que você já pode fazer no painel: editar só o que é seu (ou tudo, se for admin)',
];

// Tela de autorização do conector do Claude: o backend do OAuth redireciona para cá com o pedido assinado
export default function ConectarClaude() {
  const [params] = useSearchParams();
  const pedido = params.get('pedido') ?? '';
  const [dados, setDados] = useState<PedidoClaude | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!pedido) {
      setErro('Pedido de conexão expirado ou inválido. Conecte novamente pelo Claude.');
      return;
    }
    obterPedidoClaude(pedido)
      .then(setDados)
      .catch((e) => setErro(mensagemErro(e, 'Não foi possível carregar o pedido de conexão')));
  }, [pedido]);

  const responder = async (aprovar: boolean) => {
    setEnviando(true);
    try {
      window.location.assign(await responderPedidoClaude(pedido, aprovar));
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível concluir a conexão'));
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-700 to-ocean-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Ocean" className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-2xl font-semibold text-ocean-900">Conectar ao Claude</h1>
        </div>

        {erro ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">{erro}</p>
            <Link to="/" className="text-sm text-ocean-700 hover:underline">
              Ir para o painel
            </Link>
          </div>
        ) : !dados ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-gray-700">
              <strong>{dados.cliente_nome}</strong> quer acessar o Consultant Panel em nome de{' '}
              <strong>{dados.usuario}</strong>. Ele poderá:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {PERMISSOES.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600">
              Excluir, cancelar e encerrar continuam só no painel. Você pode desconectar a qualquer momento em Meu
              perfil.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => responder(false)}
                disabled={enviando}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => responder(true)}
                disabled={enviando}
                className="flex-1 py-2 rounded-lg bg-ocean-700 text-white font-semibold hover:bg-ocean-800 disabled:bg-gray-400 transition"
              >
                {enviando ? 'Conectando...' : 'Permitir'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
