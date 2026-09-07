/**
 * Exemplo versionado do botão DEV de wipe.
 * Para ativar: copie este arquivo para `DevWipeButton.tsx` (gitignored).
 *
 * Só aparece com Vite DEV e chama POST /api/dev/zerar-dados (backend DEBUG=True).
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const FRASE = 'ZERAR DADOS OCEAN';

export default function DevWipeButton() {
  const [loading, setLoading] = useState(false);

  if (!import.meta.env.DEV) return null;

  const handleClick = async () => {
    const ok = window.confirm(
      'DEV: zerar TODOS os dados do banco apontado pelo backend?\n\n' +
        'Preserva apenas login e fornecedores.\n' +
        'Categorias, contas correntes, NFs, etc. serão apagados.\n\n' +
        'Esta ação é irreversível.'
    );
    if (!ok) return;

    const digitado = window.prompt(`Digite exatamente para confirmar:\n${FRASE}`);
    if (digitado !== FRASE) {
      toast.error('Confirmação inválida — nada foi alterado');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/dev/zerar-dados', { confirm: FRASE });
      toast.success(
        `Base zerada. Fornecedores: ${data?.depois?.fornecedores_puros ?? '?'} | ` +
          `Usuários: ${data?.depois?.usuarios_app ?? '?'}`
      );
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Falha ao zerar dados';
      toast.error(typeof detail === 'string' ? detail : 'Falha ao zerar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title="Somente DEV — zera o banco do backend atual"
      className="px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/50 rounded-lg transition disabled:opacity-50"
    >
      {loading ? 'Zerando…' : 'DEV zerar DB'}
    </button>
  );
}
