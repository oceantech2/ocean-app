import { useState, useEffect } from 'react';
import { twofaService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Seguranca() {
  const papel = useAuthStore((s) => s.papel);
  const [ativo, setAtivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState('');
  const [uri, setUri] = useState('');
  const [codigo, setCodigo] = useState('');
  const [processando, setProcessando] = useState(false);

  useEffect(() => { carregarStatus(); }, []);

  const carregarStatus = async () => {
    try {
      const res = await twofaService.status();
      setAtivo(res.data.twofa_ativo);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  const iniciarSetup = async () => {
    try {
      setProcessando(true);
      const res = await twofaService.setup();
      setSecret(res.data.secret);
      setUri(res.data.otpauth_uri);
    } catch {
      toast.error('Erro ao iniciar configuração');
    } finally {
      setProcessando(false);
    }
  };

  const ativar = async () => {
    if (!codigo.trim()) { toast.error('Digite o código do app'); return; }
    try {
      setProcessando(true);
      await twofaService.ativar(codigo.trim());
      toast.success('2FA ativado com sucesso!');
      setAtivo(true);
      setSecret(''); setUri(''); setCodigo('');
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Código inválido'));
    } finally {
      setProcessando(false);
    }
  };

  const desativar = async () => {
    if (!confirm('Desativar a autenticação em duas etapas?')) return;
    try {
      setProcessando(true);
      await twofaService.desativar();
      toast.success('2FA desativado');
      setAtivo(false);
    } catch {
      toast.error('Erro ao desativar');
    } finally {
      setProcessando(false);
    }
  };

  if (papel !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
        Acesso restrito a administradores.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Segurança</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Autenticação em duas etapas (2FA) com app autenticador</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        ) : ativo ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="font-medium text-green-700 dark:text-green-400">2FA está ativo</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A cada login será solicitado o código de 6 dígitos do seu app autenticador
              (Google Authenticator, Authy, Microsoft Authenticator, etc).
            </p>
            <button onClick={desativar} disabled={processando} className="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 disabled:opacity-50">
              Desativar 2FA
            </button>
          </div>
        ) : !secret ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              <span className="font-medium text-gray-600 dark:text-gray-400">2FA está desativado</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ative a verificação em duas etapas para proteger o acesso aos dados financeiros.
            </p>
            <button onClick={iniciarSetup} disabled={processando} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {processando ? 'Gerando...' : 'Configurar 2FA'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">Passo 1 — Adicione a chave no seu app autenticador</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Abra o app autenticador, escolha "inserir chave manualmente" e use:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 font-mono text-sm text-gray-800 dark:text-gray-100 break-all select-all">
              {secret}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 break-all">
              URI: {uri}
            </p>

            <h2 className="font-semibold text-gray-700 dark:text-gray-200 pt-2">Passo 2 — Confirme o código gerado</h2>
            <div className="flex items-end gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Código de 6 dígitos</label>
                <input
                  className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-40 tracking-widest font-mono"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                />
              </div>
              <button onClick={ativar} disabled={processando} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Ativar
              </button>
              <button onClick={() => { setSecret(''); setUri(''); setCodigo(''); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
