import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { useAuthStore } from '../store';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [precisa2fa, setPrecisa2fa] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(username, password, precisa2fa ? totpCode : undefined);
      setAuth(
        response.usuario,
        response.access_token,
        response.papel,
        response.permissoes,
        response.paginas_visibilidade ?? null,
      );
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      if (detail === '2FA_REQUIRED') {
        setPrecisa2fa(true);
        toast('Digite o código do seu app autenticador', { icon: '🔐' });
      } else {
        toast.error(detail || 'Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Logo placeholder */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Ocean Talent Solutions" className="h-20 w-auto mx-auto mb-4" />
          <p className="text-gray-600 mt-2">Sistema de Gestão Financeira</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Seu usuário"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Sua senha"
              required
            />
            <p className="text-sm text-gray-600 mt-1">Usuário: <strong>admin</strong> / Senha: <strong>123456</strong></p>
          </div>

          {precisa2fa && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Código de verificação (2FA)</label>
              <input
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-widest font-mono"
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
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Entrando...' : precisa2fa ? 'Verificar e entrar' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Ambiente de desenvolvimento
        </p>
      </div>
    </div>
  );
}
