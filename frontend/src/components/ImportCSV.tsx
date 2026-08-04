import { useState, useRef } from 'react';
import { parseCSV, lerArquivoTexto } from '../utils/import';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';

interface ImportCSVProps {
  titulo: string;
  // Colunas esperadas no CSV (cabeçalho)
  colunas: string[];
  // Exemplo para o template
  exemplo?: Record<string, string>;
  // Transforma uma linha do CSV no payload da API; lance erro para validação
  mapear: (linha: Record<string, string>) => any;
  // Chama a API para criar um registro
  criar: (payload: any) => Promise<any>;
  // Callback após conclusão
  onConcluido: () => void;
  onFechar: () => void;
}

export default function ImportCSV({ titulo, colunas, exemplo, mapear, criar, onConcluido, onFechar }: ImportCSVProps) {
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: number; erros: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const baixarTemplate = () => {
    const linha = exemplo || colunas.reduce((acc, c) => ({ ...acc, [c]: '' }), {});
    exportarCSV([linha], `template_${titulo.toLowerCase().replace(/\s+/g, '_')}`);
  };

  const processar = async (arquivo: File) => {
    setProcessando(true);
    setResultado(null);
    try {
      const texto = await lerArquivoTexto(arquivo);
      const linhas = parseCSV(texto);
      if (linhas.length === 0) {
        toast.error('CSV vazio ou sem dados');
        setProcessando(false);
        return;
      }

      let ok = 0;
      const erros: string[] = [];
      for (let i = 0; i < linhas.length; i++) {
        try {
          const payload = mapear(linhas[i]);
          await criar(payload);
          ok++;
        } catch (e: any) {
          const msg = e?.response?.data?.detail || e?.message || 'erro desconhecido';
          erros.push(`Linha ${i + 2}: ${msg}`);
        }
      }
      setResultado({ ok, erros });
      if (ok > 0) {
        toast.success(`${ok} registro(s) importado(s)`);
        onConcluido();
      }
      if (erros.length > 0) toast.error(`${erros.length} linha(s) com erro`);
    } catch {
      toast.error('Falha ao ler o arquivo');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Importar {titulo} (CSV)</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">O arquivo deve conter um cabeçalho com as colunas:</p>
            <code className="block bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded p-2 text-xs">
              {colunas.join(' ; ')}
            </code>
          </div>

          <button onClick={baixarTemplate} className="text-sm px-3 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            ↓ Baixar modelo CSV
          </button>

          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processar(f); e.target.value = ''; }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={processando}
              className="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
            >
              {processando ? 'Processando...' : '📂 Selecionar arquivo CSV'}
            </button>
          </div>

          {resultado && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">✓ {resultado.ok} importado(s) com sucesso</p>
              {resultado.erros.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">{resultado.erros.length} erro(s):</p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                    {resultado.erros.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}
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
