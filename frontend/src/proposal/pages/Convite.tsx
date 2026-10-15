import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { aceitarConvite, consultarConvite, mensagemErro } from '../services/proposalApi';
import { useProposalAuthStore } from '../store';
import CampoSenha from '../../components/CampoSenha';

const SENHA_MINIMA = 8;
const MSG_INVALIDO = 'Este convite não é mais válido. Peça um novo ao administrador.';

export default function Convite() {
  const navigate = useNavigate();
  const salvarSessao = useProposalAuthStore((s) => s.login);
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('t') ?? '');
  const [usuario, setUsuario] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [invalido, setInvalido] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    if (!token) {
      setInvalido(true);
      setCarregando(false);
      return;
    }
    consultarConvite(token)
      .then((r) => setUsuario(r.usuario))
      .catch((error) => {
        if (error?.response?.status === 404) setInvalido(true);
        else toast.error(mensagemErro(error, 'Não foi possível abrir o convite. Tente novamente.'));
      })
      .finally(() => setCarregando(false));
  }, [token]);

  const criarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < SENHA_MINIMA) {
      toast.error(`A senha deve ter pelo menos ${SENHA_MINIMA} caracteres`);
      return;
    }
    if (senha !== confirmacao) {
      toast.error('As senhas não conferem');
      return;
    }
    setSalvando(true);
    try {
      const r = await aceitarConvite(token, senha);
      window.history.replaceState(null, '', window.location.pathname);
      salvarSessao(r.access_token, r.usuario, r.papel);
      toast.success('Senha criada. Bem-vindo ao Proposal!');
      navigate('/', { replace: true });
    } catch (error: any) {
      if (error?.response?.status === 404) setInvalido(true);
      else toast.error(mensagemErro(error, 'Não foi possível criar a senha. Tente novamente.'));
    } finally {
      setSalvando(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-700 to-ocean-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Ocean" className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-2xl font-semibold text-ocean-900">Proposal</h1>
        </div>

        {carregando ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-700" />
          </div>
        ) : invalido ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">{MSG_INVALIDO}</p>
            <Link to="/login" className="inline-block text-ocean-700 font-medium hover:underline">
              Ir para o login
            </Link>
          </div>
        ) : usuario ? (
          <form onSubmit={criarSenha} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Criar senha</h2>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Usuário</label>
              <input type="text" value={usuario} readOnly className={`${inputCls} bg-gray-100 text-gray-600`} autoComplete="username" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Senha</label>
              <CampoSenha
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
                minLength={SENHA_MINIMA}
                autoFocus
                required
              />
              <p className="text-sm text-gray-600 mt-1">Mínimo de {SENHA_MINIMA} caracteres</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Confirmar senha</label>
              <CampoSenha
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-ocean-700 text-white font-semibold py-2 rounded-lg hover:bg-ocean-800 disabled:bg-gray-400 transition"
            >
              {salvando ? 'Salvando...' : 'Criar senha e entrar'}
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-700">Não foi possível abrir o convite. Recarregue a página.</p>
        )}
      </div>
    </div>
  );
}
