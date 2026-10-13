import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { entrarSso, mensagemErro } from '../services/proposalApi';
import { useProposalAuthStore } from '../store';

const MSG_FALHA = 'Não foi possível entrar automaticamente. Entre com seu usuário e senha.';

export default function Entrar() {
  const navigate = useNavigate();
  const salvarSessao = useProposalAuthStore((s) => s.login);
  const sair = useProposalAuthStore((s) => s.logout);
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    const codigo = new URLSearchParams(window.location.hash.slice(1)).get('c') ?? '';
    window.history.replaceState(null, '', window.location.pathname);
    if (!codigo) {
      navigate('/login', { replace: true, state: { mensagem: MSG_FALHA } });
      return;
    }
    entrarSso(codigo)
      .then((r) => {
        salvarSessao(r.access_token, r.usuario, r.papel);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        sair();
        const semAcesso = error?.response?.status === 403;
        navigate('/login', {
          replace: true,
          state: { mensagem: semAcesso ? mensagemErro(error, MSG_FALHA) : MSG_FALHA },
        });
      });
  }, [navigate, salvarSessao, sair]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-700 to-ocean-900 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
        <p className="text-sm">Entrando…</p>
      </div>
    </div>
  );
}
