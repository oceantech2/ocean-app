/**
 * Botão DEV — zera o banco do backend com a mesma lógica de scripts/zerar_dados.py
 * (POST /api/dev/zerar-dados → zerar_dados_ops).
 *
 * Arquivo local gitignored: DevWipeButton.tsx
 * Fallback versionado: este example (carregado pelo DevToolsSlot).
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const FRASE = 'ZERAR DADOS OCEAN';

type WipeResult = {
  ok?: boolean;
  database?: string;
  depois?: Record<string, number>;
  pendencias?: Record<string, number>;
  maggo_stub_empty?: boolean;
  avisos_arquivos?: string[];
};

export default function DevWipeButton() {
  const [loading, setLoading] = useState(false);

  if (!import.meta.env.DEV) return null;

  const handleClick = async () => {
    let database = '(consultando…)';
    try {
      const { data: st } = await api.get('/dev/status');
      database = st?.database || database;
      if (!st?.disponivel) {
        toast.error('Wipe DEV indisponível (backend precisa DEBUG=True)');
        return;
      }
    } catch {
      toast.error('Não foi possível falar com /api/dev/status — backend no ar?');
      return;
    }

    const ok = window.confirm(
      `DEV — mesma limpeza do script zerar_dados.py\n\n` +
        `Banco: ${database}\n\n` +
        `PRESERVA:\n` +
        `• login (usuarios_app / usuarios_auth)\n` +
        `• fornecedores puros (+ docs/histórico)\n\n` +
        `ZERA:\n` +
        `• Contas a receber (nfs) + bloqueio do stub Maggo\n` +
        `• contas a pagar, bônus, férias, DH, fluxo, saldos\n` +
        `• impostos, metas, patrimônio, auditoria\n` +
        `• categorias, contas correntes, config, equipe\n\n` +
        `Irreversível. Continuar?`
    );
    if (!ok) return;

    const digitado = window.prompt(`Digite exatamente para confirmar:\n${FRASE}`);
    if (digitado !== FRASE) {
      toast.error('Confirmação inválida — nada foi alterado');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<WipeResult>('/dev/zerar-dados', { confirm: FRASE });
      const d = data?.depois || {};
      const nfs = d.nfs_contas_receber ?? d.nfs ?? '?';
      const msg =
        `Zerado em ${data?.database ?? database}. ` +
        `Login: ${d.usuarios_app ?? '?'} | Fornecedores: ${d.fornecedores_puros ?? '?'} | ` +
        `Contas a receber: ${nfs} | Maggo bloqueado: ${data?.maggo_stub_empty ? 'sim' : 'não'}`;

      if (data?.ok === false || (data?.pendencias && Object.keys(data.pendencias).length > 0)) {
        toast.error(`Limpeza incompleta: ${JSON.stringify(data.pendencias)}`);
      } else {
        toast.success(msg, { duration: 6000 });
      }
      if (data?.avisos_arquivos?.length) {
        toast(`Avisos de arquivo: ${data.avisos_arquivos.length}`, { icon: '⚠️' });
      }
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
      title="DEV: executa zerar_dados_ops no DATABASE_URL do backend"
      className="px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/50 rounded-lg transition disabled:opacity-50"
    >
      {loading ? 'Zerando…' : 'DEV zerar DB'}
    </button>
  );
}
