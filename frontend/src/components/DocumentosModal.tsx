import { useState, useEffect, useRef } from 'react';
import { documentosService } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

interface Props {
  colaboradorId: number;
  colaboradorNome: string;
  onFechar: () => void;
}

const fmtTamanho = (bytes: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function DocumentosModal({ colaboradorId, colaboradorNome, onFechar }: Props) {
  const papel = useAuthStore((s) => s.papel);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await documentosService.listar(colaboradorId);
      setDocs(res.data);
    } catch {
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const enviar = async (arquivo: File) => {
    try {
      setEnviando(true);
      await documentosService.upload(colaboradorId, arquivo);
      toast.success('Documento enviado!');
      carregar();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erro ao enviar');
    } finally {
      setEnviando(false);
    }
  };

  const baixar = async (doc: any) => {
    try {
      await documentosService.download(doc.id, doc.nome_original);
    } catch {
      toast.error('Erro ao baixar');
    }
  };

  const deletar = async (doc: any) => {
    if (!confirm(`Remover "${doc.nome_original}"?`)) return;
    try {
      await documentosService.deletar(doc.id);
      toast.success('Removido');
      carregar();
    } catch {
      toast.error('Erro ao remover');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Documentos</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{colaboradorNome}</p>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">×</button>
        </div>

        <div className="p-6 space-y-4">
          {papel === 'admin' && (
            <div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) enviar(f); e.target.value = ''; }}
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={enviando}
                className="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
              >
                {enviando ? 'Enviando...' : '📎 Enviar documento (contrato, RG, etc.)'}
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Carregando...</p>
          ) : docs.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-4">Nenhum documento anexado</p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.nome_original}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{fmtTamanho(doc.tamanho)} · {doc.criado_em ? new Date(doc.criado_em).toLocaleDateString('pt-BR') : ''}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => baixar(doc)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200">Baixar</button>
                    {papel === 'admin' && (
                      <button onClick={() => deletar(doc)} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200">Remover</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-gray-700 flex justify-end">
          <button onClick={onFechar} className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
