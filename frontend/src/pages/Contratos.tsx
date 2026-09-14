const ATALHOS = [
  {
    rotulo: 'Contratos Clientes',
    url: 'https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H',
  },
  {
    rotulo: 'Contratos Internos',
    url: 'https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-',
  },
] as const;

export default function Contratos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Contratos</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Abra a pasta desejada no Google Drive (nova aba).
        </p>
      </div>

      <ul className="space-y-3 max-w-xl">
        {ATALHOS.map((atalho) => (
          <li key={atalho.url}>
            <a
              href={atalho.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-800 dark:text-gray-100 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <span className="font-medium">{atalho.rotulo}</span>
              <span className="text-sm text-blue-600 dark:text-blue-400 shrink-0">Abrir →</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
