// Utilitário de leitura de CSV (separador ; ou ,) com cabeçalho na primeira linha.
// Retorna um array de objetos { coluna: valor }.

export function parseCSV(texto: string): Record<string, string>[] {
  // Remove BOM e normaliza quebras de linha
  const limpo = texto.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const linhas = limpo.split('\n').filter((l) => l.trim() !== '');
  if (linhas.length < 2) return [];

  const sep = detectarSeparador(linhas[0]);
  const headers = parseLinha(linhas[0], sep).map((h) => h.trim());

  return linhas.slice(1).map((linha) => {
    const valores = parseLinha(linha, sep);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (valores[i] ?? '').trim(); });
    return obj;
  });
}

function detectarSeparador(cabecalho: string): string {
  const qtdPontoVirgula = (cabecalho.match(/;/g) || []).length;
  const qtdVirgula = (cabecalho.match(/,/g) || []).length;
  return qtdPontoVirgula >= qtdVirgula ? ';' : ',';
}

// Parser simples que respeita campos entre aspas
function parseLinha(linha: string, sep: string): string[] {
  const resultado: string[] = [];
  let atual = '';
  let dentroAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      if (dentroAspas && linha[i + 1] === '"') { atual += '"'; i++; }
      else dentroAspas = !dentroAspas;
    } else if (c === sep && !dentroAspas) {
      resultado.push(atual);
      atual = '';
    } else {
      atual += c;
    }
  }
  resultado.push(atual);
  return resultado;
}

export function lerArquivoTexto(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsText(arquivo, 'utf-8');
  });
}
