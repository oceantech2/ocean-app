export function exportarCSV(dados: Record<string, any>[], nomeArquivo: string) {
  if (!dados.length) return;
  const headers = Object.keys(dados[0]);
  const linhas = dados.map((row) =>
    headers.map((h) => {
      const val = String(row[h] ?? '');
      return val.includes(';') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(';')
  );
  const csv = [headers.join(';'), ...linhas].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nomeArquivo}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
