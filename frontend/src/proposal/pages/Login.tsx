import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/proposalApi';
import { useProposalAuthStore } from '../store';

const MSG_CREDENCIAIS = 'Usuário ou senha incorretos';
const MSG_REDE = 'Não foi possível conectar. Tente novamente.';
const MSG_GENERICA = 'Não foi possível entrar. Tente novamente.';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [precisa2fa, setPrecisa2fa] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const salvarSessao = useProposalAuthStore((s) => s.login);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await login(username, password, precisa2fa ? totpCode : undefined);
      salvarSessao(r.access_token, r.usuario, r.papel);
      navigate('/', { replace: true });
    } catch (error: any) {
      if (!error.response) {
        toast.error(MSG_REDE);
        return;
      }
      const detail = error.response?.data?.detail;
      if (detail === '2FA_REQUIRED') {
        setPrecisa2fa(true);
        toast('Digite o código do seu app autenticador', { icon: '🔐' });
      } else if (detail === 'Código 2FA inválido') {
        toast.error('Código 2FA inválido');
      } else if (error.response?.status === 401) {
        toast.error(MSG_CREDENCIAIS);
      } else {
        toast.error(typeof detail === 'string' && detail ? detail : MSG_GENERICA);
      }
    } finally {
      setLoading(false);
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

        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              placeholder="Seu usuário"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
          </div>

          {precisa2fa && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Código de verificação (2FA)</label>
              <input
                type="text"
                inputMode="numeric"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`${inputCls} tracking-widest font-mono`}
                placeholder="000000"
                autoFocus
                required
              />
              <p className="text-sm text-gray-600 mt-1">Código de 6 dígitos do app autenticador</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ocean-700 text-white font-semibold py-2 rounded-lg hover:bg-ocean-800 disabled:bg-gray-400 transition"
          >
            {loading ? 'Entrando...' : precisa2fa ? 'Verificar e entrar' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
