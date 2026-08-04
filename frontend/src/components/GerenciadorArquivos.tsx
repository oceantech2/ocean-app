import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';

interface Arquivo {
  nome: string;
  tamanho: number;
  modificado: number;
}

interface Servico {
  listar: () => Promise<{ data: { arquivos: Arquivo[] } }>;
  upload: (file: File) => Promise<any>;
  downloadUrl: (nome: string) => string;
  deletar: (nome: string) => Promise<any>;
}

interface Props {
  titulo: string;
  servico: Servico;
  aberto: boolean;
  onFechar: () => void;
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatarData(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function iconeArquivo(nome: string): string {
  const ext = nome.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return '📄';
  if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
  if (['xlsx', 'xls'].includes(ext)) return '📊';
  if (['docx', 'doc'].includes(ext)) return '📝';
  if (ext === 'xml') return '🗂️';
  if (ext === 'zip') return '🗜️';
  return '📁';
}

export default function GerenciadorArquivos({ titulo, servico, aberto, onFechar }: Props) {
  const papel = useAuthStore((s) => s.papel);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [busca, setBusca] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) carregar();
  }, [aberto]);

  const carregar = async () => {
    try {
      setCarregando(true);
      const res = await servico.listar();
      setArquivos(res.data.arquivos || []);
    } catch {
      toast.error('Erro ao listar arquivos');
    } finally {
      setCarregando(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setEnviando(true);
      await servico.upload(file);
      toast.success(`${file.name} enviado com sucesso`);
      await carregar();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erro ao enviar arquivo');
    } finally {
      setEnviando(false);
      e.target.value = '';
    }
  };

  const handleDeletar = async (nome: string) => {
    if (!window.confirm(`Remover "${nome}"?`)) return;
    try {
      await servico.deletar(nome);
      toast.success('Arquivo removido');
      setArquivos((prev) => prev.filter((a) => a.nome !== nome));
    } catch {
      toast.error('Erro ao remover arquivo');
    }
  };

  const filtrados = arquivos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{titulo}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {arquivos.length} arquivo(s) na pasta
            </p>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <input
            type="text"
            placeholder="Buscar arquivo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-1.5 text-sm"
          />
          {papel === 'admin' && (
            <>
              <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={enviando}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
              >
                {enviando ? 'Enviando...' : '↑ Enviar arquivo'}
              </button>
            </>
          )}
          <button
            onClick={carregar}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            title="Atualizar"
          >
            ↺
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {carregando ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              {busca ? 'Nenhum arquivo encontrado' : 'Pasta vazia — envie o primeiro arquivo'}
            </div>
          ) : (
            <div className="space-y-1">
              {filtrados.map((arq) => (
                <div
                  key={arq.nome}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                >
                  <span className="text-2xl shrink-0">{iconeArquivo(arq.nome)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{arq.nome}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatarTamanho(arq.tamanho)} · {formatarData(arq.modificado)}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <a
                      href={servico.downloadUrl(arq.nome)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      ↓ Abrir
                    </a>
                    {papel === 'admin' && (
                      <button
                        onClick={() => handleDeletar(arq.nome)}
                        className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 shrink-0 text-xs text-gray-400 dark:text-gray-500">
          Arquivos salvos em <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{titulo}/</code> na pasta do projeto
        </div>
      </div>
    </div>
  );
}
